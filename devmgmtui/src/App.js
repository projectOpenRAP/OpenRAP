import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'

import { connect } from 'react-redux';
import * as actions from './actions/config';

import axios from 'axios'
import { BASE_URL } from './config/config';

import Login from './components/auth/Login'
import CreateUser from './components/user/CreateUser'
import EditUser from './components/user/EditUser'
import UpdatePassword from './components/user/UpdatePassword'
import UserList from './components/user/UserList'
import SetSSID from './components/ssid/SetSSID'
import Dashboard from './components/dashboard/Dashboard'
import Upgrade from './components/upgrade/Upgrade'
import FileMgmt from './components/filemgmt/FileMgmt'
import Captive from './components/captive/Captive'

class App extends Component {

  componentDidMount() {
    this.props.fetchConfig((error) => {
        if(error) {
            alert('Error occurred during configuration.');
            this.props.history.push('/');
        } else {
            console.log('Configuation successful.');
        }
    });
  }

  render() {
    return (
      <div className="App">
            <BrowserRouter >
                <div>
                    <Route exact path={"/"} component={Login} />
                    <Route exact path={"/users/edit/:username/:permissions"} component={EditUser} />
                    <Route exact path={"/create/user"} component={CreateUser} />
                    <Route exact path={"/users"} component={UserList} />
                    <Route exact path={"/ssid/set"} component={SetSSID} />
                    <Route exact path={"/update/password"} component={UpdatePassword} />
                    <Route exact path={"/upgrade"} component={Upgrade} />
                    <Route exact path={"/filemgmt"} component={FileMgmt} />
                    <Route exact path={"/dashboard"} component={Dashboard} />
                    <Route exact path={"/upgrade"} component={Upgrade} />
                    <Route exact path={"/captive"} component={Captive} />
                </div>
            </BrowserRouter>
      </div>
    );
  }
}

export default connect(null, actions)(App);
