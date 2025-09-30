/**

 * =====================================================

 * COMPONENTE CARD - DESIGN SYSTEM

 * =====================================================

 */

import React from 'react'

import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {

  variant?: 'default' | 'elevated' | 'outlined' | 'glass'

  padding?: 'none' | 'sm' | 'md' | 'lg'

  hover?: boolean

  children: React.ReactNode

}

export const Card: React.FC<CardProps> = ({

  variant = 'default',

  padding = 'md',

  hover = false,

  className,

  children,

  ...props

}) => {

  const baseClasses = 'rounded-xl transition-all duration-200'

  const variantClasses = {

    default: 'bg-white border border-gray-200 shadow-sm',

    elevated: 'bg-white border border-gray-200 shadow-lg',

    outlined: 'bg-transparent border-2 border-gray-300',

    glass: 'bg-white/80 backdrop-blur-sm border border-gray-200/50'

  }

  const paddingClasses = {

    none: '',

    sm: 'p-3',

    md: 'p-4',

    lg: 'p-6'

  }

  const hoverClasses = hover ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''

  return (

    <div

      className={cn(

        baseClasses,

        variantClasses[variant],

        paddingClasses[padding],

        hoverClasses,

        className

      )}

      {...props}

    >

      {children}

    </div>

  )

}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {

  children: React.ReactNode

}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => {

  return (

    <div

      className={cn('flex flex-col space-y-1.5 pb-4', className)}

      {...props}

    >

      {children}

    </div>

  )

}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {

  children: React.ReactNode

}

export const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => {

  return (

    <h3

      className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}

      {...props}

    >

      {children}

    </h3>

  )

}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {

  children: React.ReactNode

}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, children, ...props }) => {

  return (

    <p

      className={cn('text-sm text-gray-600', className)}

      {...props}

    >

      {children}

    </p>

  )

}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {

  children: React.ReactNode

}

export const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => {

  return (

    <div

      className={cn('pt-0', className)}

      {...props}

    >

      {children}

    </div>

  )

}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {

  children: React.ReactNode

}

export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => {

  return (

    <div

      className={cn('flex items-center pt-4', className)}

      {...props}

    >

      {children}

    </div>

  )

}