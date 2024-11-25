export { auth as middleware } from '@/lib/auth'

export const config = {
	matcher: [
		'/((?!api|api-docs|swagger.yml|_next/static|_next/image|logo.svg|favicon.ico|sitemap.xml|robots.txt).*)',
	],
}
