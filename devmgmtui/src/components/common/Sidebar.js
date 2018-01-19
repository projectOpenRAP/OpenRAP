import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Sidebar, Segment, Menu, Icon, Header } from 'semantic-ui-react'
class SideNav extends Component {
    constructor(props){
        super(props);
        this.state= {
            sideBarVisible:false
        }
    }
    toggleSideBarVisibility(){
        this.setState({
            sideBarVisible : !this.state.sideBarVisible
        })
    }
    render() {
        return (
            <Sidebar.Pushable>
                <Sidebar as={Menu} animation='scale down' width='thin' visible={this.state.sideBarVisible} icon='labeled' vertical inverted>
                    <Menu.Item name='home'>
                        <Icon name='home' color='teal' />
                        Home
                    </Menu.Item>
                    <Menu.Item as={Link} name='users' to={'/users'}>
                        <Icon name='users' />
                        Users
                    </Menu.Item>
                    <Menu.Item name='camera'>
                        <Icon name='sign out' />
                        Lgout
                    </Menu.Item>
                    <Menu.Item name='upgrade' as={Link} to={'/upgrade'}>
                      <Icon name='up arrow' />
                      Upgrade
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

export default SideNav;
