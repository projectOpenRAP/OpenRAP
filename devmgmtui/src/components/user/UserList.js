import React,{ Component } from 'react'
import {connect} from 'react-redux'
import * as actions from '../../actions/auth'
class UserList extends Component{

    renderUserList(){
        return this.props.user.list.map((item,index)=> {
            return (
                <div></div>
            )
        })
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

export default connect(mapStateToProps,actions)(UserList);