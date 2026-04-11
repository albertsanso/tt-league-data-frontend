import { Outlet } from 'react-router-dom'
import { Header } from './components/layout/Header'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
