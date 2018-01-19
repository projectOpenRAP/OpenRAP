import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/fileMgmt'
import {Form , Input, Button, Icon, Segment} from 'semantic-ui-react'

const fileUploadStyle = {
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

class FileUploadComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        filesToAdd : [],
        fileNames : [],
        fileUploadedStatus : [],
        currentFolder : '',
      }
      this.handleFileInputChange = this.handleFileInputChange.bind(this);
    }

    handleFileInputChange(selectedFiles) {
      console.log(selectedFiles.length);
      console.log(selectedFiles);
      let fileNames = [];
      for (var i = 0; i < selectedFiles.length; i++) {
        fileNames.push(selectedFiles[i].name);
      }
      console.log(fileNames);
      this.setState({fileNames, filesToAdd : selectedFiles});
  }

    submitFilesForUpload() {
      console.log("We are gonna upload dem files");
      if (this.state.filesToAdd.length < 1) {
        alert('Select some files to upload first');
        return;
      }
      for (var i = 0; i < this.state.filesToAdd.length; i++) {
        console.log(i);

        this.props.uploadFile(this.state.currentFolder, this.state.filesToAdd[i], (err, msg) => {
          if (!err) {
            alert('Successfully uploaded file!');
          }
          else {
            alert(msg);
          }
        });
      }
    }


    renderFileUploadComponent() {

      var filesList = this.state.fileNames.map((i) => <div className = "item" key={i.toString()}>{i}</div>);
      return(
        <div style = {fileUploadStyle.outside}>
          <Segment raised>
            <span>
              <Button animated color='blue' onClick = {() => {
                document.getElementById("fileinput").click();
              }}>
                <Button.Content visible>
                  Choose files to upload
                </Button.Content>
                <Button.Content hidden>
                  <Icon name='up arrow' />
                </Button.Content>
              </Button>
              <input type='file' id='fileinput' style = {{display : 'None'}}
              onChange={(e) => this.handleFileInputChange(e.target.files)} accept = '.tgz'/>
            </span>
            <span style={{float : 'right'}}>
              <Button animated color='green' onClick = {this.submitFilesForUpload.bind(this)}>
                <Button.Content visible>Begin upload!</Button.Content>
                <Button.Content hidden><Icon name='checkmark'/></Button.Content>
              </Button>
            </span>
          <hr />
          <div>
            <h3>Selected files for upload: </h3>
            <div className="ui celled list">
              {filesList}
            </div>
          </div>
          </Segment>
        </div>
      )
    }

    render() {
      return (
        <div>
          {this.renderFileUploadComponent()}
        </div>
      )
    }
}

function mapStateToProps({ fileUpload }) {
  return { fileUpload }
}

export default connect(mapStateToProps, actions)(FileUploadComponent);
