"""
k-Nearest Neighbors classifier for multi-label classification.
"""

import numpy as np
from sklearn.neighbors import NearestNeighbors
from collections import Counter


class KNNClassifier:
    """
    k-NN based multi-label classifier using cosine similarity.
    Predicts labels based on majority voting from k nearest neighbors.
    """

    def __init__(self, k: int = 5):
        """
        Initialize the k-NN classifier.

        Args:
            k: Number of nearest neighbors to consider.
        """
        self.k = k
        self.nn = NearestNeighbors(n_neighbors=k, metric="cosine")
        self.train_labels = None
        self.train_embeddings = None

    def fit(self, embeddings: np.ndarray, labels: list[set[str]]) -> None:
        """
        Fit the classifier on training data.

        Args:
            embeddings: Training embeddings of shape (n_samples, embedding_dim).
            labels: List of label sets for each training sample.
        """
        self.train_embeddings = embeddings
        self.train_labels = labels
        self.nn.fit(embeddings)

    def predict(
        self,
        embeddings: np.ndarray,
        threshold: float = 0.5
    ) -> tuple[list[set[str]], list[list[str]]]:
        """
        Predict labels for new samples.

        Args:
            embeddings: Query embeddings of shape (n_samples, embedding_dim).
            threshold: Minimum fraction of neighbors required for a label.

        Returns:
            Tuple of (predicted label sets, ranked label lists).
        """
        distances, indices = self.nn.kneighbors(embeddings)

        predictions = []
        ranked_predictions = []

        for neighbor_indices in indices:
            # Collect all labels from neighbors
            label_counts = Counter()
            for idx in neighbor_indices:
                for label in self.train_labels[idx]:
                    label_counts[label] += 1

            # Rank labels by frequency
            ranked = [label for label, _ in label_counts.most_common()]
            ranked_predictions.append(ranked)

            # Threshold for inclusion
            min_count = int(self.k * threshold)
            predicted_labels = {
                label for label, count in label_counts.items()
                if count >= max(1, min_count)
            }
            predictions.append(predicted_labels)

        return predictions, ranked_predictions

    def predict_proba(self, embeddings: np.ndarray) -> list[dict[str, float]]:
        """
        Get probability scores for each label based on neighbor voting.

        Args:
            embeddings: Query embeddings of shape (n_samples, embedding_dim).

        Returns:
            List of dicts mapping label to probability (0-1).
        """
        distances, indices = self.nn.kneighbors(embeddings)

        probabilities = []

        for neighbor_indices in indices:
            label_counts = Counter()
            for idx in neighbor_indices:
                for label in self.train_labels[idx]:
                    label_counts[label] += 1

            probs = {
                label: count / self.k
                for label, count in label_counts.items()
            }
            probabilities.append(probs)

        return probabilities
