import { useEffect, useRef } from "react";
import {
  SpeechRecognition,
  getSpeechRecognition,
} from "../utils/getSpeechRecognition";

export function useSpeech(onResult: (result: string) => void) {
  const speechRecognitionRef = useRef<SpeechRecognition>();

  useEffect(() => {
    speechRecognitionRef.current = getSpeechRecognition();
    const speechRecognition = speechRecognitionRef.current;
    speechRecognition.interimResults = true;
    speechRecognition.continuous = true;
    speechRecognition.lang = "ko-KR";
  }, []);

  useEffect(() => {
    const speechRecognition = speechRecognitionRef.current;
    if (speechRecognition === undefined) {
      return;
    }

    speechRecognition.onnomatch = () => {
      console.log("nomatch");
    };
    speechRecognition.onresult = (event) => {
      try {
        const transcript = event.results
          .map((result) => result[0].transcript)
          .join(" ");
        onResult(transcript);
      } catch {
        // ignore
      }
    };
    speechRecognition.onerror = (event) => {
      console.log("speech recognition error:", event.error);
    };
  }, [onResult]);

  useEffect(() => {
    const speechRecognition = speechRecognitionRef.current;
    if (speechRecognition === undefined) {
      return;
    }

    speechRecognition.start();

    return () => {
      speechRecognition.stop();
    };
  }, []);
}
