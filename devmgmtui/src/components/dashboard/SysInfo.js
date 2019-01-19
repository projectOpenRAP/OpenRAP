import React, { Component } from 'react';

import { connect } from 'react-redux';

import { Segment, Grid, Header, Message, Progress, Loader } from 'semantic-ui-react';

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

class SysInfo extends Component {

    renderMessage(icon, header, content) {
        return (
            <Message
                icon={icon}
                header={header}
                content={
                    content
                    ?
                    content
                    :
                    <Loader active inline size="tiny" />
                }
            />
        )
    }

    renderData() {
        let memoryData = this.props.dashboard.memoryData;
        let version = this.props.dashboard.version;
        let usersConnected = this.props.dashboard && this.props.dashboard.usersConnected && this.props.dashboard.usersConnected.numberOfUsers
            ?
            <ProgressBar numberOfUsers={this.props.dashboard.usersConnected.numberOfUsers} />
            :
            false;
        let internetStatus = this.props.dashboard && this.props.dashboard.internetStatus && typeof this.props.dashboard.internetStatus.data !== 'undefined'
            ?
            (
                this.props.dashboard.internetStatus.data
                ?
                'Connected' : 'Not connected'
            )
            :
            false;
        let lastRefreshTime = this.props.dashboard && this.props.dashboard.lastRefreshTime && this.props.dashboard.lastRefreshTime.data
            ?
            this.props.dashboard.lastRefreshTime.data
            :
            false;
        let deviceID = this.props.dashboard.deviceID;

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
        let sysVersion              = version && version.data.toString();
        let sysUpTimeInDDHHMMSS     = memoryData && secondsToDDHHMMSS(memoryData.sysUpTime);

        return (
            <Segment color='teal'>
                <Header color='teal'>
                    System Information
                </Header>

                <Grid centered columns='equal'>
                    <Grid.Row centered>
                        <Grid.Column>
                            {this.renderMessage('id badge', 'Device ID', deviceID)}
                        </Grid.Column>

                        <Grid.Column>
                            {this.renderMessage('time', 'System Uptime', sysUpTimeInDDHHMMSS)}
                        </Grid.Column>

                        <Grid.Column>
                            {this.renderMessage('tag', 'System Version', sysVersion)}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row centered>
                        <Grid.Column>
                            {this.renderMessage('wifi', 'SSID', ssid)}
                        </Grid.Column>

                        <Grid.Column>
                            {this.renderMessage('signal', 'Internet Connectivity', internetStatus)}
                        </Grid.Column>

                        <Grid.Column>
                            {this.renderMessage('refresh', 'Last Content Refresh', lastRefreshTime)}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row centered>
                        <Grid.Column>
                            {this.renderMessage('users', 'Number of Users connected', usersConnected)}
                        </Grid.Column>
                        <Grid.Column/>
                        <Grid.Column/>
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }

    render() {
        return (
            <div>
                {
                    this.renderData()
                }
            </div>
        );
    }
}

function mapStateToProps({ dashboard, ssid }) {
    return { dashboard, ssid }
}

export default connect(mapStateToProps, null)(SysInfo);
