import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Axios from "../api/axiosConfig";

export const useVentasPaginadas = (startDate, currentPage) => {
	const queryClient = useQueryClient();

	// Obtener ventas paginadas
	const { data, isLoading, isError } = useQuery({
		queryKey: ["ventasPaginadas", startDate, currentPage],
		queryFn: async () => {
			const { data } = await Axios.get("/venta", {
				params: {
					day: startDate.getDate(),
					month: startDate.getMonth() + 1,
					year: startDate.getFullYear(),
					page: currentPage,
				},
			});
			return data;
		},
		keepPreviousData: true, // Mantener los datos previos al cambiar de página
	});

	// Eliminar venta
	const eliminarVenta = useMutation({
		mutationFn: (id) => Axios.delete(`/venta/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries(["ventasPaginadas", startDate, currentPage]); // Refrescar ventas
		},
	});

	return {
		ventas: data?.ventas || [],
		totalPages: data?.totalPages || 1,
		isLoading,
		isError,
		eliminarVenta,
	};
};

export const useVentasGlobales = (startDate) => {
	const { data } = useQuery({
		queryKey: ["ventasGlobales", startDate],
		queryFn: async () => {
			const { data } = await Axios.get("/venta/all", {
				params: {
					day: startDate.getDate(),
					month: startDate.getMonth() + 1,
					year: startDate.getFullYear(),
				},
			});
			return data.ventas;
		},
	});

	return data || [];
};

export const calcularEstadisticas = (ventas) => {
	let totalGanancia = 0;
	let totalRecaudado = 0;
	const productoContador = {};
	let gananciaGestores = 0;

	ventas.forEach((venta) => {
		let gananciaVenta = 0;
		venta.productos.forEach((producto) => {
			gananciaVenta += (producto.venta - producto.costo) * producto.cantidad;
			productoContador[producto.nombre] = (productoContador[producto.nombre] || 0) + producto.cantidad;
			if (venta.gestor !== "Ninguno") {
				gananciaGestores += (producto.precioGestor || 0) * producto.cantidad;
			}
		});
		totalRecaudado += venta.precioTotal;
		totalGanancia += gananciaVenta;
	});

	const maxCantidad = Math.max(...Object.values(productoContador));
	const productosMasVendidos = Object.keys(productoContador).filter(
		(producto) => productoContador[producto] === maxCantidad
	);

	return {
		totalGanancia,
		totalRecaudado,
		gananciaNeta: totalGanancia - gananciaGestores,
		productoMasVendido:
			productosMasVendidos.length === 1
				? `${productosMasVendidos[0]} con ${maxCantidad} unidades.`
				: productosMasVendidos.length > 1
				? `Empatados: ${productosMasVendidos.join(" y ")} con ${maxCantidad} unidades cada uno.`
				: "No hay ventas.",
	};
};
