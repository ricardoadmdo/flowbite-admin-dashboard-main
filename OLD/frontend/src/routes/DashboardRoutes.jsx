import Navbar from '../components/Navbar.jsx';
import { Routes, Route } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import AdminRoute from './AdminRoute.jsx';
import MostrarUsuarios from '../components/usuarios/MostrarUsuarios.jsx';

const DashboardRoutes = () => {
	return (
		<>
			<Navbar />

			<Routes>
				<Route
					path='usuarios'
					element={
						<AdminRoute>
							<MostrarUsuarios />
						</AdminRoute>
					}
				/>
			</Routes>
			<Footer />
		</>
	);
};

export default DashboardRoutes;
