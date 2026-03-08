'use client'

import { ReactNode } from 'react'
import { SiteHeaderNavLink } from './SiteHeaderNavLink'

export function SiteHeaderMobileNavItem({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return <SiteHeaderNavLink href={href}>{children}</SiteHeaderNavLink>
}
