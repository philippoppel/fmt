"""
Embedding generation using sentence-transformers.
Uses paraphrase-multilingual-MiniLM-L12-v2 for German/multilingual support.
"""

import numpy as np
from sentence_transformers import SentenceTransformer

# Model optimized for German/multilingual paraphrase detection
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

_model = None


def get_model() -> SentenceTransformer:
    """Lazy load the sentence transformer model."""
    global _model
    if _model is None:
        print(f"Loading embedding model: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Generate embeddings for a list of texts.

    Args:
        texts: List of text strings to embed.

    Returns:
        NumPy array of shape (len(texts), embedding_dim).
    """
    model = get_model()
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    return embeddings


def embed_single(text: str) -> np.ndarray:
    """
    Generate embedding for a single text.

    Args:
        text: Text string to embed.

    Returns:
        NumPy array of shape (embedding_dim,).
    """
    model = get_model()
    embedding = model.encode([text], convert_to_numpy=True)
    return embedding[0]


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """
    Compute cosine similarity between two vectors.

    Args:
        a: First vector.
        b: Second vector.

    Returns:
        Cosine similarity score between -1 and 1.
    """
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
