import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'

import Login from './components/auth/Login'
import CreateUser from './components/user/CreateUser'
import EditUser from './components/user/EditUser'
import UpdatePassword from './components/user/UpdatePassword'
import UserList from './components/user/UserList'
import SetSSID from './components/ssid/SetSSID'
import Dashboard from './components/dashboard/Dashboard'

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter >
            <div>
                <Route exact path={"/"} component={Login} />
                <Route exact path={"/users/edit/:username/:permissions"} component={EditUser} />
                <Route exact path={"/create/user"} component={CreateUser} />
                <Route exact path={"/users"} component={UserList} />
                <Route exact path={"/set/ssid"} component={SetSSID} />
                <Route exact path={"/update/password"} component={UpdatePassword} />
                <Route exact path={"/dashboard"} component={Dashboard} />
            </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
