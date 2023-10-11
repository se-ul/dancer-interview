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
      const transcript = event.results[event.results.length - 1][0].transcript;
      onResult(transcript);
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
