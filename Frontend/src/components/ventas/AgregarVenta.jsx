import { useState, useEffect } from "react";
import Axios from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Factura from "./Factura";
import { fetchGestores, fetchProductosName, fetchUltimoCodigoFactura } from "../../api/fetchData";
import BuscarProductoSkeleton from "./BuscarProductoSkeleton";

const AgregarVenta = () => {
	const [spinner] = useState(false);
	const [gestores, setGestores] = useState([]);
	const [codigoFactura, setCodigoFactura] = useState("");
	const [formState, setFormState] = useState({
		productos: [],
		totalProductos: 0,
		precioTotal: 0,
		fecha: new Date(),
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [cliente, setCliente] = useState({
		nombre: "",
		carnet: "",
		direccion: "",
	});

	const queryClient = useQueryClient();
	const refetchProductos = () => {
		queryClient.invalidateQueries(["productos"]);
	};

	// Búsqueda de productos usando react-query
	const {
		data: productos = [],
		refetch,
		isFetching,
	} = useQuery({
		queryKey: ["productos", searchTerm],
		queryFn: () => fetchProductosName(searchTerm),
		enabled: false, // Solo hacer la búsqueda cuando el término de búsqueda cambie
	});

	const handleClienteChange = (e) => {
		const { name, value } = e.target;
		setCliente({
			...cliente,
			[name]: value,
		});
	};

	// Actualiza la búsqueda cuando el usuario escribe
	useEffect(() => {
		if (searchTerm) {
			refetch(); // Ejecutar la búsqueda al cambiar el término
		}
	}, [searchTerm, refetch]);

	const ventaMutation = useMutation({
		mutationFn: (newVenta) => Axios.post("/venta", newVenta),
		onSuccess: async () => {
			refetchProductos();
			limpiarCampos();
			Swal.fire({
				toast: true,
				position: "top-end",
				title: "<strong>Operación exitosa!</strong>",
				text: `La venta se ha registrado correctamente 💰`,
				icon: "success",
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
				didOpen: (toast) => {
					toast.addEventListener("mouseenter", Swal.stopTimer);
					toast.addEventListener("mouseleave", Swal.resumeTimer);
				},
				customClass: {
					popup: "swal-popup-success",
					title: "swal-title",
					text: "swal-content",
				},
			});

			// Obtener y actualizar el nuevo código de factura después de registrar la venta
			try {
				const ultimoCodigoFactura = await fetchUltimoCodigoFactura();
				const nuevoCodigoFactura = generarCodigoFactura(ultimoCodigoFactura);
				setCodigoFactura(nuevoCodigoFactura);
			} catch (error) {
				console.error("Error al obtener el nuevo código de factura:", error);
			}
		},
		onError: (error) => {
			console.log(error);
			Swal.fire({
				icon: "error",
				title: "Error al registrar la venta",
				text: error.response?.data?.error || "Error desconocido al registrar la venta",
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
		setCliente({ nombre: "", carnet: "", direccion: "" });
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
						icon: "warning",
						title: "Cantidad excedida",
						text: `Solo quedan ${producto.existencia} unidades de este producto.`,
					});
					return prevState;
				}

				nuevosProductos[index].cantidad += cantidad;
			} else {
				if (cantidad > producto.existencia) {
					Swal.fire({
						icon: "warning",
						title: "Cantidad excedida",
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

	const aumentarCantidad = (uid, cantidad = 1) => {
		setFormState((prevState) => {
			const productosActualizados = prevState.productos.map((producto) => {
				if (producto.uid === uid) {
					const nuevaCantidad = producto.cantidad + cantidad;
					if (nuevaCantidad <= producto.existencia) {
						return { ...producto, cantidad: nuevaCantidad };
					} else {
						Swal.fire({
							icon: "warning",
							title: "No hay suficiente Stock",
							text: "La cantidad introducida sobrepasa el stock",
						});
					}
				}
				return producto;
			});

			const precioTotal = productosActualizados.reduce(
				(total, producto) => total + producto.cantidad * producto.venta,
				0
			);

			return { ...prevState, productos: productosActualizados, precioTotal };
		});
	};

	const disminuirCantidad = (uid, cantidad = 1) => {
		setFormState((prevState) => {
			const productosActualizados = prevState.productos.map((producto) => {
				if (producto.uid === uid) {
					const nuevaCantidad = producto.cantidad - cantidad;
					if (nuevaCantidad >= 1) {
						return { ...producto, cantidad: nuevaCantidad };
					} else {
						Swal.fire({
							icon: "error",
							title: "La cantidad no puede ser menor a 1",
							text: "No puedes registrar un producto negativo",
						});
					}
				}
				return producto;
			});

			const precioTotal = productosActualizados.reduce(
				(total, producto) => total + producto.cantidad * producto.venta,
				0
			);

			return { ...prevState, productos: productosActualizados, precioTotal };
		});
	};

	const generarCodigoFactura = (ultimoCodigoFactura) => {
		if (ultimoCodigoFactura) {
			const nuevoNumero = (parseInt(ultimoCodigoFactura) + 1).toString().padStart(4, "0");
			localStorage.setItem("ultimoCodigoFactura", nuevoNumero);
			return nuevoNumero;
		}

		// Si no hay un código anterior, iniciar desde 0001
		const nuevoCodigo = "0001";
		localStorage.setItem("ultimoCodigoFactura", nuevoCodigo);
		return nuevoCodigo;
	};

	useEffect(() => {
		const obtenerUltimoCodigoFactura = async () => {
			try {
				const ultimoCodigoFactura = await fetchUltimoCodigoFactura();
				const nuevoCodigoFactura = generarCodigoFactura(ultimoCodigoFactura);
				setCodigoFactura(nuevoCodigoFactura);
			} catch (error) {
				console.error("Error al obtener el último código de factura:", error);
			}
		};

		const obtenerGestores = async () => {
			try {
				const gestoresObtenidos = await fetchGestores(1, 100);
				setGestores(gestoresObtenidos.gestores);
			} catch (error) {
				console.error("Error al obtener los gestores:", error);
			}
		};

		obtenerUltimoCodigoFactura();
		obtenerGestores();
	}, []);

	// Validar venta
	const validarVenta = async () => {
		if (formState.productos.length === 0) {
			Swal.fire({
				icon: "error",
				title: "No hay productos",
				text: "Debe agregar al menos un producto a la venta",
			});
			return;
		}

		if (!cliente.nombre || !cliente.carnet || !cliente.direccion) {
			Swal.fire({
				icon: "error",
				title: "Datos del cliente incompletos",
				text: "Debe completar todos los datos del cliente",
			});
			return;
		}

		try {
			// Crear opciones para el modal
			const gestoresOptions = gestores.reduce((options, gestor) => {
				options[gestor.nombre] = gestor.nombre;
				return options;
			}, {});

			const result = await Swal.fire({
				title: "Seleccione el Gestor",
				input: "select",
				inputOptions: gestoresOptions,
				inputPlaceholder: "Selecciona Gestor, será Ninguno por defecto",
				showCancelButton: true,
			});

			if (result.isConfirmed) {
				const gestorSeleccionado = result.value !== "Ninguno" ? { nombre: result.value } : "Ninguno";
				// Asegúrate de que cada producto tenga los campos requeridos
				const productosValidados = formState.productos.map((producto) => ({
					...producto,
					existencia: producto.existencia || 0,
					costo: producto.costo || 0,
					venta: producto.venta || 0,
					precioGestor: producto.precioGestor || 0,
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
					gestor: gestorSeleccionado,
					codigoFactura: codigoFactura,
					cliente: cliente,
				});
			}
		} catch (error) {
			console.error("Error al registrar la venta:", error);
		}
	};

	// Modal para seleccionar cantidad
	const openModal = (producto) => {
		Swal.fire({
			title: "Ingrese la cantidad",
			input: "number",
			inputAttributes: {
				min: 1,
				autocapitalize: "off",
			},
			inputValue: "1",
			showCancelButton: true,
			confirmButtonText: "Agregar",
			preConfirm: (cantidad) => {
				if (!cantidad || cantidad < 1) {
					Swal.showValidationMessage("Debe ingresar una cantidad válida");
					return false;
				}
				agregarProducto(producto, parseInt(cantidad));
			},
		});
	};

	return (
		<div className="container animate__animated animate__fadeIn mt-4 my-5">
			<h2 className="text-center mb-4">Registrar Ventas</h2>

			<form onSubmit={(e) => e.preventDefault()} className="mb-4">
				<div className="input-group">
					<input
						type="text"
						className="form-control"
						placeholder="Buscar un producto..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						disabled={spinner}
					/>
					<button className="btn btn-primary" type="button" onClick={() => refetch()}>
						{isFetching ? (
							<div className="spinner-border spinner-border-sm me-2" role="status">
								<span className="visually-hidden">Cargando...</span>
							</div>
						) : (
							"Buscar"
						)}
					</button>
				</div>
			</form>
			{/* Lista de productos encontrados */}
			<div className="list-group">
				{isFetching ? (
					<BuscarProductoSkeleton lines={5} />
				) : searchTerm && productos.length === 0 ? (
					<div className="list-group-item">No se encontraron productos.</div>
				) : (
					productos.map((producto) => (
						<div
							key={producto.uid}
							className="list-group-item d-flex justify-content-between align-items-center"
						>
							<div>
								<span className="fw-bold">{producto.nombre}</span> - ${producto.venta}
								<span className="text-muted"> (Disponible: {producto.existencia} unidades)</span>
							</div>
							<button className="btn btn-success" onClick={() => openModal(producto)}>
								Agregar
							</button>
						</div>
					))
				)}
			</div>
			<hr className="my-4" />
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
