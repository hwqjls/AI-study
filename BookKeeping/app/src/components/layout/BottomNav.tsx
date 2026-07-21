import { NavLink } from 'react-router-dom'
import { IconStats, IconToday } from '../ui/icons'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex min-h-[52px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-200',
    isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]',
  ].join(' ')

export function BottomNav() {
  return (
    <nav
      className="sticky bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md"
      aria-label="主导航"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <NavLink to="/" end className={linkClass}>
          {({ isActive }) => (
            <>
              <IconToday
                className={`h-5 w-5 ${isActive ? 'text-[var(--color-primary)]' : ''}`}
                aria-hidden
              />
              <span>今日</span>
            </>
          )}
        </NavLink>
        <NavLink to="/stats" className={linkClass}>
          {({ isActive }) => (
            <>
              <IconStats
                className={`h-5 w-5 ${isActive ? 'text-[var(--color-primary)]' : ''}`}
                aria-hidden
              />
              <span>统计</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
