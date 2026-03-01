'use client'

import Button from '@chris-test/ui/components/atoms/Button'
import { Logo } from '@chris-test/ui/components/brand/Logo'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@chris-test/ui/components/ui/sheet'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { ComponentProps } from 'react'
import { usePathname } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import { NavPopover, NavPopoverSection } from '@/components/Layout/NavPopover'

const featuresSections: NavPopoverSection[] = [
  {
    items: [
      {
        href: '/features/products',
        label: 'Products',
        subtitle: 'Digital products for SaaS',
      },
      {
        href: '/features/usage-billing',
        label: 'Usage Billing',
        subtitle: 'Ingestion-based Billing',
      },
      {
        href: '/features/customers',
        label: 'Customer Management',
        subtitle: 'Profiles & Analytics',
      },
      {
        href: '/features/analytics',
        label: 'Analytics',
        subtitle: 'Revenue Insights',
      },
    ],
  },
]

const docsSections: NavPopoverSection[] = [
  {
    title: 'Integrate',
    items: [
      {
        href: '/docs/integrate/sdk/adapters/nextjs',
        label: 'Next.js',
      },
      {
        href: '/docs/integrate/sdk/adapters/hono',
        label: 'Hono',
      },
      {
        href: '/docs/integrate/sdk/adapters/laravel',
        label: 'Laravel',
      },
      {
        href: '/docs',
        label: 'All Docs',
      },
    ],
  },
]

const NavLink = ({
  href,
  className,
  children,
  isActive: _isActive,
  target,
  ...props
}: ComponentProps<typeof Link> & {
  isActive?: (pathname: string) => boolean
}) => {
  const pathname = usePathname()
  const isActive = _isActive
    ? _isActive(pathname)
    : pathname.startsWith(href.toString())
  const isExternal = href.toString().startsWith('http')

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : target}
      prefetch
      className={twMerge(
        'dark:text-polar-500 -m-1 flex items-center gap-x-2 p-1 text-gray-500 transition-colors hover:text-black dark:hover:text-white',
        isActive && 'text-black dark:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header>
      <div className="hidden w-full md:block">
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Fide home">
            <Logo />
          </Link>

          <ul className="absolute left-1/2 mx-auto flex -translate-x-1/2 flex-row gap-x-8 font-medium">
            <li>
              <NavPopover
                trigger="Features"
                sections={featuresSections}
                isActive={pathname.startsWith('/features')}
              />
            </li>
            <li>
              <NavPopover trigger="Docs" sections={docsSections} layout="flex" />
            </li>
            <li>
              <NavLink href="/company">Company</NavLink>
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
            <nav className="mt-10 flex flex-col gap-4">
              <NavLink href="/features/products">Features</NavLink>
              <NavLink href="/docs">Docs</NavLink>
              <NavLink href="/company">Company</NavLink>
              <NavLink href="/login">Log In</NavLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
