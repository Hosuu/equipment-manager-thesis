export default async function Home() {
	return (
		<div>
			<div className='relative max-w-sm'>
				<div className='absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none'>
					<svg
						className='w-4 h-4 text-gray-500 dark:text-gray-400'
						aria-hidden='true'
						xmlns='http://www.w3.org/2000/svg'
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path d='M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z' />
					</svg>
				</div>
				{/* <input datepicker id="default-datepicker" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date"> */}
			</div>

			<form className='max-w-[8rem] mx-auto'>
				<label
					htmlFor='time'
					className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
				>
					Select time:
				</label>
				<div className='relative'>
					<div className='absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none'>
						<svg
							className='w-4 h-4 text-gray-500 dark:text-gray-400'
							aria-hidden='true'
							xmlns='http://www.w3.org/2000/svg'
							fill='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								fill-rule='evenodd'
								d='M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z'
								clip-rule='evenodd'
							/>
						</svg>
					</div>
					<input
						type='time'
						id='time'
						className='bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
						min='09:00'
						max='18:00'
						value='00:00'
						required
					/>
				</div>
			</form>

			<table id='export-table'>
				<thead>
					<tr>
						<th>
							<span className='flex items-center'>
								Name
								<svg
									className='w-4 h-4 ms-1'
									aria-hidden='true'
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									fill='none'
									viewBox='0 0 24 24'
								>
									<path
										stroke='currentColor'
										stroke-linecap='round'
										stroke-linejoin='round'
										stroke-width='2'
										d='m8 15 4 4 4-4m0-6-4-4-4 4'
									/>
								</svg>
							</span>
						</th>
						<th data-type='date' data-format='YYYY/DD/MM'>
							<span className='flex items-center'>
								Release Date
								<svg
									className='w-4 h-4 ms-1'
									aria-hidden='true'
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									fill='none'
									viewBox='0 0 24 24'
								>
									<path
										stroke='currentColor'
										stroke-linecap='round'
										stroke-linejoin='round'
										stroke-width='2'
										d='m8 15 4 4 4-4m0-6-4-4-4 4'
									/>
								</svg>
							</span>
						</th>
						<th>
							<span className='flex items-center'>
								NPM Downloads
								<svg
									className='w-4 h-4 ms-1'
									aria-hidden='true'
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									fill='none'
									viewBox='0 0 24 24'
								>
									<path
										stroke='currentColor'
										stroke-linecap='round'
										stroke-linejoin='round'
										stroke-width='2'
										d='m8 15 4 4 4-4m0-6-4-4-4 4'
									/>
								</svg>
							</span>
						</th>
						<th>
							<span className='flex items-center'>
								Growth
								<svg
									className='w-4 h-4 ms-1'
									aria-hidden='true'
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									fill='none'
									viewBox='0 0 24 24'
								>
									<path
										stroke='currentColor'
										stroke-linecap='round'
										stroke-linejoin='round'
										stroke-width='2'
										d='m8 15 4 4 4-4m0-6-4-4-4 4'
									/>
								</svg>
							</span>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Flowbite
						</td>
						<td>2021/25/09</td>
						<td>269000</td>
						<td>49%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							React
						</td>
						<td>2013/24/05</td>
						<td>4500000</td>
						<td>24%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Angular
						</td>
						<td>2010/20/09</td>
						<td>2800000</td>
						<td>17%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Vue
						</td>
						<td>2014/12/02</td>
						<td>3600000</td>
						<td>30%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Svelte
						</td>
						<td>2016/26/11</td>
						<td>1200000</td>
						<td>57%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Ember
						</td>
						<td>2011/08/12</td>
						<td>500000</td>
						<td>44%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Backbone
						</td>
						<td>2010/13/10</td>
						<td>300000</td>
						<td>9%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							jQuery
						</td>
						<td>2006/28/01</td>
						<td>6000000</td>
						<td>5%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Bootstrap
						</td>
						<td>2011/19/08</td>
						<td>1800000</td>
						<td>12%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Foundation
						</td>
						<td>2011/23/09</td>
						<td>700000</td>
						<td>8%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Bulma
						</td>
						<td>2016/24/10</td>
						<td>500000</td>
						<td>7%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Next.js
						</td>
						<td>2016/25/10</td>
						<td>2300000</td>
						<td>45%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Nuxt.js
						</td>
						<td>2016/16/10</td>
						<td>900000</td>
						<td>50%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Meteor
						</td>
						<td>2012/17/01</td>
						<td>1000000</td>
						<td>10%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Aurelia
						</td>
						<td>2015/08/07</td>
						<td>200000</td>
						<td>20%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Inferno
						</td>
						<td>2016/27/09</td>
						<td>100000</td>
						<td>35%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Preact
						</td>
						<td>2015/16/08</td>
						<td>600000</td>
						<td>28%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Lit
						</td>
						<td>2018/28/05</td>
						<td>400000</td>
						<td>60%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Alpine.js
						</td>
						<td>2019/02/11</td>
						<td>300000</td>
						<td>70%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Stimulus
						</td>
						<td>2018/06/03</td>
						<td>150000</td>
						<td>25%</td>
					</tr>
					<tr className='hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'>
						<td className='font-medium text-gray-900 whitespace-nowrap dark:text-white'>
							Solid
						</td>
						<td>2021/05/07</td>
						<td>250000</td>
						<td>80%</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}
