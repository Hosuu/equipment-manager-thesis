import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'

interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
	label: string
	action?: ReactNode
}

export const PageSection: FC<PageSectionProps> = ({ className, children, action, label }) => {
	return (
		<div className={cn('my-4', className)}>
			<div className='flex justify-between border-b border-neutral-800 py-2 px-4'>
				<h1 className=' text-xl sm:text-2xl md:text-3xl font-extrabold text-primary-600'>
					{label}
				</h1>
				{action}
			</div>
			{children}
		</div>
	)
}
