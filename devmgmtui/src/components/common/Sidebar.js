import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Sidebar, Menu, Icon } from 'semantic-ui-react'
class SideNav extends Component {
    constructor(props){
        super(props);
        this.state= {
            sideBarVisible:false,
        }
    }

    toggleSideBarVisibility(){
        this.setState({
            sideBarVisible : !this.state.sideBarVisible
        })
    }

    componentWillMount() {
        if (this.props.auth && !this.props.auth.authenticated) {
          this.props.history.push(`/`);
        }
    }

    render() {
        if (typeof this.props.auth.user !== `undefined`) {
        return (
            <Sidebar.Pushable style={{ height: '100%' }}>
                <Sidebar as={Menu} animation='scale down' width='thin' visible={this.state.sideBarVisible} icon='labeled' vertical inverted>
                    {this.props.auth.user.permissions.search(/VIEW_DASHBOARD|ALL/) >= 0 ? <Menu.Item name='home' as={Link} to={'/dashboard'}>
                        <Icon name='home' color='teal' />
                        Home
                    </Menu.Item> : null }
                    {this.props.auth.user.permissions.search(/VIEW_USERS|ALL/) >= 0 ? <Menu.Item as={Link} name='users' to={'/users'}>
                        <Icon name='users' />
                        Users
                    </Menu.Item> : null }
                    {this.props.auth.user.permissions.search(/UPGRADE_DEVICE|ALL/) >= 0 ? <Menu.Item name='upgrade' as={Link} to={'/upgrade'}>
                      <Icon name='up arrow' />
                      Upgrade
                    </Menu.Item> : null}
                    { this.props.auth.user.permissions.search(/VIEW_FILES|ALL/) >= 0 ? <Menu.Item name='filemgmt' as={Link} to={'/filemgmt'}>
                      <Icon name='disk outline' />
                      File Management
                    </Menu.Item> : null }
                    { this.props.auth.user.permissions.search(/MODIFY_SSID|ALL/) >= 0 ? <Menu.Item name='modify_ssid' as={Link} to={'/ssid/set'}>
                      <Icon name='wifi' />
                      Modify SSID
                    </Menu.Item> : null }
                    { this.props.auth.user.permissions.search(/CHANGE_CAPTIVE_PORTAL|ALL/) >= 0 ? <Menu.Item name='captive_mod' as={Link} to={'/captive'}>
                      <Icon name='eye' />
                      Modify Captive Portal
                    </Menu.Item> : null }

                    <Menu.Item name='logout' as={Link} to={'/'}>
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
        );
      } else {
        this.props.history.push("/");
        return null;
      }
    }
}

function mapStateToProps({ auth }) {
  return { auth }
}

export default connect(mapStateToProps, actions)(SideNav);
