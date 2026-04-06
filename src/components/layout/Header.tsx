import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <nav className="flex items-center gap-6">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          TT League
        </Link>
        <Link to="/clubs" className="text-sm text-gray-600 hover:text-gray-900">
          Clubs
        </Link>
        <Link to="/players" className="text-sm text-gray-600 hover:text-gray-900">
          Players
        </Link>
        <Link to="/matches" className="text-sm text-gray-600 hover:text-gray-900">
          Matches
        </Link>
      </nav>
    </header>
  )
}
