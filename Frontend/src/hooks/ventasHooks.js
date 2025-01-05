import { useState, useEffect } from "react";
import Axios from "../api/axiosConfig";

export const useVentasPaginadas = (startDate, currentPage) => {
	const [ventas, setVentas] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);

	useEffect(() => {
		const fetchVentas = async () => {
			setIsLoading(true);
			setIsError(false);
			try {
				const { data } = await Axios.get("/venta", {
					params: {
						day: startDate.getDate(),
						month: startDate.getMonth() + 1,
						year: startDate.getFullYear(),
						page: currentPage,
					},
				});
				setVentas(data.ventas);
				setTotalPages(data.totalPages);
			} catch (error) {
				console.error("Error al obtener ventas:", error);
				setIsError(true);
			} finally {
				setIsLoading(false);
			}
		};
		fetchVentas();
	}, [startDate, currentPage]);

	const eliminarVenta = (id) => {
		setVentas((prevVentas) => prevVentas.filter((venta) => venta.uid !== id));
	};

	return { ventas, totalPages, isLoading, isError, eliminarVenta };
};

export const useVentasGlobales = (startDate) => {
	const [ventasGlobales, setVentasGlobales] = useState([]);

	useEffect(() => {
		const fetchAllVentas = async () => {
			try {
				const { data } = await Axios.get("/venta/all", {
					params: {
						day: startDate.getDate(),
						month: startDate.getMonth() + 1,
						year: startDate.getFullYear(),
					},
				});
				setVentasGlobales(data.ventas);
			} catch (error) {
				console.error("Error al obtener todas las ventas:", error);
			}
		};
		fetchAllVentas();
	}, [startDate]);

	return ventasGlobales;
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
