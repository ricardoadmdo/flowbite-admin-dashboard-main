import Axios from "./axiosConfig";

export const fetchUsuarios = async (page, limit) => {
	const response = await Axios.get(`/usuarios`, {
		params: { page, limit },
	});
	return response.data; // Esto debería devolver un objeto con usuarios y totalPages.
};
