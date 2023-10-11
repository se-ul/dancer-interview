import { cx } from "cva";
import * as faceapi from "face-api.js";
import { useCallback, useEffect, useRef } from "react";

export interface CameraProps {
  className?: string;
  onExpressionDetection?: (expression: string, probability: number) => void;
}

export const Camera: React.FC<CameraProps> = ({
  className,
  onExpressionDetection,
}) => {
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

  const onPlay = useCallback(() => {
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

    let animationFrameHandle: number;
    const tick = async () => {
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, canvasSize);
      resizedDetections.forEach((detection) => {
        const box = detection.detection.box;
        const expressions = detection.expressions;
        const topExpression = expressions.asSortedArray()[0];

        const text = `${topExpression.expression} ${Math.floor(
          topExpression.probability * 100
        )}%`;
        const color =
          {
            neutral: "rgba(255, 255, 255, 0.7)",
            happy: "rgba(0, 255, 0, 0.7)",
            sad: "rgba(255, 0, 0, 0.7)",
            angry: "rgba(255, 0, 0, 0.7)",
            fearful: "rgba(255, 0, 0, 0.7)",
            disgusted: "rgba(255, 0, 0, 0.7)",
            surprised: "rgba(255, 0, 0, 0.7)",
          }[topExpression.expression] ?? "rgba(255, 255, 255, 0.7)";

        canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvas.fillStyle = color;
        canvas.strokeStyle = color;
        canvas.lineWidth = 3;
        canvas.font = "24px sans-serif";
        canvas.fillText(text, box.x, box.y - 7);
        canvas.strokeRect(box.x, box.y, box.width, box.height);

        onExpressionDetection?.(
          topExpression.expression,
          topExpression.probability
        );
      });

      animationFrameHandle = requestAnimationFrame(() => void tick());
    };

    void tick();

    return () => {
      cancelAnimationFrame(animationFrameHandle);
    };
  }, [onExpressionDetection]);

  return (
    <div className={cx("relative", className)}>
      <video ref={videoRef} autoPlay width={640} height={480} onPlay={onPlay} />
      <canvas
        className="absolute top-0 left-0"
        ref={canvasRef}
        width={640}
        height={480}
      />
    </div>
  );
};
