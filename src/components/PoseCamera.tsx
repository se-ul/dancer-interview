import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { cx } from "cva";
import { useCallback, useEffect, useRef } from "react";

export interface PoseCameraProps {
  className?: string;
}

export const PoseCamera: React.FC<PoseCameraProps> = ({ className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseDetectorRef = useRef<poseDetection.PoseDetector>();

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    void (async function () {
      if (poseDetectorRef.current === undefined) {
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        };
        poseDetectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      videoElement.srcObject = stream;
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

    let animationFrameHandle: number;
    const tick = async () => {
      canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (videoRef.current === null || poseDetectorRef.current === undefined) {
        return;
      }

      const poseDetections = await poseDetectorRef.current.estimatePoses(
        videoRef.current
      );

      canvas.fillStyle = "white";
      canvas.strokeStyle = "lightgrey";

      const drawKeypoints = (keypoints: poseDetection.Keypoint[]) => {
        for (const keypoint of keypoints) {
          const { x, y } = keypoint;
          canvas.beginPath();
          canvas.arc(x, y, 5, 0, 2 * Math.PI);
          canvas.fillText(keypoint.name ?? "", x, y);
          canvas.fill();
        }
      };

      const drawSkeleton = (keypoints: poseDetection.Keypoint[]) => {
        const connectedParts = poseDetection.util.getAdjacentPairs(
          poseDetection.SupportedModels.MoveNet
        );

        // 스켈레톤의 각 선을 그리기
        canvas.beginPath();
        for (const [i, j] of connectedParts) {
          const kp1 = keypoints[i];
          const kp2 = keypoints[j];

          // 두 키포인트가 모두 검출된 경우에만 선을 그립니다.
          if ((kp1.score ?? 0) > 0.5 && (kp2.score ?? 0) > 0.5) {
            canvas.moveTo(kp1.x, kp1.y);
            canvas.lineTo(kp2.x, kp2.y);
          }
        }
        canvas.lineWidth = 3;
        canvas.strokeStyle = "aqua";
        canvas.stroke();
      };

      if (poseDetections.length > 0) {
        drawKeypoints(poseDetections[0].keypoints);
        drawSkeleton(poseDetections[0].keypoints);
      }

      animationFrameHandle = requestAnimationFrame(() => void tick());
    };

    void tick();

    return () => {
      cancelAnimationFrame(animationFrameHandle);
    };
  }, []);

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
