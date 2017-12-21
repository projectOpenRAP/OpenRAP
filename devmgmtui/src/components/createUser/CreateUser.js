import React,{ Component } from 'react'
import {connect} from 'react-redux'
import * as actions from '../../actions/auth'
class Login extends Component{

    constructor(props){
        super(props)
        this.state = {
            user:"",
            password:""
        }
    }
    handleUserChange(e){
        this.setState({
            user : e.target.value
        })
    }
    handlePasswordChange(e){
        this.setState({
            password : e.target.value
        })
    }
    handleSubmit(){
        this.props.createUser(this.state.user,this.state.password);
    }
    render(){
        return (
            <div>
                {this.props.auth && <div>Auth</div>}
                <input type="text" onChange={this.handleUserChange.bind(this)} value={this.state.user} />
                <input type="text" onChange={this.handlePasswordChange.bind(this)} value={this.state.password} />
                <button onClick={this.handleSubmit.bind(this)} >create user</button>
            </div>
        )
    }

}

function mapStateToProps({auth}){
    return {auth}
}

export default connect(mapStateToProps,actions)(Login);