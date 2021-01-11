import { Redirect, Route, Switch } from "react-router-dom";
import Example from './ExampleComponent';

function Main() {

    return (
        <Switch>
            <Route path="/home" component={Example} />
            <Redirect to="/home" />
        </Switch>
    );
}

export default Main;