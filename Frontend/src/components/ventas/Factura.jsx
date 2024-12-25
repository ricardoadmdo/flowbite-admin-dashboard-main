import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrashAlt, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import html2pdf from 'html2pdf.js';

const Factura = ({ formState, setFormState, aumentarCantidad, disminuirCantidad, eliminarProducto, validarVenta }) => {
	const facturaRef = useRef();
	const [cliente, setCliente] = useState({
		nombre: '',
		carnet: '',
		direccion: '',
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setCliente({
			...cliente,
			[name]: value,
		});
	};

	const handlePrecioChange = (uid, value) => {
		const nuevoPrecio = parseFloat(value);
		if (isNaN(nuevoPrecio)) return;
		const productosActualizados = formState.productos.map((producto) => {
			if (producto.uid === uid) {
				return { ...producto, venta: nuevoPrecio };
			}
			return producto;
		});
		const precioTotal = productosActualizados.reduce(
			(total, producto) => total + producto.cantidad * producto.venta,
			0
		);
		setFormState({ ...formState, productos: productosActualizados, precioTotal });
	};

	const generatePDF = () => {
		const element = facturaRef.current.cloneNode(true);
		element.querySelectorAll('.d-print-none').forEach((el) => el.remove());
		html2pdf()
			.from(element)
			.set({
				margin: 1,
				filename: 'Factura_Servicios_Bravo.pdf',
				html2canvas: { scale: 2 },
				jsPDF: { orientation: 'portrait' },
			})
			.save();
	};

	return (
		<div className='container mt-4 p-4 border rounded bg-white' ref={facturaRef}>
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
							<th className='d-print-none'>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{formState.productos.map((producto) => (
							<tr key={producto.uid}>
								<td>{producto.nombre}</td>
								<td>
									<span
										contentEditable='true'
										style={{ border: 'none', padding: '0' }}
										onBlur={(e) => handlePrecioChange(producto.uid, e.target.innerText)}
									>
										${producto.venta}
									</span>
								</td>
								<td>{producto.cantidad}</td>
								<td>${producto.cantidad * producto.venta}</td>
								<td className='d-print-none'>
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
					<div className='d-flex justify-content-between fw-bold mb-3'>
						<span>Total:</span>
						<span>${formState.precioTotal}</span>
					</div>
				</div>
			</div>
			<div className='mt-4'>
				<h5>Datos del Cliente</h5>
				<div className='mb-2'>
					Nombre:{' '}
					<span
						contentEditable='true'
						style={{ border: 'none', padding: '0' }}
						onBlur={(e) => setCliente({ ...cliente, nombre: e.target.innerText })}
					>
						{cliente.nombre}
					</span>
				</div>
				<div className='mb-2'>
					Carnet de Identidad:{' '}
					<input
						type='text'
						name='carnet'
						value={cliente.carnet}
						onChange={handleInputChange}
						style={{ border: 'none', padding: '0' }}
					/>
				</div>
				<div className='mb-2'>
					Dirección:{' '}
					<span
						contentEditable='true'
						style={{ border: 'none', padding: '0' }}
						onBlur={(e) => setCliente({ ...cliente, direccion: e.target.innerText })}
					>
						{cliente.direccion}
					</span>
				</div>
				<div className='mb-2'>Firma: ____________________________________</div>
			</div>
			<div className='d-print-none text-right'>
				<button className='btn btn-success mr-1' onClick={validarVenta}>
					Registrar Venta <FontAwesomeIcon icon={faPlus} />
				</button>
				<button className='btn btn-primary ' onClick={generatePDF}>
					Descargar PDF <FontAwesomeIcon icon={faFilePdf} />
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
	setFormState: PropTypes.func.isRequired,
	aumentarCantidad: PropTypes.func.isRequired,
	disminuirCantidad: PropTypes.func.isRequired,
	eliminarProducto: PropTypes.func.isRequired,
	validarVenta: PropTypes.func.isRequired,
	actualizarPrecio: PropTypes.func.isRequired,
};

export default Factura;
