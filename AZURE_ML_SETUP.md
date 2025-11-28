# Azure Machine Learning Setup Guide

## Quick Setup

### Method 1: Using Conda Environment (Recommended)

1. **Upload your files to Azure ML**
   - Upload all `.py` files
   - Upload `training_data_2008_2024.csv`
   - Upload `environment.yml`

2. **In your compute instance terminal**, run:
   ```bash
   # Create environment from YAML
   conda env create -f environment.yml

   # Activate environment
   conda activate snow-lstm-training

   # Verify installation
   python -c "import torch; import pandas; import sklearn; print('All packages installed!')"
   ```

3. **Run training**:
   ```bash
   python train_paper_model.py
   ```

### Method 2: Using pip (Alternative)

```bash
# Create new environment
conda create -n snow-lstm python=3.10 -y
conda activate snow-lstm

# Install PyTorch (CPU version)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install azure-ai-ml
pip install azureml-core

# For GPU version instead:
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install other requirements
pip install -r requirements.txt
```

## For GPU Training (Recommended for Speed)

If your compute instance has a GPU:

1. **Modify `environment.yml`**:
   ```yaml
   # Replace this line:
   - cpuonly

   # With this line:
   - pytorch-cuda=11.8  # Check your CUDA version with: nvidia-smi
   ```

2. **Modify `train_paper_model.py` line 134**:
   ```python
   # Change from:
   trainer = SnowModelTrainer(model_type=model_type, device='cpu')

   # To:
   trainer = SnowModelTrainer(model_type=model_type, device='cuda')
   ```

3. **Recreate environment**:
   ```bash
   conda env remove -n snow-lstm-training
   conda env create -f environment.yml
   conda activate snow-lstm-training
   ```

## File Structure on Azure ML

Your workspace should look like:
```
/home/azureuser/cloudfiles/code/Users/<your-name>/
├── train_paper_model.py
├── data_preprocessing.py
├── hybrid_lstm_model.py
├── batched_dataset.py
├── training_data_2008_2024.csv
├── environment.yml
├── requirements.txt
├── trained_models/          # Will be created automatically
│   ├── hybrid_lstm_fold01_*.pth
│   ├── scalers_hybrid_fold01.pkl
│   └── training_results.json
```

## Running Training

### Option 1: Interactive Terminal
```bash
conda activate snow-lstm-training
python train_paper_model.py
```

### Option 2: As a Job (Runs in Background)
Create a file called `run_training.py`:
```python
from azureml.core import Workspace, Experiment, ScriptRunConfig, Environment

# Connect to workspace
ws = Workspace.from_config()

# Create environment from conda file
env = Environment.from_conda_specification(
    name='snow-lstm-env',
    file_path='environment.yml'
)

# Configure the script run
src = ScriptRunConfig(
    source_directory='.',
    script='train_paper_model.py',
    compute_target='your-compute-instance-name',  # Replace with your compute name
    environment=env
)

# Submit experiment
exp = Experiment(workspace=ws, name='snow-lstm-training')
run = exp.submit(src)

print(f"Run submitted: {run.get_portal_url()}")
run.wait_for_completion(show_output=True)
```

Then run:
```bash
python run_training.py
```

## Monitoring Training

### Check Progress
```bash
# Watch the output
tail -f nohup.out  # If running in background

# Check saved models
ls -lh trained_models/

# Check results JSON
cat trained_models/training_results.json
```

### Monitor GPU Usage (if using GPU)
```bash
watch -n 1 nvidia-smi
```

### Monitor Memory Usage
```bash
watch -n 2 free -h
```

## Downloading Results

After training completes:

```bash
# Download all models and results
az ml folder download --path trained_models --output-path ./local_trained_models
```

Or use the Azure ML Studio UI:
1. Go to Notebooks → Files
2. Navigate to `trained_models/`
3. Select files → Download

## Troubleshooting

### "ModuleNotFoundError"
```bash
# Make sure environment is activated
conda activate snow-lstm-training

# Reinstall requirements
pip install -r requirements.txt
```

### "CUDA out of memory" (GPU)
Reduce batch size in `train_paper_model.py` line 43:
```python
'batch_size': 16,  # Or even 8
```

### "FileNotFoundError: training_data_2008_2024.csv"
```bash
# Check file exists
ls -l training_data_2008_2024.csv

# If not, upload it to the same directory as your scripts
```

### Training is slow
- Use GPU compute (much faster)
- Increase batch size if you have memory available
- Use a larger VM size

## Compute Instance Recommendations

### For CPU Training
- **Standard_D4s_v3** (4 cores, 16 GB RAM) - Minimum
- **Standard_D8s_v3** (8 cores, 32 GB RAM) - Better

### For GPU Training (Much Faster!)
- **Standard_NC6** (1 K80 GPU, 6 cores, 56 GB RAM)
- **Standard_NC6s_v3** (1 V100 GPU) - Recommended
- **Standard_NC4as_T4_v3** (1 T4 GPU) - Cost-effective

## Expected Training Times

| Compute Type | Approximate Time (49 stations, hybrid) |
|--------------|---------------------------------------|
| CPU (4 cores) | 48-72 hours |
| CPU (8 cores) | 24-36 hours |
| GPU (K80) | 6-8 hours |
| GPU (V100) | 2-3 hours |
| GPU (T4) | 3-4 hours |

## Cost Optimization

To save costs:

1. **Use Auto-shutdown**:
   - In Azure ML Studio: Compute → Your Instance → Edit → Auto-shutdown → Enable

2. **Stop when not training**:
   ```bash
   # Before leaving
   az ml compute stop --name your-compute-instance
   ```

3. **Use Spot instances** (for non-critical training):
   - Can save 60-80% on compute costs
   - May be preempted, but training saves after each fold

## Quick Command Reference

```bash
# Activate environment
conda activate snow-lstm-training

# Start training
python train_paper_model.py

# Check progress (while running)
tail -f nohup.out

# List saved models
ls -lh trained_models/

# Check results
python -c "import json; print(json.dumps(json.load(open('trained_models/training_results.json')), indent=2))"

# Monitor resources
htop  # or top
nvidia-smi  # for GPU

# Deactivate environment
conda deactivate
```

## Need Help?

Common issues:
1. **Environment not activating**: Make sure you're in the right directory
2. **Out of memory**: Reduce batch_size in train_paper_model.py
3. **Slow training**: Consider GPU compute or reduce number of epochs
4. **Files not found**: Check all .py files and .csv are uploaded to same directory
