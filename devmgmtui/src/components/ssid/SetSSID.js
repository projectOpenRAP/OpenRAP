import React, { Component } from 'react'

import { connect } from 'react-redux'
import * as actions from '../../actions/ssid'

import { Container, Grid, Segment, Input, Header, Button, Icon } from 'semantic-ui-react';

const styles = {
    ssidForm: {
        height: '100%'
    },
    segment: {
        maxWidth: '450px'
    },
    container: {
        marginTop: '10px'
    }
}

class SetSSID extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ssid: ""
        }
    }

    componentWillMount() {
        if (this.props.auth && !this.props.auth.authenticated) {
            this.props.history.push("/");
        }
        document.title = "Set SSID";
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.auth && !nextProps.auth.authenticated) {
            this.props.history.push("/");
        }
    }

    handleSSIDChange(e) {
        this.setState({
            ssid: e.target.value
        })
    }

    handleSubmit() {

        this.props.setSSID(this.state.ssid, (err, data) => {
            if(err) {
                alert(data.msg);
            }
            else {
                alert("SSID set successfully!");
                this.props.history.push('/dashboard');
            }
        });
    }

    renderSSIDForm() {
        return (
            <div style={styles.ssidForm}>
                <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                    <Grid.Column style={styles.segment}>
                        <Segment raised >
                            <Header as='h2' color='teal' textAlign='center'>
                                Set a name for your hotspot
                             </Header>
                            <Input
                                onChange={this.handleSSIDChange.bind(this)}
                                value={this.state.ssid}
                                fluid
                                icon='wifi'
                                iconPosition='left'
                                placeholder='Enter the name' />

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
            <div style={styles.ssidForm}>
                {this.renderSSIDForm()}
            </div>
        )
    }
}

function mapStateToProps({ ssid, auth }) {
    return { ssid, auth }
}

export default connect(mapStateToProps, actions)(SetSSID);
