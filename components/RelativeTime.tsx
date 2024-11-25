'use client'

import { FC } from 'react'
import { Tooltip } from './Tooltip'

function automaticRelativeDifference(d: Date): {
	duration: number
	unit: Intl.RelativeTimeFormatUnit
} {
	const diff = -((new Date().getTime() - d.getTime()) / 1000) | 0
	const absDiff = Math.abs(diff)
	if (absDiff > 86400 * 30 * 10) {
		return { duration: Math.round(diff / (86400 * 365)), unit: 'years' }
	}
	if (absDiff > 86400 * 25) {
		return { duration: Math.round(diff / (86400 * 30)), unit: 'months' }
	}
	if (absDiff > 3600 * 21) {
		return { duration: Math.round(diff / 86400), unit: 'days' }
	}
	if (absDiff > 60 * 44) {
		return { duration: Math.round(diff / 3600), unit: 'hours' }
	}
	if (absDiff > 30) {
		return { duration: Math.round(diff / 60), unit: 'minutes' }
	}
	return { duration: diff, unit: 'seconds' }
}

interface RelativeTimeProps {
	timeStamp: Date | string
}

export const RelativeTime: FC<RelativeTimeProps> = ({ timeStamp }) => {
	const date = timeStamp instanceof Date ? timeStamp : new Date(timeStamp)
	// Relative time stuff
	const relativeTimeFormatter = new Intl.RelativeTimeFormat()
	const { duration, unit } = automaticRelativeDifference(date)
	// Datetime stuff
	const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
	return (
		<Tooltip text={dateTimeFormatter.format(date)}>
			{relativeTimeFormatter.format(duration, unit)}
		</Tooltip>
	)
}
