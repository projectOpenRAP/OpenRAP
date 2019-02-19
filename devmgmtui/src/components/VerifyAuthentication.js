import React, { Component } from 'react';
import { connect } from 'react-redux';

export default function(ComposedComponent) {
    class Authentication extends Component {
        componentWillMount() {
            if (!this.props.verify.authenticated) {
                this.props.history.push('/');
            } else {
                const { pathname } = this.props.location;
                if (pathname === "/") {
                    this.props.history.push("/dashboard");
                }
            }
        }

        render () {
            return <ComposedComponent {...this.props} />
        }
    }

    function mapStateToProps(state) {
        return { verify: state.auth }
    }

    return connect(mapStateToProps)(Authentication);
}
