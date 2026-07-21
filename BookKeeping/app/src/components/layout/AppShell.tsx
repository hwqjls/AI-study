import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
  title?: string
  hideNav?: boolean
}

export function AppShell({ children, title, hideNav = false }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-[var(--color-surface)]/70 shadow-sm">
      {title ? (
        <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </header>
      ) : null}
      <main className="flex-1 px-4 py-4">{children}</main>
      {hideNav ? null : <BottomNav />}
    </div>
  )
}
