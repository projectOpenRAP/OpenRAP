import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../../actions/dashboard';

import { Segment, Container, Grid, Icon, Header, List, Divider, Message, Loader, Dimmer } from 'semantic-ui-react';

import PieChart from 'react-svg-piechart';


const maxNumberOfUsers = 12;

const UserChart = ({ numberOfUsers }) => {
    let numberOfUsersPercent = Math.floor((numberOfUsers * 100) / 12);

    let data = [
        { title: 'Current capacity', value: 100-numberOfUsersPercent, color: '#B2DFDB' },
        { title: 'Users connected', value: numberOfUsersPercent, color: 'teal' }
    ]

    return (
        <Container style={{position: 'relative', width: '100px', height: '100px'}}>
            <div style={{position: 'absolute', width: '100%'}}>
                <PieChart
                    strokeLinejoin="round"
                    strokeWidth={0.2}
                    viewBoxSize={100}
                    data={data}
                />
            </div>

            <div style={{position: 'absolute', top: '45%', left: '48%', margin: '-10%', width: '100%', height: '100%', color: 'black'}}>
                <Icon size='large' name='users'/>
                <br/>

            </div>

            <div style={{position: 'absolute', top: '70%', left: '42%', margin: '-10%', width: '100%', height: '100%', color: 'black'}}>
                {numberOfUsers} / {maxNumberOfUsers}
            </div>
        </Container>
    );
}


class ChartSegment extends Component {

    renderData() {
        let memoryData = this.props.dashboard.memoryData;
        let spaceData = this.props.dashboard.spaceData;
        let cpuData = this.props.dashboard.cpuData;
        let version = this.props.dashboard.version;
        let usersConnected = this.props.dashboard.usersConnected;
        let lastRefreshTime = this.props.dashboard.lastRefreshTime;

        let data = [];
        let header = {};

        let color = ['teal', '#B2DFDB'];

        // Each ChartSegment's data and header is defined based on the the corresponding ID's passed
        switch(this.props.id) {

            // Memory Usage chart
            case 'mem': {
                let freememPercentage = memoryData.usage;
                let usedmemPercentage = 100 - freememPercentage;

                let totalMemory = memoryData.total;
                let freeMemory = memoryData.free;
                let usedMemory = totalMemory - freeMemory;

                data = [
                  { title: "RAM Free: " + freeMemory.toFixed(2) + " Mb (" + freememPercentage.toFixed(2) + "%)", value: freememPercentage, color: color[1] },
                  { title: "RAM Used: " + usedMemory.toFixed(2) + " Mb (" + usedmemPercentage.toFixed(2) + "%)", value: usedmemPercentage, color: color[0] }
                ]

                header = {
                    title: 'RAM Usage',
                    used: usedMemory.toFixed() + ' Mb',
                    free: freeMemory.toFixed() + ' Mb'
                }
            }

            break;

            // Disk Usage chart
            case 'space': {
                let totalSpace = spaceData.total / (1024 * 1024);
                let freeSpace = spaceData.free / (1024 * 1024);
                let usedSpace = totalSpace - freeSpace;

                let freespcPercentage = (freeSpace*100) / totalSpace;
                let usedspcPercentage = 100 - freespcPercentage;

                data = [
                  { title: "Space Free: " + freeSpace.toFixed(2) + " Mb (" + freespcPercentage.toFixed(2) + "%)", value: freespcPercentage, color: color[1] },
                  { title: "Space Used: " + usedSpace.toFixed(2) + " Mb (" + usedspcPercentage.toFixed(2) + "%)", value: usedspcPercentage, color: color[0] }
                ]

                header = {
                    title: 'Disk Space',
                    used: usedSpace.toFixed() + ' Mb',
                    free: freeSpace.toFixed() + ' Mb'
                }
            }

            break;

            // CPU Usage chart
            case 'cpu': {
                let cpuUsed = cpuData.v;
                let cpuFree = 100-cpuUsed;

                data = [
                    { title: "CPU Free: " + cpuFree.toFixed(2) + "%", value: cpuFree, color: color[1] },
                    { title: "CPU Used: " + cpuUsed.toFixed(2) + "%", value: cpuUsed, color: color[0] },
                ]

                header = {
                    title: 'CPU Usage',
                    used: cpuUsed.toFixed() + '%',
                    free: cpuFree.toFixed() + '%'
                }
            }

            break;

            // Segment showing system version and uptime returned directly
            default: {
                const secondsToDDHHMMSS = (totalSeconds) => {
                    let days    = Math.floor(totalSeconds / (3600 * 24));
                    let hours   = Math.floor((totalSeconds - days * 3600 * 24) / 3600);
                    let minutes = Math.floor((totalSeconds - days * 3600 * 24 - hours * 3600) / 60);

                    let result =  (days < 10 ? "0" + days : days);
                        result += ":" + (hours < 10 ? "0" + hours : hours);
                        result += ":" + (minutes < 10 ? "0" + minutes : minutes);

                    return result;
                }

                let ssid                    = this.props.ssid.currentSSID || this.props.dashboard.currentSSID;
                let sysVersion              = version.data.toString();
                let sysUpTimeInDDHHMMSS     = secondsToDDHHMMSS(memoryData.sysUpTime);
                let numberOfUsersConnected  = usersConnected.numberOfUsers;

                return (
                    <Segment color='teal'>
                        <Header color='teal'>
                            System Information
                        </Header>

                        <Grid relaxed columns={6}>
                            <Grid.Column width={2} verticalAlign='middle'>
                                <UserChart
                                    numberOfUsers={numberOfUsersConnected}
                                />
                            </Grid.Column>

                            <Grid.Column verticalAlign='middle'>
                                <Message
                                    icon='time'
                                    header='System Uptime'
                                    content={sysUpTimeInDDHHMMSS}
                                />
                            </Grid.Column>

                            <Grid.Column verticalAlign='middle'>
                                <Message
                                    icon='tag'
                                    header='System Version'
                                    content={sysVersion}
                                    />
                            </Grid.Column>

                            <Grid.Column verticalAlign='middle'>
                                <Message
                                icon='wifi'
                                header='SSID'
                                content={ssid}
                                />
                            </Grid.Column>

                            <Grid.Column verticalAlign='middle'>
                                <Message
                                    icon='signal'
                                    header='Internet Connectivity'
                                    content={''}
                                />
                            </Grid.Column>

                            <Grid.Column width={3} verticalAlign='middle'>
                                <Message
                                    icon='refresh'
                                    header='Last Content Refresh'
                                    content={lastRefreshTime.data}
                                />
                            </Grid.Column>
                        </Grid>
                    </Segment>
                )
            }
        }

        return (
            <Segment color='teal' style={{width: '30vw'}}>
                <Header color='teal' floated='left'>
                    {header.title}
                </Header>

                <br />

                <Message>
                    <b>{'Used: ' + header.used}</b>
                    <br />
                    <b>{'Free: ' + header.free}</b>
                </Message>

                <PieChart
                    expandOnHover={true}
                    strokeLinejoin="round"
                    strokeWidth={0.2}
                    viewBoxSize={100}
                    data={data}
                />
            </Segment>
        )
    }

    renderLoader() {
        return (
            <Segment loading padded>
                Loading...
            </Segment>
        )
    }

    render() {
        let dashboard = this.props.dashboard;

        return (
            <div>
                { dashboard.memoryData && dashboard.spaceData && dashboard.cpuData ? this.renderData() : this.renderLoader() }
            </div>
        );
    }
}

function mapStateToProps({ dashboard, ssid }) {
    return { dashboard, ssid }
}

export default connect(mapStateToProps, actions)(ChartSegment);
