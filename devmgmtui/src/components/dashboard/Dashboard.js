import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../../actions/dashboard';

import { Segment, Grid } from 'semantic-ui-react';

import SideNav from '../common/Sidebar';
import ChartSegment from './ChartSegment';
import SysInfo from './SysInfo';

let timer;

class Dashboard extends Component {

    componentWillMount() {
        document.title = "Dashboard";

        this.props.fetchSystemData();

        timer = setInterval(() => { this.props.fetchSystemData() }, 10 * 1000);
    }

    componentWillUnmount() {
        clearInterval(timer);
    }

    renderCharts() {
        const systemInfo = () => { return <SysInfo /> }
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

                    <Grid.Row columns={3}>
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
        if(typeof this.props.auth.user !== 'undefined') {
            return (
                <SideNav>
                    <Segment style={{marginTop: '2.5%'}}>
                        { this.renderCharts() }
                    </Segment>
                </SideNav>
            );
        }  else {
        return (null);
}
  }
}

function mapStateToProps({ dashboard, auth }) {
    return { dashboard, auth }
}

export default connect(mapStateToProps, actions)(Dashboard);
