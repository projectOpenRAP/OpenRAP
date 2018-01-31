import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import {List, Grid, Icon, Button, Divider, Segment, Input} from 'semantic-ui-react'
import FolderUnitComponent from './FolderUnitComponent'
import FileUnitComponent from './FileUnitComponent'

const fileDisplayStyles = {
  dirDisplay : {
    'color' : 'blue'
  },
  fileDisplay : {
    'color' : 'red'
  }

}

class FileDisplayComponent extends Component {

  constructor(props) {
    super(props);
    this.pop.bind(this);
    this.state = {
      newFolderName : '',
    }
  }

  componentWillMount() {
    this.props.readFolder(this.props.filemgmt.currentDir);
  }

  pop(slashedPath) {
    slashedPath = slashedPath.slice(0, -1);
    let lastSlash = slashedPath.lastIndexOf('/');
    return slashedPath.slice(0, lastSlash+1);
  }

  goBack() {
    if (this.props.filemgmt.currentDir !== '/') {
      this.props.readFolder(this.pop(this.props.filemgmt.currentDir))
    } else {
      return;
    }
  }

  createNewFolder() {
    if (this.state.newFolderName.length < 1) {
      alert('A folder needs a name.');
      return;
    }
    this.props.createFolder(this.props.filemgmt.currentDir, this.state.newFolderName, (err, res) => {
      if (err) {
        alert(res);
      } else {
        alert("Successfully created folder!");
        this.props.readFolder(this.props.filemgmt.currentDir);
      }
    });
  }

  handleFolderNameChange(e) {
    this.setState({newFolderName : e.target.value})
  }

  renderFileDisplayComponent() {
    let folders = this.props.filemgmt.files.map((item, index) => {
        return (
          item.type === 'dir' ? <List.Item key={index}><FolderUnitComponent name={item.name} size={item.size}/></List.Item>  : null
        )
    });
    let files = this.props.filemgmt.files.map((item, index) => {
        return (
          item.type === 'file' ? <List.Item key={index}><FileUnitComponent name={item.name} size={item.size}/></List.Item> : null
        )
    });
    return (
      <div>
        <List>
          {folders}
        </List>
        <List>
          {files}
        </List>
      </div>
    )
  }

  render() {
    let isDisabled = this.props.filemgmt.currentDir === '/' ? true : false ;
    return (
      <div>
      <span>
        <span>
          <Button animated color='orange' disabled = {isDisabled} onClick={this.goBack.bind(this)}>
            <Button.Content visible>Back</Button.Content>
            <Button.Content hidden><Icon name='left arrow' /></Button.Content>
          </Button>
        </span>
        { this.props.auth.user.permissions.search(/UPLOAD_FILES|ALL/) >= 0 ? <span>
          <Input action={{ color: 'teal', labelPosition: 'right', icon: 'plus', content: 'Make New Folder', onClick : this.createNewFolder.bind(this)}} placeholder='Type name here...' onChange={this.handleFolderNameChange.bind(this)} />
        </span> : null}
      </span>
      <Divider></Divider>
      <div>
        Currently at : {this.props.filemgmt.currentDir}
      </div>
      <div className='ui divider'></div>
        <List>
          {this.renderFileDisplayComponent()}
        </List>
      </div>

    )
  }
}

function mapStateToProps({ filemgmt, auth }) {
  return { filemgmt, auth }
}

export default connect(mapStateToProps, actions)(FileDisplayComponent);
