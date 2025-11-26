"""
Data Preprocessing for Hybrid LSTM Snow Depth Model
Prepares SNOTEL data for training following Steele et al. (2024) methodology
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict
from sklearn.preprocessing import StandardScaler
import pickle


class SnowDataPreprocessor:
    """
    Preprocesses SNOTEL data for hybrid LSTM model training

    Creates features for:
    - Plain LSTM: 7 meteorological inputs
    - Hybrid LSTM: 7 met inputs + 3 physical model outputs
    """

    def __init__(self):
        self.scalers = {}
        self.feature_columns = []

    def create_snow_presence(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create binary snow presence indicator

        Args:
            df: DataFrame with SNWD column

        Returns:
            DataFrame with snow_presence column
        """
        df = df.copy()
        df['snow_presence'] = (df['SNWD'] > 0).astype(int)
        return df

    def calculate_physical_baseline(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate simple degree-day physical snow model
        Estimates: SWE, snow depth, and density

        Args:
            df: DataFrame with TAVG, PREC, TMAX, TMIN

        Returns:
            DataFrame with physical_swe, physical_snwd, physical_density
        """
        df = df.copy()
        df = df.sort_values('date').reset_index(drop=True)

        # Parameters
        melt_factor = 0.15  # inches per degree-day (Fahrenheit)
        snow_ratio = 10.0   # snow to water ratio (fresh snow)
        min_density = 0.1   # minimum snow density (SWE/depth)
        max_density = 0.5   # maximum snow density

        # Initialize arrays
        n = len(df)
        physical_swe = np.zeros(n)
        physical_snwd = np.zeros(n)
        physical_density = np.full(n, 0.2)  # Default density

        for i in range(1, n):
            # Get previous values
            prev_swe = physical_swe[i-1]
            prev_snwd = physical_snwd[i-1]

            # Current conditions
            temp = df.loc[i, 'TAVG'] if pd.notna(df.loc[i, 'TAVG']) else 32
            precip = df.loc[i, 'PREC'] if pd.notna(df.loc[i, 'PREC']) else 0

            # Accumulation (when cold)
            if temp < 32:
                # Add precipitation as snow
                new_swe = precip
                new_snwd = precip * snow_ratio

                current_swe = prev_swe + new_swe
                current_snwd = prev_snwd + new_snwd

            else:
                # Melt (degree-day method)
                melt_amount = melt_factor * (temp - 32) / 100  # Convert to inches

                # Remove melt from SWE
                current_swe = max(0, prev_swe - melt_amount)

                # Snow depth reduces proportionally
                if prev_swe > 0:
                    melt_fraction = current_swe / prev_swe
                    current_snwd = prev_snwd * melt_fraction
                else:
                    current_snwd = 0

            # Store values
            physical_swe[i] = current_swe
            physical_snwd[i] = current_snwd

            # Calculate density (bounded)
            if current_snwd > 0.1:  # Minimum depth threshold
                density = current_swe / current_snwd
                physical_density[i] = np.clip(density, min_density, max_density)
            else:
                physical_density[i] = 0.2  # Default

        # Add to dataframe
        df['physical_swe'] = physical_swe
        df['physical_snwd'] = physical_snwd
        df['physical_density'] = physical_density

        return df

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Handle missing values in meteorological variables

        Args:
            df: DataFrame with potential missing values

        Returns:
            DataFrame with filled values
        """
        df = df.copy()

        # Temperature: forward fill then backward fill
        temp_cols = ['TAVG', 'TMAX', 'TMIN']
        for col in temp_cols:
            if col in df.columns:
                df[col] = df[col].fillna(method='ffill').fillna(method='bfill')

        # Precipitation: fill with 0 (no precip)
        if 'PREC' in df.columns:
            df['PREC'] = df['PREC'].fillna(0)

        # Solar radiation: interpolate
        if 'SRADV' in df.columns:
            df['SRADV'] = df['SRADV'].interpolate(method='linear').fillna(method='ffill').fillna(method='bfill')

        # Humidity: forward fill
        if 'RHUMV' in df.columns:
            df['RHUMV'] = df['RHUMV'].fillna(method='ffill').fillna(method='bfill').fillna(50)  # Default 50%

        # Wind speed: forward fill
        if 'WSPDV' in df.columns:
            df['WSPDV'] = df['WSPDV'].fillna(method='ffill').fillna(method='bfill').fillna(2)  # Default 2 m/s

        # Target variables: drop rows with missing targets
        target_cols = ['SNWD', 'WTEQ']
        df = df.dropna(subset=[col for col in target_cols if col in df.columns])

        return df

    def create_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create temporal features (day of year, lagged values)

        Args:
            df: DataFrame with date column

        Returns:
            DataFrame with temporal features
        """
        df = df.copy()

        # Day of year (cyclical encoding)
        df['day_of_year'] = df['date'].dt.dayofyear
        df['day_of_year_sin'] = np.sin(2 * np.pi * df['day_of_year'] / 365.25)
        df['day_of_year_cos'] = np.cos(2 * np.pi * df['day_of_year'] / 365.25)

        # Month
        df['month'] = df['date'].dt.month

        return df

    def create_plain_lstm_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create 7 input features for Plain LSTM model

        Args:
            df: Preprocessed DataFrame

        Returns:
            DataFrame with plain LSTM features
        """
        df = df.copy()

        # Ensure all required columns exist
        required_cols = ['TAVG', 'PREC', 'WSPDV', 'RHUMV', 'SRADV', 'snow_presence']

        # Use TMAX/TMIN average if TAVG missing
        if 'TAVG' not in df.columns or df['TAVG'].isna().all():
            if 'TMAX' in df.columns and 'TMIN' in df.columns:
                df['TAVG'] = (df['TMAX'] + df['TMIN']) / 2

        # Fill remaining missing with defaults
        defaults = {
            'WSPDV': 2.0,
            'RHUMV': 50.0,
            'SRADV': 200.0
        }

        for col, default in defaults.items():
            if col not in df.columns:
                df[col] = default

        self.plain_features = [
            'TAVG',           # Temperature
            'PREC',           # Precipitation
            'WSPDV',          # Wind speed
            'RHUMV',          # Relative humidity
            'SRADV',          # Solar radiation
            'snow_presence',  # Binary snow indicator
            'day_of_year_sin' # Temporal (replaces longwave radiation proxy)
        ]

        return df

    def create_hybrid_lstm_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create 10 input features for Hybrid LSTM model
        (7 plain + 3 physical model outputs)

        Args:
            df: DataFrame with plain features and physical model outputs

        Returns:
            DataFrame with hybrid LSTM features
        """
        df = df.copy()

        # Plain LSTM features
        df = self.create_plain_lstm_features(df)

        # Add physical model outputs
        self.hybrid_features = self.plain_features + [
            'physical_swe',     # Simulated SWE
            'physical_snwd',    # Simulated snow depth
            'physical_density'  # Simulated snow density
        ]

        return df

    def normalize_features(self, df: pd.DataFrame, feature_cols: list,
                          fit: bool = True) -> pd.DataFrame:
        """
        Normalize features using StandardScaler

        Args:
            df: DataFrame with features
            feature_cols: List of column names to normalize
            fit: Whether to fit scaler (True for training, False for inference)

        Returns:
            DataFrame with normalized features
        """
        df = df.copy()

        for col in feature_cols:
            if col not in df.columns:
                continue

            if fit:
                scaler = StandardScaler()
                df[col] = scaler.fit_transform(df[[col]])
                self.scalers[col] = scaler
            else:
                if col in self.scalers:
                    df[col] = self.scalers[col].transform(df[[col]])

        return df

    def prepare_sequences(self, df: pd.DataFrame, feature_cols: list,
                         target_cols: list, sequence_length: int = 30) -> Tuple:
        """
        Create sequences for LSTM training

        Args:
            df: DataFrame with features and targets
            feature_cols: Input feature column names
            target_cols: Target column names
            sequence_length: Number of timesteps in each sequence

        Returns:
            X, y arrays for LSTM training
        """
        # Sort by date
        df = df.sort_values('date').reset_index(drop=True)

        X_sequences = []
        y_sequences = []

        # Create sequences
        for i in range(len(df) - sequence_length):
            # Input sequence
            X_seq = df[feature_cols].iloc[i:i+sequence_length].values

            # Target (next day)
            y_seq = df[target_cols].iloc[i+sequence_length].values

            # Only include if no NaN values
            if not np.isnan(X_seq).any() and not np.isnan(y_seq).any():
                X_sequences.append(X_seq)
                y_sequences.append(y_seq)

        X = np.array(X_sequences)
        y = np.array(y_sequences)

        return X, y

    def preprocess_for_plain_lstm(self, df: pd.DataFrame,
                                   fit_scalers: bool = True,
                                   sequence_length: int = 30) -> Tuple:
        """
        Full preprocessing pipeline for Plain LSTM

        Args:
            df: Raw SNOTEL DataFrame
            fit_scalers: Whether to fit normalization scalers
            sequence_length: LSTM sequence length

        Returns:
            X, y arrays ready for training
        """
        # Step 1: Handle missing values
        df = self.handle_missing_values(df)

        # Step 2: Create snow presence
        df = self.create_snow_presence(df)

        # Step 3: Create temporal features
        df = self.create_temporal_features(df)

        # Step 4: Create Plain LSTM features
        df = self.create_plain_lstm_features(df)

        # Step 5: Normalize
        df = self.normalize_features(df, self.plain_features, fit=fit_scalers)

        # Step 6: Create sequences
        target_cols = ['SNWD', 'WTEQ']
        X, y = self.prepare_sequences(df, self.plain_features, target_cols, sequence_length)

        return X, y, df

    def preprocess_for_hybrid_lstm(self, df: pd.DataFrame,
                                    fit_scalers: bool = True,
                                    sequence_length: int = 30) -> Tuple:
        """
        Full preprocessing pipeline for Hybrid LSTM

        Args:
            df: Raw SNOTEL DataFrame
            fit_scalers: Whether to fit normalization scalers
            sequence_length: LSTM sequence length

        Returns:
            X, y arrays ready for training
        """
        # Step 1: Handle missing values
        df = self.handle_missing_values(df)

        # Step 2: Calculate physical baseline
        df = self.calculate_physical_baseline(df)

        # Step 3: Create snow presence
        df = self.create_snow_presence(df)

        # Step 4: Create temporal features
        df = self.create_temporal_features(df)

        # Step 5: Create Hybrid LSTM features
        df = self.create_hybrid_lstm_features(df)

        # Step 6: Normalize
        df = self.normalize_features(df, self.hybrid_features, fit=fit_scalers)

        # Step 7: Create sequences
        target_cols = ['SNWD', 'WTEQ']
        X, y = self.prepare_sequences(df, self.hybrid_features, target_cols, sequence_length)

        return X, y, df

    def save_scalers(self, filepath: str):
        """Save fitted scalers for deployment"""
        with open(filepath, 'wb') as f:
            pickle.dump(self.scalers, f)

    def load_scalers(self, filepath: str):
        """Load fitted scalers"""
        with open(filepath, 'rb') as f:
            self.scalers = pickle.load(f)


# Example usage
if __name__ == "__main__":
    # Load your collected training data
    print("Loading training data...")
    df = pd.read_csv('training_data_2008_2024.csv')
    df['date'] = pd.to_datetime(df['date'])

    print(f"Total records: {len(df)}")
    print(f"Columns: {df.columns.tolist()}")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")

    # Initialize preprocessor
    preprocessor = SnowDataPreprocessor()

    # Test with one station
    print("\n" + "=" * 80)
    print("Testing Preprocessing - Plain LSTM")
    print("=" * 80)

    # Get data for one station
    station_data = df[df['station'] == df['station'].iloc[0]].copy()
    print(f"\nStation: {station_data['station_name'].iloc[0] if 'station_name' in station_data else 'Unknown'}")
    print(f"Records: {len(station_data)}")

    # Preprocess for Plain LSTM
    X_plain, y_plain, processed_df = preprocessor.preprocess_for_plain_lstm(
        station_data,
        fit_scalers=True,
        sequence_length=30
    )

    print(f"\nPlain LSTM Input shape: {X_plain.shape}")  # (samples, 30, 7)
    print(f"Plain LSTM Output shape: {y_plain.shape}")   # (samples, 2) [SNWD, WTEQ]
    print(f"Features: {preprocessor.plain_features}")

    # Test Hybrid LSTM
    print("\n" + "=" * 80)
    print("Testing Preprocessing - Hybrid LSTM")
    print("=" * 80)

    preprocessor2 = SnowDataPreprocessor()
    X_hybrid, y_hybrid, processed_df2 = preprocessor2.preprocess_for_hybrid_lstm(
        station_data,
        fit_scalers=True,
        sequence_length=30
    )

    print(f"\nHybrid LSTM Input shape: {X_hybrid.shape}")  # (samples, 30, 10)
    print(f"Hybrid LSTM Output shape: {y_hybrid.shape}")   # (samples, 2)
    print(f"Features: {preprocessor2.hybrid_features}")

    print("\n✅ Preprocessing pipeline ready!")
