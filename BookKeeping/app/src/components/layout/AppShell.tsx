import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
  hideNav?: boolean
}

export function AppShell({ children, title, subtitle, hideNav = false }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <div className="flex min-h-dvh flex-col overflow-hidden rounded-none bg-[var(--color-surface)] shadow-[var(--shadow-lg)] sm:my-4 sm:min-h-[calc(100dvh-2rem)] sm:rounded-[var(--radius-xl)] sm:border sm:border-[var(--color-border)]">
        {title ? (
          <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-5 pb-4 pt-5 backdrop-blur-md">
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-text)]">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-[var(--color-muted)]">{subtitle}</p>
            ) : null}
          </header>
        ) : null}
        <main className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-6">
          {children}
        </main>
        {hideNav ? null : <BottomNav />}
      </div>
    </div>
  )
}
