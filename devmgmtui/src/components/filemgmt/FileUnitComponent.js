import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Icon, Divider, Checkbox } from 'semantic-ui-react'


let formatBytes = (bytes,decimals) => {
   if(bytes === 0) return '0 Bytes';
   var k = 1024,
       dm = decimals || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

let fileDisplayStyles = {
  rightPadded : {
    'paddingRight' : '5px',
  }
}

class FileUnitComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected : (this.props.filemgmt.selectedFiles.indexOf(props.name) >= 0)
    }
    this.toggleSelected = this.toggleSelected.bind(this);
  }
/*
  componentWillMount() {
    let currentlySelectedFiles = this.props.filemgmt.selectedFiles;
    if (currentlySelectedFiles.indexOf(this.props.name) >= 0) {
      this.setState({selected: true});
    }
  }*/

  componentWillReceiveProps(newProps, newState) {
    this.setState({selected : (newProps.filemgmt.selectedFiles.indexOf(this.props.name) >= 0)})
  }
  toggleSelected() {
    let currentlySelectedFiles = this.props.filemgmt.selectedFiles;
    if (this.state.selected) {
      currentlySelectedFiles.splice(currentlySelectedFiles.indexOf(this.props.name), 1);
    } else {
      currentlySelectedFiles.push(this.props.name);
    }
    this.setState({selected : !this.state.selected});
    this.props.updateSelectedFiles(currentlySelectedFiles);
  }

  shortenString(string) {
    if (string.length > 30) {
      return (string.slice(0, 12) + '...' + string.slice(-15))
    }
    return string;
  }

  handleDelete() {
    let consent = window.confirm("Cannot be reverted once it is deleted. Are you sure you want to delete this file?");
    if (consent) {
      const fileToDelete = this.props.ext === '.ecar' ? (this.props.id + this.props.ext) : this.props.name;

      this.props.deleteFile(this.props.filemgmt.currentDir, fileToDelete, this.props.auth.user.username, (err, res) => {
        if (err) {
          alert(res);
        } else {
          alert("File deletion success");
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
        { this.props.auth.user.permissions.search(/DELETE_FILES|ALL/) >= 0 ?  <span style={fileDisplayStyles.rightPadded}><Checkbox onClick = {() => this.toggleSelected(this)} checked={this.state.selected}/></span> : null}
          <Icon name='file' color='blue' size='big'/>
            {this.shortenString(this.props.name)}
        </span>
        <span>
          {'\t[' + formatBytes(this.props.size) + ']'}
        </span>
        { this.props.auth.user.permissions.search(/DELETE_FILES|ALL/) >= 0 ?
        <span style={{float:'right'}}>
          <a href='javascript:void(0);' onClick={this.handleDelete.bind(this)}>
            <Icon name='trash outline' color='red' size='big' />
          </a>
        </span>
         : null}
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
function mapStateToProps({ filemgmt, auth }) {
  return { filemgmt, auth }
}

export default connect(mapStateToProps, actions)(FileUnitComponent);
