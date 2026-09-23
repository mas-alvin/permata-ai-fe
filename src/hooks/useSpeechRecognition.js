import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wrapper around the browser Web Speech API (SpeechRecognition).
 *
 * On unsupported browsers `supported` is false so the caller can disable the
 * mic button with a tooltip instead of crashing.
 *
 * @param {object} [options]
 * @param {string} [options.lang='id-ID']
 * @param {(transcript: string, isFinal: boolean) => void} [options.onTranscript]
 */
export function useSpeechRecognition({ lang = 'id-ID', onTranscript } = {}) {
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const manualStopRef = useRef(false);

  // Keep the latest callback without re-creating the recognition instance
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const supported = !!SpeechRecognitionCtor;

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setError('Browser tidak mendukung voice input.');
      return;
    }
    if (recognitionRef.current) {
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setInterimTranscript('');
        onTranscriptRef.current?.(final.trim(), true);
      } else if (interim) {
        setInterimTranscript(interim);
        onTranscriptRef.current?.(interim.trim(), false);
      }
    };

    recognition.onerror = (event) => {
      let message = 'Terjadi kesalahan saat voice input.';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        message = 'Akses mikrofon ditolak. Izinkan mikrofon di pengaturan browser.';
      } else if (event.error === 'no-speech') {
        message = 'Tidak ada suara terdeteksi. Coba lagi.';
      }
      setError(message);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterimTranscript('');
      // Auto-restart if it ended while still meant to be listening
      // (browser stops after a pause in continuous mode)
      if (!manualStopRef.current) {
        try {
          recognitionRef.current = recognition;
          recognition.start();
          setListening(true);
        } catch {
          // ignore double-start race
        }
      }
    };

    manualStopRef.current = false;
    recognitionRef.current = recognition;
    setError(null);
    recognition.start();
    setListening(true);
  }, [SpeechRecognitionCtor, lang]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimTranscript('');
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  return { listening, interimTranscript, error, supported, start, stop, reset };
}

export default useSpeechRecognition;
