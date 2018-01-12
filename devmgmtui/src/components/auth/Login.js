import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/auth'
import './login.css'
import { Container,Grid, Segment, Input, Header, Button, Icon } from 'semantic-ui-react';

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
            user: "",
            password: ""
        }
    }
    login() {
        this.props.login()
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
        this.props.login(this.state.user, this.state.password);
    }
    renderLogin() {
        return (
            <div style={styles.loginForm}>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                    <Grid.Column style={styles.segment}>
                        {/* <h1>Hello</h1> */}
                        <Segment raised >
                            <Header as='h2' color='teal' textAlign='center'>
                                {/* <Image src='/logo.png' /> */}
                                {' '}Log-in to your account
                            </Header>
                            <Input 
                                onChange={this.handleUserChange.bind(this)} 
                                value={this.state.user} 
                                fluid 
                                icon='users' 
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
                                <Button animated color='teal' onClick={this.handleSubmit.bind(this)}>
                                    <Button.Content visible>Login</Button.Content>
                                    <Button.Content hidden>
                                        <Icon name='right arrow' />
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
            // <div>
            //     {this.props.auth && <div>Auth</div>}
            //     <input type="text" onChange={this.handleUserChange.bind(this)} value={this.state.user} />
            //     <input type="text" onChange={this.handlePasswordChange.bind(this)} value={this.state.password} />
            //     <button onClick={this.handleSubmit.bind(this)} >Submit</button>
            // </div>
        )
    }

}

function mapStateToProps({ auth }) {
    return { auth }
}

export default connect(mapStateToProps, actions)(Login);