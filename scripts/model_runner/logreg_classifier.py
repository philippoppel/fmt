"""
Logistic Regression classifier for multi-label classification.
Uses One-vs-Rest strategy.
"""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer


class LogRegClassifier:
    """
    Logistic Regression multi-label classifier using One-vs-Rest strategy.
    """

    def __init__(self, threshold: float = 0.5, max_iter: int = 1000):
        """
        Initialize the classifier.

        Args:
            threshold: Probability threshold for predicting a label.
            max_iter: Maximum iterations for logistic regression.
        """
        self.threshold = threshold
        self.max_iter = max_iter
        self.classifier = None
        self.mlb = MultiLabelBinarizer()
        self.all_labels = None

    def fit(self, embeddings: np.ndarray, labels: list[set[str]]) -> None:
        """
        Fit the classifier on training data.

        Args:
            embeddings: Training embeddings of shape (n_samples, embedding_dim).
            labels: List of label sets for each training sample.
        """
        # Convert label sets to lists for MultiLabelBinarizer
        label_lists = [list(label_set) for label_set in labels]

        # Fit the binarizer and transform labels
        y_train = self.mlb.fit_transform(label_lists)
        self.all_labels = list(self.mlb.classes_)

        # Create and fit the classifier
        base_clf = LogisticRegression(max_iter=self.max_iter, solver="lbfgs")
        self.classifier = OneVsRestClassifier(base_clf)
        self.classifier.fit(embeddings, y_train)

    def predict(
        self,
        embeddings: np.ndarray,
        threshold: float | None = None
    ) -> tuple[list[set[str]], list[list[str]]]:
        """
        Predict labels for new samples.

        Args:
            embeddings: Query embeddings of shape (n_samples, embedding_dim).
            threshold: Override the default threshold.

        Returns:
            Tuple of (predicted label sets, ranked label lists).
        """
        if threshold is None:
            threshold = self.threshold

        proba = self.classifier.predict_proba(embeddings)

        predictions = []
        ranked_predictions = []

        for sample_proba in proba:
            # Get labels above threshold
            predicted_labels = set()
            for i, prob in enumerate(sample_proba):
                if prob >= threshold:
                    predicted_labels.add(self.all_labels[i])
            predictions.append(predicted_labels)

            # Rank all labels by probability
            label_probs = list(zip(self.all_labels, sample_proba))
            label_probs.sort(key=lambda x: x[1], reverse=True)
            ranked = [label for label, _ in label_probs]
            ranked_predictions.append(ranked)

        return predictions, ranked_predictions

    def predict_proba(self, embeddings: np.ndarray) -> list[dict[str, float]]:
        """
        Get probability scores for each label.

        Args:
            embeddings: Query embeddings of shape (n_samples, embedding_dim).

        Returns:
            List of dicts mapping label to probability (0-1).
        """
        proba = self.classifier.predict_proba(embeddings)

        probabilities = []
        for sample_proba in proba:
            probs = {
                label: float(prob)
                for label, prob in zip(self.all_labels, sample_proba)
            }
            probabilities.append(probs)

        return probabilities
