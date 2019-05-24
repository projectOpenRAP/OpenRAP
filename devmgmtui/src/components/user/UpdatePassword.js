import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/auth';

import { Container, Grid, Segment, Input, Header, Button, Icon } from 'semantic-ui-react';

const styles = {
    passwordUpdateForm: {
        height: '100%'
    },
    segment: {
        maxWidth: '450px'
    },
    container: {
        marginTop: '10px'
    }
}

class UpdatePassword extends Component {

    constructor(props) {
        super(props);

        this.state = {
            password: "",
            user: props.match.params.username
        }
    }

    componentWillMount() {
      document.title = "Update Password";  
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
        if((this.state.password.length>=1) && ((this.state.password) !== ('\ '))) {
            this.props.changePassword(this.state.user, this.state.password, (err, res) => {
                if (!err) {
                  alert("Password updated successfully.");
                } else {
                  console.log(err);
                }
                this.props.history.push("/users");
            });
        } else {
            alert(" Please Enter a New Password");
        }
    }

    renderPasswordUpdateForm() {
        return (
            <div style={styles.passwordUpdateForm}>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                    <Grid.Column style={styles.segment}>
                        <Segment raised >
                            <Header as='h2' color='teal' textAlign='center'>
                                {' '}Set a new password
                            </Header>

                            <p
                                onChange={this.handleUserChange.bind(this)}
                                value={this.state.user} />

                                <br />

                            <Input
                                onChange={this.handlePasswordChange.bind(this)}
                                value={this.state.password}
                                fluid
                                type='password'
                                icon='lock'
                                iconPosition='left'
                                placeholder='Enter new password' />

                            <br />

                            <Container textAlign='right' style={styles.container}>
                                <Button animated color='teal' onClick={this.handleSubmit.bind(this)}>
                                    <Button.Content visible>Update</Button.Content>
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
            <div style={styles.passwordUpdateForm}>
                {this.renderPasswordUpdateForm()}
            </div>
        )
    }

}
export default connect(null, actions)(UpdatePassword);
