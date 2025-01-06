import Axios from "./axiosConfig";

const fetchData = async (endpoint, page, limit) => {
	const response = await Axios.get(`/${endpoint}`, {
		params: { page, limit },
	});
	return response.data;
};

export const fetchGestores = (page, limit) => fetchData("gestor", page, limit);
export const fetchUsuarios = (page, limit) => fetchData("usuarios", page, limit);
export const fetchProductos = (page, limit) => fetchData("productos", page, limit);
