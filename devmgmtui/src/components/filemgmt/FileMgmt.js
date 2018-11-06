import React, { Component } from 'react'
import { connect } from 'react-redux'
import SideNav from '../common/Sidebar'
import * as actions from '../../actions/filemgmt'
import { Segment, Grid, Header } from 'semantic-ui-react'
import FileUploadComponent from './FileUploadComponent'
import FileDisplayComponent from './FileDisplayComponent'

const fileMgmtStyles = {
  gridGap : {
    marginTop : '3%',
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

  componentWillMount() {
      document.title = "File Management";
  }

  renderFileMgmt() {
    return (
      <SideNav>
         <Grid columns={2} divided style={fileMgmtStyles.gridGap}>
            <Grid.Row>
              <Grid.Column>
                <Header as='h1'>File Management</Header>
              </Grid.Column>
              <Grid.Column>
                { this.props.auth.user.permissions.search(/UPLOAD_FILES|ALL/) >= 0 ?
                    <Header as='h1'>File Upload</Header>
                    :
                    null
                }
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
            <Grid.Column>
             <Segment>
              <FileDisplayComponent />
            </Segment>
            </Grid.Column>
            <Grid.Column>
              { this.props.auth.user.permissions.search(/UPLOAD_FILES|ALL/) >= 0 ? <div style={fileMgmtStyles.fileUpload}>
                <Segment raised>
                  <FileUploadComponent />
                </Segment>
              </div> : null}
            </Grid.Column>
            </Grid.Row>
          </Grid>
      </SideNav>
    )
  }

  render() {
    if (typeof this.props.auth.user !== `undefined` && (this.props.auth.user.permissions.search(/VIEW_FILES|ALL/) >= 0)) {
      return (
        <div>
          {this.renderFileMgmt()}
        </div>
    )
  } else {
      return (
        null
      )
  }
  }
}

function mapStateToProps({ filemgmt, auth }) {
  return { filemgmt, auth }
}

export default connect(mapStateToProps, actions)(FileMgmt);
