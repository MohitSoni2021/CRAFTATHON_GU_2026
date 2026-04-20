'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import {
  FaMicrophone,
  FaStop,
  FaTimes,
  FaUndo,
  FaChevronUp,
} from 'react-icons/fa';

/* =========================
   MAIN COMPONENT
========================= */
function VoiceToText() {
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [language, setLanguage] = useState('en-IN');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      SpeechRecognition.applyPolyfill(
        (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
      );
    }
  }, []);

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language,
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  if (!browserSupportsSpeechRecognition) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* PANEL */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-3 border border-blue-100 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaMicrophone className="text-blue-600" />
              Voice Typing
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          {/* LANGUAGE */}
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* CONTROLS */}
          <div className="flex gap-2 mb-4">
            {!listening ? (
              <button
                onClick={startListening}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <FaMicrophone /> Start
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse"
              >
                <FaStop /> Stop
              </button>
            )}

            <button
              onClick={resetTranscript}
              className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl"
              title="Reset"
            >
              <FaUndo />
            </button>
          </div>

          {/* OUTPUT */}
          <div className="bg-gray-50 rounded-xl p-3 border min-h-[100px] max-h-[200px] overflow-y-auto">
            <p className="text-xs text-gray-400 font-bold mb-1">
              {listening ? 'Listening...' : 'Transcript'}
            </p>

            <p className="text-sm text-gray-800">
              {interimTranscript ||
                transcript ||
                <span className="text-gray-300 italic">
                  Speak something…
                </span>}
            </p>

            {finalTranscript && (
              <p className="mt-2 pt-2 border-t text-blue-700 text-sm font-medium">
                {finalTranscript}
              </p>
            )}
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-3 bg-white px-6 py-4 rounded-full shadow-lg border hover:shadow-xl transition-all ${
          listening ? 'ring-4 ring-red-100 border-red-200' : ''
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            isOpen
              ? 'bg-red-500'
              : listening
              ? 'bg-red-500 animate-pulse'
              : 'bg-blue-600'
          }`}
        >
          {isOpen ? <FaTimes /> : <FaMicrophone />}
        </div>

        <div className="hidden sm:block text-left">
          <p className="text-xs text-gray-500 font-bold uppercase">Voice</p>
          <p className="text-sm font-bold text-gray-900">
            {listening ? 'Recording...' : 'Assistant'}
          </p>
        </div>

        {!isOpen && (
          <FaChevronUp className="text-gray-300 group-hover:text-blue-500" />
        )}
      </button>
    </div>
  );
}

/* =========================
   DYNAMIC EXPORT
========================= */
const SpeechInput = dynamic(() => Promise.resolve(VoiceToText), {
  ssr: false,
});

export default SpeechInput;
