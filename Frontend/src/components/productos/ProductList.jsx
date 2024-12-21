import { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../ui/Pagination';
import Swal from 'sweetalert2';
import ProductSkeleton from './ProductSkeleton';
import ErrorComponent from '../ui/ErrorComponent';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const fetchProductos = async (page, limit) => {
	const response = await Axios.get(`/productos`, {
		params: { page, limit },
	});
	return response.data;
};

const ProductList = () => {
	const [productosData, setProductosData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(8);

	const navigate = useNavigate();

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const data = await fetchProductos(currentPage, limit);
			setProductosData(data);
		} catch (error) {
			console.error('Error fetching productos:', error);
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [currentPage]);

	const handleDelete = async (producto) => {
		const result = await Swal.fire({
			title: `¿Está seguro de eliminar el producto ${producto.nombre}?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		});

		if (result.isConfirmed) {
			try {
				await Axios.delete(`/productos/${producto.uid}`);
				Swal.fire('Eliminado', `El producto ${producto.nombre} ha sido eliminado`, 'success');
				fetchData();
			} catch (error) {
				console.error('Error eliminando producto:', error);
				Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
			}
		}
	};

	if (isLoading) return <ProductSkeleton />;
	if (isError) return <ErrorComponent message='No se pudo cargar la lista de productos' />;

	const productosList = productosData?.productos || [];
	const totalPages = productosData?.totalPages || 1;

	return (
		<div className='container my-5'>
			<h2 className='text-center mb-4'>Lista de Productos</h2>

			<div className='text-center mb-4'>
				<Link to='/productform' className='btn btn-success'>
					Agregar Producto
				</Link>
			</div>

			<div className='row'>
				{productosList.length > 0 ? (
					productosList.map((producto) => (
						<div key={producto.uid} className='col-sm-6 col-md-4 col-lg-3 mb-4'>
							<div className='card h-100'>
								<img
									src={producto.url}
									alt={producto.nombre}
									className='card-img-top'
									style={{ objectFit: 'cover', height: '200px' }}
								/>
								<div className='card-body'>
									<h5 className='card-title'>{producto.nombre}</h5>
									<p className='card-text'>{producto.descripcion}</p>
									<p className='card-text'>
										<strong>Codigo:</strong> {producto.codigo}
									</p>
									<p className='card-text'>
										<strong>Precio Venta:</strong> ${producto.venta}
									</p>
									<p className='card-text'>
										<strong>Precio Costo:</strong> ${producto.costo}
									</p>
									<p className='card-text'>
										<strong>Existencia:</strong> {producto.existencia} unidades
									</p>
									<p className='card-text'>
										<strong>Impuesto de Costo:</strong> ${producto.impuestoCosto}
									</p>
									<p className='card-text'>
										<strong>Impuesto de Venta:</strong> ${producto.impuestoVenta}
									</p>
								</div>
								<div className='card-footer d-flex justify-content-between'>
									<button
										className='btn btn-primary'
										onClick={() => navigate(`/edit/${producto.uid}`)}
									>
										<FontAwesomeIcon icon={faEdit} /> Editar
									</button>
									<button className='btn btn-danger' onClick={() => handleDelete(producto)}>
										<FontAwesomeIcon icon={faTrashAlt} /> Eliminar
									</button>
								</div>
							</div>
						</div>
					))
				) : (
					<div className='col-12 text-center'>
						<p>No hay productos disponibles.</p>
					</div>
				)}
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				handlePreviousPage={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
				handleNextPage={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
			/>
		</div>
	);
};

export default ProductList;
