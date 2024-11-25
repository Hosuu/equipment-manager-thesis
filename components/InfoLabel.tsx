import { FC, ReactNode } from 'react'

interface InfoLabelProps {
	label: string
	value: ReactNode
}

export const InfoLabel: FC<InfoLabelProps> = ({ label, value }) => {
	return (
		<dl className='px-4 py-2'>
			<dt className='font-semibold text-gray-900 dark:text-white'>{label}</dt>
			<dd className='text-gray-500 dark:text-gray-400'>{value}</dd>
		</dl>
	)
}
