import type { LucideIcon } from 'lucide-react'
import { Building2, LayoutDashboard, Settings } from 'lucide-react'

export interface ProtectedNavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const protectedNavItems: ProtectedNavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/clubs', label: 'Clubs search', icon: Building2 },
]
