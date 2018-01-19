import React, { Component } from 'react'
import { Container, Grid, Segment, Input, Header, Button, Icon, Checkbox, Divider } from 'semantic-ui-react';
import * as actions from '../../actions/auth'
import { connect } from 'react-redux'

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
        console.log(props.match.params)
        this.state = {
            user: props.match.params.username,
            permissionList : JSON.parse(props.match.params.permissions),
            permissions: {
                perm0: false,
                perm1: false,
                perm2: false,
                perm3: false,
                perm4: false
            },
            permissionsAsStrings: {
                perm0 : "VIEW_DASHBOARD",
                perm1 : "VIEW_USERS",
                perm2 : "DELETE_USERS",
                perm3 : "EDIT_USERS",
                perm4 : "ADD_USERS"
            }
        }
        for (var key in this.state.permissionsAsStrings) {
            if (this.state.permissionList.indexOf(this.state.permissionsAsStrings[key]) !== -1) {
              this.state.permissions[key] = true;
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

    handleSubmit() {
        console.log("User edit requested.");
        let checkedPermissions = [];
        for (var key in this.state.permissions) {
          if (this.state.permissions[key]) {
            checkedPermissions.push(this.state.permissionsAsStrings[key]);
          }
        }
        checkedPermissions = JSON.stringify(checkedPermissions);
        this.props.editUserPermissions(this.state.user, checkedPermissions, (err, res) => {
          if (err) {
            alert(res);
          } else {
            alert("Update of permissions successful!");
          }
          this.props.history.push("/users");
        });
    }

    renderUserUpdateForm() {

        var permissionsList = Object.entries(this.state.permissions).map(([permLabel, set]) => {
            return (
                <div key={permLabel}>
                    <Checkbox label={this.state.permissionsAsStrings[permLabel]} checked={set} onChange={this.handlePermissionsChange(permLabel)} />

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
function mapStateToProps({ auth }) {
    return { auth }
}

export default connect(mapStateToProps, actions)(EditUser);
