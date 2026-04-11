import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { protectedNavItems } from './protected-nav'

interface NavListProps {
  /** Close mobile drawer after navigation */
  onNavigate?: () => void
}

function NavList({ onNavigate }: NavListProps) {
  return (
    <ul className="flex flex-col gap-1 p-4">
      {protectedNavItems.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function ProtectedAppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  return (
    <div className="flex min-h-0 flex-1 overflow-x-hidden">
      <aside
        className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:block"
        aria-label="App sections"
      >
        <nav aria-label="Main">
          <NavList />
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 shrink-0 p-0"
            aria-expanded={mobileOpen}
            aria-controls="protected-nav-drawer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </Button>
          <span className="text-sm font-medium text-gray-700">Menu</span>
        </div>

        {mobileOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div
              id="protected-nav-drawer"
              className="fixed inset-y-0 left-0 z-50 w-56 border-r border-gray-200 bg-white shadow-lg md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="App sections"
            >
              <nav aria-label="Main">
                <NavList onNavigate={() => setMobileOpen(false)} />
              </nav>
            </div>
          </>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
