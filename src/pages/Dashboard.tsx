import { PageWrapper } from '../components/layout/PageWrapper'
import { useAuth } from '../store/AuthContext'

export function Dashboard() {
  const { session } = useAuth()
  return (
    <PageWrapper title="Dashboard">
      <p className="text-gray-600">Welcome back, {session?.username}.</p>
    </PageWrapper>
  )
}
