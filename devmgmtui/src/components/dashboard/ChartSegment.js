import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actions from '../../actions/dashboard';

import { Segment, Container, Grid, Icon, Header, List, Divider, Message, Loader, Dimmer } from 'semantic-ui-react';

import PieChart from 'react-svg-piechart';

class ChartSegment extends Component {

    renderData() {
        let memoryData = this.props.dashboard.memoryData;
        let spaceData = this.props.dashboard.spaceData;
        let cpuData = this.props.dashboard.cpuData;
        let version = this.props.dashboard.version;

        let data = [];
        let header = {};

        let color = [
            ['#4CAF50', '#81C784'],
            ['#2196F3', '#64B5F6'],
            ['#FFC107', '#FFD54F']
        ]

        // Each ChartSegment's data and header is defined based on the the corresponding ID's passed
        switch(this.props.id) {

            // Memory Usage chart
            case 'mem': {
                let freememPercentage = memoryData.usage;
                let usedmemPercentage = 100 - freememPercentage;

                let totalMemory = memoryData.total / 1024;
                let freeMemory = memoryData.free / 1024;
                let usedMemory = totalMemory - freeMemory;

                data = [
                  { title: "Memory Free: " + freeMemory.toFixed(2) + " Gb (" + freememPercentage.toFixed(2) + "%)", value: freememPercentage, color: color[0][1] },
                  { title: "Memory Used: " + usedMemory.toFixed(2) + " Gb (" + usedmemPercentage.toFixed(2) + "%)", value: usedmemPercentage, color: color[0][0] }
                ]

                header = {
                    title: 'Memory Usage',
                    used: usedMemory.toFixed(2) + ' Gb',
                    free: freeMemory.toFixed(2) + ' Gb'
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
                  { title: "Space Free: " + freeSpace.toFixed(2) + " Mb (" + freespcPercentage.toFixed(2) + "%)", value: freespcPercentage, color: color[1][1] },
                  { title: "Space Used: " + usedSpace.toFixed(2) + " Mb (" + usedspcPercentage.toFixed(2) + "%)", value: usedspcPercentage, color: color[1][0] }
                ]

                header = {
                    title: 'Disk Usage',
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
                    { title: "CPU Free: " + cpuFree.toFixed(2) + "%", value: cpuFree, color: color[2][1] },
                    { title: "CPU Used: " + cpuUsed.toFixed(2) + "%", value: cpuUsed, color: color[2][0] },
                ]

                header = {
                    title: 'CPU Usage',
                    used: cpuUsed.toFixed(2) + '%',
                    free: cpuFree.toFixed(2) + '%'
                }
            }

            break;

            // Segment showing system version and uptime returned directly
            default: {
                let sysUpTimeInSeconds = memoryData.sysUpTime;

                const secondsToDDHHMMSS = (totalSeconds) => {
                    let days    = Math.floor(totalSeconds / (3600 * 24));
                    let hours   = Math.floor((totalSeconds - days * 3600 * 24) / 3600);
                    let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
                    let seconds = totalSeconds - (days * 3600 * 24) - (hours * 3600) - (minutes * 60);

                    seconds = Math.round(seconds * 100) / 100

                    let result =  (days < 10 ? "0" + days : days);
                        result += ":" + (hours < 10 ? "0" + hours : hours);
                        result += ":" + (minutes < 10 ? "0" + minutes : minutes);
                        result += ":" + (seconds  < 10 ? "0" + seconds : seconds);

                    return result;
                }

                let ssid                = this.props.ssid.currentSSID;
                let sysVersion          = version.data.toString();
                let sysUpTimeInDDHHMMSS = secondsToDDHHMMSS(sysUpTimeInSeconds);

                return (
                    <Segment color='teal'>
                        <Header color='teal'>
                            System Information
                        </Header>

                        <List>
                            <List.Item color='teal'>
                                <List.Content>
                                    <Message
                                    icon='time'
                                    header='System Uptime'
                                    content={sysUpTimeInDDHHMMSS}
                                    />
                                </List.Content>
                            </List.Item>

                            <List.Item>
                                <List.Content>
                                    <Message
                                    icon='tag'
                                    header='System Version'
                                    content={sysVersion}
                                    />
                                </List.Content>
                            </List.Item>

                            <List.Item>
                                <List.Content>
                                    <Message
                                    icon='wifi'
                                    header='SSID'
                                    content={ssid}
                                    />
                                </List.Content>
                            </List.Item>
                        </List>
                    </Segment>
                )
            }
        }

        return (
            <Segment color='teal'>
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
                    // onSectorHover={(d, i, e) => {
                    //         if(d) {
                    //             console.log("Mouse enter - Index:", i, "Data:", d, "Event:", e)
                    //         }
                    //         else {
                    //             console.log("Mouse leave - Index:", i, "Event:", e)
                    //         }
                    //     }
                    // }
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
