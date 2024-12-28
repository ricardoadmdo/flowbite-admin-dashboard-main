import { useState, useEffect, useContext } from 'react';
import Axios from '../../api/axiosConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Pagination from '../ui/Pagination';
import '../ventas/ReporteVentas.css';
import { AuthContext } from '../../auth/authContext';
import GananciaGestores from './GananciaGestores';
import ReporteVentasSkeleton from './ReportedeVentaSkeleton';

const ReporteVentas = () => {
	const [ventas, setVentas] = useState([]);
	const [startDate, setStartDate] = useState(new Date());
	const [totalGanancia, setTotalGanancia] = useState(0);
	const [totalRecaudado, setTotalRecaudado] = useState(0);
	const [productoMasVendido, setProductoMasVendido] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [gananciaNeta, setGananciaNeta] = useState(0);
	const [ventasGlobales, setVentasGlobales] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const { user } = useContext(AuthContext);

	// Fetch ventas con paginación y fecha seleccionada
	useEffect(() => {
		const fetchVentasByDateAndPage = async () => {
			setIsLoading(true);
			setIsError(false);
			try {
				const day = startDate.getDate();
				const month = startDate.getMonth() + 1;
				const year = startDate.getFullYear();
				const { data } = await Axios.get(`/venta`, {
					params: { day, month, year, page: currentPage },
				});
				setVentas(data.ventas);
				setTotalPages(data.totalPages);
			} catch (error) {
				console.error('Error al obtener ventas:', error);
				setIsError(true);
			} finally {
				setIsLoading(false);
			}
		};

		fetchVentasByDateAndPage();
	}, [startDate, currentPage]); // Llamar cada vez que cambie la fecha o la página actual

	// Fetch todas las ventas del día para calcular estadísticas globales
	useEffect(() => {
		const fetchAllVentasByDate = async () => {
			try {
				const day = startDate.getDate();
				const month = startDate.getMonth() + 1;
				const year = startDate.getFullYear();
				const { data } = await Axios.get(`/venta/all`, { params: { day, month, year } });
				setVentasGlobales(data.ventas);
				calcularGananciasYProductoMasVendido(data.ventas);
			} catch (error) {
				console.error('Error al obtener todas las ventas:', error);
				Swal.fire('Error', 'No se pudo obtener todas las ventas. Por favor, intenta nuevamente.', 'error');
			}
		};

		fetchAllVentasByDate();
	}, [startDate]);

	const calcularGananciasYProductoMasVendido = (ventas) => {
		let totalGananciaCalculada = 0;
		let totalRecaudadoCalculado = 0;
		const productoContador = {};
		let gananciaGestores = 0;

		ventas.forEach((venta) => {
			let gananciaVenta = 0;
			venta.productos.forEach((producto) => {
				gananciaVenta += (producto.venta - producto.costo) * producto.cantidad;
				productoContador[producto.nombre] = (productoContador[producto.nombre] || 0) + producto.cantidad;
				if (venta.gestor !== 'Ninguno') {
					gananciaGestores += (producto.precioGestor || 0) * producto.cantidad;
				}
			});

			totalRecaudadoCalculado += venta.precioTotal;
			totalGananciaCalculada += gananciaVenta;
		});

		setTotalGanancia(totalGananciaCalculada);
		setTotalRecaudado(totalRecaudadoCalculado);
		setGananciaNeta(totalGananciaCalculada - gananciaGestores);

		if (Object.keys(productoContador).length > 0) {
			const productoMax = Object.keys(productoContador).reduce((a, b) =>
				productoContador[a] > productoContador[b] ? a : b
			);
			setProductoMasVendido(productoMax);
		} else {
			setProductoMasVendido('No hay ventas.');
		}
	};

	const handleDeleteVenta = async (id) => {
		Swal.fire({
			title: `Eliminar`,
			html: `¿Está seguro que desea eliminar esta venta, no podrá revertir esta acción?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					await Axios.delete(`/venta/${id}`);
					setVentas(ventas.filter((venta) => venta.uid !== id));
					Swal.fire('¡Eliminada!', 'La venta ha sido eliminada.', 'success');
				} catch (error) {
					console.error('Error al eliminar la venta:', error);
					Swal.fire('Error', 'No se pudo eliminar la venta.', 'error');
				}
			}
		});
	};

	return (
		<div className='container my-5'>
			<h2 className='text-center mb-4'>Reporte de Ventas</h2>

			<div className='d-flex justify-content-center mb-4'>
				<DatePicker
					selected={startDate}
					onChange={(date) => setStartDate(date)}
					dateFormat='dd/MM/yyyy'
					className='form-control'
				/>
			</div>

			{isError ? (
				<p className='text-danger'>Ocurrió un error al cargar las ventas.</p>
			) : isLoading ? (
				<ReporteVentasSkeleton />
			) : (
				<>
					<div className='mb-4'>
						<p>
							<strong>Total Recaudado del Día:</strong> ${totalRecaudado.toFixed(2)} CUP
						</p>
						{user.rol === 'Administrador' && (
							<p>
								<strong>Ganancia Total del Día:</strong> ${totalGanancia.toFixed(2)} CUP
							</p>
						)}

						{user.rol === 'Administrador' && (
							<p>
								<strong>Ganancia Neta para Alejandro:</strong> ${gananciaNeta.toFixed(2)} CUP{' '}
							</p>
						)}
						<p>
							<strong>Producto Más Vendido:</strong> {productoMasVendido || 'No hay ventas.'}
						</p>
					</div>

					<GananciaGestores ventas={ventasGlobales} porcentajeGanancia={0.01} />

					<div className='report-ventas__table-container'>
						<table className='table report-ventas__table table-striped table-bordered rounded-3 overflow-hidden'>
							<thead className='thead-dark'>
								<tr>
									<th>#</th>
									<th>Hora</th>
									<th>Productos</th>
									<th>Total Recaudado</th>
									{user.rol === 'Administrador' && <th>Ganancia por Venta</th>}
									<th>Factura</th>
									<th>Datos del Cliente</th>
									<th>Gestor</th>
									<th>Acciones</th>
								</tr>
							</thead>
							<tbody>
								{ventas.length === 0 ? (
									<tr>
										<td colSpan='7' className='text-center'>
											No hay ventas para la fecha seleccionada.
										</td>
									</tr>
								) : (
									ventas.map((venta, index) => {
										let gananciaVenta = 0;

										venta.productos.forEach((producto) => {
											gananciaVenta += (producto.venta - producto.costo) * producto.cantidad;
										});

										return (
											<tr key={venta.uid}>
												<td>{(currentPage - 1) * 8 + index + 1}</td>
												<td>{new Date(venta.fecha).toLocaleTimeString()}</td>
												<td>
													<ul>
														{venta.productos.map((producto, idx) => (
															<li key={idx}>
																{producto.nombre} - {producto.cantidad} x $
																{producto.venta.toFixed(2)}
															</li>
														))}
													</ul>
												</td>
												<td>${venta.precioTotal.toFixed(2)} CUP</td>
												{user.rol === 'Administrador' && (
													<td>${gananciaVenta.toFixed(2)} CUP</td>
												)}
												<td>{venta.codigoFactura}</td>
												<td>
													<ul style={{ paddingLeft: '15px', listStyleType: 'none' }}>
														<li>
															<strong>Nombre:</strong> {venta.cliente.nombre}
														</li>
														<li>
															<strong>Carnet:</strong> {venta.cliente.carnet}
														</li>
														<li>
															<strong>Dirección:</strong> {venta.cliente.direccion}
														</li>
													</ul>
												</td>

												<td>{venta.gestor}</td>
												<td>
													<button
														className='btn btn-danger'
														onClick={() => handleDeleteVenta(venta.uid)}
													>
														<FontAwesomeIcon icon={faTrashAlt} /> Eliminar
													</button>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				handlePreviousPage={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
				handleNextPage={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
			/>
		</div>
	);
};

export default ReporteVentas;
