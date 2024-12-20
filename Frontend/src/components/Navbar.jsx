import { useState } from 'react';

const Navbar = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<nav className='fixed top-0 left-0 right-0 z-30 bg-white shadow-md dark:bg-gray-800'>
			<div className='px-4 py-4 md:px-6 lg:px-8'>
				<div className='flex items-center justify-between'>
					{/* Logo */}
					<a href='/' className='flex items-center space-x-3'>
						<img src='src/images/logo.png' className='h-8' alt='Logo' />
						<span className='text-xl font-semibold text-gray-800 dark:text-white'>Bravo</span>
					</a>

					{/* Desktop Menu */}
					<div className='hidden lg:flex space-x-6'>
						<a
							href='/crud-productos'
							className='text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition duration-300'
						>
							Crud Productos
						</a>
						<a
							href='/crud-usuarios'
							className='text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition duration-300'
						>
							Crud Usuarios
						</a>
						<a
							href='/reporte-ventas'
							className='text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition duration-300'
						>
							Reporte Ventas
						</a>
						<a
							href='/registrar-venta'
							className='text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition duration-300'
						>
							Registrar Venta
						</a>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={toggleSidebar}
						className='lg:hidden p-2 text-gray-600 rounded-lg hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:text-gray-400 dark:hover:text-white dark:focus:ring-gray-700'
						aria-expanded={sidebarOpen ? 'true' : 'false'}
						aria-controls='sidebar'
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
				</div>
			</div>

			{/* Sidebar for Mobile */}
			<div
				id='sidebar'
				className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className='flex justify-end p-4'>
					<button
						onClick={toggleSidebar}
						className='text-white'
						aria-expanded={sidebarOpen ? 'true' : 'false'}
						aria-controls='sidebar'
					>
						<svg
							className='w-6 h-6'
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
				</div>
				<div className='flex flex-col items-center space-y-6 text-white pt-12'>
					<a href='/crud-productos' className='text-lg hover:text-blue-400 transition duration-300'>
						Crud Productos
					</a>
					<a href='/crud-usuarios' className='text-lg hover:text-blue-400 transition duration-300'>
						Crud Usuarios
					</a>
					<a href='/reporte-ventas' className='text-lg hover:text-blue-400 transition duration-300'>
						Reporte Ventas
					</a>
					<a href='/registrar-venta' className='text-lg hover:text-blue-400 transition duration-300'>
						Registrar Venta
					</a>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
