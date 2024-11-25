import { cn } from '@/lib/utils'
import { FC } from 'react'

interface TableBtnProps extends React.HTMLAttributes<HTMLButtonElement> {
	label: string
}

export const TableBtn: FC<TableBtnProps> = ({ label, className, onClick }) => {
	return (
		<button
			onClick={onClick}
			className={cn(
				'focus:outline-none text-white bg-red-500 hover:bg-red-600 active:scale-95 shadow-sm font-medium rounded-lg text-sm px-3 py-1',
				className
			)}
		>
			{label}
		</button>
	)
}
