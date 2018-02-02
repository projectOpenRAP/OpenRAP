import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/auth'
import SideNav from '../common/Sidebar'
import { Container,Grid, Segment, Input, Header, Button, Icon } from 'semantic-ui-react';

const styles = {
    segment: {
        maxWidth: '450px',
        marginTop: '150px'
    },
    container: {
        marginTop: '10px'
    },
}

class CreateUser extends Component {

    constructor(props) {
        super(props)
        this.state = {
            user: "",
            password: ""
        }
    }

    componentWillMount() {
      if (this.props.auth.user.permissions.search(/ADD_USER|ALL/) < 0) {
        this.props.history.push('/');
      }
    }

    handleUserChange(e) {
        this.setState({
            user: e.target.value
        })
    }
    handlePasswordChange(e) {
        this.setState({
            password: e.target.value
        })
    }
    handleSubmit() {
        this.props.createUser(this.state.user, this.state.password, (err,msg)=>{
            if(err){
                alert(msg);
            }else{
                alert("Success");
                this.props.history.push("/users");
            }
        });
    }
    renderCreateUser() {
        return (
            <Grid textAlign='center' style={{ height: '100%' }}>
                <Grid.Column style={styles.segment}>
                    <Segment raised >
                        <Header as='h2' color='teal' textAlign='center'>
                            Create a new User
                        </Header>
                        <Input
                            onChange={this.handleUserChange.bind(this)}
                            value={this.state.user}
                            fluid
                            icon='users'
                            iconPosition='left'
                            placeholder='Enter new username' />
                        <br />
                        <Input
                            onChange={this.handlePasswordChange.bind(this)}
                            value={this.state.password}
                            fluid
                            type='password'
                            icon='lock'
                            iconPosition='left'
                            placeholder='Enter new password' />

                        <Container textAlign='right' style={styles.container}>
                            <Button animated color='teal' onClick={this.handleSubmit.bind(this)}>
                                <Button.Content visible>Create User</Button.Content>
                                <Button.Content hidden>
                                    <Icon name='user' />
                                </Button.Content>
                            </Button>
                        </Container>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
    render() {
      if (typeof this.props.auth.user !== `undefined` && (this.props.auth.user.permissions.search(/VIEW_USERS|ALL/) >= 0)) {
        return (
            <SideNav>
                {this.renderCreateUser()}
            </SideNav>
        )} else {
          this.props.history.push("/");
          return null;
        }
  }

}

function mapStateToProps({ auth }) {
    return { auth }
}

export default connect(mapStateToProps, actions)(CreateUser);
