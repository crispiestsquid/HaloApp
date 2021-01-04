import { useAtom } from 'jotai';
import { testAtom } from './Jotai/Atoms';
import { Container, Row, Col, Button, Card, CardBody } from 'reactstrap';

function App() {
	const [test, setTest] = useAtom(testAtom);

	return (
		<Container>
			<Row>
				<Col>
					<h1>{test}</h1>
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
