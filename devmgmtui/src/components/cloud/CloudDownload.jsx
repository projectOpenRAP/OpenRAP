import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from '../../actions/cloud';

import { Container, Grid, Segment, Input, Header, Button, Icon } from 'semantic-ui-react';


import SearchBar from './SearchBar';
import Results from './Results';
import Downloads from './Downloads';

import SideNav from '../common/Sidebar';


// const styles = {
// };

class CloudDownload extends Component {

	constructor(props) {
		super(props);

		this.state = {
			input: ''	
		};

		this.handleSearch = this.handleSearch.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);		
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	handleSearch() {
		console.log(`Searched for \"${this.state.input}\"`);

		this.props.searchContent(this.state.input, (err) => {
			if(err) {
				console.log('Error occurred while performing search. Following is the response returned by the server: ');
				console.log(err);
			}
		});
	}

	handleClick() {
		this.handleSearch();
	}

	handleKeyUp(event) {
		if(event.keyCode === 13) {
			event.preventDefault();
			this.handleSearch();
		}
	}

	handleInputChange(event) {
		this.setState({
			...this.state,
			input: event.target.value
		});
	}

	getCloudDownloadComponent() {
		return (
			<SideNav>
				<Grid divided='vertically'>
					<SearchBar
						handleKeyUp={this.handleKeyUp}
						handleInputChange={this.handleInputChange}
						handleClick={this.handleClick}
						value={this.state.input}
					/>

					{/* <Grid.Row columns={1} style={{ height: '16em', padding: '0px' }}>
						<Grid.Column stretched color='red'>
							
						</Grid.Column>	
					</Grid.Row> */}

					<Grid.Row columns={2} style={{ height: '100rem', padding: '0px' }}>
						<Results content={this.props.cloud.content} />

						<Downloads />
					</Grid.Row>
				</Grid>
			</SideNav>
		);
	}

	componentDidMount() {
		document.title = 'Cloud Download';
	}
	
	render() {
		return (
			<div style = {{width: '100%', height: '100%'}}>
				{this.getCloudDownloadComponent()}
			</div>
		);
	}

}

function mapStateToProps({ cloud }) {
	return { cloud };
}

export default connect(mapStateToProps, actions)(CloudDownload);