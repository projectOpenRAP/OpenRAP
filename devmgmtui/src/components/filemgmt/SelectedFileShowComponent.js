import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Segment, Container, Button, Icon, Divider } from 'semantic-ui-react'

let selectedStyles = {
  'upload_wrapper' : {
    'color' : 'teal',
    fontWeight : 'bold',
    verticalAlign : 'text-center',
    paddingBottom : '4%'
  }
}

const colors = {
  'INACTIVE' : 'blue',
  'UPLOADING' : 'yellow',
  'UPLOADED' : 'green',
  'ERROR' : 'red',
}

const button_text = {
  'INACTIVE' : 'Upload!',
  'UPLOADING' : 'Uploading...',
  'UPLOADED' : 'Uploaded!',
  'ERROR' : 'Error!'
}

let formatBytes = (bytes,decimals) => {
   if(bytes == 0) return '0 Bytes';
   var k = 1024,
       dm = decimals || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

class SelectedFileShowComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName : props.file.name,
      fileSize : formatBytes(props.file.size, 2),
      uploadStatus : props.uploadStatus,
      hidden : false,
    }
    this.initiateUpload.bind(this);
  }

  initiateUpload() {
    let that = this;
    this.props.uploadFile(this.props.filemgmt.currentDir, this.props.file, function(err, res) {
      if (err) {
        alert(res);
      } else {
        that.setState({uploadStatus : 'UPLOADED'})
      }
      that.props.readFolder(that.props.filemgmt.currentDir)
    });
  }

  handleUploadClick() {
    if (this.state.uploadStatus === 'INACTIVE') {
      this.setState({uploadStatus : 'UPLOADING'})
    }
  }

  hide() {
    this.setState({hidden : true});
  }

  componentWillReceiveProps(newProps) {
    if (newProps.uploadStatus != this.props.uploadStatus && this.state.uploadStatus != 'UPLOADED') {
      this.setState({uploadStatus : newProps.uploadStatus})
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let data_target = null;
      if (prevProps.uploadStatus != this.props.uploadStatus && prevProps.uploadStatus != 'UPLOADED') {
        data_target = this.props.uploadStatus;
    } else if (prevState.uploadStatus != this.state.uploadStatus && prevState.uploadStatus != 'UPLOADED') {
        data_target = this.state.uploadStatus;
    }
    switch (data_target) {
      case 'INACTIVE':
          break;

      case 'UPLOADING':
          this.initiateUpload();
          break;

      case 'UPLOADED':
          let uploadableFiles = this.props.filemgmt.uploadableFiles;
          uploadableFiles.splice(uploadableFiles.indexOf(this.props.file), 1);
          this.props.updateUploadableFiles(uploadableFiles);
          window.setTimeout(this.hide(), 3000);
          break;

      case 'ERROR' :
          break;

      default :
          break;
    }
  }


  renderSelectedFileShowComponent() {
    return (
      <div>
        {this.state.hidden ? null :<Segment>
          <span style={selectedStyles.upload_wrapper}>{this.state.fileName}</span>
          <span style={{float : 'right'}}>
            <Button animated color={colors[this.state.uploadStatus]} onClick={this.handleUploadClick.bind(this)} disabled={this.state.uploadStatus !== 'INACTIVE'}>
            <Button.Content visible>{button_text[this.state.uploadStatus]}</Button.Content>
            <Button.Content hidden><Icon name='checkmark' /></Button.Content>
            </Button>
          </span>
          <Divider></Divider>
        </Segment>}
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderSelectedFileShowComponent()}
      </div>
    )
  }
}

function mapStateToProps({ filemgmt }) {
  return { filemgmt }
}

export default connect(mapStateToProps, actions)(SelectedFileShowComponent);
