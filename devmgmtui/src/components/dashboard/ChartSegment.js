import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../../actions/dashboard';

import { Segment, Grid, Header, Message, Progress } from 'semantic-ui-react';

import PieChart from 'react-svg-piechart';
import './dashboard.css';

const ProgressBar = ({ numberOfUsers }) => {

    const handleProgressColor = () => {
        if(numberOfUsers <= 15) {
            return 'green';
        } else if (numberOfUsers > 15 && numberOfUsers <= 25) {
            return 'orange';
        } else {
            return 'red';
        }
    }

    const handleProgress = () => {
        return (
            (numberOfUsers/25)*100
        );
    }

    return (
        <div style={{marginTop: '1%'}}>
            <Progress
                percent={handleProgress()}
                color={handleProgressColor()}
                style={{marginBottom: '0'}}
                className="progress-bar-content"
            >
                {numberOfUsers}/25
            </Progress>
        </div>
    )
}

class ChartSegment extends Component {

    renderData() {
        let memoryData = this.props.dashboard.memoryData;
        let spaceData = this.props.dashboard.spaceData;
        let cpuData = this.props.dashboard.cpuData;
        let version = this.props.dashboard.version;
        let usersConnected = this.props.dashboard.usersConnected;
        let internetStatus = this.props.dashboard.internetStatus;
        let lastRefreshTime = this.props.dashboard.lastRefreshTime;
        let deviceID = this.props.dashboard.deviceID;

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

                        <Grid centered columns='equal'>
                            <Grid.Row centered>
                                <Grid.Column>
                                    <Message
                                        icon='id badge'
                                        header='Device ID'
                                        content={deviceID}
                                    />
                                </Grid.Column>

                                <Grid.Column>
                                    <Message
                                        icon='time'
                                        header='System Uptime'
                                        content={sysUpTimeInDDHHMMSS}
                                    />
                                </Grid.Column>

                                <Grid.Column>
                                    <Message
                                        icon='tag'
                                        header='System Version'
                                        content={sysVersion}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row centered>
                                <Grid.Column>
                                    <Message
                                        icon='wifi'
                                        header='SSID'
                                        content={ssid}
                                    />
                                </Grid.Column>

                                <Grid.Column>
                                    <Message compact
                                        style={{width: '100%'}}
                                        icon='signal'
                                        header='Internet Connectivity'
                                        content={internetStatus.data ? 'Connected' : 'Not connected'}
                                    />
                                </Grid.Column>

                                <Grid.Column>
                                    <Message
                                        icon='refresh'
                                        header='Last Content Refresh'
                                        content={lastRefreshTime.data || 'Not refreshed yet'}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row centered>
                                <Grid.Column>
                                    <Message
                                        icon='users'
                                        header='Number of Users connected'
                                        content={
                                            <ProgressBar
                                                numberOfUsers={numberOfUsersConnected}
                                            />
                                        }
                                    />
                                </Grid.Column>
                                <Grid.Column/>
                                <Grid.Column/>
                            </Grid.Row>
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
                {
                    dashboard.memoryData
                    && dashboard.spaceData
                    && dashboard.cpuData
                    && dashboard.version
                    && dashboard.usersConnected
                    && dashboard.internetStatus
                    ? this.renderData()
                    : this.renderLoader()
                }
            </div>
        );
    }
}

function mapStateToProps({ dashboard, ssid }) {
    return { dashboard, ssid }
}

export default connect(mapStateToProps, actions)(ChartSegment);
