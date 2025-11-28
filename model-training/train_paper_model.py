"""
Train Hybrid LSTM Model - Steele et al. (2024) Replication
Implements leave-one-out cross-validation on 49 SNOTEL stations
"""

import pandas as pd
import numpy as np
import torch
from pathlib import Path
import json
from datetime import datetime
from data_preprocessing import SnowDataPreprocessor
from hybrid_lstm_model import SnowModelTrainer
from batched_dataset import create_memory_efficient_dataloaders
import warnings
warnings.filterwarnings('ignore')


class PaperModelTrainer:
    """
    Replicate Steele et al. (2024) training methodology
    - Leave-one-out cross-validation
    - 49 stations
    - Plain LSTM vs Hybrid LSTM comparison
    """

    def __init__(self, data_path: str, output_dir: str = 'models'):
        """
        Args:
            data_path: Path to collected SNOTEL data CSV
            output_dir: Directory to save trained models
        """
        self.data_path = data_path
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

        # Paper hyperparameters
        self.hyperparameters = {
            'hidden_size': 150,
            'num_layers': 1,
            'dropout': 0.4,
            'learning_rate': 0.005,
            'max_epochs': 100,
            'batch_size': 8,  # Reduced from 32 to save memory (can increase if you have more RAM)
            'sequence_length': 30,  # Assumed - check paper if specified
            'loss_function': 'MSE',
            'optimizer': 'ADAM'
        }

        self.results = {
            'plain_lstm': [],
            'hybrid_lstm': []
        }

    def load_data(self) -> pd.DataFrame:
        """Load collected SNOTEL data"""
        print(f"Loading data from {self.data_path}...")
        df = pd.read_csv(self.data_path)
        df['date'] = pd.to_datetime(df['date'])

        print(f"  Total records: {len(df):,}")
        print(f"  Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"  Stations: {df['station'].nunique()}")

        return df

    def get_station_list(self, df: pd.DataFrame) -> list:
        """Get unique station IDs"""
        stations = df['station'].unique().tolist()
        print(f"\nFound {len(stations)} unique stations")
        return stations

    def train_single_model_batched(self, model_type: str, train_data: pd.DataFrame,
                                   test_station: str, fold_num: int,
                                   total_folds: int, data_preprocessed: bool = False) -> dict:
        """
        Train a single model using memory-efficient batched loading

        Args:
            model_type: 'plain' or 'hybrid'
            train_data: Training data (48 stations)
            test_station: Station ID being held out
            fold_num: Current fold number
            total_folds: Total number of folds
            data_preprocessed: If True, assumes data already has all features calculated

        Returns:
            Dictionary with results
        """
        print(f"\n{'='*80}")
        print(f"Fold {fold_num}/{total_folds}: {model_type.upper()} LSTM (Memory-Efficient)")
        print(f"Test Station: {test_station}")
        if data_preprocessed:
            print("(Using pre-processed data - skipping feature calculation)")
        print(f"{'='*80}")

        # Create train/val split BEFORE preprocessing (90/10 by stations)
        all_stations = train_data['station'].unique()
        n_train_stations = int(0.9 * len(all_stations))

        train_stations = all_stations[:n_train_stations]
        val_stations = all_stations[n_train_stations:]

        train_split = train_data[train_data['station'].isin(train_stations)].copy()
        val_split = train_data[train_data['station'].isin(val_stations)].copy()

        print(f"\nData Split:")
        print(f"  Training stations: {len(train_stations)}")
        print(f"  Training records: {len(train_split):,}")
        print(f"  Validation stations: {len(val_stations)}")
        print(f"  Validation records: {len(val_split):,}")

        # Create memory-efficient dataloaders
        print(f"Creating dataloaders for {len(train_stations)} train stations, {len(val_stations)} val stations...")
        train_loader, val_loader, preprocessor = create_memory_efficient_dataloaders(
            train_df=train_split,
            val_df=val_split,
            model_type=model_type,
            sequence_length=self.hyperparameters['sequence_length'],
            batch_size=self.hyperparameters['batch_size'],
            num_workers=0,  # Set to 0 for Windows, 2-4 for Linux/Mac
            use_station_batching=False,  # False = faster startup, True = slower startup but uses less RAM
            data_preprocessed=data_preprocessed  # Skip feature calculation if already done
        )

        print(f"\nDataloader Statistics:")
        print(f"  Training batches: {len(train_loader)}")
        print(f"  Validation batches: {len(val_loader)}")

        # Create and train model
        print("\nInitializing model...")
        input_size = 7 if model_type == 'plain' else 10

        trainer = SnowModelTrainer(model_type=model_type, device='cpu')
        trainer.create_model(
            input_size=input_size,
            hidden_size=self.hyperparameters['hidden_size'],
            num_layers=self.hyperparameters['num_layers'],
            dropout=self.hyperparameters['dropout']
        )

        total_params = sum(p.numel() for p in trainer.model.parameters())
        print(f"  Model parameters: {total_params:,}")

        # Train with dataloaders
        print("\nTraining...")
        history = trainer.train_with_loaders(
            train_loader=train_loader,
            val_loader=val_loader,
            epochs=self.hyperparameters['max_epochs'],
            learning_rate=self.hyperparameters['learning_rate'],
            patience=15,
            verbose=True
        )

        # Evaluate on validation set
        metrics = trainer.evaluate_with_loader(val_loader)

        print(f"\nValidation Results:")
        for var in ['SNWD', 'WTEQ']:
            print(f"  {var}:")
            print(f"    RMSE: {metrics[var]['RMSE']:.3f}")
            print(f"    MAE:  {metrics[var]['MAE']:.3f}")
            print(f"    R²:   {metrics[var]['R2']:.3f}")

        # Save model
        model_filename = f"{model_type}_lstm_fold{fold_num:02d}_{test_station.replace(':', '_')}.pth"
        model_path = self.output_dir / model_filename
        trainer.save_model(str(model_path))
        print(f"\n✅ Model saved: {model_path}")

        # Save preprocessor scalers
        scaler_filename = f"scalers_{model_type}_fold{fold_num:02d}.pkl"
        preprocessor.save_scalers(str(self.output_dir / scaler_filename))

        return {
            'fold': fold_num,
            'test_station': test_station,
            'model_type': model_type,
            'train_batches': len(train_loader),
            'val_batches': len(val_loader),
            'metrics': metrics,
            'best_val_loss': history['best_val_loss'],
            'model_path': str(model_path),
            'scaler_path': str(self.output_dir / scaler_filename)
        }

    def train_single_model(self, model_type: str, train_data: pd.DataFrame,
                          test_station: str, fold_num: int,
                          total_folds: int, data_preprocessed: bool = False) -> dict:
        """
        Train a single model (one fold of leave-one-out CV)

        Args:
            model_type: 'plain' or 'hybrid'
            train_data: Training data (48 stations)
            test_station: Station ID being held out
            fold_num: Current fold number
            total_folds: Total number of folds
            data_preprocessed: If True, assumes data already has all features calculated
                             and only does normalization + sequence creation

        Returns:
            Dictionary with results
        """
        print(f"\n{'='*80}")
        print(f"Fold {fold_num}/{total_folds}: {model_type.upper()} LSTM")
        print(f"Test Station: {test_station}")
        if data_preprocessed:
            print("(Using pre-processed data - skipping feature calculation)")
        print(f"{'='*80}")

        # Initialize preprocessor
        preprocessor = SnowDataPreprocessor()

        if data_preprocessed:
            # Data already has features - just normalize and create sequences
            print("Creating sequences from pre-processed data...")

            # Define feature columns based on model type
            if model_type == 'plain':
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

            target_cols = ['SNWD', 'WTEQ']

            # Sort by date
            df = train_data.sort_values('date').reset_index(drop=True)

            # Normalize features
            df_normalized = preprocessor.normalize_features(
                df, feature_cols, fit=True
            )

            # Create sequences
            X_train, y_train = preprocessor.prepare_sequences(
                df_normalized,
                feature_cols,
                target_cols,
                sequence_length=self.hyperparameters['sequence_length']
            )

        else:
            # Full preprocessing pipeline
            print("Preprocessing training data...")
            if model_type == 'plain':
                X_train, y_train, _ = preprocessor.preprocess_for_plain_lstm(
                    train_data,
                    fit_scalers=True,
                    sequence_length=self.hyperparameters['sequence_length']
                )
            else:  # hybrid
                X_train, y_train, _ = preprocessor.preprocess_for_hybrid_lstm(
                    train_data,
                    fit_scalers=True,
                    sequence_length=self.hyperparameters['sequence_length']
                )

        print(f"  Training sequences: {len(X_train)}")
        print(f"  Input shape: {X_train.shape}")
        print(f"  Output shape: {y_train.shape}")

        # Check if we have enough data
        if len(X_train) < 100:
            print(f"  ⚠️  Warning: Only {len(X_train)} training sequences")
            return None

        # Create train/val split from training data (90/10)
        split_idx = int(0.9 * len(X_train))
        X_train_split = X_train[:split_idx]
        y_train_split = y_train[:split_idx]
        X_val_split = X_train[split_idx:]
        y_val_split = y_train[split_idx:]

        print(f"  Train split: {len(X_train_split)} sequences")
        print(f"  Val split: {len(X_val_split)} sequences")

        # Create and train model
        print("\nInitializing model...")
        input_size = 7 if model_type == 'plain' else 10

        trainer = SnowModelTrainer(model_type=model_type, device='cpu')
        trainer.create_model(
            input_size=input_size,
            hidden_size=self.hyperparameters['hidden_size'],
            num_layers=self.hyperparameters['num_layers'],
            dropout=self.hyperparameters['dropout']
        )

        total_params = sum(p.numel() for p in trainer.model.parameters())
        print(f"  Model parameters: {total_params:,}")

        # Train
        print("\nTraining...")
        history = trainer.train(
            X_train_split, y_train_split,
            X_val_split, y_val_split,
            epochs=self.hyperparameters['max_epochs'],
            batch_size=self.hyperparameters['batch_size'],
            learning_rate=self.hyperparameters['learning_rate'],
            patience=15,  # Early stopping
            verbose=True
        )

        # Evaluate on validation set
        metrics = trainer.evaluate(X_val_split, y_val_split)

        print(f"\nValidation Results:")
        for var in ['SNWD', 'WTEQ']:
            print(f"  {var}:")
            print(f"    RMSE: {metrics[var]['RMSE']:.3f}")
            print(f"    MAE:  {metrics[var]['MAE']:.3f}")
            print(f"    R²:   {metrics[var]['R2']:.3f}")

        # Save model
        model_filename = f"{model_type}_lstm_fold{fold_num:02d}_{test_station.replace(':', '_')}.pth"
        model_path = self.output_dir / model_filename
        trainer.save_model(str(model_path))
        print(f"\n✅ Model saved: {model_path}")

        # Save preprocessor scalers
        scaler_filename = f"scalers_{model_type}_fold{fold_num:02d}.pkl"
        preprocessor.save_scalers(str(self.output_dir / scaler_filename))

        return {
            'fold': fold_num,
            'test_station': test_station,
            'model_type': model_type,
            'train_sequences': len(X_train_split),
            'val_sequences': len(X_val_split),
            'metrics': metrics,
            'best_val_loss': history['best_val_loss'],
            'model_path': str(model_path),
            'scaler_path': str(self.output_dir / scaler_filename)
        }

    def run_leave_one_out_cv_batched(self, model_type: str = 'both', data_preprocessed: bool = False):
        """
        Run leave-one-out cross-validation with memory-efficient batched loading

        Args:
            model_type: 'plain', 'hybrid', or 'both'
            data_preprocessed: If True, assumes data already has all features calculated
        """
        # Load data
        df = self.load_data()
        stations = self.get_station_list(df)

        total_stations = len(stations)

        print(f"\n{'='*80}")
        print(f"Starting Leave-One-Out Cross-Validation (Memory-Efficient)")
        print(f"Total Stations: {total_stations}")
        print(f"Model Type(s): {model_type.upper()}")
        if data_preprocessed:
            print("Using pre-processed data (skipping feature calculations)")
        print(f"{'='*80}")

        # Leave-one-out CV
        for fold_num, test_station in enumerate(stations, 1):
            print(f"\n\n{'#'*80}")
            print(f"# FOLD {fold_num}/{total_stations}: Test Station = {test_station}")
            print(f"{'#'*80}")

            # Split data
            train_data = df[df['station'] != test_station].copy()
            test_data = df[df['station'] == test_station].copy()

            train_stations = train_data['station'].nunique()
            test_records = len(test_data)

            print(f"\nData Split:")
            print(f"  Training stations: {train_stations}")
            print(f"  Training records: {len(train_data):,}")
            print(f"  Test records: {test_records:,}")

            # Train Plain LSTM
            if model_type in ['plain', 'both']:
                result_plain = self.train_single_model_batched(
                    'plain', train_data, test_station,
                    fold_num, total_stations, data_preprocessed
                )
                if result_plain:
                    self.results['plain_lstm'].append(result_plain)

            # Train Hybrid LSTM
            if model_type in ['hybrid', 'both']:
                result_hybrid = self.train_single_model_batched(
                    'hybrid', train_data, test_station,
                    fold_num, total_stations, data_preprocessed
                )
                if result_hybrid:
                    self.results['hybrid_lstm'].append(result_hybrid)

            # Save intermediate results
            self.save_results()

        print(f"\n\n{'='*80}")
        print("Leave-One-Out Cross-Validation Complete!")
        print(f"{'='*80}")

        self.print_summary()

    def run_leave_one_out_cv(self, model_type: str = 'both', data_preprocessed: bool = False):
        """
        Run leave-one-out cross-validation

        Args:
            model_type: 'plain', 'hybrid', or 'both'
            data_preprocessed: If True, assumes data already has all features calculated
        """
        # Load data
        df = self.load_data()
        stations = self.get_station_list(df)

        total_stations = len(stations)

        print(f"\n{'='*80}")
        print(f"Starting Leave-One-Out Cross-Validation")
        print(f"Total Stations: {total_stations}")
        print(f"Model Type(s): {model_type.upper()}")
        if data_preprocessed:
            print("Using pre-processed data (skipping feature calculations)")
        print(f"{'='*80}")

        # Leave-one-out CV
        for fold_num, test_station in enumerate(stations, 1):
            print(f"\n\n{'#'*80}")
            print(f"# FOLD {fold_num}/{total_stations}: Test Station = {test_station}")
            print(f"{'#'*80}")

            # Split data
            train_data = df[df['station'] != test_station].copy()
            test_data = df[df['station'] == test_station].copy()

            train_stations = train_data['station'].nunique()
            test_records = len(test_data)

            print(f"\nData Split:")
            print(f"  Training stations: {train_stations}")
            print(f"  Training records: {len(train_data):,}")
            print(f"  Test records: {test_records:,}")

            # Train Plain LSTM
            if model_type in ['plain', 'both']:
                result_plain = self.train_single_model(
                    'plain', train_data, test_station,
                    fold_num, total_stations, data_preprocessed
                )
                if result_plain:
                    self.results['plain_lstm'].append(result_plain)

            # Train Hybrid LSTM
            if model_type in ['hybrid', 'both']:
                result_hybrid = self.train_single_model(
                    'hybrid', train_data, test_station,
                    fold_num, total_stations, data_preprocessed
                )
                if result_hybrid:
                    self.results['hybrid_lstm'].append(result_hybrid)

            # Save intermediate results
            self.save_results()

        print(f"\n\n{'='*80}")
        print("Leave-One-Out Cross-Validation Complete!")
        print(f"{'='*80}")

        self.print_summary()

    def print_summary(self):
        """Print summary of all results"""
        print(f"\n{'='*80}")
        print("SUMMARY OF RESULTS")
        print(f"{'='*80}")

        for model_type in ['plain_lstm', 'hybrid_lstm']:
            if not self.results[model_type]:
                continue

            print(f"\n{model_type.replace('_', ' ').upper()}:")
            print(f"  Total folds completed: {len(self.results[model_type])}")

            # Aggregate metrics
            snwd_rmse = [r['metrics']['SNWD']['RMSE'] for r in self.results[model_type]]
            snwd_r2 = [r['metrics']['SNWD']['R2'] for r in self.results[model_type]]
            wteq_rmse = [r['metrics']['WTEQ']['RMSE'] for r in self.results[model_type]]
            wteq_r2 = [r['metrics']['WTEQ']['R2'] for r in self.results[model_type]]

            print(f"\n  Snow Depth (SNWD):")
            print(f"    Mean RMSE: {np.mean(snwd_rmse):.3f} ± {np.std(snwd_rmse):.3f}")
            print(f"    Mean R²:   {np.mean(snwd_r2):.3f} ± {np.std(snwd_r2):.3f}")

            print(f"\n  Snow Water Equivalent (WTEQ):")
            print(f"    Mean RMSE: {np.mean(wteq_rmse):.3f} ± {np.std(wteq_rmse):.3f}")
            print(f"    Mean R²:   {np.mean(wteq_r2):.3f} ± {np.std(wteq_r2):.3f}")

    def save_results(self):
        """Save results to JSON file"""
        results_file = self.output_dir / 'training_results.json'

        results_data = {
            'timestamp': datetime.now().isoformat(),
            'hyperparameters': self.hyperparameters,
            'results': self.results
        }

        with open(results_file, 'w') as f:
            json.dump(results_data, f, indent=2)

        print(f"\n💾 Results saved to: {results_file}")


# Main execution
if __name__ == "__main__":
    print("="*80)
    print("Hybrid LSTM Training - Steele et al. (2024) Replication")
    print("="*80)

    # Configuration
    DATA_PATH = 'processed_training_data_08_24.csv'  # Your collected data
    OUTPUT_DIR = 'trained_models'

    # Check if data exists
    if not Path(DATA_PATH).exists():
        print(f"\n❌ Error: Data file not found: {DATA_PATH}")
        print("\nPlease ensure you have run collect_sntl_data.py first")
        print("and the output CSV is named 'training_data_2008_2016.csv'")
        exit(1)

    # Initialize trainer
    trainer = PaperModelTrainer(
        data_path=DATA_PATH,
        output_dir=OUTPUT_DIR
    )

    # Run leave-one-out CV
    # Options: 'plain', 'hybrid', or 'both'

    # Use batched training to avoid memory errors (generates sequences on-the-fly)
    trainer.run_leave_one_out_cv_batched(model_type='hybrid', data_preprocessed=True)

    # Only use these if you have LOTS of RAM:
    # trainer.run_leave_one_out_cv(model_type='hybrid', data_preprocessed=True)  # Pre-processed data
    # trainer.run_leave_one_out_cv(model_type='hybrid', data_preprocessed=False)  # Raw data

    print("\n" + "="*80)
    print("✅ Training Complete!")
    print(f"Models saved in: {OUTPUT_DIR}/")
    print("="*80)
