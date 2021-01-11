import { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Jumbotron, Card, CardBody, Label, Input, CardHeader, CardImg, CardTitle, CardSubtitle, ListGroup, ListGroupItem } from 'reactstrap';

function App() {
	const [imageSrc, setImageSrc] = useState(null);
	const [spartanCompanyInfo, setSpartanCompanyInfo] = useState({
		isLoading: false,
		info: null
	});
	const [playerContributions, setPlayerContributions] = useState({
		isLoading: false,
		contributions: null
	});
	const [gamertag, setGamertag] = useState('');

	const getCompanyInfoWithGamertag = gamertag => {
		setPlayerContributions({
			isLoading: false,
			contributions: null
		});
		setSpartanCompanyInfo({
			isLoading: true,
			info: null
		});
		axios.get(`http://localhost:8000/spartan-company/with-gamertag/${gamertag}`)
		.then(response => {
			let companyInfo = response.data.company;
			let creatorGamertag = companyInfo.Creator.Gamertag;
			let companyMembers = companyInfo.Members;
			let creatorEmblemUrl = companyMembers.filter(member => member.Player.Gamertag === creatorGamertag)[0].Player.EmblemUrl;
			setSpartanCompanyInfo({
				isLoading: false,
				info: companyInfo
			});
			setImageSrc(creatorEmblemUrl);
			console.log(response.data.company);
			console.log(creatorEmblemUrl);
		})
		.catch(err => console.error(err));
	};

	const getCompanyPlayerContributions = members => {
		if (members) {
			setPlayerContributions({
				isLoading: true,
				contributions: null
			});
			axios.post(`http://localhost:8000/spartan-company/player-contributions`,
			{
				members: members
			})
			.then(response => {
				let array = [];
				for (const player in response.data.contributions) {
					let gamertag = player;
					let newObject = {
						...response.data.contributions[player],
						Gamertag: gamertag
					};
					array.push(newObject);
				}
				setPlayerContributions({
					isLoading: false,
					contributions: array
				});
				console.log(response.data.contributions);
			})
			.catch(err => console.error(err));
		}
	};

	const popPlayerContributions = () => {
		if (playerContributions.contributions) {
			return <h5>Number of players who contributed: {playerContributions.contributions.filter(contribution => contribution.Games.length > 0).length}</h5>
		} 
		
		if (playerContributions.isLoading) {
			return <p>Loading...</p>
		}

		return <div />;
	};

	const popCreatorsCard = () => {
		if (imageSrc && spartanCompanyInfo.info) {
			return (
				<Card>
					<img className="img-fluid card-img-top" src={imageSrc} alt={spartanCompanyInfo.info.Creator.Gamertag} />
					<CardBody>
						<CardTitle className="text-center" tag="h2">{spartanCompanyInfo.info.Name}</CardTitle>
						<CardSubtitle tag="h5" className="mb-4">
							<span className="text-white bg-secondary rounded p-1">Founder</span> {spartanCompanyInfo.info.Creator.Gamertag}
						</CardSubtitle>
						<CardSubtitle tag="h5" className="mb-4">
						<span className="text-white bg-secondary rounded p-1">Established</span> {new Date(spartanCompanyInfo.info.CreatedDate.ISO8601Date).toLocaleDateString()}
						</CardSubtitle>
						<CardSubtitle tag="h5" className="mb-0">
						<span className="text-white bg-secondary rounded p-1">Player Count</span> {spartanCompanyInfo.info.Members.length}
						</CardSubtitle>
					</CardBody>
				</Card>
			);
		}

		if (spartanCompanyInfo.isLoading) {
			return <p>Loading...</p>;
		}

		return <div />;
	};

	const popMembersList = () => {
		if (spartanCompanyInfo.info) {
			return (
				<Card>
					<CardHeader tag="h1">Members</CardHeader>
					<CardBody className="p-0">
						<ul style={{maxHeight: "380px"}} className="list-group list-group-flush overflow-auto">
							{spartanCompanyInfo.info.Members.map(member => (
								<ListGroupItem className="container-fluid py-2" key={member.Player.gamertag}>
									<Row>
										<Col xs={3}>
											<img className="mx-auto my-auto" width="95px" height="auto" src={member.Player.EmblemUrl} alt={member.Player.Gamertag} />
										</Col>
										<Col className="d-flex">
											<h5 className="mx-auto my-auto">{member.Player.Gamertag}</h5>
										</Col>
									</Row>
								</ListGroupItem>
							))}
						</ul>
					</CardBody>
				</Card>
			);
		}
	};

	return (
		<Container>
			<Jumbotron><h1>Halo 5 Spartan Company Stats</h1></Jumbotron>
			<Row className="mb-5">
				<Col xs={{size: 4, offset: 1}}>
					{popCreatorsCard()}
				</Col>
				<Col xs={{size: 5, offset: 1}}>
					<Card>
						<CardBody>
							<Row>
								<Col>
									<Label htmlFor="gamertag">Gamertag</Label>
									<Input id="gamertag" type="text" value={gamertag} onChange={e => setGamertag(e.target.value)} />
								</Col>
							</Row>
							<Row className="mt-3">
								<Col>
									<Button className="mr-3" onClick={() => {
										getCompanyInfoWithGamertag(gamertag);
									}}>
										Get Info
									</Button>
									<Button disabled={spartanCompanyInfo.info ? false : true} onClick={() => {
										getCompanyPlayerContributions(spartanCompanyInfo.info.Members);
									}}>
										Get Contributions
									</Button>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>
			<Row>
				<Col xs={{size: 6, offset: 3}}>
					{popMembersList()}
				</Col>
			</Row>
			<Row className="mb-5">
				<Col>
					{popPlayerContributions()}
				</Col>
			</Row>
		</Container>
	);
}

export default App;
