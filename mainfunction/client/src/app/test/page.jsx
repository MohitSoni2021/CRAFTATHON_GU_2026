"use client"

import { useEffect, useRef, useState } from "react";

const SpeechToText = () => {
  const [text, setText] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-IN";
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Voice Input
      </label>

      <textarea
        value={text}
        readOnly
        rows={3}
        className="w-full rounded-md border border-gray-300 p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Speak something..."
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => recognitionRef.current?.start()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          Start
        </button>

        <button
          onClick={() => recognitionRef.current?.stop()}
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default SpeechToText;
