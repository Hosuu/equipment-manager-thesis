export default async function NotFound() {
	return (
		<div className='flex flex-col justify-center items-center my-24 gap-4'>
			<h1 className='text-3xl font-extrabold text-primary-600'>Nie znaleziono</h1>
			<p>Nie znaleziono użytkownika o podanym ID w systemie</p>
		</div>
	)
}
