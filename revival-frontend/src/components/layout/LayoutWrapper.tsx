'use client'

import { usePathname } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
      },
    },
  }))
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/partner/dashboard') || pathname?.startsWith('/admin/dashboard')

  if (isDashboard) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </QueryClientProvider>
  )
}
