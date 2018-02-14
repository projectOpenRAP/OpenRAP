import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../../actions/dashboard';

import { Segment, Container, Grid, Icon, Header } from 'semantic-ui-react';

import SideNav from '../common/Sidebar';
import ChartSegment from './ChartSegment';


let timer;

const styles = {
    container: {
        marginTop: '3%',
        width: '650px'
    }
}

class Dashboard extends Component {

    componentWillMount() {
        if (this.props.auth && !this.props.auth.authenticated) {
            this.props.history.push("/");
        }

        document.title = "Dashboard";

        this.props.fetchSystemData();
        timer = setInterval(() => { this.props.fetchSystemData() }, 1000);
    }

    componentWillUnmount() {
        clearInterval(timer);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth && !nextProps.auth.authenticated) {
            this.props.history.push("/");
        }
    }

    renderCharts() {
        const systemInfo = () => { return <ChartSegment /> }
        const memoryUsage = () => { return <ChartSegment id='mem'/> }
        const spaceUsage = () => { return <ChartSegment id='space'/> }
        const cpuUsage = () => { return <ChartSegment id='cpu'/> }

        if(systemInfo && memoryUsage && spaceUsage && cpuUsage) {
            return (
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            {systemInfo()}
                        </Grid.Column>

                        <Grid.Column width={8}>
                            {memoryUsage()}
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column width={8}>
                            {spaceUsage()}
                        </Grid.Column>

                        <Grid.Column width={8}>
                            {cpuUsage()}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            );
        }
        else {
            return ( <strong>Loading...</strong> );
        }
    }

    render() {
        console.log('rendering now');

        if(typeof this.props.auth.user !== 'undefined') {
            return (
                <SideNav>
                    <Container style={styles.container}>
                        <Segment>
                            { this.renderCharts() }
                        </Segment>
                    </Container>
                </SideNav>
            );
        }  else {
        this.props.history.push("/");
        return (null);
}
  }
}

function mapStateToProps({ dashboard, auth }) {
    return { dashboard, auth }
}

export default connect(mapStateToProps, actions)(Dashboard);
