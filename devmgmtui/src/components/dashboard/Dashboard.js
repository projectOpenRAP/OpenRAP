import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../../actions/dashboard';

import { Segment, Grid } from 'semantic-ui-react';

import SideNav from '../common/Sidebar';
import ChartSegment from './ChartSegment';


let timer;

class Dashboard extends Component {

    componentWillMount() {
        if (this.props.auth && !this.props.auth.authenticated) {
            this.props.history.push("/");
        }

        document.title = "Dashboard";

        this.props.fetchSystemData();

        timer = setInterval(() => { this.props.fetchSystemData() }, 5000);
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
                        <Grid.Column>
                            {systemInfo()}
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row relaxed columns={3}>
                        <Grid.Column >
                            {cpuUsage()}
                        </Grid.Column>

                        <Grid.Column>
                            {memoryUsage()}
                        </Grid.Column>

                        <Grid.Column >
                            {spaceUsage()}
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
                    <Segment style={{marginTop: '2.5%'}}>
                        { this.renderCharts() }
                    </Segment>
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
