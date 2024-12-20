import { useState } from 'react';

const Navbar = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<nav className='fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700'>
			<div className='px-3 py-3 lg:px-5 lg:pl-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center justify-start'>
						<button
							onClick={toggleSidebar}
							aria-expanded={sidebarOpen ? 'true' : 'false'}
							aria-controls='sidebar'
							className='p-2 text-gray-600 rounded cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
						>
							<svg
								className={`w-6 h-6 ${sidebarOpen ? 'hidden' : 'block'}`}
								fill='currentColor'
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
									clipRule='evenodd'
								></path>
							</svg>
							<svg
								className={`w-6 h-6 ${sidebarOpen ? 'block' : 'hidden'}`}
								fill='currentColor'
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
									clipRule='evenodd'
								></path>
							</svg>
						</button>
						<a href='/' className='flex ml-2 md:mr-24'>
							<img src='src/images/logo.png' className='h-8 mr-3' alt='Logo' />
							<span className='self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white'>
								Bravo
							</span>
						</a>
					</div>
					<div className='flex items-center ml-3'>
						<div>
							<button
								type='button'
								className='flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600'
								id='user-menu-button-2'
								aria-expanded='false'
								data-dropdown-toggle='dropdown-2'
							>
								<span className='sr-only'>Open user menu</span>
								<img
									className='w-8 h-8 rounded-full'
									src='https://flowbite.com/docs/images/people/profile-picture-5.jpg'
									alt='user photo'
								/>
							</button>
						</div>
						<div
							className='z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600'
							id='dropdown-2'
						>
							<div className='px-4 py-3' role='none'>
								<p className='text-sm text-gray-900 dark:text-white' role='none'>
									Neil Sims
								</p>
								<p
									className='text-sm font-medium text-gray-900 truncate dark:text-gray-300'
									role='none'
								>
									neil.sims@flowbite.com
								</p>
							</div>
							<ul className='py-1' role='none'>
								<li>
									<a
										href='#'
										className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
										role='menuitem'
									>
										Dashboard
									</a>
								</li>
								<li>
									<a
										href='#'
										className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
										role='menuitem'
									>
										Settings
									</a>
								</li>
								<li>
									<a
										href='#'
										className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
										role='menuitem'
									>
										Earnings
									</a>
								</li>
								<li>
									<a
										href='#'
										className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
										role='menuitem'
									>
										Sign out
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div
				className={`lg:hidden ${
					sidebarOpen ? 'block' : 'hidden'
				} bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700`}
			>
				<ul className='p-4'>
					<li>
						<a
							href='#'
							className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
						>
							Agregar Venta
						</a>
					</li>
					<li>
						<a
							href='#'
							className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
						>
							Reportes de Ventas
						</a>
					</li>
					<li>
						<a
							href='#'
							className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
						>
							Ver Productos
						</a>
					</li>
					<li>
						<a
							href='#'
							className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
						>
							Ver Usuarios
						</a>
					</li>
				</ul>
			</div>
			<div className='hidden lg:block lg:w-64 lg:fixed lg:top-16 lg:left-0 lg:bg-white lg:border-r lg:border-gray-200 lg:dark:bg-gray-800 lg:dark:border-gray-700 lg:h-full'>
				<ul className='p-4'>
					<li>
						<a
							href='#'
							className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
						>
							Agregar Venta
						</a>
					</li>
					<li>
						<a
							href='#'
							className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
						>
							Reportes de Ventas
						</a>
					</li>
					<li>
						<a
							href='#'
							className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
						>
							Ver Productos
						</a>
					</li>
					<li>
						<a
							href='#'
							className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
						>
							Ver Usuarios
						</a>
					</li>
				</ul>
			</div>
		</nav>
	);
};

export default Navbar;
