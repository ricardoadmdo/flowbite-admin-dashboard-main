import { useEffect, useState } from 'react';
import Axios from '../../api/axiosConfig';
import ProductSkeleton from './ProductSkeleton';
import ErrorComponent from '../ui/ErrorComponent';
import Pagination from '../ui/Pagination';

const fetchProductos = async (page, limit) => {
	const response = await Axios.get(`/productos`, {
		params: { page, limit },
	});
	return response.data;
};

const ResumenProductos = () => {
	const [productosData, setProductosData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(8);

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

	if (isLoading) return <ProductSkeleton />;
	if (isError) return <ErrorComponent message='No se pudo cargar el resumen de productos' />;

	const productosList = productosData?.productos || [];
	const totalPages = productosData?.totalPages || 1;

	const totalProductos = productosData.productos.length;
	const totalGanancia = productosData.productos.reduce(
		(acc, producto) => acc + (producto.venta - producto.costo) * producto.existencia,
		0
	);
	const totalCostoInventario = productosData.productos.reduce(
		(acc, producto) => acc + producto.costo * producto.existencia,
		0
	);

	return (
		<div className='container my-5'>
			<h2 className='text-center'>Resumen de Productos</h2>

			<ul className='list-group mb-4'>
				<li className='list-group-item'>
					<strong>Total de Productos:</strong> {totalProductos}
				</li>
				<li className='list-group-item'>
					<strong>Total Ganancia Esperada:</strong> ${totalGanancia.toFixed(2)}
				</li>
				<li className='list-group-item'>
					<strong>Total Costo de Inventario:</strong> ${totalCostoInventario.toFixed(2)}
				</li>
			</ul>

			<h3 className='text-center mb-4'>Detalles por Producto</h3>
			<div className='table-responsive'>
				<table className='table table-striped table-bordered'>
					<thead className='thead-dark'>
						<tr>
							<th>Nombre</th>
							<th>Código</th>
							<th>Descripción</th>
							<th>Precio Venta</th>
							<th>Precio Costo</th>
							<th>Existencia</th>
							<th>Ganancia Total</th>
							<th>Costo Total</th>
						</tr>
					</thead>
					<tbody>
						{productosList.map((producto) => {
							const gananciaProducto = (producto.venta - producto.costo) * producto.existencia;
							const costoTotalProducto = producto.costo * producto.existencia;

							return (
								<tr key={producto.uid}>
									<td>{producto.nombre}</td>
									<td>{producto.codigo}</td>
									<td>{producto.descripcion}</td>
									<td>${producto.venta.toFixed(2)}</td>
									<td>${producto.costo.toFixed(2)}</td>
									<td>{producto.existencia} unidades</td>
									<td>${gananciaProducto.toFixed(2)}</td>
									<td>${costoTotalProducto.toFixed(2)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
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

export default ResumenProductos;
