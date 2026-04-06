import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { Button } from '../ui/Button'

export function Header() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <nav className="flex items-center gap-6">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          TT League
        </Link>
        {isAuthenticated && (
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
        )}
        {isAuthenticated && (
          <Link to="/settings" className="text-sm text-gray-600 hover:text-gray-900">
            Settings
          </Link>
        )}
        <div className="ml-auto">
          {isAuthenticated ? (
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
