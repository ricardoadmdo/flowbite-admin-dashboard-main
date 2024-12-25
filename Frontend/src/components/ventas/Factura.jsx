import PropTypes from 'prop-types';
import MotionNumber from 'motion-number';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const Factura = ({ formState, aumentarCantidad, disminuirCantidad, eliminarProducto, validarVenta }) => {
	return (
		<div>
			<div className='mb-4'>
				<h4>Factura</h4>
				<ul className='list-group'>
					{formState.productos.map((producto) => (
						<li
							key={producto.uid}
							className='list-group-item d-flex justify-content-between align-items-center'
						>
							<div>
								<span className='fw-bold'>{producto.nombre}</span> -{' '}
								<MotionNumber
									value={producto.cantidad}
									format={{ notation: 'standard' }} // Intl.NumberFormat() options
									locales // Intl.NumberFormat() locales
								/>
								x ${producto.venta}
							</div>
							<div>
								<button
									className='btn btn-secondary btn-sm ml-1'
									onClick={() => aumentarCantidad(producto.uid)}
								>
									<FontAwesomeIcon icon={faPlus} />
								</button>
								<button
									className={`btn btn-sm ml-1 ${producto.cantidad > 1 ? 'btn-danger' : 'btn-danger'}`}
									onClick={() => {
										if (producto.cantidad > 1) {
											disminuirCantidad(producto.uid);
										} else {
											eliminarProducto(producto.uid);
										}
									}}
								>
									{' '}
									<FontAwesomeIcon icon={producto.cantidad > 1 ? faMinus : faTrashAlt} />{' '}
								</button>
							</div>
						</li>
					))}
				</ul>
			</div>

			{/* Total y acción final */}
			<div className='d-flex justify-content-between'>
				<h5>
					Total: $
					<MotionNumber
						value={formState.precioTotal}
						format={{ notation: 'standard' }} // Intl.NumberFormat() options
						locales // Intl.NumberFormat() locales
					/>
				</h5>
				<button className='btn btn-success' onClick={validarVenta}>
					Registrar Venta <FontAwesomeIcon icon={faPlus} />
				</button>
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
