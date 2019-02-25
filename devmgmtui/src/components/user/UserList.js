import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import SideNav from '../common/Sidebar'
import * as actions from '../../actions/user'
import { Segment, Container, List, Button, Icon, Header, Modal } from 'semantic-ui-react'
const styles = {
    container: {
        marginTop: '4%'
    },
}
class UserList extends Component {

    constructor() {
        super();
        this.state = {
            deleteModal: false
        };
        this.username = '';
    }

    componentWillMount() {
        this.props.getAllUser();
        document.title = "User List";
    }

    handleDelete() {
        this.props.deleteUser(this.username, this.props.auth.user.username, (err,msg) => {
            if(!err){
                alert("Deletion Success");
                this.props.getAllUser();
                this.setState({
                    deleteModal: false
                });
            }else{
                alert(msg);
            }
        })
    }

    setUserName(username) {
        this.username = username;
    }

    openDeleteModal() {
        this.setState({
            deleteModal: true
        });
    }

    closeDeleteModal() {
        this.setState({
            deleteModal: false
        });
    }

    renderDeleteModal() {
        return (
            <Modal
                open={this.state.deleteModal}
                onClose={() => this.closeDeleteModal()}
                style={{ height: 'auto' }}
                closeIcon
            >
                <Header content='Delete User' />
                <Modal.Content>
                    <p>
                        Are you sure?
                    </p>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        color='red'
                        onClick={() => this.closeDeleteModal()}
                    >
                        <Icon name='remove' /> No
                    </Button>
                    <Button 
                        color='green'
                        onClick={() => this.handleDelete()}
                    >
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }

    renderUserList() {
        return this.props.user.list.userList.map((item, index) => {
            return (
                // <div key={index}>
                //     <div >
                //         <div>{item.key}</div>
                //         <button onClick={() => this.handleDelete(item.key)}>Delete</button>
                //     </div>
                // </div>
                ( item.username !== 'root' ? <List.Item key={index}>
                { this.props.auth.user.permissions.search(/DELETE_USERS|ALL/) >= 0 ? <List.Content floated='right'>
                    <Button animated color='red' onClick={() => {this.openDeleteModal(); this.setUserName(item.username)}} >
                        <Button.Content visible> Delete</Button.Content>
                        <Button.Content hidden>
                            <Icon name='trash' />
                        </Button.Content>
                    </Button>
                </List.Content> :  null}
                { this.props.auth.user.permissions.search(/EDIT_USER|ALL/) >= 0 ? <List.Content floated='right'>
                    <Button animated color='blue' as={Link} to={'/users/edit/' + item.username + '/' + item.permission}>
                        <Button.Content visible>Edit Permission</Button.Content>
                        <Button.Content hidden>
                            <Icon name='edit' />
                        </Button.Content>
                    </Button>
                </List.Content> : null}
                <List.Content>
                    <List.Header>{item.username}</List.Header>
                </List.Content>
            </List.Item> : null)
            )
        })
    }

    render() {
      if (typeof this.props.auth.user !== `undefined` && (this.props.auth.user.permissions.search(/VIEW_USERS|ALL/) >= 0)) {
        return (
            <SideNav>
                <Container style={styles.container}>
                    <Header as='h1'>User Management</Header>
                    <Segment raised >
                        {this.renderDeleteModal()}
                        <div>
                            <List animated divided verticalAlign='middle' size={'big'}>
                                {this.props.user.list && this.renderUserList()}
                            </List>
                        </div>
                        { this.props.auth.user.permissions.search(/ADD_USERS|ALL/) >= 0 ? <Container textAlign='center' style={{ marginTop: '10px' }}>
                            <Button as={Link} to={'/create/user'} animated color='teal'>
                                <Button.Content visible>Add User</Button.Content>
                                <Button.Content hidden>
                                    <Icon name='add user' />
                                </Button.Content>
                            </Button>
                        </Container> : null }

                    </Segment>
                </Container>
                {/* UserList
                {this.props.user.list && this.renderUserList()}
                <Link to={"/create/user"}>Add User</Link> */}
            </SideNav>
        )
    } else {
      return (null);
    }
  }
}

function mapStateToProps({ user, auth }) {
    return { user, auth }
}

export default connect(mapStateToProps, actions)(UserList);
