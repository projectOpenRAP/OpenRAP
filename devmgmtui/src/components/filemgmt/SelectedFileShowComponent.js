import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Segment, Button, Icon, Divider, Dimmer, Loader, Progress } from 'semantic-ui-react'

let selectedStyles = {
  'upload_wrapper' : {
    'color' : 'teal',
    fontWeight : 'bold',
    verticalAlign : 'text-center',
    paddingBottom : '4%'
  }
}

class SelectedFileShowComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadProgress : 0,
      uploadStatus : 'INACTIVE',
      cancelUpload : undefined
    }
    this.initiateUpload = this.initiateUpload.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
  }

  initiateUpload() {
    let that = this;

    if (this.props.filemgmt.files.find(file => file.name === this.props.file.name)) {
        alert(`${this.props.file.name} will be overwritten.`);
    }

    this.props.uploadFile(this.props.filemgmt.currentDir, this.props.file, this.props.auth.user.username, function(err, res, uploading, cancelUpload) {
        if (err) {
            alert(res);
            that.setState({
                uploadProgress : 0,
                uploadStatus : 'ERROR'
            });
        } else if(uploading) {
            that.setState({
                cancelUpload,
                uploadProgress : res,
                uploadStatus : 'UPLOADING'
            });
        } else {
            that.setState({
                uploadProgress : res,
                uploadStatus : 'UPLOADED'
            }, () => {
                that.props.readFolder(that.props.filemgmt.currentDir);
                that.handleDeleteClick();
            });
        }
    });
  }

  handleUploadClick() {
       this.initiateUpload();
  }

  handleDeleteClick() {
    if(this.state.uploadStatus !== 'INACTIVE') {
      this.state.cancelUpload();
    }

    let uploadableFiles = this.props.filemgmt.uploadableFiles;
    let fileIndex = uploadableFiles.indexOf(this.props.file);

    if(fileIndex !== -1) {
        delete uploadableFiles[fileIndex];
        this.props.updateUploadableFiles(uploadableFiles);
    }
  }

  componentDidUpdate() {
    if(this.props.autoUpload === true && this.state.uploadStatus === 'INACTIVE') {
        this.initiateUpload();
    }
  }

  shortenString(string) {
    if (string.length > 70) {
      return (string.slice(0, 50) + '...' + string.slice(-10))
    }
    return string;
  }

  renderSelectedFileShowComponent() {
    let isUploading = this.state.uploadStatus === 'UPLOADING'
    let hasUploaded = this.state.uploadStatus === 'UPLOADED'

    return (
      <Segment>
          {
            isUploading
            ? <Progress percent={this.state.uploadProgress} attached='top' color='blue'/>
            : null
          }
          <span style={selectedStyles.upload_wrapper}>
            {this.shortenString(this.props.file.name)}
          </span>
          <span style={{float : 'right'}}>
                <Button
                    basic
                    circular
                    icon='upload'
                    color='blue'
                    loading={isUploading && !hasUploaded}
                    onClick={this.handleUploadClick.bind(this)}
                />

                <Button
                    basic
                    circular
                    icon='cancel'
                    color='red'
                    onClick={this.handleDeleteClick}
                />
          </span>
          <br/>
          <br/>
      </Segment>
    )
  }

  render() {
    return this.renderSelectedFileShowComponent();
  }
}

function mapStateToProps({ auth, filemgmt }) {
  return { auth, filemgmt }
}

export default connect(mapStateToProps, actions)(SelectedFileShowComponent);
