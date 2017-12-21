import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'

const Home = () => <div>Home</div>
const Login = () => <div>Login</div>
const Ssid = () => <div>Ssid</div>

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter >
            <div>
                <Route exact path={"/"} component={Login} />
                <Route exact path={"/home"} component={Home} />
                <Route exact path={"/ssid"} component={Ssid} />
            </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
