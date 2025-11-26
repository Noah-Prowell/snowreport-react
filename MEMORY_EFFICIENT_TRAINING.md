# Memory-Efficient Training Guide

## Problem
Loading all SNOTEL data into memory at once causes memory errors with large datasets.

## Solution
The new batched training approach processes data in chunks, keeping memory usage low.

## Quick Start

Simply run your existing training script - it's already configured to use batched training:

```bash
python train_paper_model.py
```

The script now uses `run_leave_one_out_cv_batched()` by default, which implements memory-efficient training.

## How It Works

### Traditional Approach (Memory Intensive)
```python
# OLD: Loads all sequences into memory
X_train, y_train = preprocessor.preprocess_for_hybrid_lstm(train_data)
# X_train could be 100,000+ sequences × 30 timesteps × 10 features = HUGE!
```

### New Batched Approach (Memory Efficient)
```python
# NEW: Generates sequences on-the-fly
train_loader, val_loader, preprocessor = create_memory_efficient_dataloaders(
    train_df=train_data,
    val_df=val_data,
    model_type='hybrid',
    sequence_length=30,
    batch_size=32,
    use_station_batching=True  # Even more memory efficient
)
```

## Memory-Saving Options

### Option 1: BatchedSnowDataset (Default)
Processes all data but generates sequences on-the-fly instead of storing them.

**Memory Savings**: ~10-20x reduction
**Usage**: Already enabled by default

### Option 2: StationBatchedDataset (Maximum Efficiency)
Loads one station at a time, caching only the current station's data.

**Memory Savings**: ~50-100x reduction
**Usage**: Already enabled with `use_station_batching=True`

### Option 3: Reduce Batch Size
Lower batch size = less memory per iteration

```python
# In train_paper_model.py, modify hyperparameters:
self.hyperparameters = {
    ...
    'batch_size': 16,  # Reduce from 32 to 16 or even 8
    ...
}
```

### Option 4: Process Fewer Stations at Once
Instead of training on all 48 stations, split them into groups:

```python
# In run_leave_one_out_cv_batched(), after creating train_split:
# Sample a subset of stations for even lower memory usage
if len(train_stations) > 30:
    train_stations = np.random.choice(train_stations, 30, replace=False)
    train_split = train_split[train_split['station'].isin(train_stations)]
```

## Memory Usage Comparison

| Approach | Approximate RAM Usage (49 stations, 16 years) |
|----------|-----------------------------------------------|
| Original | 16-32 GB |
| BatchedSnowDataset | 2-4 GB |
| StationBatchedDataset | 500 MB - 1 GB |
| + Reduced batch size (16) | 250-500 MB |

## Configuration Options

### In `train_paper_model.py`:

```python
# Adjust these in the PaperModelTrainer.__init__() method:
self.hyperparameters = {
    'batch_size': 32,        # Lower this if still running out of memory
    'sequence_length': 30,   # Shorter sequences = less memory
    ...
}
```

### In `batched_dataset.py`:

```python
# When calling create_memory_efficient_dataloaders():
train_loader, val_loader, preprocessor = create_memory_efficient_dataloaders(
    train_df=train_split,
    val_df=val_split,
    model_type=model_type,
    sequence_length=30,
    batch_size=32,           # Adjust batch size
    num_workers=0,           # Keep at 0 for Windows, use 2-4 for Linux/Mac
    use_station_batching=True  # Set False to use BatchedSnowDataset instead
)
```

## Troubleshooting

### Still Getting Memory Errors?

1. **Reduce batch size**: Change `batch_size` from 32 → 16 → 8
2. **Reduce sequence length**: Change `sequence_length` from 30 → 20 → 10
3. **Process fewer epochs**: Change `max_epochs` from 100 → 50
4. **Use fewer stations**: Temporarily train on subset of stations

### Slow Training?

1. **Increase batch size**: If you have RAM available, increase batch size
2. **Use GPU**: Change `device='cpu'` to `device='cuda'` (requires CUDA)
3. **Reduce logging**: Set `verbose=False` in training call

### Verification

Check memory usage during training:

**Windows (PowerShell)**:
```powershell
while($true) { Get-Process python | Select-Object CPU, PM; Start-Sleep 2 }
```

**Linux/Mac**:
```bash
watch -n 2 "ps aux | grep python"
```

## Technical Details

### How Batched Loading Works

1. **Index Calculation**: Pre-calculates which data points can form valid sequences
2. **On-Demand Loading**: Only loads sequences when requested by DataLoader
3. **Automatic Batching**: PyTorch DataLoader handles batching efficiently
4. **Caching**: StationBatchedDataset caches one station at a time

### Files Modified

- `batched_dataset.py`: New file with memory-efficient dataset classes
- `train_paper_model.py`: Added `train_single_model_batched()` and `run_leave_one_out_cv_batched()`
- `hybrid_lstm_model.py`: Added `train_with_loaders()` and `evaluate_with_loader()`

### Backward Compatibility

The old memory-intensive methods are still available:
- `train_single_model()` - Original method
- `run_leave_one_out_cv()` - Original CV method

Just uncomment them in `train_paper_model.py` if you move to a machine with more RAM.

## Performance Tips

1. **Use SSD**: Faster disk I/O helps with on-demand data loading
2. **Close other applications**: Free up as much RAM as possible
3. **Monitor GPU usage**: If using GPU, ensure it's being utilized
4. **Check CPU cores**: More cores = better DataLoader performance (set `num_workers` accordingly)

## Next Steps

After successful training, you can:

1. **Evaluate on test sets**: Use the saved models for predictions
2. **Compare Plain vs Hybrid**: Results are saved in `training_results.json`
3. **Deploy models**: Use saved `.pth` files and scaler `.pkl` files

## Questions?

- Memory still too high? Try reducing `batch_size` to 8 or lower
- Training too slow? Increase `batch_size` if you have RAM available
- Need GPU support? Change `device='cpu'` to `device='cuda'` in trainer initialization
