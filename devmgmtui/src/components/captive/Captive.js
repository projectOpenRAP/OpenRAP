import React, { Component } from 'react'
import SideNav from '../common/Sidebar';
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import { connect } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Container, Grid, Segment, Input, Header, Button, Icon } from 'semantic-ui-react';
import './captive.css';
import UploadApkButton from './UploadApkButton.js';
import * as actions from '../../actions/captive.js';


const captiveStyles = {
  container : {
    "paddingTop" : "10px",
    "textAlign" : "center",
    "marginLeft" : "25px",
    "marginRight" : "25px"
  }
}
class Captive extends Component {
    constructor(props) {
        super(props)
        this.state = {
          editorState: EditorState.createEmpty(),
        }
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.uploadImageCallBack = this.uploadImageCallBack.bind(this);
    }

    componentWillMount()  {
      document.title="Captive Portal";
    }

    onEditorStateChange(editorState) {
        this.setState({
            editorState,
        });
    };

    writeToHtmlFile() {
      let { editorState } = this.state;
      this.props.writeToHtmlFile(draftToHtml(convertToRaw(editorState.getCurrentContent())), (err, res) => {
        if (err){
          alert(res);
        } else {
          alert("Successfully wrote to file!");
        }
      });
    }

    uploadImageCallBack(file) {
       return this.props.uploadImageToCaptive(file);
    }

    uploadApkCallBack(file) {
      let { editorState } = this.state;
      this.props.uploadApksToCaptive(file).then(resolve => {
        let content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        let apkItem = "<li key = " + resolve.name  + "><a href=" + resolve.link + ">" + resolve.name + " </a></li>";
        let newContent = "<ul>" + apkItem + "</ul>";
        content += newContent;
        let updatedBlocks = convertFromHTML(content);
        let updatedContent = ContentState.createFromBlockArray(updatedBlocks.contentBlocks, updatedBlocks.entityMap);
        this.setState({editorState : EditorState.createWithContent(updatedContent)});
      }, reject => {
        alert("Some APKs could not be uploaded!");
      });
    }

    render() {
        let { editorState } = this.state ;
        return (
            <SideNav>
                <br />
                <br />
                <div style={captiveStyles.container}>
                <div>
                    <Editor
                        editorState = {editorState}
                        toolbarClassName="rdw-storybook-toolbar"
                        wrapperClassName="rdw-storybook-wrapper"
                        editorClassName="rdw-storybook-editor"
                        toolbarCustomButtons={[<UploadApkButton />]}
                        onEditorStateChange={this.onEditorStateChange}
                        toolbar={{
                            image: {
                                uploadCallback: this.uploadImageCallBack,
                                alt: { present: true, mandatory: false },
                            },
                        }}
                    />
                </div>
                <input type='file' id='apkinput' style = {{display : 'None'}}
                onChange={(e) => this.uploadApkCallBack(e.target.files[0])} accept='.apk'/>
                <Container style = {captiveStyles.container}>
                  <Button color = 'violet' onClick={this.writeToHtmlFile.bind(this)}>
                    <Button.Content visible>
                      Write Changes To Captive Portal
                    </Button.Content>
                  </Button>
                </Container>
                </div>
            </SideNav>
        )
    }

}

function mapStateToProps({ auth }) {
    return { auth }
}

export default connect(mapStateToProps, actions)(Captive);
