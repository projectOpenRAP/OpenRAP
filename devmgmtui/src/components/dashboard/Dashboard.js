import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../../actions/dashboard';

import { Segment, Container, Grid, Icon, Header } from 'semantic-ui-react';

import SideNav from '../common/Sidebar';
import ChartSegment from './ChartSegment';

const styles = {
    container: {
        marginTop: '2.8%',
        width: '650px'
    }
}

class Dashboard extends Component {

    componentWillMount() {
        if (this.props.auth && !this.props.auth.authenticated) {
            this.props.history.push("/");
        }

        this.props.fetchSystemData();

        setInterval(() => { this.props.fetchSystemData() }, 1000);
        document.title = "Dashboard";
        // this.props.fetchSystemData()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth && !nextProps.auth.authenticated) {
            this.props.history.push("/");
        }
    }

    render() {
      if  (typeof this.props.auth.user !== 'undefined') {
        return (
            <SideNav>
                <Container style={styles.container}>
                    <Segment>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <ChartSegment />
                                </Grid.Column>

                                <Grid.Column width={8}>
                                    <ChartSegment id='mem'/>
                                </Grid.Column>
                            </Grid.Row>

                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <ChartSegment id='space'/>
                                </Grid.Column>

                                <Grid.Column width={8}>
                                    <ChartSegment id='cpu'/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
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
