import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const LANG = 'hi-IN'

const synth =
  typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null

const isHindi = (voice) => voice.lang.replace('_', '-').toLowerCase().startsWith('hi')

// Reads Hindi text aloud with the browser's built-in speech engine.
//   speak(text, { onDone })                    read one text
//   speakMany(texts, { onItemStart, onDone })  read texts one after another
//   stop()                                     stop immediately
export default function useSpeech() {
  const [voices, setVoices] = useState(() => (synth ? synth.getVoices() : []))
  const [speaking, setSpeaking] = useState(false)
  const tokenRef = useRef(0) // lets us ignore events from speech we already cancelled
  const utterancesRef = useRef([]) // keeps utterances alive (browsers can drop them)

  useEffect(() => {
    if (!synth) return undefined
    const onVoices = () => setVoices(synth.getVoices())
    synth.addEventListener('voiceschanged', onVoices)
    return () => {
      synth.removeEventListener('voiceschanged', onVoices)
      synth.cancel()
    }
  }, [])

  const voice = useMemo(
    () =>
      voices.find((v) => v.lang.replace('_', '-') === LANG) ||
      voices.find(isHindi) ||
      null,
    [voices],
  )

  const stop = useCallback(() => {
    if (!synth) return
    tokenRef.current += 1
    synth.cancel()
    utterancesRef.current = []
    setSpeaking(false)
  }, [])

  const speakMany = useCallback(
    (texts, { onItemStart, onDone } = {}) => {
      if (!synth) return
      const list = texts.filter(Boolean)
      if (!list.length) return

      tokenRef.current += 1
      const token = tokenRef.current
      synth.cancel()
      setSpeaking(true)

      utterancesRef.current = list.map((text, index) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = LANG
        utterance.rate = 0.9
        if (voice) utterance.voice = voice

        utterance.onstart = () => {
          if (token === tokenRef.current) onItemStart?.(index)
        }
        utterance.onend = () => {
          if (token === tokenRef.current && index === list.length - 1) {
            setSpeaking(false)
            onDone?.()
          }
        }
        utterance.onerror = () => {
          if (token === tokenRef.current) setSpeaking(false)
        }
        return utterance
      })

      utterancesRef.current.forEach((utterance) => synth.speak(utterance))
    },
    [voice],
  )

  const speak = useCallback(
    (text, options = {}) => speakMany([text], { onDone: options.onDone }),
    [speakMany],
  )

  return {
    supported: Boolean(synth),
    voicesReady: voices.length > 0,
    hasHindiVoice: Boolean(voice),
    speaking,
    speak,
    speakMany,
    stop,
  }
}
