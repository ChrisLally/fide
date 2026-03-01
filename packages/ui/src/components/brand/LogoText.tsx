import * as React from 'react'
import { cn } from '../../lib/utils'

export interface LogoTextProps extends React.ComponentProps<'span'> {
  text?: string
}

export const LogoText = ({ text = 'FIDE', className, ...props }: LogoTextProps) => {
  return <span className={cn('text-base font-medium', className)} {...props}>{text}</span>
}
