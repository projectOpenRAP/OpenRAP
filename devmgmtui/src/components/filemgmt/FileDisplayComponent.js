import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import * as actions from '../../actions/fileMgmt'
import {Form , Input, Button} from 'semantic-ui-react'


class FileDisplayComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      folders : [],
      files : []
    }
    this.handleFolderClickEvent.bind(this);
    this.handleFileClickEvent.bind(this);
  }

  handleFolderClickEvent(e) {
    console.log("You have clicked folder " + e.target.value);
  }

  handleFileClickEvent(e) {
    console.log("You have clicked file " + e.target.value);
  }

  renderFileDisplayComponent() {
    return (
      <div>Miaow
      </div>
    )
  }

  render() {
    return(
      <div>{this.renderFileDisplayComponent()}</div>
    )
  }
}

function mapStateToProps ({fileDisplay }) {
  return { fileDisplay }
}

export default connect(mapStateToProps, actions)(FileDisplayComponent);
