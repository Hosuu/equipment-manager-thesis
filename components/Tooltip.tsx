import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
	text: string
	children: ReactNode
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => {
	return (
		<div className={cn('relative inline-block group', className)}>
			<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center px-3 py-2 bg-primary-700 text-white text-sm rounded shadow-lg whitespace-nowrap'>
				{text}
				<div className='absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary-700 rotate-45'></div>
			</div>
			{children}
		</div>
	)
}
Tooltip.displayName = 'Tooltip'
