import React, { Component } from 'react';

import { connect } from 'react-redux';

import { Segment, Header, Message } from 'semantic-ui-react';

import PieChart from 'react-svg-piechart';
import './dashboard.css';

class ChartSegment extends Component {

    renderData() {
        let memoryData = this.props.dashboard.memoryData;
        let spaceData = this.props.dashboard.spaceData;
        let cpuData = this.props.dashboard.cpuData;

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

            default: {
                return null;
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
                    ? this.renderData()
                    : this.renderLoader()
                }
            </div>
        );
    }
}

function mapStateToProps({ dashboard }) {
    return { dashboard }
}

export default connect(mapStateToProps, null)(ChartSegment);
