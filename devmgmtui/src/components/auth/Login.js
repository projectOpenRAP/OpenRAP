import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/auth'
import './login.css'
import { Container, Grid, Segment, Input, Header, Button, Icon } from 'semantic-ui-react';

const styles = {
    loginForm: {
        height: '100%'
    },
    segment: {
        maxWidth: '450px'
    },
    container: {
        marginTop: '10px'
    },

}

class Login extends Component {

    constructor(props) {
        super(props)
        this.state = {
            username: "",
            password: "",
            isLoading: false
        }
    }

    handleUserChange(e) {
        this.setState({
            user: e.target.value
        });
    }

    handlePasswordChange(e) {
        this.setState({
            password: e.target.value
        });
    }

    toggleLoading() {
        this.setState({
            isLoading: !this.state.isLoading
        });
    }

    handleSubmit() {
        this.toggleLoading();

        this.props.login(this.state.user, this.state.password,(err,data)=>{
            if(err) {
                this.toggleLoading();
                alert(data.msg);
            } else {
                this.props.history.push("/dashboard");
            }
        });
    }

    handleKeyPress = (e) =>
    {
        console.log('Key pressed.');

        if(e.key === 'Enter')
        {
            this.handleSubmit();
        }
    }

    componentWillMount() {
      document.title = "Login";
    }

    renderLogin() {
        return (
            <div style={styles.loginForm}>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                    <Grid.Column style={styles.segment}>
                        <Segment raised onKeyPress={this.handleKeyPress}>
                            <Header as='h2' color='teal' textAlign='center'>
                                Log-in to your account
                            </Header>
                            <Input
                                onChange={this.handleUserChange.bind(this)}
                                value={this.state.user}
                                fluid
                                icon='user'
                                iconPosition='left'
                                placeholder='Enter your username' />
                            <br />
                            <Input
                                onChange={this.handlePasswordChange.bind(this)}
                                value={this.state.password}
                                fluid
                                type='password'
                                icon='lock'
                                iconPosition='left'
                                placeholder='Enter your password' />

                            <Container textAlign='right' style={styles.container}>
                                <Button animated loading={this.state.isLoading} color='teal' onClick={this.handleSubmit.bind(this)}>
                                    <Button.Content visible>Login</Button.Content>
                                    <Button.Content hidden>
                                        <Icon name='right arrow'/>
                                    </Button.Content>
                                </Button>
                            </Container>
                        </Segment>
                    </Grid.Column>
                </Grid>
            </div>
        )
    }
    render() {
        return (
            <div style={styles.loginForm}>
                {this.renderLogin()}
            </div>
        )
    }

}

function mapStateToProps({ auth }) {
    return { auth }
}

export default connect(mapStateToProps, actions)(Login);
