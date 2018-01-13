import React, { Component } from 'react'

import { Container, Grid, Segment, Input, Header, Button, Icon, Checkbox, Divider } from 'semantic-ui-react';

const styles = {
    form: {
        height: '100%'
    },
    segment: {
        maxWidth: '800px',
    },
    container: {
        marginTop: '20px'
    }

}

class EditUser extends Component {

    constructor(props) {
        super(props)
        this.state = {
            user: "",
            password: "",
            permissions: {
                perm0: false,
                perm1: false,
                perm2: false,
                perm3: false
            }
        }
    }

    handlePermissionsChange = permLabel => e => {
        var permissions = this.state.permissions
        permissions[permLabel] = !permissions[permLabel]

        this.setState({permissions})

        console.log(permissions)
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
        console.log("User edit requested.");

        /*Handler code goes here*/
    }

    renderUserUpdateForm() {

        var permissionsList = Object.entries(this.state.permissions).map(([permLabel, set]) => {
            return (
                <div key={permLabel}>
                    <Checkbox label={permLabel} checked={set} onChange={this.handlePermissionsChange(permLabel)} />

                    <Divider horizontal/>
                </div>
            )
        })


        return (
            <div style={styles.form}>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                    <Grid.Column style={styles.segment}>
                        <Segment raised >
                            <Header as='h2' color='teal' textAlign='center'>
                                {' '}Edit Users
                            </Header>

                            <Input
                                onChange={this.handleUserChange.bind(this)}
                                value={this.state.user}
                                fluid
                                icon='users'
                                iconPosition='left'
                                placeholder='Enter the username' />

                            <br />

                            <Input
                                onChange={this.handlePasswordChange.bind(this)}
                                value={this.state.password}
                                fluid
                                type='password'
                                icon='lock'
                                iconPosition='left'
                                placeholder='Enter the password' />

                            <br />

                            <Segment color='teal' textAlign='left'>
                                <Header as='h3' color='teal'>
                                    {' '}Permissions
                                </Header>
                                    {permissionsList}
                            </Segment>

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
            <div style={styles.form}>
                {this.renderUserUpdateForm()}
            </div>
        )
    }

}

export default EditUser;
