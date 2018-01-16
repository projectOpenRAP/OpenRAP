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
        // if (this.props.auth && !this.props.auth.authenticated) {
        //     this.props.history.push("/");
        // }
        this.props.getAllUser();
    }
    componentWillReceiveProps(nextProps) {
        // if (nextProps.auth && !nextProps.auth.authenticated) {
        //     this.props.history.push("/");
        // }
    }

    handleDelete(key) {
        console.log("called with " , key)
        this.props.deleteUser(key, (err,msg) => {
            if(!err){
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
                <List.Item key={index}>
                <List.Content floated='right'>
                    <Button animated color='red' onClick={() => this.handleDelete(item.username)} >
                        <Button.Content visible> Delete</Button.Content>
                        <Button.Content hidden>
                            <Icon name='trash' />
                        </Button.Content>
                    </Button>
                </List.Content>
                <List.Content floated='right'>
                    <Button animated color='blue' as={Link} to={'/users/edit/' + item.username + '/' + item.permission}>
                        <Button.Content visible>Edit Permission</Button.Content>
                        <Button.Content hidden>
                            <Icon name='edit' />
                        </Button.Content>
                    </Button>
                </List.Content>
                <List.Content>
                    <List.Header>{item.username}</List.Header>
                </List.Content>
            </List.Item>
            )
        })
    }

    render() {
        console.log(this.props.user.list);
        return (
            <SideNav>
                <Container style={styles.conatiner}>
                    <Segment raised >
                        <div>
                            <List animated divided verticalAlign='middle' size={'big'}>
                                {this.props.user.list && this.renderUserList()}

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
