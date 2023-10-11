import * as faceapi from "face-api.js";
import { useEffect, useRef } from "react";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    void (async function () {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;

      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    })();
  }, []);

  return (
    <main className="h-full flex flex-col">
      <h1 className="text-3xl font-bold underline text-center">
        Dancer Interview
      </h1>
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          width={640}
          height={480}
          onPlay={() => {
            const videoElement = videoRef.current;
            const canvasElement = canvasRef.current;

            if (!videoElement || !canvasElement) {
              return;
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const canvas = canvasElement.getContext("2d")!;
            const canvasSize = {
              width: videoElement.width,
              height: videoElement.height,
            };
            faceapi.matchDimensions(canvasElement, canvasSize);

            const tick = async () => {
              const detections = await faceapi
                .detectAllFaces(
                  videoElement,
                  new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks()
                .withFaceDescriptors()
                .withFaceExpressions();

              const resizedDetections = faceapi.resizeResults(
                detections,
                canvasSize
              );
              resizedDetections.forEach((detection) => {
                const box = detection.detection.box;
                const expressions = detection.expressions;

                const topExpression = expressions.asSortedArray()[0];

                const text = `${topExpression.expression} ${Math.floor(
                  topExpression.probability * 100
                )}%`;

                canvas.clearRect(
                  0,
                  0,
                  canvasElement.width,
                  canvasElement.height
                );
                canvas.fillStyle = "rgba(255, 255, 255, 0.7)";
                canvas.strokeStyle = "rgba(255, 255, 255, 0.7)";
                canvas.fillText(text, box.x, box.y);
                canvas.strokeRect(box.x, box.y, box.width, box.height);
              });

              requestAnimationFrame(() => void tick());
            };

            void tick();
          }}
        />
        <canvas
          className="absolute top-0 left-0"
          ref={canvasRef}
          width={640}
          height={480}
        />
      </div>
    </main>
  );
};

export default App;
