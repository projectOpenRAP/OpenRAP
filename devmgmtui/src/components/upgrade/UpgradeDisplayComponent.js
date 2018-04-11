import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/upgrade'
import {Button, Icon, Segment, Loader, Dimmer, Progress} from 'semantic-ui-react'

const upgradeStyle = {
  outside : {
    'padding-top' : '30px'
  },
  'big_head' : {
    'font-weight' : 'bold',
    'font-size' : '20px',
    'color' : 'teal'
  },
  'big_text' : {
    'font-size' : '20px',
  }
}


class UpgradeDisplayComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileToAdd : null,
      fileName : '',
      fileUploadedStatus : "INACTIVE",
      uploadProgress : 0
    }
    this.handleFileInputChange = this.handleFileInputChange.bind(this);
  }

  handleFileInputChange(selectedFile) {
    this.setState({fileName : selectedFile[0].name, fileToAdd : selectedFile[0]});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.fileUploadedStatus !== this.state.fileUploadedStatus && this.state.fileUploadedStatus === 'ACTIVE') {
      this.props.uploadFile(this.state.currentFolder, this.state.fileToAdd, (err, res, uploading) => {
        if (err) {
          alert(res);
          this.setState({fileUploadedStatus:"ERROR"});
        } else if (uploading) {
          this.setState({uploadProgress : res});
        } else {
          alert('Successfully uploaded file!');
          this.setState({fileUploadedStatus:"DONE"});
        }
      });
    }
  }

  submitFilesForUpload() {
    if (this.state.fileToAdd == null) {
      alert('Select a file to upload first');
      return;
    }
    this.setState({fileUploadedStatus:"ACTIVE"});
  }


  renderUpgradeDisplayComponent() {
    let isUploading = this.state.fileUploadedStatus === 'ACTIVE';

    return(
      <div style = {upgradeStyle.outside}>
        <Segment raised>
        {
          isUploading
          ? (<Dimmer active inverted>
              <span style={{ color : 'grey' }}>{Math.floor(this.state.uploadProgress) + '%'}</span>
              <Loader active size='huge'/>
            </Dimmer>)
          : null
        }
        {
          isUploading
          ? <Progress active percent={this.state.uploadProgress} attached='top' color='blue'/>
          : null
        }
        <span>
          <Button animated color='blue' onClick = {() => {
            document.getElementById("fileinput").click();
          }}>
            <Button.Content visible>
              Choose Upgrade File
            </Button.Content>
            <Button.Content hidden>
              <Icon name='up arrow' />
            </Button.Content>
          </Button>
          <input type='file' id='fileinput' style = {{display : 'None'}}
            onChange={(e) => this.handleFileInputChange(e.target.files)} accept = '.tgz'/>
        </span>
        <span style={{float : 'right'}}>

          <Button animated color={this.state.fileUploadedStatus === 'ERROR' ? 'red': 'green'} onClick = {this.submitFilesForUpload.bind(this)}>
            <Button.Content visible>Begin upload!</Button.Content>
            <Button.Content hidden><Icon name='checkmark'/></Button.Content>
          </Button>
        </span>
        <div className="ui divider"></div>
        <div>
          <span style = {upgradeStyle.big_head}>Selected file: </span>
            <span style = {upgradeStyle.big_text}>{this.state.fileName}</span>
            <span style = {{float : 'right'}}>{this.state.fileUploadedStatus === 'ERROR' ? <Icon name = 'warning sign' color='red' size='big'/> : this.state.fileUploadedStatus === "DONE" ? <Icon name = 'checkmark' color='green' size='big'/> : null }</span>
        </div>
        </Segment>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderUpgradeDisplayComponent()}
      </div>
    )
  }
}

function mapStateToProps({ upgrade }) {
return { upgrade }
}

export default connect(mapStateToProps, actions)(UpgradeDisplayComponent);
