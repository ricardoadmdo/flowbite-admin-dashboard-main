import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
	return (
		<footer style={{ backgroundColor: '#343a40' }} className='text-white py-4'>
			<Container>
				<Row>
					<Col md={4}>
						<h5>Servicios Bravo</h5>
						<p>Falgueras entre auditor y Santa Catalina, Empresa de fósforos ENFOS Cerro, La Habana</p>
					</Col>
					<Col md={4}>
						<h5>Contacto</h5>
						<ul className='list-unstyled'>
							<li>Email: info@serviciosbravo.com</li>
							<li>Teléfono: +53 123 456 789</li>
						</ul>
					</Col>
					<Col md={4}>
						<h5>Síguenos</h5>
						<ul className='list-unstyled'>
							<li>
								<a href='https://www.facebook.com' className='text-white'>
									Facebook
								</a>
							</li>
							<li>
								<a href='https://www.twitter.com' className='text-white'>
									Twitter
								</a>
							</li>
							<li>
								<a href='https://www.instagram.com' className='text-white'>
									Instagram
								</a>
							</li>
						</ul>
					</Col>
				</Row>
				<Row className='mt-3'>
					<Col className='text-center'>
						<p className='mb-0'>&copy; 2024 Servicios Bravo. Todos los derechos reservados.</p>
					</Col>
				</Row>
			</Container>
		</footer>
	);
};

export default Footer;
