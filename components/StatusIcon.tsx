import { FC } from 'react'

interface StatusIconProps {
	doPulse: boolean
	color: 'green' | 'yellow' | 'red'
}

export const StatusIcon: FC<StatusIconProps> = ({ doPulse, color }) => {
	return (
		<span className='relative flex h-2 w-2'>
			{doPulse && (
				<span
					className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`}
				></span>
			)}
			<span className={`relative inline-flex rounded-full h-2 w-2 bg-${color}-500`}></span>
		</span>
	)
}
