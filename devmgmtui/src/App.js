import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'

import { connect } from 'react-redux';
import * as actions from './actions/config';

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
import CloudDownload from './components/cloud/CloudDownload'

import verifyAuth from './components/VerifyAuthentication';

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
                    <Route exact path={"/users/edit/:username/:permissions"} component={verifyAuth(EditUser)} />
                    <Route exact path={"/create/user"} component={verifyAuth(CreateUser)} />
                    <Route exact path={"/users"} component={verifyAuth(UserList)} />
                    <Route exact path={"/ssid/set"} component={verifyAuth(SetSSID)} />
                    <Route exact path={"/update/password"} component={verifyAuth(UpdatePassword)} />
                    <Route exact path={"/upgrade"} component={verifyAuth(Upgrade)} />
                    <Route exact path={"/filemgmt"} component={verifyAuth(FileMgmt)} />
                    <Route exact path={"/dashboard"} component={verifyAuth(Dashboard)} />
                    <Route exact path={"/upgrade"} component={verifyAuth(Upgrade)} />
                    <Route exact path={"/captive"} component={verifyAuth(Captive)} />
                    <Route exact path={"/cloud"} component={verifyAuth(CloudDownload)} />
                </div>
            </BrowserRouter>
      </div>
    );
  }
}

export default connect(null, actions)(App);
