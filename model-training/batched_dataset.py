"""
Memory-Efficient Batched Dataset for Snow LSTM Training
Processes data in chunks to avoid loading everything into memory
"""

import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from typing import List, Tuple, Optional
from data_preprocessing import SnowDataPreprocessor


class BatchedSnowDataset(Dataset):
    """
    Memory-efficient dataset that processes stations in batches
    Instead of loading all sequences at once, generates them on-the-fly
    """

    def __init__(self,
                 df: pd.DataFrame,
                 model_type: str = 'hybrid',
                 sequence_length: int = 30,
                 preprocessor: Optional[SnowDataPreprocessor] = None,
                 fit_scalers: bool = True,
                 chunk_size: int = 10000,
                 data_preprocessed: bool = False):
        """
        Args:
            df: Raw SNOTEL DataFrame with all stations
            model_type: 'plain' or 'hybrid'
            sequence_length: LSTM sequence length
            preprocessor: Existing preprocessor (or creates new one)
            fit_scalers: Whether to fit scalers
            chunk_size: Number of records to process at a time
            data_preprocessed: If True, assumes data already has all features calculated
        """
        self.df = df.copy()
        self.model_type = model_type
        self.sequence_length = sequence_length
        self.chunk_size = chunk_size
        self.data_preprocessed = data_preprocessed

        # Initialize or use provided preprocessor
        if preprocessor is None:
            self.preprocessor = SnowDataPreprocessor()
        else:
            self.preprocessor = preprocessor

        # Preprocess the dataframe (feature engineering, no sequences yet)
        print(f"Preprocessing {len(df):,} records...")
        self.processed_df = self._preprocess_dataframe(fit_scalers)

        # Calculate total number of sequences without creating them
        self.sequence_indices = self._calculate_sequence_indices()
        self.total_sequences = len(self.sequence_indices)

        print(f"  Total sequences available: {self.total_sequences:,}")

    def _preprocess_dataframe(self, fit_scalers: bool) -> pd.DataFrame:
        """
        Preprocess the dataframe (features only, no sequences)
        """
        df = self.df.copy()

        if self.data_preprocessed:
            # Data already has features - just define feature columns and normalize
            print("  Using pre-processed data - skipping feature calculation")

            if self.model_type == 'plain':
                feature_cols = [
                    'TAVG', 'PREC', 'WSPDV', 'RHUMV', 'SRADV',
                    'snow_presence', 'day_of_year_sin'
                ]
            else:  # hybrid
                feature_cols = [
                    'TAVG', 'PREC', 'WSPDV', 'RHUMV', 'SRADV',
                    'snow_presence', 'day_of_year_sin',
                    'physical_swe', 'physical_snwd', 'physical_density'
                ]

            # Set feature columns on preprocessor
            if self.model_type == 'plain':
                self.preprocessor.plain_features = feature_cols
            else:
                self.preprocessor.hybrid_features = feature_cols

            # Sort by date for sequence creation
            df = df.sort_values('date').reset_index(drop=True)

            # Normalize features
            df = self.preprocessor.normalize_features(df, feature_cols, fit=fit_scalers)
        else:
            # Full preprocessing pipeline
            # Step 1: Handle missing values
            df = self.preprocessor.handle_missing_values(df)

            if self.model_type == 'hybrid':
                # Step 2: Calculate physical baseline
                df = self.preprocessor.calculate_physical_baseline(df)

            # Step 3: Create snow presence
            df = self.preprocessor.create_snow_presence(df)

            # Step 4: Create temporal features
            df = self.preprocessor.create_temporal_features(df)

            # Step 5: Create features
            if self.model_type == 'plain':
                df = self.preprocessor.create_plain_lstm_features(df)
                feature_cols = self.preprocessor.plain_features
            else:
                df = self.preprocessor.create_hybrid_lstm_features(df)
                feature_cols = self.preprocessor.hybrid_features

            # Step 6: Normalize features
            df = self.preprocessor.normalize_features(df, feature_cols, fit=fit_scalers)

            # Sort by date for sequence creation
            df = df.sort_values('date').reset_index(drop=True)

        return df

    def _calculate_sequence_indices(self) -> List[int]:
        """
        Calculate valid sequence start indices without creating sequences
        Returns list of indices where sequences can start
        """
        indices = []
        df = self.processed_df

        # Find valid sequence starting points
        for i in range(len(df) - self.sequence_length):
            # Check if we have enough consecutive data
            seq_slice = df.iloc[i:i+self.sequence_length+1]

            # Get feature columns
            if self.model_type == 'plain':
                feature_cols = self.preprocessor.plain_features
            else:
                feature_cols = self.preprocessor.hybrid_features

            target_cols = ['SNWD', 'WTEQ']

            # Check for NaN values in features and targets
            features_valid = not seq_slice[feature_cols].isna().any().any()
            targets_valid = not seq_slice[target_cols].iloc[-1].isna().any()

            if features_valid and targets_valid:
                indices.append(i)

        return indices

    def __len__(self) -> int:
        """Return total number of sequences"""
        return self.total_sequences

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Generate a single sequence on-the-fly

        Args:
            idx: Index in the sequence_indices list

        Returns:
            X (sequence), y (target) as tensors
        """
        # Get the actual dataframe index
        start_idx = self.sequence_indices[idx]

        # Get feature columns
        if self.model_type == 'plain':
            feature_cols = self.preprocessor.plain_features
        else:
            feature_cols = self.preprocessor.hybrid_features

        target_cols = ['SNWD', 'WTEQ']

        # Extract sequence
        X_seq = self.processed_df[feature_cols].iloc[start_idx:start_idx+self.sequence_length].values
        y_seq = self.processed_df[target_cols].iloc[start_idx+self.sequence_length].values

        # Convert to tensors
        X_tensor = torch.FloatTensor(X_seq)
        y_tensor = torch.FloatTensor(y_seq)

        return X_tensor, y_tensor


class StationBatchedDataset(Dataset):
    """
    Even more memory-efficient: processes one station at a time
    Useful when you have many stations and each has lots of data
    """

    def __init__(self,
                 df: pd.DataFrame,
                 model_type: str = 'hybrid',
                 sequence_length: int = 30,
                 preprocessor: Optional[SnowDataPreprocessor] = None,
                 fit_scalers: bool = True,
                 data_preprocessed: bool = False):
        """
        Args:
            df: Raw SNOTEL DataFrame with multiple stations
            model_type: 'plain' or 'hybrid'
            sequence_length: LSTM sequence length
            preprocessor: Existing preprocessor (or creates new one)
            fit_scalers: Whether to fit scalers on first station
            data_preprocessed: If True, assumes data already has all features calculated
        """
        self.df_raw = df
        self.model_type = model_type
        self.sequence_length = sequence_length
        self.fit_scalers = fit_scalers
        self.data_preprocessed = data_preprocessed

        # Initialize or use provided preprocessor
        if preprocessor is None:
            self.preprocessor = SnowDataPreprocessor()
        else:
            self.preprocessor = preprocessor

        # Get list of stations
        self.stations = df['station'].unique().tolist()

        # Build index mapping: (station_idx, sequence_idx_within_station)
        print(f"Indexing {len(self.stations)} stations...")
        self.sequence_map = []
        self.station_sequence_counts = {}

        for station_idx, station in enumerate(self.stations):
            station_data = df[df['station'] == station].copy()

            # Quick preprocessing to count sequences
            temp_dataset = BatchedSnowDataset(
                station_data,
                model_type=model_type,
                sequence_length=sequence_length,
                preprocessor=self.preprocessor,
                fit_scalers=(fit_scalers and station_idx == 0),  # Only fit on first station
                data_preprocessed=data_preprocessed
            )

            n_sequences = len(temp_dataset)
            self.station_sequence_counts[station] = n_sequences

            # Add to map
            for seq_idx in range(n_sequences):
                self.sequence_map.append((station, seq_idx))

            if (station_idx + 1) % 10 == 0:
                print(f"  Processed {station_idx + 1}/{len(self.stations)} stations")

        self.total_sequences = len(self.sequence_map)
        print(f"  Total sequences: {self.total_sequences:,}")

        # Cache for currently loaded station
        self._cached_station = None
        self._cached_dataset = None

    def __len__(self) -> int:
        """Return total number of sequences across all stations"""
        return self.total_sequences

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Get sequence by loading station data only when needed

        Args:
            idx: Global sequence index

        Returns:
            X (sequence), y (target) as tensors
        """
        # Get station and local sequence index
        station, seq_idx = self.sequence_map[idx]

        # Load station data if not cached
        if self._cached_station != station:
            station_data = self.df_raw[self.df_raw['station'] == station].copy()

            self._cached_dataset = BatchedSnowDataset(
                station_data,
                model_type=self.model_type,
                sequence_length=self.sequence_length,
                preprocessor=self.preprocessor,
                fit_scalers=False,  # Never refit scalers
                data_preprocessed=self.data_preprocessed
            )
            self._cached_station = station

        # Get sequence from cached dataset
        return self._cached_dataset[seq_idx]


def create_memory_efficient_dataloaders(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    model_type: str = 'hybrid',
    sequence_length: int = 30,
    batch_size: int = 32,
    num_workers: int = 0,
    use_station_batching: bool = False,
    data_preprocessed: bool = False
) -> Tuple[DataLoader, DataLoader, SnowDataPreprocessor]:
    """
    Create train and validation dataloaders with minimal memory usage

    Args:
        train_df: Training data DataFrame
        val_df: Validation data DataFrame
        model_type: 'plain' or 'hybrid'
        sequence_length: LSTM sequence length
        batch_size: Batch size for training
        num_workers: Number of DataLoader workers (0 for Windows)
        use_station_batching: Use StationBatchedDataset (even more memory efficient)
        data_preprocessed: If True, assumes data already has all features calculated

    Returns:
        train_loader, val_loader, preprocessor
    """
    print("\nCreating memory-efficient dataloaders...")
    print(f"  Model type: {model_type}")
    print(f"  Sequence length: {sequence_length}")
    print(f"  Batch size: {batch_size}")
    if data_preprocessed:
        print(f"  Using pre-processed data (skipping feature calculations)")

    # Choose dataset class
    DatasetClass = StationBatchedDataset if use_station_batching else BatchedSnowDataset

    # Create training dataset (fits scalers)
    print("\nProcessing training data...")
    train_dataset = DatasetClass(
        train_df,
        model_type=model_type,
        sequence_length=sequence_length,
        preprocessor=None,  # Will create new one
        fit_scalers=True,
        data_preprocessed=data_preprocessed
    )

    # Get the fitted preprocessor
    if use_station_batching:
        preprocessor = train_dataset.preprocessor
    else:
        preprocessor = train_dataset.preprocessor

    # Create validation dataset (uses fitted scalers)
    print("\nProcessing validation data...")
    val_dataset = DatasetClass(
        val_df,
        model_type=model_type,
        sequence_length=sequence_length,
        preprocessor=preprocessor,  # Use fitted scalers
        fit_scalers=False,
        data_preprocessed=data_preprocessed
    )

    # Create dataloaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=False  # Set to True if using GPU
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=False
    )

    print(f"\n✅ Dataloaders created:")
    print(f"  Training batches: {len(train_loader)}")
    print(f"  Validation batches: {len(val_loader)}")

    return train_loader, val_loader, preprocessor


# Example usage
if __name__ == "__main__":
    print("=" * 80)
    print("Testing Memory-Efficient Batched Dataset")
    print("=" * 80)

    # Load data
    import warnings
    warnings.filterwarnings('ignore')

    df = pd.read_csv('training_data_2008_2024.csv')
    df['date'] = pd.to_datetime(df['date'])

    print(f"\nTotal records: {len(df):,}")
    print(f"Stations: {df['station'].nunique()}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")

    # Test with a subset of stations
    test_stations = df['station'].unique()[:5]  # First 5 stations
    test_df = df[df['station'].isin(test_stations)].copy()

    print(f"\nTesting with {len(test_stations)} stations")
    print(f"Test records: {len(test_df):,}")

    # Create batched dataset
    print("\n" + "=" * 80)
    print("Testing BatchedSnowDataset")
    print("=" * 80)

    dataset = BatchedSnowDataset(
        test_df,
        model_type='hybrid',
        sequence_length=30
    )

    print(f"\nDataset size: {len(dataset)} sequences")

    # Test getting a few samples
    print("\nTesting sample access...")
    for i in range(min(3, len(dataset))):
        X, y = dataset[i]
        print(f"  Sample {i}: X shape {X.shape}, y shape {y.shape}")

    # Test DataLoader
    print("\nTesting DataLoader...")
    loader = DataLoader(dataset, batch_size=32, shuffle=True)

    for i, (X_batch, y_batch) in enumerate(loader):
        print(f"  Batch {i}: X {X_batch.shape}, y {y_batch.shape}")
        if i >= 2:  # Just show first 3 batches
            break

    print(f"\n  Total batches: {len(loader)}")

    # Test station-based batching
    print("\n" + "=" * 80)
    print("Testing StationBatchedDataset")
    print("=" * 80)

    station_dataset = StationBatchedDataset(
        test_df,
        model_type='hybrid',
        sequence_length=30
    )

    print(f"\nDataset size: {len(station_dataset)} sequences")

    # Test getting samples
    print("\nTesting sample access...")
    for i in [0, len(station_dataset)//2, len(station_dataset)-1]:
        X, y = station_dataset[i]
        print(f"  Sample {i}: X shape {X.shape}, y shape {y.shape}")

    print("\n✅ Memory-efficient dataset ready for training!")
