import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import {Form , Input, Button} from 'semantic-ui-react'
import * as actions from '../../actions/fileMgmt'
import  FileUploadComponent  from './FileUploadComponent.js'
import  FileDisplayComponent  from './FileDisplayComponent.js'


class FileMgmt extends Component {
  renderFileMgmt() {
    return (
      <div className="ui container">
        <div>
          Bonjour
        </div>
        <div>
          <FileUploadComponent /> <hr />
        </div>
        <div>
          <FileDisplayComponent />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div>
          {this.renderFileMgmt()}
        </div>
      </div>
    )
  }
}

function mapStateToProps({ fileMgmt }) {
  return { fileMgmt }
}

export default connect(mapStateToProps, actions)(FileMgmt);
