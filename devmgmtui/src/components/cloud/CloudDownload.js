import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from '../../actions/cloud';

import { Grid } from 'semantic-ui-react';

import SearchBar from './SearchBar';
import Results from './Results';
import Downloads from './Downloads';

import SideNav from '../common/Sidebar';

// TODO Add content fetch at the beginning

const styles = {
	bottomRow: {
		height: 'calc(100vh - 228px)',
		padding: '0px'
	},
	parentDiv: {
		width: '100%',
		height: '100%'
	}
};

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
		this.props.searchContent(this.state.input, 30, 1, (err) => {
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

	renderCloudDownloadComponent() {
		return (
			<SideNav>
				<Grid divided='vertically' style={styles.parent}>
					<SearchBar
						handleKeyUp={this.handleKeyUp}
						handleInputChange={this.handleInputChange}
						handleClick={this.handleClick}
						value={this.state.input}
					/>

					<Grid.Row columns={2} style={styles.bottomRow}>
						<Results content={this.props.cloud.content} count={this.props.cloud.count} />

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
			<div style={styles.parentDiv}>
				{this.renderCloudDownloadComponent()}
			</div>
		);
	}

}

function mapStateToProps({ cloud }) {
	return { cloud };
}

export default connect(mapStateToProps, actions)(CloudDownload);