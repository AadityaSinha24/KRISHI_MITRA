import { useCallback, useEffect, useState } from 'react'
import { getMenu } from '../services/promptService'
import getErrorMessage from '../utils/getErrorMessage'

// The sentence that is read aloud for one menu item, e.g.
// "गेहूं की फसल की जानकारी के लिए 1 दबाएं"
export function menuSpeech(item) {
  return `${item.label} के लिए ${item.key} दबाएं`
}

// Fetches the menu from GET /prompt/menu -> [{ key, label }]
export default function useMenu() {
  const [state, setState] = useState({ items: [], loading: true, error: '' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let ignore = false

    getMenu()
      .then((items) => {
        if (!ignore) setState({ items, loading: false, error: '' })
      })
      .catch((error) => {
        if (!ignore) {
          setState({ items: [], loading: false, error: getErrorMessage(error) })
        }
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: '' }))
    setAttempt((n) => n + 1)
  }, [])

  return { items: state.items, loading: state.loading, error: state.error, reload }
}