import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import SideNav from '../common/Sidebar'
import * as actions from '../../actions/user'
import { Segment, Container, List, Button, Icon, Header } from 'semantic-ui-react'
const styles = {
    container: {
        marginTop: '4%'
    },
}
class UserList extends Component {

    componentWillMount() {
        this.props.getAllUser();
        document.title = "User List";
    }

    handleDelete(key) {
        this.props.deleteUser(key, this.props.auth.user.username, (err,msg) => {
            if(!err){
                alert("Deletion Success");
                this.props.getAllUser();
            }else{
                alert(msg);
            }
        })
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
                    <Button animated color='red' onClick={() => this.handleDelete(item.username)} >
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
