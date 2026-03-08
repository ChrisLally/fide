'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@chris-test/ui/components/ui/popover'
import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface NavPopoverSection {
  title?: string
  items: NavPopoverItem[]
  className?: string
  itemsClassName?: string
  twoColumnItems?: boolean
}

export interface NavPopoverItem {
  href?: string
  label: string
  subtitle?: string
  target?: '_blank'
  disabled?: boolean
}

interface NavPopoverProps {
  trigger: ReactNode
  sections: NavPopoverSection[]
  isActive?: boolean
  layout?: 'grid' | 'flex'
  contentClassName?: string
}

export const NavPopover = ({
  trigger,
  sections,
  isActive,
  layout = 'grid',
  contentClassName,
}: NavPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={twMerge(
          'dark:text-polar-500 -m-1 flex cursor-pointer items-center gap-x-2 p-1 text-gray-500 transition-colors hover:text-black focus:outline-none dark:hover:text-white',
          (isOpen || isActive) && 'text-black dark:text-white',
        )}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        className={twMerge(
          'w-fit p-0',
          layout === 'flex'
            ? 'flex flex-row divide-x'
            : `grid gap-px ${sections.length === 1 ? 'grid-cols-1' : `grid-cols-${sections.length}`}`,
          contentClassName,
        )}
        sideOffset={0}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {sections.map((section, idx) => (
          <div key={idx} className={twMerge('flex flex-col p-2', section.className)}>
            {section.title && (
              <h3 className="dark:text-polar-500 px-4 py-2 text-sm text-gray-500">
                {section.title}
              </h3>
            )}
            <div
              className={twMerge(
                (section.twoColumnItems ?? section.items.some((item) => item.subtitle))
                  ? 'grid grid-cols-2'
                  : '',
                section.itemsClassName,
              )}
            >
              {section.items.map(({ href, label, subtitle, target, disabled }) =>
                disabled || !href ? (
                  <div
                    key={label}
                    className="flex cursor-default flex-col rounded-md px-4 py-2 text-sm opacity-60"
                  >
                    <span className="font-medium">{label}</span>
                    {subtitle && (
                      <span className="dark:text-polar-500 text-gray-500">
                        {subtitle}
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    key={href + label}
                    href={href}
                    prefetch
                    target={target}
                    className="dark:hover:bg-polar-800 flex flex-col rounded-md px-4 py-2 text-sm transition-colors hover:bg-gray-100"
                  >
                    <span className="font-medium">{label}</span>
                    {subtitle && (
                      <span className="dark:text-polar-500 text-gray-500">
                        {subtitle}
                      </span>
                    )}
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
