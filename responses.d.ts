type DateIsoString = string | Date

interface BasicUser {
	id: string
	name: string
	email: string
}

interface DetailedUser extends BasicUser {
	role: 'USER' | 'ADMIN'
	monthlyLimit: number
	createdAt: DateIsoString
	updatedAt: DateIsoString
}

interface ApiKey {
	id: string
	name: string
	hits: number
	lastUsed: DateIsoString | null
	createdAt: DateIsoString
	isRevoked: boolean
}

interface CreatedApiKey extends ApiKey {
	key: string
}

interface BasicDevice {
	id: string
	name: string
	building: string
	room: string
}

interface DetailedDevice extends BasicDevice {
	description: string | null
	updatedAt: DateIsoString
	createdAt: DateIsoString
}

interface BasicBooking {
	id: string
	user: BasicUser
	device: BasicDevice
	startTime: DateIsoString
	endTime: DateIsoString
	isCanceled: boolean
}

interface DetailedBooking extends BasicBooking {
	duration: number
	updatedAt: DateIsoString
	createdAt: DateIsoString
}

interface DeletedId {
	id: string
}
