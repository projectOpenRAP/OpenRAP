import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Card, Image, Icon, Divider } from 'semantic-ui-react'


let formatBytes = (bytes,decimals) => {
   if(bytes == 0) return '0 Bytes';
   var k = 1024,
       dm = decimals || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

class FileUnitComponent extends Component {

  constructor(props) {
    super(props);
  }

  shortenString(string) {
    if (string.length > 30) {
      return (string.slice(0, 12) + '...' + string.slice(-15))
    }
    return string;
  }

  handleDelete() {
    let consent = window.confirm("This file will be deleted! [No Undo]");
    if (consent) {
      this.props.deleteFile(this.props.filemgmt.currentDir, this.props.name, (err, res) => {
        if (err) {
          alert(res);
        } else {
          this.props.readFolder(this.props.filemgmt.currentDir);
        }
      });
    } else {
      return;
    }
  }

  renderFileUnitComponent() {
    return (
      <div>
        <span>
          <Icon name='file' color='teal' size='big'/>
            {this.shortenString(this.props.name)}
        </span>
        <span>
          {'\t[' + formatBytes(this.props.size) + ']'}
        </span>
        <a href='javascript:void(0);' onClick={this.handleDelete.bind(this)}>
        <span style={{float:'right'}}>
          <Icon name='trash outline' color='red' size='big' />
        </span>
        </a>
        <Divider></Divider>
      </div>
    )
  }
  render() {
    return(
      <div>
        {this.renderFileUnitComponent()}
      </div>
    )
  }
}
function mapStateToProps({ filemgmt }) {
  return { filemgmt }
}

export default connect(mapStateToProps, actions)(FileUnitComponent);
