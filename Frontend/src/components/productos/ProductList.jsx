import { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../ui/Pagination';
import Swal from 'sweetalert2';
import ProductSkeleton from './ProductSkeleton';
import ErrorComponent from '../ui/ErrorComponent';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import '../productos/ProductList.css';

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

	const handleViewMore = (producto) => {
		const gananciaPorUnidad = producto.venta - producto.costo;
		const gananciaTotal = gananciaPorUnidad * producto.existencia;

		Swal.fire({
			title: `Detalles de ${producto.nombre}`,
			html: `
                <p><strong>Código:</strong> ${producto.descripcion}</p>
                <p><strong>Código:</strong> ${producto.codigo}</p>
                <p><strong>Precio Venta:</strong> $${producto.venta}</p>
                <p><strong>Precio Costo:</strong> $${producto.costo}</p>
                <p><strong>Existencia:</strong> ${producto.existencia} unidades</p>
                <p><strong>Ganancia por Unidad:</strong> $${gananciaPorUnidad}</p>
                <p><strong>Costo Total:</strong> $${producto.costo * producto.existencia}</p>
                <p><strong>Ganancia Total:</strong> $${gananciaTotal}</p>
            `,
			icon: 'info',
			confirmButtonText: 'Cerrar',
		});
	};

	if (isLoading) return <ProductSkeleton />;
	if (isError) return <ErrorComponent message='No se pudo cargar la lista de productos' />;

	const productosList = productosData?.productos || [];
	const totalPages = productosData?.totalPages || 1;

	return (
		<div className='container md-5'>
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
								<LazyLoadImage
									height='200px'
									className='card-img-top'
									src={producto.url}
									alt={`Imagen del producto: ${producto.nombre}`}
									effect='blur'
									style={{ objectFit: 'contain' }}
								/>

								<div className='card-body'>
									<h5 className='card-title'>{producto.nombre}</h5>
									<p>
										<strong>Código:</strong> ${producto.codigo}
									</p>
									<p>
										<strong>Precio Venta:</strong> $${producto.venta}
									</p>
									<p>
										<strong>Precio Costo:</strong> $${producto.costo}
									</p>
									<p>
										<strong>Existencia:</strong> ${producto.existencia} unidades
									</p>
									<button
										className='btn btn-outline-primary'
										onClick={() => handleViewMore(producto)}
									>
										Ver más...
									</button>
								</div>

								<div className='card-footer d-flex justify-content-between'>
									<button
										className='btn btn-outline-secondary'
										onClick={() => navigate(`/edit/${producto.uid}`)}
									>
										<FontAwesomeIcon icon={faEdit} /> Editar
									</button>
									<button className='btn btn-outline-danger' onClick={() => handleDelete(producto)}>
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
