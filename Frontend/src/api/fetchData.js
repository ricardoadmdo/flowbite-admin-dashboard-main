import Axios from "./axiosConfig";

// Función genérica para realizar peticiones con paginación
const fetchData = async (endpoint, page, limit) => {
	const response = await Axios.get(`/${endpoint}`, {
		params: { page, limit },
	});
	return response.data;
};

// Función para buscar el último código de factura
export const fetchUltimoCodigoFactura = async () => {
	const response = await Axios.get("/venta/ultimo-codigo-factura");
	return response.data.ultimoCodigoFactura;
};

export const fetchGestores = (page, limit) => fetchData("gestor", page, limit);
export const fetchUsuarios = (page, limit) => fetchData("usuarios", page, limit);
export const fetchProductos = (page, limit) => fetchData("productos", page, limit);

// Función para buscar productos por nombre similar
export const fetchProductosName = async (searchTerm) => {
	const response = await Axios.get(`/productos?search=${searchTerm}`);
	return response.data.productos;
};
