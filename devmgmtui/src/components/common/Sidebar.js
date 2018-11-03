import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../../actions/auth'
import { Sidebar, Menu, Icon } from 'semantic-ui-react'
class SideNav extends Component {
    constructor(props){
        super(props);

        this.state= {
            sideBarVisible:false,
            currentLocation : props.location.pathname
        }
    }

    toggleSideBarVisibility(){
        this.setState({
            sideBarVisible : !this.state.sideBarVisible
        })
    }

    handleLogout() {
        this.props.logout();
    }

    render() {
        if (typeof this.props.auth.user !== `undefined`) {
        return (
            <div style={{ height: '100vh' }}>
                <Sidebar.Pushable>
                    <Sidebar as={Menu} animation='scale down' width='thin' visible={this.state.sideBarVisible} icon='labeled' vertical inverted>
                        {this.props.auth.user.permissions.search(/VIEW_DASHBOARD|ALL/) >= 0 ? <Menu.Item name='home' active={this.state.currentLocation === '/dashboard'} as={Link} to={'/dashboard'}>
                            <Icon name='home' />
                            Home
                        </Menu.Item> : null }
                        {this.props.auth.user.permissions.search(/VIEW_USERS|ALL/) >= 0 ? <Menu.Item name='users' active={this.state.currentLocation === '/users'} as={Link} to={'/users'}>
                            <Icon name='users' />
                            Users
                        </Menu.Item> : null }
                        {this.props.auth.user.permissions.search(/UPGRADE_DEVICE|ALL/) >= 0 ? <Menu.Item name='upgrade' active={this.state.currentLocation === '/upgrade'} as={Link} to={'/upgrade'}>
                          <Icon name='up arrow' />
                          Upgrade
                        </Menu.Item> : null}
                        { this.props.auth.user.permissions.search(/VIEW_FILES|ALL/) >= 0 ? <Menu.Item name='filemgmt' active={this.state.currentLocation === '/filemgmt'} as={Link} to={'/filemgmt'}>
                          <Icon name='disk outline' />
                          File Management
                        </Menu.Item> : null }
                        { this.props.auth.user.permissions.search(/MODIFY_SSID|ALL/) >= 0 ? <Menu.Item name='modify_ssid' active={this.state.currentLocation === '/ssid/set'} as={Link} to={'/ssid/set'}>
                          <Icon name='wifi' />
                          Modify SSID
                        </Menu.Item> : null }
                        { this.props.auth.user.permissions.search(/CHANGE_CAPTIVE_PORTAL|ALL/) >= 0 ? <Menu.Item name='captive_mod' active={this.state.currentLocation === '/captive'} as={Link} to={'/captive'}>
                          <Icon name='eye' />
                          Modify Captive Portal
                        </Menu.Item> : null }
                        
                        { this.props.auth.user.permissions.search(/ALL/) >= 0 ? <Menu.Item name='cloud_download' active={this.state.currentLocation === '/cloud'} as={Link} to={'/cloud'}>
                          <Icon name='cloud download' />
                          Cloud Download
                        </Menu.Item> : null }

                        <Menu.Item name='logout' as={Link} to={'/'} onClick={this.handleLogout.bind(this)}>
                            <Icon name='log out' />
                            Logout
                        </Menu.Item>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <Menu fixed='top' inverted>
                            <Menu.Item name='bars' onClick={this.toggleSideBarVisibility.bind(this)}>
                                <Icon name='bars' />
                            </Menu.Item>
                        </Menu>
                        {this.props.children}
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
      } else {
        return null;
      }
    }
}

function mapStateToProps({ auth }) {
  return { auth }
}

export default withRouter(connect(mapStateToProps, actions)(SideNav));
