import * as React from 'react'
import { cn } from '../../lib/utils'

export interface LogoIconProps extends React.ComponentProps<'img'> {
  size?: number
}

const logoIconSrc = new URL('./icon.svg', import.meta.url).toString()

export const LogoIcon = ({
  size = 28,
  className,
  alt = 'Fide logo',
  ...props
}: LogoIconProps) => {
  return (
    <img
      src={logoIconSrc}
      alt={alt}
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      {...props}
    />
  )
}
