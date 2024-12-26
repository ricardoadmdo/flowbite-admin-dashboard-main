import { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Factura from './Factura';

// Función para buscar el último código de factura
const fetchUltimoCodigoFactura = async () => {
	const response = await Axios.get('/venta/ultimo-codigo-factura');
	return response.data.ultimoCodigoFactura;
};

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
	const [cliente, setCliente] = useState({
		nombre: '',
		carnet: '',
		direccion: '',
	});

	const handleClienteChange = (e) => {
		const { name, value } = e.target;
		setCliente({
			...cliente,
			[name]: value,
		});
	};

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
		onSuccess: async () => {
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

			// Obtener y actualizar el nuevo código de factura después de registrar la venta
			try {
				const ultimoCodigoFactura = await fetchUltimoCodigoFactura();
				const nuevoCodigoFactura = generarCodigoFactura(ultimoCodigoFactura);
				setCodigoFactura(nuevoCodigoFactura);
			} catch (error) {
				console.error('Error al obtener el nuevo código de factura:', error);
			}
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
		setCliente({ nombre: '', carnet: '', direccion: '' });
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

	const generarCodigoFactura = (ultimoCodigoFactura) => {
		if (ultimoCodigoFactura) {
			const [dia, mes, numero] = ultimoCodigoFactura.split('/');
			const nuevoNumero = (parseInt(numero) + 1).toString().padStart(2, '0');
			return `${dia}/${mes}/${nuevoNumero}`;
		} else {
			const fecha = new Date();
			const dia = fecha.getDate().toString().padStart(2, '0');
			const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
			const numero = '01';
			return `${dia}/${mes}/${numero}`;
		}
	};

	const [codigoFactura, setCodigoFactura] = useState('');

	useEffect(() => {
		const obtenerUltimoCodigoFactura = async () => {
			try {
				const ultimoCodigoFactura = await fetchUltimoCodigoFactura();
				const nuevoCodigoFactura = generarCodigoFactura(ultimoCodigoFactura);
				setCodigoFactura(nuevoCodigoFactura);
			} catch (error) {
				console.error('Error al obtener el último código de factura:', error);
			}
		};

		obtenerUltimoCodigoFactura();
	}, []);

	// Validar venta
	const validarVenta = async () => {
		if (formState.productos.length === 0) {
			Swal.fire({
				icon: 'error',
				title: 'No hay productos',
				text: 'Debe agregar al menos un producto a la venta',
			});
			return;
		}

		if (!cliente.nombre || !cliente.carnet || !cliente.direccion) {
			Swal.fire({
				icon: 'error',
				title: 'Datos del cliente incompletos',
				text: 'Debe completar todos los datos del cliente',
			});
			return;
		}

		try {
			const result = await Swal.fire({
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
			});

			if (result.isConfirmed) {
				const gestor = result.value || 'Ninguno';
				// Asegúrate de que cada producto tenga los campos requeridos
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
				ventaMutation.mutateAsync({
					productos: productosValidados,
					totalProductos: formState.totalProductos,
					precioTotal: formState.precioTotal,
					fecha: new Date(),
					gestor: gestor, // Enviar el gestor
					codigoFactura: codigoFactura,
					cliente: cliente, // Añadir esta línea
				});
			}
		} catch (error) {
			console.error('Error al registrar la venta:', error);
		}
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
				{searchTerm && productos.length === 0 ? (
					<div className='list-group-item'>No se encontraron productos.</div>
				) : (
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
				)}
			</div>
			{/* Separación */} <hr className='my-4' />
			<Factura
				formState={formState}
				setFormState={setFormState}
				aumentarCantidad={aumentarCantidad}
				disminuirCantidad={disminuirCantidad}
				eliminarProducto={eliminarProducto}
				validarVenta={validarVenta}
				codigoFactura={codigoFactura}
				cliente={cliente}
				handleClienteChange={handleClienteChange}
			/>
		</div>
	);
};

export default AgregarVenta;
