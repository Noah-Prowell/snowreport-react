"""
Test the full training pipeline with a small subset
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
print("Testing Full Training Pipeline")
print("="*80)

try:
    # Load data
    print("\n1. Loading data...")
    df = pd.read_csv('processed_training_data_08_24.csv')
    df['date'] = pd.to_datetime(df['date'])
    print(f"   Loaded {len(df):,} records, {df['station'].nunique()} stations")
    print(f"   Memory: {get_memory_usage():.2f} GB")

    # Use only first 3 stations for quick test
    test_stations = df['station'].unique()[:3]
    test_station_holdout = test_stations[0]

    print(f"\n2. Setting up leave-one-out test with 3 stations...")
    print(f"   Test station (holdout): {test_station_holdout}")

    # Split data
    train_data = df[df['station'] != test_station_holdout].copy()
    test_data = df[df['station'] == test_station_holdout].copy()

    train_data = train_data[train_data['station'].isin(test_stations[1:])].copy()

    print(f"   Training stations: {train_data['station'].nunique()}")
    print(f"   Training records: {len(train_data):,}")
    print(f"   Memory: {get_memory_usage():.2f} GB")

    # Create train/val split
    all_stations = train_data['station'].unique()
    n_train_stations = max(1, int(0.9 * len(all_stations)))

    train_stations = all_stations[:n_train_stations]
    val_stations = all_stations[n_train_stations:] if n_train_stations < len(all_stations) else all_stations[-1:]

    train_split = train_data[train_data['station'].isin(train_stations)].copy()
    val_split = train_data[train_data['station'].isin(val_stations)].copy()

    print(f"\n3. Creating dataloaders...")
    print(f"   Train: {len(train_stations)} stations, {len(train_split):,} records")
    print(f"   Val: {len(val_stations)} stations, {len(val_split):,} records")

    from batched_dataset import create_memory_efficient_dataloaders

    train_loader, val_loader, preprocessor = create_memory_efficient_dataloaders(
        train_df=train_split,
        val_df=val_split,
        model_type='hybrid',
        sequence_length=30,
        batch_size=8,
        num_workers=0,
        use_station_batching=False,
        data_preprocessed=True
    )

    print(f"   Train batches: {len(train_loader)}")
    print(f"   Val batches: {len(val_loader)}")
    print(f"   Memory: {get_memory_usage():.2f} GB")

    # Test importing model
    print("\n4. Testing model import...")
    try:
        from hybrid_lstm_model import SnowModelTrainer
        print("   [OK] SnowModelTrainer imported successfully")
    except ImportError as e:
        print(f"   [ERROR] Failed to import SnowModelTrainer: {e}")
        print("   This is likely the issue!")
        raise

    # Create model
    print("\n5. Creating model...")
    trainer = SnowModelTrainer(model_type='hybrid', device='cpu')
    trainer.create_model(
        input_size=10,
        hidden_size=150,
        num_layers=1,
        dropout=0.4
    )

    total_params = sum(p.numel() for p in trainer.model.parameters())
    print(f"   Model parameters: {total_params:,}")
    print(f"   Memory: {get_memory_usage():.2f} GB")

    # Test one batch
    print("\n6. Testing forward pass with one batch...")
    for X_batch, y_batch in train_loader:
        print(f"   Batch shape: X={X_batch.shape}, y={y_batch.shape}")

        # Forward pass
        predictions = trainer.model(X_batch)
        print(f"   Predictions shape: {predictions.shape}")
        print(f"   [OK] Forward pass successful")
        print(f"   Memory: {get_memory_usage():.2f} GB")
        break

    # Test training for 2 epochs
    print("\n7. Testing training for 2 epochs...")
    history = trainer.train_with_loaders(
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=2,
        learning_rate=0.005,
        patience=15,
        verbose=True
    )

    print(f"\n   [OK] Training completed!")
    print(f"   Final train loss: {history['train_loss'][-1]:.4f}")
    print(f"   Final val loss: {history['val_loss'][-1]:.4f}")
    print(f"   Memory: {get_memory_usage():.2f} GB")

    print("\n" + "="*80)
    print("[SUCCESS] FULL TRAINING PIPELINE TEST PASSED!")
    print("="*80)
    print("\nThe code should work on Azure. If it's still terminating, check:")
    print("1. Azure timeout settings")
    print("2. Azure output logs for specific error messages")
    print("3. Check if hybrid_lstm_model.py exists and is accessible")

except Exception as e:
    print("\n" + "="*80)
    print("[ERROR] FOUND THE ISSUE:")
    print("="*80)
    print(f"\nError type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    print("\nFull traceback:")
    traceback.print_exc()
    print("\n" + "="*80)
    print("This is likely what's causing the termination on Azure!")
    print("="*80)
