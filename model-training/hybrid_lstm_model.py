"""
Hybrid LSTM Model for Snow Depth Prediction
Implements both Plain LSTM and Hybrid LSTM following Steele et al. (2024)
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from typing import Tuple, Dict, List
import pickle
from pathlib import Path


class SnowLSTM(nn.Module):
    """
    LSTM model for snow depth and SWE prediction

    Can be configured as:
    - Plain LSTM (7 inputs)
    - Hybrid LSTM (10 inputs)
    """

    def __init__(self, input_size: int, hidden_size: int = 150,
                 num_layers: int = 1, dropout: float = 0.4,
                 output_size: int = 2):
        """
        Initialize LSTM model following Steele et al. (2024)

        Paper specifications:
        - Hidden units: 150
        - Dropout: 0.4
        - Single LSTM layer
        - MSE loss
        - ADAM optimizer with lr=0.005

        Args:
            input_size: Number of input features (7 for plain, 10 for hybrid)
            hidden_size: Number of hidden units (paper uses 150)
            num_layers: Number of LSTM layers (paper uses 1)
            dropout: Dropout rate (paper uses 0.4)
            output_size: Number of outputs (2: SNWD and WTEQ)
        """
        super(SnowLSTM, self).__init__()

        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        # LSTM layer (single layer as per paper)
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0  # Not used for single layer
        )

        # Dropout layer (applied after LSTM)
        self.dropout = nn.Dropout(dropout)

        # Fully connected output layer
        self.fc = nn.Linear(hidden_size, output_size)

        # Activation to ensure non-negative outputs (snow can't be negative)
        self.relu = nn.ReLU()

    def forward(self, x):
        """
        Forward pass following paper architecture

        Args:
            x: Input tensor (batch_size, sequence_length, input_size)

        Returns:
            Output tensor (batch_size, output_size) [SNWD, WTEQ]
        """
        # LSTM forward
        lstm_out, (hidden, cell) = self.lstm(x)

        # Use the last output timestep
        last_output = lstm_out[:, -1, :]

        # Apply dropout
        dropout_out = self.dropout(last_output)

        # Fully connected layer
        output = self.fc(dropout_out)

        # Ensure non-negative (snow depth/SWE can't be negative)
        output = self.relu(output)

        return output


class SnowDataset(Dataset):
    """PyTorch Dataset for snow data"""

    def __init__(self, X: np.ndarray, y: np.ndarray):
        """
        Args:
            X: Input sequences (samples, sequence_length, features)
            y: Target values (samples, 2) [SNWD, WTEQ]
        """
        self.X = torch.FloatTensor(X)
        self.y = torch.FloatTensor(y)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


class SnowModelTrainer:
    """
    Trainer for Snow LSTM models
    Handles training, validation, and evaluation
    """

    def __init__(self, model_type: str = 'hybrid', device: str = 'cpu'):
        """
        Args:
            model_type: 'plain' or 'hybrid'
            device: 'cpu' or 'cuda'
        """
        self.model_type = model_type
        self.device = torch.device(device)
        self.model = None
        self.train_losses = []
        self.val_losses = []

    def create_model(self, input_size: int, hidden_size: int = 150,
                    num_layers: int = 1, dropout: float = 0.4) -> SnowLSTM:
        """
        Create LSTM model

        Args:
            input_size: Number of features (7 or 10)
            hidden_size: LSTM hidden size
            num_layers: Number of LSTM layers
            dropout: Dropout rate

        Returns:
            SnowLSTM model
        """
        self.model = SnowLSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout,
            output_size=2  # SNWD and WTEQ
        ).to(self.device)

        return self.model

    def train_epoch(self, train_loader: DataLoader, optimizer, criterion) -> float:
        """
        Train for one epoch

        Returns:
            Average training loss
        """
        self.model.train()
        total_loss = 0
        n_batches = 0
        total_batches = len(train_loader)

        # Progress reporting intervals
        report_interval = max(1, total_batches // 10)  # Report 10 times per epoch

        for batch_idx, (X_batch, y_batch) in enumerate(train_loader):
            X_batch = X_batch.to(self.device)
            y_batch = y_batch.to(self.device)

            # Forward pass
            optimizer.zero_grad()
            predictions = self.model(X_batch)

            # Calculate loss
            loss = criterion(predictions, y_batch)

            # Backward pass
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            n_batches += 1

            # Progress reporting
            if (batch_idx + 1) % report_interval == 0 or (batch_idx + 1) == total_batches:
                avg_loss = total_loss / n_batches
                print(f"  Batch {batch_idx + 1}/{total_batches} - Avg Loss: {avg_loss:.4f}")

        return total_loss / n_batches

    def validate(self, val_loader: DataLoader, criterion) -> float:
        """
        Validate model

        Returns:
            Average validation loss
        """
        self.model.eval()
        total_loss = 0
        n_batches = 0
        total_batches = len(val_loader)

        with torch.no_grad():
            for batch_idx, (X_batch, y_batch) in enumerate(val_loader):
                X_batch = X_batch.to(self.device)
                y_batch = y_batch.to(self.device)

                predictions = self.model(X_batch)
                loss = criterion(predictions, y_batch)

                total_loss += loss.item()
                n_batches += 1

        print(f"  Validation: {total_batches} batches processed")
        return total_loss / n_batches

    def train_with_loaders(self, train_loader: DataLoader, val_loader: DataLoader,
                          epochs: int = 100, learning_rate: float = 0.001,
                          patience: int = 10, verbose: bool = True) -> Dict:
        """
        Train the model using pre-made DataLoaders (memory-efficient)

        Args:
            train_loader: Training DataLoader
            val_loader: Validation DataLoader
            epochs: Number of training epochs
            learning_rate: Learning rate
            patience: Early stopping patience
            verbose: Print progress

        Returns:
            Training history dictionary
        """
        # Loss and optimizer
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)

        # Early stopping
        best_val_loss = float('inf')
        patience_counter = 0
        best_model_state = None

        # Training loop
        for epoch in range(epochs):
            if verbose:
                print(f"\nEpoch {epoch+1}/{epochs} - Starting...")

            train_loss = self.train_epoch(train_loader, optimizer, criterion)
            val_loss = self.validate(val_loader, criterion)

            self.train_losses.append(train_loss)
            self.val_losses.append(val_loss)

            if verbose:
                print(f"Epoch {epoch+1}/{epochs} Complete - Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")

            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                best_model_state = self.model.state_dict().copy()
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    if verbose:
                        print(f"Early stopping at epoch {epoch+1}")
                    break

        # Load best model
        if best_model_state is not None:
            self.model.load_state_dict(best_model_state)

        history = {
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'best_val_loss': best_val_loss
        }

        return history

    def evaluate_with_loader(self, data_loader: DataLoader) -> Dict:
        """
        Evaluate model performance using a DataLoader (memory-efficient)

        Args:
            data_loader: DataLoader with test data

        Returns:
            Dictionary with metrics (RMSE, MAE, R²)
        """
        self.model.eval()

        all_predictions = []
        all_targets = []

        with torch.no_grad():
            for X_batch, y_batch in data_loader:
                X_batch = X_batch.to(self.device)
                predictions = self.model(X_batch)

                all_predictions.append(predictions.cpu().numpy())
                all_targets.append(y_batch.numpy())

        # Concatenate all batches
        predictions = np.vstack(all_predictions)
        y_test = np.vstack(all_targets)

        # Calculate metrics for each output
        metrics = {}

        for i, var in enumerate(['SNWD', 'WTEQ']):
            y_true = y_test[:, i]
            y_pred = predictions[:, i]

            # RMSE
            rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))

            # MAE
            mae = np.mean(np.abs(y_true - y_pred))

            # R²
            ss_res = np.sum((y_true - y_pred) ** 2)
            ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

            metrics[var] = {
                'RMSE': rmse,
                'MAE': mae,
                'R2': r2
            }

        return metrics

    def train(self, X_train: np.ndarray, y_train: np.ndarray,
             X_val: np.ndarray, y_val: np.ndarray,
             epochs: int = 100, batch_size: int = 32,
             learning_rate: float = 0.001, patience: int = 10,
             verbose: bool = True) -> Dict:
        """
        Train the model

        Args:
            X_train, y_train: Training data
            X_val, y_val: Validation data
            epochs: Number of training epochs
            batch_size: Batch size
            learning_rate: Learning rate
            patience: Early stopping patience
            verbose: Print progress

        Returns:
            Training history dictionary
        """
        # Create datasets and dataloaders
        train_dataset = SnowDataset(X_train, y_train)
        val_dataset = SnowDataset(X_val, y_val)

        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

        # Loss and optimizer
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)

        # Early stopping
        best_val_loss = float('inf')
        patience_counter = 0
        best_model_state = None

        # Training loop
        for epoch in range(epochs):
            if verbose:
                print(f"\nEpoch {epoch+1}/{epochs} - Starting...")

            train_loss = self.train_epoch(train_loader, optimizer, criterion)
            val_loss = self.validate(val_loader, criterion)

            self.train_losses.append(train_loss)
            self.val_losses.append(val_loss)

            if verbose:
                print(f"Epoch {epoch+1}/{epochs} Complete - Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")

            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                best_model_state = self.model.state_dict().copy()
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    if verbose:
                        print(f"Early stopping at epoch {epoch+1}")
                    break

        # Load best model
        if best_model_state is not None:
            self.model.load_state_dict(best_model_state)

        history = {
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'best_val_loss': best_val_loss
        }

        return history

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Make predictions

        Args:
            X: Input data (samples, sequence_length, features)

        Returns:
            Predictions (samples, 2) [SNWD, WTEQ]
        """
        self.model.eval()

        X_tensor = torch.FloatTensor(X).to(self.device)

        with torch.no_grad():
            predictions = self.model(X_tensor)

        return predictions.cpu().numpy()

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict:
        """
        Evaluate model performance

        Args:
            X_test, y_test: Test data

        Returns:
            Dictionary with metrics (RMSE, MAE, R²)
        """
        predictions = self.predict(X_test)

        # Calculate metrics for each output
        metrics = {}

        for i, var in enumerate(['SNWD', 'WTEQ']):
            y_true = y_test[:, i]
            y_pred = predictions[:, i]

            # RMSE
            rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))

            # MAE
            mae = np.mean(np.abs(y_true - y_pred))

            # R²
            ss_res = np.sum((y_true - y_pred) ** 2)
            ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

            metrics[var] = {
                'RMSE': rmse,
                'MAE': mae,
                'R2': r2
            }

        return metrics

    def save_model(self, filepath: str):
        """Save model to file"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'model_type': self.model_type,
            'input_size': self.model.input_size,
            'hidden_size': self.model.hidden_size,
            'num_layers': self.model.num_layers
        }, filepath)

    def load_model(self, filepath: str):
        """Load model from file"""
        checkpoint = torch.load(filepath, map_location=self.device)

        self.model = SnowLSTM(
            input_size=checkpoint['input_size'],
            hidden_size=checkpoint['hidden_size'],
            num_layers=checkpoint['num_layers']
        ).to(self.device)

        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model_type = checkpoint['model_type']


# Example usage
if __name__ == "__main__":
    print("=" * 80)
    print("Testing Snow LSTM Model")
    print("=" * 80)

    # Create dummy data
    n_samples = 1000
    sequence_length = 30
    plain_features = 7
    hybrid_features = 10

    X_plain = np.random.randn(n_samples, sequence_length, plain_features)
    X_hybrid = np.random.randn(n_samples, sequence_length, hybrid_features)
    y = np.random.rand(n_samples, 2) * 50  # Random snow depth and SWE

    # Split data
    split = int(0.8 * n_samples)
    X_train, X_val = X_plain[:split], X_plain[split:]
    y_train, y_val = y[:split], y[split:]

    # Test Plain LSTM
    print("\n" + "=" * 80)
    print("Testing Plain LSTM (7 inputs)")
    print("=" * 80)

    plain_trainer = SnowModelTrainer(model_type='plain')
    plain_trainer.create_model(input_size=7, hidden_size=64, num_layers=2)

    print(f"Model created: {sum(p.numel() for p in plain_trainer.model.parameters())} parameters")

    history = plain_trainer.train(
        X_train, y_train, X_val, y_val,
        epochs=50, batch_size=32, verbose=True
    )

    print(f"\nBest validation loss: {history['best_val_loss']:.4f}")

    # Evaluate
    metrics = plain_trainer.evaluate(X_val, y_val)
    print("\nValidation Metrics:")
    for var, vals in metrics.items():
        print(f"  {var}:")
        for metric, value in vals.items():
            print(f"    {metric}: {value:.4f}")

    # Save model
    plain_trainer.save_model('plain_lstm_model.pth')
    print("\nModel saved to plain_lstm_model.pth")

    # Test Hybrid LSTM
    print("\n" + "=" * 80)
    print("Testing Hybrid LSTM (10 inputs)")
    print("=" * 80)

    X_train_h, X_val_h = X_hybrid[:split], X_hybrid[split:]

    hybrid_trainer = SnowModelTrainer(model_type='hybrid')
    hybrid_trainer.create_model(input_size=10, hidden_size=64, num_layers=2)

    print(f"Model created: {sum(p.numel() for p in hybrid_trainer.model.parameters())} parameters")

    history_h = hybrid_trainer.train(
        X_train_h, y_train, X_val_h, y_val,
        epochs=50, batch_size=32, verbose=True
    )

    print(f"\nBest validation loss: {history_h['best_val_loss']:.4f}")

    metrics_h = hybrid_trainer.evaluate(X_val_h, y_val)
    print("\nValidation Metrics:")
    for var, vals in metrics_h.items():
        print(f"  {var}:")
        for metric, value in vals.items():
            print(f"    {metric}: {value:.4f}")

    hybrid_trainer.save_model('hybrid_lstm_model.pth')
    print("\nModel saved to hybrid_lstm_model.pth")

    print("\n" + "=" * 80)
    print("Model architecture ready for training on real data!")
    print("=" * 80)
