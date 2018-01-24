import React, { Component } from 'react'
import { connect } from 'react-redux'
import SideNav from '../common/Sidebar'
import * as actions from '../../actions/filemgmt'
import { Segment, Container, Sticky, Rail, Grid } from 'semantic-ui-react'
import FileUploadComponent from './FileUploadComponent'
import FileDisplayComponent from './FileDisplayComponent'

const fileMgmtStyles = {
  gridGap : {
    marginTop : '4%',
    paddingLeft : '2%',
    paddingRight : '2%'
  },
  fileUpload : {
    'position' : '-webkit-sticky',
    'position' : 'sticky',
    'top' : 10
  }
}

class FileMgmt extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  renderFileMgmt() {
    const { contextRef } = this.state;
    return (
      <SideNav>
          <Grid columns={2} divided style={fileMgmtStyles.gridGap}>
            <Grid.Row>
            <Grid.Column>
            <Segment>
              <FileDisplayComponent />
            </Segment>
            </Grid.Column>
            <Grid.Column>
              <div style={fileMgmtStyles.fileUpload}>
                <Segment raised>
                  <FileUploadComponent />
                </Segment>
              </div>
            </Grid.Column>
            </Grid.Row>
          </Grid>
      </SideNav>
    )
  }

  render() {
    return (
      <div>
        {this.renderFileMgmt()}
      </div>
    )
  }
}

function mapStateToProps({ filemgmt }) {
  return { filemgmt }
}

export default connect(mapStateToProps, actions)(FileMgmt);
