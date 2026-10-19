"""Train an offline sketch classifier using Google's public Quick, Draw! bitmap dataset.
Run: python tools/train_quickdraw.py
Requires: numpy, tensorflow (CPU), requests
Exports: quickdraw-model/model.json and quickdraw-model/weights.bin for TensorFlow.js.
"""
import json
from pathlib import Path
import numpy as np
import requests
import tensorflow as tf

CATEGORIES = ["circle", "square", "triangle", "star", "heart", "flower", "house", "sun", "arrow", "cloud", "tree", "moon", "diamond", "umbrella", "fish", "apple"]
SAMPLES_PER_CLASS = 3500
ROOT = Path("quickdraw-model")
ROOT.mkdir(exist_ok=True)
xs, ys = [], []
for label, name in enumerate(CATEGORIES):
    url = "https://storage.googleapis.com/quickdraw_dataset/full/numpy_bitmap/" + requests.utils.quote(name) + ".npy"
    cache = ROOT / (name.replace(" ", "_") + ".npy")
    if not cache.exists():
        response = requests.get(url, timeout=180)
        response.raise_for_status()
        cache.write_bytes(response.content)
    data = np.load(cache, mmap_mode="r")
    rng = np.random.default_rng(42 + label)
    idx = rng.choice(len(data), size=min(SAMPLES_PER_CLASS, len(data)), replace=False)
    xs.append(np.asarray(data[idx], dtype=np.float32).reshape(-1, 28, 28, 1) / 255.0)
    ys.extend([label] * len(idx))
x = np.concatenate(xs)
y = np.asarray(ys, dtype=np.int32)
rng = np.random.default_rng(73)
order = rng.permutation(len(y))
x, y = x[order], y[order]
split = int(len(y) * .85)
model = tf.keras.Sequential([
    tf.keras.layers.Input((28, 28, 1)),
    tf.keras.layers.Conv2D(24, 3, activation="relu", padding="same"),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Conv2D(48, 3, activation="relu", padding="same"),
    tf.keras.layers.MaxPooling2D(),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(96, activation="relu"),
    tf.keras.layers.Dropout(.25),
    tf.keras.layers.Dense(len(CATEGORIES), activation="softmax")
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
model.fit(x[:split], y[:split], validation_data=(x[split:], y[split:]), epochs=10, batch_size=128, verbose=2)
(ROOT / "labels.json").write_text(json.dumps(CATEGORIES), encoding="utf-8")
model.export(str(ROOT / "saved_model"))
print("Exported model and labels. Convert SavedModel to TFJS graph model using tensorflowjs_converter.")
