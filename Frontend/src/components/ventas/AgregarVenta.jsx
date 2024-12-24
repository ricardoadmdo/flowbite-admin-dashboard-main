import { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MotionNumber from 'motion-number';

// Función para buscar productos por nombre similar
const fetchProductos = async (searchTerm) => {
	const response = await Axios.get(`/productos?search=${searchTerm}`);
	return response.data.productos;
};

const AgregarVenta = () => {
	const [formState, setFormState] = useState({
		productos: [],
		totalProductos: 0,
		precioTotal: 0,
		fecha: new Date(),
	});
	const [searchTerm, setSearchTerm] = useState('');

	const queryClient = useQueryClient();
	const refetchProductos = () => {
		queryClient.invalidateQueries(['productos']);
	};

	// Búsqueda de productos usando react-query
	const { data: productos = [], refetch } = useQuery({
		queryKey: ['productos', searchTerm],
		queryFn: () => fetchProductos(searchTerm),
		enabled: false, // Solo hacer la búsqueda cuando el término de búsqueda cambie
	});

	// Actualiza la búsqueda cuando el usuario escribe
	useEffect(() => {
		if (searchTerm) {
			refetch(); // Ejecutar la búsqueda al cambiar el término
		}
	}, [searchTerm, refetch]);

	const ventaMutation = useMutation({
		mutationFn: (newVenta) => Axios.post('/venta', newVenta),
		onSuccess: () => {
			refetchProductos();
			limpiarCampos();
			Swal.fire({
				toast: true,
				position: 'top-end',
				title: '<strong>Operación exitosa!</strong>',
				text: `La venta se ha registrado correctamente`,
				icon: 'success',
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
				didOpen: (toast) => {
					toast.addEventListener('mouseenter', Swal.stopTimer);
					toast.addEventListener('mouseleave', Swal.resumeTimer);
				},
				customClass: {
					popup: 'swal-popup-success',
					title: 'swal-title',
					text: 'swal-content',
				},
			});
		},
		onError: (error) => {
			console.log(error);
			Swal.fire({
				icon: 'error',
				title: 'Error al registrar la venta',
				text: error.response?.data?.error || 'Error desconocido al registrar la venta',
			});
		},
	});

	const limpiarCampos = () => {
		setFormState({
			productos: [],
			totalProductos: 0,
			precioTotal: 0,
			fecha: new Date(),
		});
	};

	// Función para agregar productos seleccionados y sus cantidades
	const agregarProducto = (producto, cantidad) => {
		setFormState((prevState) => {
			const nuevosProductos = [...prevState.productos];
			const index = nuevosProductos.findIndex((p) => p.uid === producto.uid);

			if (index !== -1) {
				// Verificar si la cantidad excede la existencia
				if (nuevosProductos[index].cantidad + cantidad > producto.existencia) {
					Swal.fire({
						icon: 'warning',
						title: 'Cantidad excedida',
						text: `Solo quedan ${producto.existencia} unidades de este producto.`,
					});
					return prevState;
				}

				nuevosProductos[index].cantidad += cantidad;
			} else {
				if (cantidad > producto.existencia) {
					Swal.fire({
						icon: 'warning',
						title: 'Cantidad excedida',
						text: `Solo quedan ${producto.existencia} unidades de este producto.`,
					});
					return prevState;
				}

				nuevosProductos.push({ ...producto, cantidad });
			}

			const totalProductos = nuevosProductos.reduce((acc, p) => acc + p.cantidad, 0);
			const precioTotal = nuevosProductos.reduce((acc, p) => acc + p.venta * p.cantidad, 0);

			return {
				...prevState,
				productos: nuevosProductos,
				totalProductos,
				precioTotal,
			};
		});
	};

	const eliminarProducto = (productoId) => {
		setFormState((prevState) => {
			const nuevosProductos = prevState.productos.filter((p) => p.uid !== productoId);
			const totalProductos = nuevosProductos.reduce((acc, p) => acc + p.cantidad, 0);
			const precioTotal = nuevosProductos.reduce((acc, p) => acc + p.venta * p.cantidad, 0);

			return {
				...prevState,
				productos: nuevosProductos,
				totalProductos,
				precioTotal,
			};
		});
	};

	const aumentarCantidad = (productoId) => {
		setFormState((prevState) => {
			const nuevosProductos = prevState.productos.map((p) =>
				p.uid === productoId ? { ...p, cantidad: p.cantidad + 1 } : p
			);

			const totalProductos = nuevosProductos.reduce((acc, p) => acc + p.cantidad, 0);
			const precioTotal = nuevosProductos.reduce((acc, p) => acc + p.venta * p.cantidad, 0);

			return {
				...prevState,
				productos: nuevosProductos,
				totalProductos,
				precioTotal,
			};
		});
	};

	const disminuirCantidad = (productoId) => {
		setFormState((prevState) => {
			const nuevosProductos = prevState.productos.map((p) =>
				p.uid === productoId ? { ...p, cantidad: p.cantidad - 1 } : p
			);

			const totalProductos = nuevosProductos.reduce((acc, p) => acc + p.cantidad, 0);
			const precioTotal = nuevosProductos.reduce((acc, p) => acc + p.venta * p.cantidad, 0);

			return {
				...prevState,
				productos: nuevosProductos,
				totalProductos,
				precioTotal,
			};
		});
	};

	// Validar venta
	const validarVenta = () => {
		if (formState.productos.length === 0) {
			Swal.fire({
				icon: 'error',
				title: 'No hay productos',
				text: 'Debe agregar al menos un producto a la venta',
			});
			return;
		}

		// Modal para seleccionar gestor
		Swal.fire({
			title: 'Seleccione el Gestor',
			input: 'select',
			inputOptions: {
				Elena: 'Elena',
				Milton: 'Milton',
				Liset: 'Liset',
				Berardo: 'Berardo',
				Monaco: 'Mónaco',
				AnaMaria: 'Ana María',
				Greter: 'Greter',
				Wilson: 'Wilson',
				Jazmin: 'Jazmin',
				Ninguno: 'Ninguno',
			},
			inputPlaceholder: 'Selecciona Gestor, será Ninguno por defecto',
			showCancelButton: true,
		}).then((result) => {
			if (result.isConfirmed) {
				const gestor = result.value || 'Ninguno';
				// Asegurarse de que cada producto tenga los campos requeridos
				const productosValidados = formState.productos.map((producto) => ({
					...producto,
					existencia: producto.existencia || 0,
					costo: producto.costo || 0,
					venta: producto.venta || 0,
					impuestoCosto: producto.impuestoCosto || 0,
					impuestoVenta: producto.impuestoVenta || 0,
					codigo: producto.codigo || 0,
				}));

				// Realizar la mutación (registro de la venta)
				ventaMutation.mutate({
					productos: productosValidados,
					totalProductos: formState.totalProductos,
					precioTotal: formState.precioTotal,
					fecha: new Date(),
					gestor: gestor, // Enviar el gestor
				});
			}
		});
	};

	// Modal para seleccionar cantidad
	const openModal = (producto) => {
		Swal.fire({
			title: 'Ingrese la cantidad',
			input: 'number',
			inputAttributes: {
				min: 1,
				autocapitalize: 'off',
			},
			inputValue: '1',
			showCancelButton: true,
			confirmButtonText: 'Agregar',
			preConfirm: (cantidad) => {
				if (!cantidad || cantidad < 1) {
					Swal.showValidationMessage('Debe ingresar una cantidad válida');
					return false;
				}
				agregarProducto(producto, parseInt(cantidad));
			},
		});
	};

	return (
		<div className='container animate__animated animate__fadeIn mt-4 my-5'>
			<h2 className='text-center mb-4'>Registrar Ventas</h2>
			<form onSubmit={(e) => e.preventDefault()} className='mb-4'>
				<div className='input-group'>
					<input
						type='text'
						className='form-control'
						placeholder='Buscar un producto...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<button className='btn btn-primary' type='button' onClick={() => refetch()}>
						Buscar
					</button>
				</div>
			</form>

			{/* Lista de productos encontrados */}
			<div className='list-group'>
				{productos && productos.length > 0 ? (
					productos.map((producto) => (
						<div
							key={producto.uid}
							className='list-group-item d-flex justify-content-between align-items-center'
						>
							<div>
								<span className='fw-bold'>{producto.nombre}</span> - ${producto.venta}
								<span className='text-muted'> (Stock: {producto.existencia})</span>
							</div>
							<button className='btn btn-success' onClick={() => openModal(producto)}>
								Agregar
							</button>
						</div>
					))
				) : (
					<div className='list-group-item'>No se encontraron productos.</div>
				)}
			</div>

			{/* Mostrar productos agregados a la venta */}
			<div className='mb-4'>
				<h4>Productos Seleccionados</h4>
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

export default AgregarVenta;
