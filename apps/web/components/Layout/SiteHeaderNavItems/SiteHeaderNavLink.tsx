'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentPropsWithoutRef } from 'react'
import { twMerge } from 'tailwind-merge'

export const SiteHeaderNavLink = ({
  href,
  className,
  children,
  isActive: isActiveOverride,
  target,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Link>, 'key'> & {
  isActive?: (pathname: string) => boolean
}) => {
  const pathname = usePathname()
  const isActive = isActiveOverride
    ? isActiveOverride(pathname)
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
