#!/bin/bash
# Quick setup script for Azure ML Compute Instance

echo "=========================================="
echo "Snow LSTM Training - Environment Setup"
echo "=========================================="

# Check if environment.yml exists
if [ ! -f "environment.yml" ]; then
    echo "❌ Error: environment.yml not found!"
    echo "Please make sure you've uploaded all files to this directory."
    exit 1
fi

# Remove existing environment if it exists
echo ""
echo "Checking for existing environment..."
if conda env list | grep -q "snow-lstm-training"; then
    echo "Removing existing environment..."
    conda env remove -n snow-lstm-training -y
fi

# Create environment
echo ""
echo "Creating conda environment (this may take 5-10 minutes)..."
conda env create -f environment.yml

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Environment created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Activate environment:    conda activate snow-lstm-training"
    echo "2. Start training:          python train_paper_model.py"
    echo ""
    echo "To use GPU (if available):"
    echo "1. Edit environment.yml: replace 'cpuonly' with 'pytorch-cuda=11.8'"
    echo "2. Edit train_paper_model.py line 134: change device='cpu' to device='cuda'"
    echo "3. Re-run this setup script"
    echo ""
else
    echo ""
    echo "❌ Environment creation failed!"
    echo ""
    echo "Try manual setup:"
    echo "  conda create -n snow-lstm python=3.10 -y"
    echo "  conda activate snow-lstm"
    echo "  pip install -r requirements.txt"
    exit 1
fi
