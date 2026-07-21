import { useEffect } from 'react'
import { AppRouter } from './routes'
import { useRecordsStore } from './store/recordsStore'

export default function App() {
  const hydrate = useRecordsStore((s) => s.hydrate)
  const hydrated = useRecordsStore((s) => s.hydrated)
  const loadError = useRecordsStore((s) => s.loadError)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!hydrated || !loadError) return
    // MVP：启动加载损坏时用原生提示；后续可替换为 Toast 组件
    window.alert(loadError)
    useRecordsStore.setState({ loadError: null })
  }, [hydrated, loadError])

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[var(--color-muted)]">
        加载中…
      </div>
    )
  }

  return <AppRouter />
}
