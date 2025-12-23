"""
Diagnostic script to identify training issues
"""
import pandas as pd
import traceback
import psutil
import os

def get_memory_usage():
    """Get current memory usage in GB"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024 / 1024

print("="*80)
print("Diagnostic Script - Finding Training Issues")
print("="*80)

try:
    # Check initial memory
    print(f"\n1. Initial memory usage: {get_memory_usage():.2f} GB")

    # Load data
    print("\n2. Loading data...")
    df = pd.read_csv('processed_training_data_08_24.csv')
    df['date'] = pd.to_datetime(df['date'])
    print(f"   Loaded {len(df):,} records")
    print(f"   Stations: {df['station'].nunique()}")
    print(f"   Memory after load: {get_memory_usage():.2f} GB")

    # Check for required columns
    print("\n3. Checking for required columns...")
    required_cols = [
        'TAVG', 'PREC', 'WSPDV', 'RHUMV', 'SRADV',
        'snow_presence', 'day_of_year_sin',
        'physical_swe', 'physical_snwd', 'physical_density',
        'SNWD', 'WTEQ', 'date', 'station'
    ]

    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        print(f"   [ERROR] Missing columns: {missing}")
    else:
        print("   [OK] All required columns present")

    # Check for NaN values
    print("\n4. Checking for NaN values...")
    for col in required_cols:
        if col in df.columns:
            nan_count = df[col].isna().sum()
            if nan_count > 0:
                print(f"   [WARNING] {col}: {nan_count:,} NaN values ({100*nan_count/len(df):.2f}%)")

    # Test creating a small dataset
    print("\n5. Testing BatchedSnowDataset with 1 station...")
    from batched_dataset import BatchedSnowDataset

    test_station = df['station'].unique()[0]
    test_df = df[df['station'] == test_station].copy()

    print(f"   Station: {test_station}")
    print(f"   Records: {len(test_df):,}")
    print(f"   Memory before dataset: {get_memory_usage():.2f} GB")

    dataset = BatchedSnowDataset(
        test_df,
        model_type='hybrid',
        sequence_length=30,
        preprocessor=None,
        fit_scalers=True,
        data_preprocessed=True
    )

    print(f"   [OK] Dataset created: {len(dataset)} sequences")
    print(f"   Memory after dataset: {get_memory_usage():.2f} GB")

    # Test getting a sample
    print("\n6. Testing sample retrieval...")
    if len(dataset) > 0:
        X, y = dataset[0]
        print(f"   [OK] Sample 0: X shape {X.shape}, y shape {y.shape}")

    # Test with 5 stations
    print("\n7. Testing with 5 stations...")
    test_stations = df['station'].unique()[:5]
    test_df = df[df['station'].isin(test_stations)].copy()

    print(f"   Stations: {len(test_stations)}")
    print(f"   Records: {len(test_df):,}")
    print(f"   Memory before: {get_memory_usage():.2f} GB")

    dataset = BatchedSnowDataset(
        test_df,
        model_type='hybrid',
        sequence_length=30,
        preprocessor=None,
        fit_scalers=True,
        data_preprocessed=True
    )

    print(f"   [OK] Dataset created: {len(dataset)} sequences")
    print(f"   Memory after: {get_memory_usage():.2f} GB")

    print("\n" + "="*80)
    print("[SUCCESS] DIAGNOSIS COMPLETE - No issues found")
    print("="*80)

except Exception as e:
    print("\n" + "="*80)
    print("[ERROR] ERROR FOUND:")
    print("="*80)
    print(f"\nError type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    print("\nFull traceback:")
    traceback.print_exc()
    print("\n" + "="*80)
