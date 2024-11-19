'use server'
import { signOut } from '@/lib/auth'

export async function signOutFormAction() {
	await signOut()
}
