import * as React from 'react'
import { cn } from '../../lib/utils'
import { LogoIcon } from './LogoIcon'
import { LogoText } from './LogoText'

export interface LogoProps extends React.ComponentProps<'div'> {
  showText?: boolean
  iconSize?: number
  text?: string
}

export const Logo = ({
  showText = true,
  iconSize = 28,
  text,
  className,
  ...props
}: LogoProps) => {
  return (
    <div className={cn('inline-flex items-center gap-2', className)} {...props}>
      <LogoIcon size={iconSize} className="text-black dark:text-white" />
      {showText ? <LogoText text={text} className="text-black dark:text-white text-2xl" /> : null}
    </div>
  )
}
