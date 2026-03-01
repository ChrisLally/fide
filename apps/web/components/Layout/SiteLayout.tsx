import { PropsWithChildren } from 'react'
import { Footer } from '@/components/Layout/Footer'
import { SiteHeader } from '@/components/Layout/SiteHeader'

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-polar-950 dark:text-polar-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
