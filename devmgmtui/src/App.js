import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'
import Login from './components/auth/Login'
import CreateUser from './components/createUser/CreateUser'

const Home = () => <div>Home</div>
const Ssid = () => <div>Ssid</div>

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter >
            <div>
                <Route exact path={"/"} component={Login} />
                <Route exact path={"/CreateUser"} component={CreateUser} />
                <Route exact path={"/home"} component={Home} />
                <Route exact path={"/ssid"} component={Ssid} />
            </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
