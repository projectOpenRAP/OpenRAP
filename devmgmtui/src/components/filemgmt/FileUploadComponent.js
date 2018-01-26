import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Button, Icon } from 'semantic-ui-react'
import SelectedFileShowComponent from './SelectedFileShowComponent'


class FileUploadComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      files : [],
      fileNames : [],
      autoUpload : false
    }
    this.children = [];
  }

  handleFileInputChange(fileList)  {
    let files = this.state.files;
    let fileNames = this.state.fileNames;
    for (let i = 0; i < fileList.length; i++) {
      files.push(fileList[i]);
      fileNames.push(fileList[i].name);
    }
    this.setState({files, fileNames});
  }

  enableAutomaticUpload() {
    this.setState({autoUpload : true})
  }

  componentDidUpdate(newProps, newState) {
    if (newState.autoUpload === true) {
      this.setState({autoUpload : false})
    }
  }

  renderFileUploadComponent() {
    let fileNameDOMs = this.state.files.map((thing, index) =>
      <div>
        <div>
          <SelectedFileShowComponent file = {thing} uploadStatus={this.state.autoUpload ? 'UPLOADING' : 'INACTIVE'} key={index}/>
        </div>
      </div>)
    return (
      <div>
        <span>
          <Button animated color='teal' onClick = {() => {
            document.getElementById("fileinput").click();
          }}>
            <Button.Content visible>
              Choose file(s) to upload
            </Button.Content>
            <Button.Content hidden>
              <Icon name='upload' />
            </Button.Content>
          </Button>
          <input type='file' id='fileinput' style = {{display : 'None'}}
          onChange={(e) => this.handleFileInputChange(e.target.files)} multiple/>
        </span>
        <span>
        <Button animated color='green' onClick = {this.enableAutomaticUpload.bind(this)}>
          <Button.Content visible>
            Upload all files
          </Button.Content>
          <Button.Content hidden>
            <Icon name='checkmark' />
          </Button.Content>
        </Button>
        </span>
        <div className='ui divider'></div>
        {this.state.files.length > 0 ? <h2>Selected files for upload</h2> : null}
        {fileNameDOMs}
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

function mapStateToProps({ filemgmt }) {
  return { filemgmt }
}

export default connect(mapStateToProps, actions)(FileUploadComponent);
