import React, { Component } from 'react'
import { Container, Grid, Segment, Input, Header, Button, Icon, Checkbox, Divider } from 'semantic-ui-react';
import SideNav from '../common/Sidebar'
import * as actions from '../../actions/auth'
import { connect } from 'react-redux'

const styles = {
    segment: {
        maxWidth: '800px',
        marginTop: '150px'
    },
    container: {
        marginTop: '10px'
    },
}

class EditUser extends Component {

    constructor(props) {
        super(props)
        this.state = {
            user: props.match.params.username,
            permissionList : JSON.parse(props.match.params.permissions),
            permissions: {
                perm0 : false,
                perm1 : false,
                perm2 : false,
                perm3 : false,
                perm4 : false,
                perm5 : false,
                perm6 : false,
                perm7 : false,
                perm8 : false,
                perm9 : false,
            },
            permissionsAsStrings: {
                perm0 : "VIEW_DASHBOARD",
                perm1 : "VIEW_USERS",
                perm2 : "DELETE_USERS",
                perm3 : "EDIT_USERS",
                perm4 : "ADD_USERS",
                perm5 : "VIEW_FILES",
                perm6 : "UPLOAD_FILES",
                perm7 : "DELETE_FILES",
                perm8 : "MODIFY_SSID",
                perm9 : "UPGRADE_DEVICE"
            },
            disabledFlag : {
                perm0 : false,
                perm1 : false,
                perm2 : false,
                perm3 : false,
                perm4 : false,
                perm5 : false,
                perm6 : false,
                perm7 : false,
                perm8 : false,
                perm9 : false,
            },
            isAllEnabled : true
        }
        for (var key in this.state.permissionsAsStrings) {
            if (this.state.permissionList.indexOf(this.state.permissionsAsStrings[key]) !== -1) {
              this.state.permissions[key] = true;
            } else {
              this.state.isAllEnabled = false;
            }
        }
    }

    componentWillMount() {
        if (this.state.permissionList.indexOf('ALL') >= 0) {
          let permissions = this.state.permissions;
          for (let i in permissions) {
            permissions[i] = true;
          }
          this.setState({permissions});
        }
        let disabledFlag = { ...this.state.disabledFlag };
        if (this.state.permissions['perm2'] || this.state.permissions['perm3'] || this.state.permissions['perm4']) {
            disabledFlag.perm1 = true;
        }
        if (this.state.permissions['perm6'] || this.state.permissions['perm7']) {
            disabledFlag.perm5 = true;
        }
        this.setState({
            disabledFlag
        });
        document.title = "Edit User";
    }

    setAllEnabled = () => {
        let { permissions, isAllEnabled } = this.state;

        isAllEnabled = true;

        Object.values(permissions).forEach(permission => {
            if(!permission) {
                isAllEnabled = false;
            }
        });

        this.setState({ isAllEnabled });
    }

    handlePermissionsChange = permLabel => e => {
        let { permissions, permissionsAsStrings, disabledFlag } = this.state;

        permissions[permLabel] = !permissions[permLabel]

        if(permissions[permLabel] && ["DELETE_USERS", "EDIT_USERS", "ADD_USERS"].indexOf(permissionsAsStrings[permLabel]) !== -1) {
            permissions['perm1'] = true;
            disabledFlag['perm1'] = true;
        }

        if(!permissions['perm2'] && !permissions['perm3'] && !permissions['perm4']) {
            disabledFlag['perm1'] = false;
        }

        if(permissions[permLabel] && ["UPLOAD_FILES", "DELETE_FILES"].indexOf(permissionsAsStrings[permLabel]) !== -1) {
            permissions['perm5'] = true;
            disabledFlag['perm5'] = true;
        }

        if(!permissions['perm6'] && !permissions['perm7']) {
            disabledFlag['perm5'] = false;
        }

        this.setState({ permissions }, this.setAllEnabled);
    }

    handleUserChange(e) {
        this.setState({
            user: e.target.value
        })
    }

    handleAllPermissionsGrant() {
      var permissions = this.state.permissions
      let disabledFlag = { ...this.state.disabledFlag }
      for (let i in permissions) {
        permissions[i] = true;
      }
      disabledFlag.perm1 = true;
      disabledFlag.perm5 = true;
      this.setState({ permissions, disabledFlag }, this.setAllEnabled);
    }

    handleSubmit() {
        let checkedPermissions = [];
        for (var key in this.state.permissions) {
          if (this.state.permissions[key]) {
            checkedPermissions.push(this.state.permissionsAsStrings[key]);
          }
        }
        if (!this.state.isAllEnabled){
          checkedPermissions = JSON.stringify(checkedPermissions);
        } else {
          checkedPermissions = JSON.stringify(["ALL"]);
        }
        this.props.editUserPermissions(this.state.user, this.state.permissionList, checkedPermissions, this.props.auth.user.username, (err, res) => {
          if (err) {
            alert(res);
          } else {
            alert("Permissions updated successfully.");
          }
          this.props.history.push("/users");
        });
    }

    renderUserUpdateForm() {
        var permissionsList = Object.entries(this.state.permissions).map(([permLabel, set]) => {
            return (
                <div key={permLabel}>
                    <Checkbox
                        label={this.state.permissionsAsStrings[permLabel]}
                        checked={set}
                        disabled={this.state.disabledFlag[permLabel]}
                        onChange={this.handlePermissionsChange(permLabel)}
                    />

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
                            <Container textAlign='left' style={styles.container}>
                                <Button animated color='red' onClick={this.handleAllPermissionsGrant.bind(this)}>
                                    <Button.Content visible>Grant All Permissions</Button.Content>
                                    <Button.Content hidden>
                                        <Icon name='warning' />
                                    </Button.Content>
                                </Button>
                                <Button animated color='teal' onClick={this.handleSubmit.bind(this)} style={{'float' : 'right'}}>
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
      if (typeof this.props.auth.user !== `undefined` && (this.props.auth.user.permissions.search(/VIEW_USERS|ALL/) >= 0)) {
        return (
            <SideNav>
                {this.renderUserUpdateForm()}
            </SideNav>
        )} else {
          return null;
        }
    }

}
function mapStateToProps({ auth }) {
    return { auth }
}

export default connect(mapStateToProps, actions)(EditUser);
