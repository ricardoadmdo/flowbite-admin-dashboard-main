import { useEffect, useState } from 'react';
import Axios from '../../api/axiosConfig';
import ProductSkeleton from './ProductSkeleton';
import ErrorComponent from '../ui/ErrorComponent';

const ResumenProductos = () => {
	const [productos, setProductos] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);

	const fetchProductos = async () => {
		try {
			const response = await Axios.get('/productos', {
				params: { page: 1, limit: 1000 },
			});
			setProductos(response.data.productos || []);
		} catch (error) {
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProductos();
	}, []);

	if (isLoading) return <ProductSkeleton />;
	if (isError) return <ErrorComponent message="No se pudo cargar el resumen de productos" />;

	const totalProductos = productos.length;
	const totalGanancia = productos.reduce(
		(acc, producto) => acc + (producto.venta - producto.costo) * producto.existencia,
		0
	);
	const totalCostoInventario = productos.reduce(
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
			<div className='list-group'>
				{productos.map((producto) => {
					const gananciaProducto =
						(producto.venta - producto.costo) * producto.existencia;
					const costoTotalProducto = producto.costo * producto.existencia;

					return (
						<div key={producto.uid} className='list-group-item'>
							<h5>{producto.nombre}</h5>
							<p><strong>Código:</strong> {producto.codigo}</p>
							<p><strong>Descripción:</strong> {producto.descripcion}</p>
							<p><strong>Precio Venta:</strong> ${producto.venta}</p>
							<p><strong>Precio Costo:</strong> ${producto.costo}</p>
							<p><strong>Existencia:</strong> {producto.existencia} unidades</p>
							<p><strong>Ganancia Total:</strong> ${gananciaProducto.toFixed(2)}</p>
							<p><strong>Costo Total:</strong> ${costoTotalProducto.toFixed(2)}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ResumenProductos;
