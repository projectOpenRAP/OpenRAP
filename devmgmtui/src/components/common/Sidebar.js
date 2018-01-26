import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Sidebar, Segment, Menu, Icon, Header } from 'semantic-ui-react'
class SideNav extends Component {
    constructor(props){
        super(props);
        this.state= {
            sideBarVisible:false,
            permissions : this.props.auth.user.permissions
        }
    }

    toggleSideBarVisibility(){
        this.setState({
            sideBarVisible : !this.state.sideBarVisible
        })
    }

    render() {
        return (
            <Sidebar.Pushable style={{ height: '100%' }}>
                <Sidebar as={Menu} animation='scale down' width='thin' visible={this.state.sideBarVisible} icon='labeled' vertical inverted>
                    {this.state.permissions.search(/VIEW_DASHBOARD|ALL/) >= 0 ? <Menu.Item name='home' as={Link} to={'/dashboard'}>
                        <Icon name='home' color='teal' />
                        Home
                    </Menu.Item> : null }
                    {this.state.permissions.search(/VIEW_USERS|ALL/) >= 0 ? <Menu.Item as={Link} name='users' to={'/users'}>
                        <Icon name='users' />
                        Users
                    </Menu.Item> : null }
                    {this.state.permissions.search(/UPGRADE_DEVICE|ALL/) >= 0 ? <Menu.Item name='upgrade' as={Link} to={'/upgrade'}>
                      <Icon name='up arrow' />
                      Upgrade
                    </Menu.Item> : null}
                    { this.state.permissions.search(/VIEW_FILES|ALL/) >= 0 ? <Menu.Item name='fielmgmt' as={Link} to={'/filemgmt'}>
                      <Icon name='disk outline' />
                      File Management
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
    }
}

function mapStateToProps({ auth }) {
  return { auth }
}

export default connect(mapStateToProps, actions)(SideNav);
