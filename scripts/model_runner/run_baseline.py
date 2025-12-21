#!/usr/bin/env python3
"""
Baseline model runner for the labelling portal.
Loads exported JSONL data, trains a classifier, and reports metrics.

Usage:
    python run_baseline.py --input export.jsonl --method knn --callback http://localhost:3000/api/labelling/model-callback

Environment:
    MODEL_RUN_ID: ID of the model run for callback
"""

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
import requests
from sklearn.model_selection import train_test_split

from embeddings import embed_texts
from metrics import top_k_accuracy, macro_f1, per_label_recall, label_distribution
from knn_classifier import KNNClassifier
from logreg_classifier import LogRegClassifier


def load_jsonl(filepath: str) -> list[dict]:
    """Load data from JSONL file."""
    data = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    return data


def extract_labels(item: dict) -> set[str]:
    """Extract primary category labels from a data item."""
    labels_main = item.get("labels_main", [])
    return {label["key"] for label in labels_main}


def run_training(
    data: list[dict],
    method: str,
    k: int = 5,
    threshold: float = 0.5,
    test_split: float = 0.2,
    random_seed: int = 42
) -> dict:
    """
    Run training and evaluation.

    Args:
        data: List of data items from JSONL.
        method: "knn" or "logreg".
        k: Number of neighbors for k-NN.
        threshold: Prediction threshold.
        test_split: Fraction of data for testing.
        random_seed: Random seed for reproducibility.

    Returns:
        Dictionary with metrics and metadata.
    """
    # Extract texts and labels
    texts = [item["text"] for item in data]
    labels = [extract_labels(item) for item in data]

    # Get all unique labels
    all_labels = sorted(set(label for label_set in labels for label in label_set))
    print(f"Found {len(all_labels)} unique labels: {all_labels}")

    # Check minimum data requirements
    if len(data) < 10:
        return {
            "error": f"Insufficient data: {len(data)} samples (minimum 10 required)"
        }

    # Split data
    texts_train, texts_test, labels_train, labels_test = train_test_split(
        texts, labels, test_size=test_split, random_state=random_seed
    )

    print(f"Training samples: {len(texts_train)}")
    print(f"Test samples: {len(texts_test)}")

    # Generate embeddings
    print("Generating embeddings...")
    train_embeddings = embed_texts(texts_train)
    test_embeddings = embed_texts(texts_test)

    # Train classifier
    print(f"Training {method} classifier...")
    if method == "knn":
        classifier = KNNClassifier(k=k)
        classifier.fit(train_embeddings, labels_train)
        predictions, ranked_predictions = classifier.predict(test_embeddings, threshold=threshold)
    elif method == "logreg":
        classifier = LogRegClassifier(threshold=threshold)
        classifier.fit(train_embeddings, labels_train)
        predictions, ranked_predictions = classifier.predict(test_embeddings)
    else:
        return {"error": f"Unknown method: {method}"}

    # Calculate metrics
    print("Calculating metrics...")
    top3_acc = top_k_accuracy(labels_test, ranked_predictions, k=3)
    macro_f1_score = macro_f1(labels_test, predictions, all_labels)
    per_label_rec = per_label_recall(labels_test, predictions, all_labels)

    # Label distribution in training data
    train_distribution = label_distribution(labels_train)

    metrics = {
        "top3_accuracy": round(top3_acc, 4),
        "macro_f1": round(macro_f1_score, 4),
        "per_label_recall": {k: round(v, 4) for k, v in per_label_rec.items()},
        "train_samples": len(texts_train),
        "test_samples": len(texts_test),
        "unique_labels": len(all_labels),
        "label_distribution": train_distribution
    }

    print(f"\nResults:")
    print(f"  Top-3 Accuracy: {metrics['top3_accuracy']:.2%}")
    print(f"  Macro F1: {metrics['macro_f1']:.2%}")
    print(f"  Per-label recall:")
    for label, recall in sorted(per_label_rec.items(), key=lambda x: x[1], reverse=True):
        print(f"    {label}: {recall:.2%}")

    return metrics


def send_callback(callback_url: str, run_id: str, metrics: dict, status: str) -> bool:
    """Send results to callback URL."""
    try:
        payload = {
            "runId": run_id,
            "status": status,
            "metrics": metrics if status == "completed" else None,
            "error": metrics.get("error") if status == "failed" else None
        }
        response = requests.post(callback_url, json=payload, timeout=30)
        response.raise_for_status()
        print(f"Callback sent successfully: {status}")
        return True
    except requests.RequestException as e:
        print(f"Failed to send callback: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Run baseline classifier training")
    parser.add_argument("--input", required=True, help="Path to JSONL export file")
    parser.add_argument("--method", choices=["knn", "logreg"], default="knn", help="Classification method")
    parser.add_argument("--k", type=int, default=5, help="Number of neighbors for k-NN")
    parser.add_argument("--threshold", type=float, default=0.5, help="Prediction threshold")
    parser.add_argument("--test-split", type=float, default=0.2, help="Test split fraction")
    parser.add_argument("--random-seed", type=int, default=42, help="Random seed")
    parser.add_argument("--callback", help="Callback URL for results")
    parser.add_argument("--output", help="Output file for metrics JSON")

    args = parser.parse_args()

    # Get run ID from environment
    run_id = os.environ.get("MODEL_RUN_ID", "unknown")

    print(f"Model Run ID: {run_id}")
    print(f"Input file: {args.input}")
    print(f"Method: {args.method}")
    print(f"Parameters: k={args.k}, threshold={args.threshold}, test_split={args.test_split}")

    # Load data
    if not Path(args.input).exists():
        error = f"Input file not found: {args.input}"
        print(error)
        if args.callback:
            send_callback(args.callback, run_id, {"error": error}, "failed")
        sys.exit(1)

    data = load_jsonl(args.input)
    print(f"Loaded {len(data)} samples")

    # Run training
    metrics = run_training(
        data=data,
        method=args.method,
        k=args.k,
        threshold=args.threshold,
        test_split=args.test_split,
        random_seed=args.random_seed
    )

    # Check for errors
    if "error" in metrics:
        print(f"Error: {metrics['error']}")
        if args.callback:
            send_callback(args.callback, run_id, metrics, "failed")
        sys.exit(1)

    # Save metrics if output specified
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)
        print(f"Metrics saved to: {args.output}")

    # Send callback if specified
    if args.callback:
        send_callback(args.callback, run_id, metrics, "completed")

    print("\nDone!")


if __name__ == "__main__":
    main()
