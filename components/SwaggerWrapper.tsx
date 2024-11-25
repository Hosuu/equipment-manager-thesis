'use client'
import SwaggerUI from 'swagger-ui-react'

export const SwaggerWrapper = ({}) => {
	return (
		<div className='bg-white py-4'>
			<SwaggerUI url='swagger.yml' />
		</div>
	)
}
