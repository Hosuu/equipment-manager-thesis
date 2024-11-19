import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'
const prisma = new PrismaClient()

const APIKEY_SALT = process.env.APIKEY_SALT
console.log(APIKEY_SALT)
function generateApiKeyHash(key: string) {
	return createHash('sha256')
		.update(APIKEY_SALT + key)
		.digest('base64')
}

async function main() {
	const user = await prisma.user.create({
		data: {
			email: '264422@student.pwr.edu.pl',
			hashedPassword: '$2a$10$ohX8aCjVGoWNPAjrTwrLSexcW/FUp/FL2PIPv/ZztVE2NePkDYwHa',
			role: 'ADMIN',
			apiKeys: { create: { name: 'testKey', keyHash: generateApiKeyHash('helloworld') } },
		},
	})

	const device = await prisma.device.create({
		data: { name: 'Mikroskop', description: 'dziala', building: 'H-4', room: '214' },
	})

	console.log(user, device)
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
