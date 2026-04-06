import { cn } from '../../lib/utils'

interface PageWrapperProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ title, children, className }: PageWrapperProps) {
  return (
    <main className={cn('mx-auto max-w-6xl px-6 py-8', className)}>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{title}</h1>
      {children}
    </main>
  )
}
