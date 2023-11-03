import pathlib
import threading

import cv2
import matplotlib as mpl
import matplotlib.pyplot as plt
import mediapy as media
import numpy as np
import PIL
import tensorflow as tf
import tensorflow_hub as hub
import tqdm
from flask import Flask, jsonify
from flask_cors import CORS

# mpl.rcParams.update({
#     'font.size': 10,
# })


labels_path = tf.keras.utils.get_file(
    fname='labels.txt',
    origin='https://raw.githubusercontent.com/tensorflow/models/f8af2291cced43fc9f1d9b41ddbf772ae7b0d7d2/official/projects/movinet/files/kinetics_600_labels.txt'
)
labels_path = pathlib.Path(labels_path)

lines = labels_path.read_text().splitlines()
KINETICS_600_LABELS = np.array([line.strip() for line in lines])
KINETICS_600_LABELS[:20]



id = 'a2'
mode = 'base'
version = '3'
hub_url = f'https://tfhub.dev/tensorflow/movinet/{id}/{mode}/kinetics-600/classification/{version}'
model = hub.load(hub_url)

sig = model.signatures['serving_default']


dance_labels = {
    "belly dancing", "Breakdancing", "capoeira", "cumbia",
    "country line dancing", "dancing ballet", "dancing charleston",
    "dancing gangnam style", "dancing macarena", "jumpstyle dancing",
    "krumping", "moon walking", "mosh pit dancing", "pirouetting",
    "robot dancing", "salsa dancing", "square dancing", "swing dancing",
    "tango dancing", "tap dancing", "zumba", "beatboxing", "headbanging", "spinning poi"
}

def get_dance_probability(probs, label_map=KINETICS_600_LABELS):
  # Ensure label_map is a list
  label_map = list(label_map)

  # Combine probabilities for dance labels
  dance_probability = tf.reduce_sum([probs[label_map.index(label)] for label in dance_labels if label in label_map], axis=0)

  return dance_probability.numpy().item()

# Get top_k labels and probabilities
def get_top_k(probs, k=5, label_map=KINETICS_600_LABELS):
    """Outputs the top k model labels and probabilities on the given video.
    
    Args:
        probs: probability tensor of shape (num_frames, num_classes) that represents
        the probability of each class on each frame.
        k: the number of top predictions to select.
        label_map: a list of labels to map logit indices to label strings.
    
    Returns:
        a tuple of the top-k labels and probabilities.
    """

    # Ensure label_map is a list
    label_map = list(label_map)

    # Combine probabilities for dance labels
    dance_probability = tf.reduce_sum([probs[label_map.index(label)] for label in dance_labels if label in label_map], axis=0)

    # Append the combined 'dancing' probability to the end
    combined_probs = tf.concat([probs, [dance_probability]], axis=0)

    # Adjust the label map to include 'dancing' at the end
    combined_label_map = label_map + ['dancing']

    # Sort predictions to find top_k (without considering 'dancing')
    top_predictions = tf.argsort(combined_probs[:-1], axis=-1, direction='DESCENDING')[:k-1] # k-1 to always include dancing

    # Ensure 'dancing' is included
    top_predictions = tf.concat([[len(combined_probs) - 1], top_predictions], axis=0)

    # Collect the labels of top_k predictions
    top_labels = tf.gather(combined_label_map, top_predictions, axis=-1)
    
    # Decode labels
    top_labels = [label.decode('utf8') if isinstance(label, bytes) else label for label in top_labels.numpy()]
    
    # Top_k probabilities of the predictions
    top_probs = tf.gather(combined_probs, top_predictions, axis=-1).numpy()

    return tuple(zip(top_labels, top_probs))

def prepare_frames_for_model(frames):
  # 프레임을 float32 형식으로 변환하고 0-1 사이로 정규화
  frames_np = np.array(frames).astype(np.float32) / 255.0

  # 모델에 맞게 차원 확장: (10, height, width, 3) -> (1, 10, height, width, 3)
  frames_np_expanded = np.expand_dims(frames_np, axis=0)
  
  return frames_np_expanded
      
      
frame_limit = 5
fps = 3

frames = []

result = -1

def process_frames(frames):
  global result
  
  # 복사하여 메인 스레드에서의 변경에 영향을 받지 않게 합니다.
  local_frames = list(frames)
  
  # 프레임 준비
  frames_ready_for_model = prepare_frames_for_model(local_frames)
  
  logits = sig(image=frames_ready_for_model)
  logits = logits['classifier_head'][0]

  probs = tf.nn.softmax(logits, axis=-1)
  
  result = get_dance_probability(probs)

  # for label, p in get_top_k(probs):
  #   print(f'{label:20s}: {p:.3f}')

def grab_frames(cap):
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        if len(frames) >= frame_limit:
            frames.pop(0)
        frame_resized = cv2.resize(frame, (224, 224))
        frames.append(frame_resized)

def process_frames_loop(cap):
  while True:
    if len(frames) == frame_limit:
        process_frames(frames)

# Start the frame grabber thread
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FPS, fps)
threading.Thread(target=grab_frames, args=(cap,)).start()
threading.Thread(target=process_frames_loop, args=(cap,)).start()


# Start server
app = Flask(__name__)
CORS(app)

@app.route('/current')
def current():
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run('0.0.0.0', port=4001, debug=True)

# while True:
#   ret, frame = cap.read()
#   cv2.imshow('Webcam', frame)
  
#   if cv2.waitKey(1) & 0xFF == ord('q'):
#     break  

cap.release()
cv2.destroyAllWindows()
