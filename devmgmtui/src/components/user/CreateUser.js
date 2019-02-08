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
      document.title = "Create User";
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
        this.props.createUser(this.state.user, this.state.password, this.props.auth.user.username, (err,msg)=>{
            if(err){
                alert(msg);
            }
            else{
                const error=this.validate();
	            if(error){
	            	switch(error){
	            		case 1:alert("Name should contain only alphabets and should not be blank");
	            				break;
	            		case 2:alert("Please Enter Password");
	            				break;
	            		default:alert("Unknown error");
                    }
                }
                else{
                    alert("Success");
                    this.props.history.push("/users");
                }

            }
            
        });
    }
    
    validate = () => {
        let isError = false;
        let a=0;
        
        if(!(/^[A-za-z0-9]*$/.test (this.state.user) && this.state.user.length>=1)){
            isError = true;
            a=1;
        }
        else{
            if(!(this.state.password.length>=1)){
                isError = true;
                a=2;
            }
        }

        return a;
    }

    handleKeyPress = (e) =>
    {
        console.log('Key pressed.');

        if(e.key === 'Enter')
        {
            this.handleSubmit();
        }
    }

    renderCreateUser() {
        return (
            <Grid textAlign='center' style={{ height: '100%' }}>
                <Grid.Column style={styles.segment}>
                    <Segment raised onKeyPress={this.handleKeyPress}>
                        <Header as='h2' color='teal' textAlign='center'>
                            <Icon name='add user' />
                            Create a new User
                        </Header>
                        <Input
                            onChange={this.handleUserChange.bind(this)}
                            value={this.state.user}
                            fluid
                            icon='user'
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
                                    <Icon name='plus' />
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
          return null;
        }
  }

}

function mapStateToProps({ auth }) {
    return { auth }
}

export default connect(mapStateToProps, actions)(CreateUser);