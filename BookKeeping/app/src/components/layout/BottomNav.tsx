import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex-1 py-3 text-center text-sm font-medium transition-colors',
    isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]',
  ].join(' ')

export function BottomNav() {
  return (
    <nav
      className="sticky bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur"
      aria-label="主导航"
    >
      <div className="mx-auto flex max-w-lg">
        <NavLink to="/" end className={linkClass}>
          今日
        </NavLink>
        <NavLink to="/stats" className={linkClass}>
          统计
        </NavLink>
      </div>
    </nav>
  )
}
