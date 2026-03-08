'use client'

import { usePathname } from 'next/navigation'
import { NavPopover, NavPopoverSection } from '@/components/Layout/NavPopover'

const solutionsSections: NavPopoverSection[] = [
  {
    items: [
      {
        href: '/features/products',
        label: 'Products',
        subtitle: 'Trusted context for humans and AI',
      },
      {
        href: '/features/usage-billing',
        label: 'Usage Billing',
        subtitle: 'Context mapping for ingestion-based billing',
      },
      {
        href: '/features/customers',
        label: 'Customer Management',
        subtitle: 'Context mapping for customer management',
      },
      {
        href: '/features/analytics',
        label: 'Analytics',
        subtitle: 'Context mapping for revenue insights',
      },
    ],
  },
]

export function SiteHeaderSolutionsNavItem() {
  const pathname = usePathname()

  return (
    <NavPopover
      trigger="Solutions"
      sections={solutionsSections}
      isActive={pathname.startsWith('/solutions')}
    />
  )
}
