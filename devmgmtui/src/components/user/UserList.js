import React, { Component } from 'react'
import { connect } from 'react-redux'
import {Link} from 'react-router-dom'

import * as actions from '../../actions/user'
class UserList extends Component {


    componentWillMount() {
        this.props.getAllUser();
    }

    handleDelete(key){
        console.log("calling");
        this.props.deleteUser(key)
    }
    renderUserList() {
        return this.props.user.list.map((item, index) => {
            return (
                <div key={index}>
                    <div >
                        <div>{item.key}</div>
                        <button onClick={() => this.handleDelete(item.key)}>Delete</button>
                    </div>
                </div>
            )
        })
    }

    render() {
        return (
            <div>
                UserList
                {this.props.user.list && this.renderUserList()}
                <Link to={"/create/user"}>Add User</Link>
            </div>
        )
    }

}

function mapStateToProps({ user }) {
    return { user }
}

export default connect(mapStateToProps, actions)(UserList);