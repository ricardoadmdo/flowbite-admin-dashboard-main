import Axios from "./axiosConfig";

export const fetchGestores = async (page, limit) => {
	const response = await Axios.get(`/gestor`, {
		params: { page, limit },
	});
	return response.data; // Esto debería devolver un objeto con usuarios y totalPages.
};
