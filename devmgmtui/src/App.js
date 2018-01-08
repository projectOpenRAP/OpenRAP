import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'
import Login from './components/auth/Login'
import CreateUser from './components/user/CreateUser'
import UserList from './components/user/UserList'

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter >
            <div>
                <Route exact path={"/"} component={Login} />
                <Route exact path={"/create/user"} component={CreateUser} />
                <Route exact path={"/users"} component={UserList} />
            </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
