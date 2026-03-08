'use client'

import Button from '@chris-test/ui/components/atoms/Button'
import { Logo } from '@chris-test/ui/components/brand/Logo'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@chris-test/ui/components/ui/sheet'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import {
  SiteHeaderDocsNavItem,
  SiteHeaderMobileNavItem,
  SiteHeaderSolutionsNavItem,
  SiteHeaderStoryNavItem,
} from '@/components/Layout/SiteHeaderNavItems'

export function SiteHeader() {
  return (
    <header>
      <div className="hidden w-full md:block">
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Fide home">
            <Logo />
          </Link>

          <ul className="absolute left-1/2 mx-auto flex -translate-x-1/2 flex-row gap-x-8 font-medium">
            <li>
              <SiteHeaderSolutionsNavItem />
            </li>
            <li>
              <SiteHeaderDocsNavItem />
            </li>
            <li>
              <SiteHeaderStoryNavItem />
            </li>
          </ul>

          <Button variant="ghost" className="rounded-full">
            Log In
          </Button>
        </div>
      </div>

      <div className="flex w-full items-center justify-between px-4 py-4 md:hidden">
        <Link href="/" aria-label="Fide home">
          <Logo />
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 dark:border-polar-700 dark:text-polar-100"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[360px]">
            <SheetTitle className="sr-only">Site navigation</SheetTitle>
            <nav className="mt-10 flex flex-col gap-4">
              <SiteHeaderMobileNavItem href="/solutions/products">Solutions</SiteHeaderMobileNavItem>
              <SiteHeaderMobileNavItem href="/docs">Docs</SiteHeaderMobileNavItem>
              <SiteHeaderMobileNavItem href="/company">Company</SiteHeaderMobileNavItem>
              <SiteHeaderMobileNavItem href="/login">Log In</SiteHeaderMobileNavItem>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
