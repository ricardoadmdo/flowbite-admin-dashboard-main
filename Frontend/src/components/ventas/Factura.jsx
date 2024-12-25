import PropTypes from 'prop-types';
import MotionNumber from 'motion-number';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const Factura = ({ formState, aumentarCantidad, disminuirCantidad, eliminarProducto, validarVenta }) => {
	return (
		<div className='container mt-4 p-4 border rounded bg-white'>
			<div className='text-center mb-4'>
				<h4>Factura</h4>
			</div>
			<div className='mb-4'>
				<div className='d-flex justify-content-between'>
					<span className='fw-bold'>Servicios Bravo</span>
					<span className='fw-bold'>Código: 12345</span> {/* Ejemplo de código de factura */}
				</div>
				<div className='text-start mt-2'>
					<span>Falgueras entre auditor y Santa Catalina, Empresa de fósforos ENFOS Cerro, La Habana</span>
				</div>
				<div className='d-flex justify-content-between mt-3'>
					<span className='fw-bold'>Fecha: {new Date().toLocaleDateString()}</span>
					<span className='fw-bold'>Fecha de vencimiento: {new Date().toLocaleDateString()}</span>
				</div>
			</div>
			<div className='mb-4'>
				<table className='table table-bordered'>
					<thead className='table-light'>
						<tr>
							<th>Descripción</th>
							<th>Precio Unitario</th>
							<th>Cantidad</th>
							<th>Monto</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{formState.productos.map((producto) => (
							<tr key={producto.uid}>
								<td>{producto.nombre}</td>
								<td>${producto.venta}</td>
								<td>
									<MotionNumber
										value={producto.cantidad}
										format={{ notation: 'standard' }} // Intl.NumberFormat() options
										locales // Intl.NumberFormat() locales
									/>
								</td>
								<td>${producto.cantidad * producto.venta}</td>
								<td>
									<button
										className='btn btn-secondary btn-sm ml-1'
										onClick={() => aumentarCantidad(producto.uid)}
									>
										<FontAwesomeIcon icon={faPlus} />
									</button>
									<button
										className='btn btn-danger btn-sm ml-1'
										onClick={() => {
											if (producto.cantidad > 1) {
												disminuirCantidad(producto.uid);
											} else {
												eliminarProducto(producto.uid);
											}
										}}
									>
										<FontAwesomeIcon icon={producto.cantidad > 1 ? faMinus : faTrashAlt} />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className='d-flex justify-content-end'>
				<div className='w-25'>
					<div className='d-flex justify-content-between mb-2'>
						<span>Subtotal:</span>
						<span>${formState.precioTotal}</span>
					</div>
					<div className='d-flex justify-content-between mb-2'>
						<span>Impuestos:</span>
						<span>$0.00</span>
					</div>
					<div className='d-flex justify-content-between fw-bold mb-3'>
						<span>Total:</span>
						<span>
							$
							<MotionNumber
								value={formState.precioTotal}
								format={{ notation: 'standard' }} // Intl.NumberFormat() options
								locales // Intl.NumberFormat() locales
							/>
						</span>
					</div>
					<button className='btn btn-success w-100' onClick={validarVenta}>
						Registrar Venta <FontAwesomeIcon icon={faPlus} />
					</button>
				</div>
			</div>
		</div>
	);
};

// Validación de props
Factura.propTypes = {
	formState: PropTypes.shape({
		productos: PropTypes.arrayOf(
			PropTypes.shape({
				uid: PropTypes.string.isRequired,
				nombre: PropTypes.string.isRequired,
				cantidad: PropTypes.number.isRequired,
				venta: PropTypes.number.isRequired,
				existencia: PropTypes.number.isRequired,
			})
		).isRequired,
		totalProductos: PropTypes.number.isRequired,
		precioTotal: PropTypes.number.isRequired,
		fecha: PropTypes.instanceOf(Date).isRequired,
	}).isRequired,
	aumentarCantidad: PropTypes.func.isRequired,
	disminuirCantidad: PropTypes.func.isRequired,
	eliminarProducto: PropTypes.func.isRequired,
	validarVenta: PropTypes.func.isRequired,
};

export default Factura;
