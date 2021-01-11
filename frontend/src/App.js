import { BrowserRouter, Route } from 'react-router-dom';
import Main from './Components/MainComponent';

function App() {
	

	return (
		<BrowserRouter>
			<Route path="/" component={Main} />
		</BrowserRouter>
	);
}

export default App;
