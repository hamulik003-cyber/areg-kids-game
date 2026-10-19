"""Train an offline sketch classifier using Google's public Quick, Draw! bitmap dataset.
Run: python tools/train_quickdraw.py
Requires: numpy, tensorflow (CPU), requests, pillow, tensorflowjs
Exports: quickdraw-model/model.json and quickdraw-model/weights.bin for TensorFlow.js.
"""
import json
from pathlib import Path
import numpy as np
import requests
from PIL import Image, ImageDraw
from urllib.parse import quote
import tensorflow as tf

CATEGORIES = ["circle", "square", "triangle", "star", "heart", "flower", "house", "sun", "arrow", "cloud", "tree", "moon", "diamond", "umbrella", "fish", "apple"]
SAMPLES_PER_CLASS = 3500
ROOT = Path("quickdraw-model")
ROOT.mkdir(exist_ok=True)
xs, ys = [], []
for label, name in enumerate(CATEGORIES):
    url = "https://storage.googleapis.com/quickdraw_dataset/full/simplified/" + quote(name) + ".ndjson"
    cache = ROOT / (name.replace(" ", "_") + ".npz")
    if cache.exists():
        bitmaps = np.load(cache)["images"]
    else:
        images = []
        with requests.get(url, stream=True, timeout=180) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line:
                    continue
                item = json.loads(line)
                if not item.get("recognized", False):
                    continue
                canvas = Image.new("L", (256, 256), 0)
                pen = ImageDraw.Draw(canvas)
                for stroke in item["drawing"]:
                    points = list(zip(stroke[0], stroke[1]))
                    if len(points) > 1:
                        pen.line(points, fill=255, width=9, joint="curve")
                    elif points:
                        pen.point(points[0], fill=255)
                images.append(np.asarray(canvas.resize((28, 28), Image.Resampling.LANCZOS), dtype=np.uint8))
                if len(images) >= SAMPLES_PER_CLASS:
                    break
        bitmaps = np.stack(images)
        np.savez_compressed(cache, images=bitmaps)
    xs.append(bitmaps.astype(np.float32).reshape(-1, 28, 28, 1) / 255.0)
    ys.extend([label] * len(bitmaps))
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
model.save(str(ROOT / "classifier.keras"))
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, str(ROOT / "web"))
print("Exported TensorFlow.js browser model and labels.")
