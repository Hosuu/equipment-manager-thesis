import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function makeSureTimePassedSince(time: number, since: number): Promise<void> {
	const timePassed = performance.now() - since
	if (timePassed < time) await sleep(time - timePassed)
}

export function dateToInputFormat(d: Date): string {
	const yyyy = d.getFullYear()
	let mm: string | number = d.getMonth() + 1 // Months start at 0!
	let dd: string | number = d.getDate()
	if (dd < 10) dd = '0' + dd
	if (mm < 10) mm = '0' + mm
	return `${yyyy}-${mm}-${dd}`
}

export function datetimeToInputFormat(d: Date): string {
	const yyyy = d.getFullYear()
	let mm: string | number = d.getMonth() + 1
	let dd: string | number = d.getDate()
	let h: string | number = d.getHours()
	let m: string | number = d.getMinutes()
	if (dd < 10) dd = '0' + dd
	if (mm < 10) mm = '0' + mm
	if (h < 10) h = '0' + h
	if (m < 10) m = '0' + m
	return `${yyyy}-${mm}-${dd}T${h}:${m}`
}

export function isoToHHMM(dateIsoString: string) {
	const date = new Date(dateIsoString)
	let h: string | number = date.getHours()
	let m: string | number = date.getMinutes()
	if (h < 10) h = '0' + h
	if (m < 10) m = '0' + m
	return `${h}:${m}`
}
