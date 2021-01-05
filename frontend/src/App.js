import { useAtom } from 'jotai';
import { testAtom } from './Jotai/Atoms';
import { Container, Row, Col, Button, Card, CardBody } from 'reactstrap';
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
	const [test, setTest] = useAtom(testAtom);
	const [imageSrc, setImageSrc] = useState('');

	useEffect(() => {
		getImage('crankiestseeker');
	}, []);

	const getImage = gamertag => {
		axios.get(`http://localhost:8000/player-emblem/with-gamertag/${gamertag}`)
		.then(response => {
			setImageSrc(response.data.emblemUrl);
		})
		.catch(err => console.log(err));
	};

	return (
		<Container>
			<Row>
				<Col>
					<img src={imageSrc} alt="TEST" />
				</Col>
			</Row>
			<Row>
				<Col xs="3">
					<Card>
						<CardBody>
							<h5 className="card-title">This is a card!</h5>
							<p className="card-text">Some text here...</p>
							<Button
								color="primary"
								onClick={() => {
									setTest("I've been clicked!");
								}}
							>
								Click Me
							</Button>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}

export default App;
