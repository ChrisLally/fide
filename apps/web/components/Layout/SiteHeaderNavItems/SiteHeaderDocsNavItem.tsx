'use client'

import { NavPopover, NavPopoverSection } from '@/components/Layout/NavPopover'

const docsSections: NavPopoverSection[] = [
  {
    title: 'Tools',
    items: [
      {
        href: '/docs/cli',
        label: 'CLI',
      },
      {
        href: '/docs',
        label: 'All Docs',
      },
    ],
  },
  {
    title: 'Solutions',
    twoColumnItems: false,
    items: [
      {
        href: '/docs/graph',
        label: 'Graph',
        subtitle: 'Store and query context',
      },
      {
        label: 'Gateway',
        subtitle: 'Coming soon',
        disabled: true,
      },
    ],
  },
  {
    title: 'Standards',
    twoColumnItems: false,
    items: [
      {
        href: '/docs/fcp',
        label: 'Context Protocol',
        subtitle: 'World Model graphing',
      },
      {
        href: '/docs/fide-id',
        label: 'ID',
        subtitle: 'Entity identification',
      },
      {
        href: '/docs/vocabulary',
        label: 'Vocabulary',
        subtitle: 'Entity types and codes',
      },
    ],
  },
]

export function SiteHeaderDocsNavItem() {
  return <NavPopover trigger="Docs" sections={docsSections} layout="flex" />
}
