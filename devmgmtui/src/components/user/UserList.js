import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import SideNav from '../common/Sidebar'
import * as actions from '../../actions/user'
import { Segment, Container, List, Button, Icon } from 'semantic-ui-react'
const styles = {
    conatiner: {
        marginTop: '4%'
    },
}
class UserList extends Component {


    componentWillMount() {
        if (this.props.auth && !this.props.auth.authenticated) {
            this.props.history.push("/");
        }
        this.props.getAllUser();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.auth && !nextProps.auth.authenticated) {
            this.props.history.push("/");
        }
    }

    handleDelete(key) {
        this.props.deleteUser(key)
    }
    renderUserList() {
        return this.props.user.list.map((item, index) => {
            return (
                <div key={index}>
                    <div >
                        <div>{item.key}</div>
                        <button onClick={() => this.handleDelete(item.key)}>Delete</button>
                    </div>
                </div>
            )
        })
    }

    render() {
        return (
            <SideNav>
                <Container style={styles.conatiner}>
                    <Segment raised >
                        <div>
                            <List animated divided verticalAlign='middle' size={'big'}>
                                <List.Item>
                                    <List.Content floated='right'>
                                        <Button animated color='red'>
                                            <Button.Content visible>Delete</Button.Content>
                                            <Button.Content hidden>
                                                <Icon name='trash' />
                                            </Button.Content>
                                        </Button>
                                    </List.Content>
                                    <List.Content floated='right'>
                                        <Button animated color='blue'>
                                            <Button.Content visible>Edit Permission</Button.Content>
                                            <Button.Content hidden>
                                                <Icon name='edit' />
                                            </Button.Content>
                                        </Button>
                                    </List.Content>
                                    <List.Content>
                                        <List.Header>Helen</List.Header>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Content floated='right'>
                                        <Button animated color='red'>
                                            <Button.Content visible>Delete</Button.Content>
                                            <Button.Content hidden>
                                                <Icon name='trash' />
                                            </Button.Content>
                                        </Button>
                                    </List.Content>
                                    <List.Content floated='right'>
                                        <Button animated color='blue'>
                                            <Button.Content visible>Edit Permission</Button.Content>
                                            <Button.Content hidden>
                                                <Icon name='edit' />
                                            </Button.Content>
                                        </Button>
                                    </List.Content>
                                    <List.Content>
                                        <List.Header>Christian</List.Header>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Content floated='right'>
                                        <Button animated color='red'>
                                            <Button.Content visible>Delete</Button.Content>
                                            <Button.Content hidden>
                                                <Icon name='trash' />
                                            </Button.Content>
                                        </Button>
                                    </List.Content>
                                    <List.Content floated='right'>
                                        <Button animated color='blue'>
                                            <Button.Content visible>Edit Permission</Button.Content>
                                            <Button.Content hidden>
                                                <Icon name='edit' />
                                            </Button.Content>
                                        </Button>
                                    </List.Content>
                                    <List.Content>
                                        <List.Header>Daniel</List.Header>
                                    </List.Content>
                                </List.Item>
                            </List>
                        </div>
                        <Container textAlign='center' style={{ marginTop: '10px' }}>
                            <Button as={Link} to={'/create/user'} animated color='teal'>
                                <Button.Content visible>Add User</Button.Content>
                                <Button.Content hidden>
                                    <Icon name='add' />
                                </Button.Content>
                            </Button>
                        </Container>

                    </Segment>
                </Container>
                {/* UserList
                {this.props.user.list && this.renderUserList()}
                <Link to={"/create/user"}>Add User</Link> */}
            </SideNav>
        )
    }

}

function mapStateToProps({ user, auth }) {
    return { user, auth }
}

export default connect(mapStateToProps, actions)(UserList);