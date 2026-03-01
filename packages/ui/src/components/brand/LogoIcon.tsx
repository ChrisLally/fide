import * as React from 'react'
import { cn } from '../../lib/utils'

export interface LogoIconProps extends React.ComponentProps<'img'> {
  size?: number
}

export const LogoIcon = ({
  size = 28,
  className,
  alt = 'Fide logo',
  ...props
}: LogoIconProps) => {
  return (
    <img
      src="/images/icon.svg"
      alt={alt}
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      {...props}
    />
  )
}
