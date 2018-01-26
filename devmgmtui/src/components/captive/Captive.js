import React, { Component } from 'react'
import SideNav from '../common/Sidebar';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Container, Grid, Segment, Input, Header, Button, Icon } from 'semantic-ui-react';
import './captive.css';

function uploadImageCallBack(file) {
    return new Promise(
        (resolve, reject) => {
            const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
            xhr.open('POST', 'https://api.imgur.com/3/image');
            xhr.setRequestHeader('Authorization', 'Client-ID 8d26ccd12712fca');
            const data = new FormData(); // eslint-disable-line no-undef
            data.append('image', file);
            xhr.send(data);
            xhr.addEventListener('load', () => {
                const response = JSON.parse(xhr.responseText);
                console.log(response);
                resolve(response);
            });
            xhr.addEventListener('error', () => {
                const error = JSON.parse(xhr.responseText);
                reject(error);
            });
        },
    );
}
class Captive extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editorState: EditorState.createEmpty(),
        }
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
    }


    onEditorStateChange(editorState) {
        this.setState({
            editorState,
        });
    };
    render() {
        const { editorState } = this.state;
        return (
            <SideNav>
                <br />
                <br />
                <div className="rdw-storybook-root">
                    <Editor
                        toolbarClassName="rdw-storybook-toolbar"
                        wrapperClassName="rdw-storybook-wrapper"
                        editorClassName="rdw-storybook-editor"
                        onEditorStateChange={this.onEditorStateChange}
                        toolbar={{
                            image: {
                                uploadCallback: uploadImageCallBack,
                                alt: { present: true, mandatory: false },
                            },
                        }}
                    />
                </div>
                <textarea
                    disabled
                    className="rdw-storybook-textarea"
                    value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                />
            </SideNav>
        )
    }

}

export default Captive;
