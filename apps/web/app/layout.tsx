import './globals.css'
import { PropsWithChildren } from 'react'
import SiteLayout from '@/components/Layout/SiteLayout'
import { ThemeProvider } from '@/components/ThemeProvider'

export const dynamic = 'force-static'
export const dynamicParams = false

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteLayout>{children}</SiteLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
