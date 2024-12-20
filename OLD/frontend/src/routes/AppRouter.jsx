import { Routes, Route, BrowserRouter } from 'react-router-dom';
import DashboardRoutes from './DashboardRoutes.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import LogIn from '../components/LogIn.jsx';
import Navbar from '../components/Navbar.jsx';
import ReporteVentas from '../components/ReporteVentas.jsx';

// const AppRouter = () => {
// 	return (
// 		<BrowserRouter>
// 			<Routes>
// 				<Route
// 					path='/'
// 					element={
// 						<PublicRoute>
// 							<LogIn />
// 						</PublicRoute>
// 					}
// 				/>

// 				<Route
// 					path='/*'
// 					element={
// 						<PrivateRoute>
// 							<DashboardRoutes />
// 						</PrivateRoute>
// 					}
// 				/>
// 			</Routes>
// 		</BrowserRouter>
// 	);
// };

const AppRouter = () => {
	return (
		<BrowserRouter>
			<Navbar />
			<Routes>
				<Route path='/' element={<ReporteVentas />} />
			</Routes>
		</BrowserRouter>
	);
};
export default AppRouter;
