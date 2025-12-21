"""
Evaluation metrics for multi-label classification.
"""

from collections import defaultdict
import numpy as np


def top_k_accuracy(
    y_true: list[set[str]],
    y_pred_ranked: list[list[str]],
    k: int = 3
) -> float:
    """
    Calculate Top-K accuracy.
    At least one true label should be in the top K predictions.

    Args:
        y_true: List of sets of true labels for each sample.
        y_pred_ranked: List of ranked prediction lists for each sample.
        k: Number of top predictions to consider.

    Returns:
        Top-K accuracy score.
    """
    correct = 0
    for true_labels, pred_labels in zip(y_true, y_pred_ranked):
        top_k_preds = set(pred_labels[:k])
        if len(true_labels & top_k_preds) > 0:
            correct += 1
    return correct / len(y_true) if y_true else 0.0


def macro_f1(
    y_true: list[set[str]],
    y_pred: list[set[str]],
    all_labels: list[str]
) -> float:
    """
    Calculate macro-averaged F1 score.

    Args:
        y_true: List of sets of true labels for each sample.
        y_pred: List of sets of predicted labels for each sample.
        all_labels: List of all possible labels.

    Returns:
        Macro F1 score.
    """
    f1_scores = []

    for label in all_labels:
        tp = sum(1 for t, p in zip(y_true, y_pred) if label in t and label in p)
        fp = sum(1 for t, p in zip(y_true, y_pred) if label not in t and label in p)
        fn = sum(1 for t, p in zip(y_true, y_pred) if label in t and label not in p)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        f1_scores.append(f1)

    return np.mean(f1_scores) if f1_scores else 0.0


def per_label_recall(
    y_true: list[set[str]],
    y_pred: list[set[str]],
    all_labels: list[str]
) -> dict[str, float]:
    """
    Calculate per-label recall.

    Args:
        y_true: List of sets of true labels for each sample.
        y_pred: List of sets of predicted labels for each sample.
        all_labels: List of all possible labels.

    Returns:
        Dictionary mapping label to recall score.
    """
    recalls = {}

    for label in all_labels:
        true_positives = sum(1 for t, p in zip(y_true, y_pred) if label in t and label in p)
        false_negatives = sum(1 for t, p in zip(y_true, y_pred) if label in t and label not in p)

        total = true_positives + false_negatives
        recalls[label] = true_positives / total if total > 0 else 0.0

    return recalls


def per_label_precision(
    y_true: list[set[str]],
    y_pred: list[set[str]],
    all_labels: list[str]
) -> dict[str, float]:
    """
    Calculate per-label precision.

    Args:
        y_true: List of sets of true labels for each sample.
        y_pred: List of sets of predicted labels for each sample.
        all_labels: List of all possible labels.

    Returns:
        Dictionary mapping label to precision score.
    """
    precisions = {}

    for label in all_labels:
        true_positives = sum(1 for t, p in zip(y_true, y_pred) if label in t and label in p)
        false_positives = sum(1 for t, p in zip(y_true, y_pred) if label not in t and label in p)

        total = true_positives + false_positives
        precisions[label] = true_positives / total if total > 0 else 0.0

    return precisions


def label_distribution(y: list[set[str]]) -> dict[str, int]:
    """
    Count label occurrences in the dataset.

    Args:
        y: List of sets of labels.

    Returns:
        Dictionary mapping label to count.
    """
    counts = defaultdict(int)
    for labels in y:
        for label in labels:
            counts[label] += 1
    return dict(counts)
