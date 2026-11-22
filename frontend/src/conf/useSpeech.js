import { useCallback, useEffect, useRef, useState } from "react";

export default function useSpeech(lang = "hi-IN") {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);
  const [hasVoice, setHasVoice] = useState(true);
  const tokenRef = useRef(0);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const check = () =>
      setHasVoice(synth.getVoices().some((v) => v.lang.toLowerCase().startsWith("hi")));
    check();
    synth.addEventListener("voiceschanged", check); // voices load late in Chrome
    return () => {
      synth.removeEventListener("voiceschanged", check);
      synth.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    tokenRef.current++;
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  // resolves when speech ends or is cancelled
  const speak = useCallback(
    (text) =>
      new Promise((resolve) => {
        if (!supported || !text) return resolve();
        const synth = window.speechSynthesis;
        synth.cancel();
        const token = ++tokenRef.current;

        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 0.9;
        const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("hi"));
        if (voice) u.voice = voice;

        u.onstart = () => setSpeaking(true);
        const done = () => {
          if (tokenRef.current === token) setSpeaking(false);
          resolve();
        };
        u.onend = done;
        u.onerror = done;
        synth.speak(u);
      }),
    [lang, supported]
  );

  return { speak, stop, speaking, supported, hasVoice };
}