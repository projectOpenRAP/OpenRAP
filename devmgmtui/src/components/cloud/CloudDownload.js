import React, { Component } from 'react';
import { connect } from 'react-redux';
import Aria2 from 'aria2';

import * as actions from '../../actions/cloud';

import { Grid } from 'semantic-ui-react';

import SearchBar from './SearchBar';
import Results from './Results';
import Downloads from './Downloads';
import SideNav from '../common/Sidebar';

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

class DownloadManager {

	constructor(params) {
		this.aria2 = new Aria2();
		this.connected = false;
		this.dir = params.dir;

		this.registerWithEvents();
	}

	registerWithEvents() {
		this.aria2.on('onDownloadStart', m => console.log(m));
		this.aria2.on('onDownloadComplete', m => console.log(m));
	}

	async connect() {
		if(!this.connected) {
			try {
				await this.aria2.open();
				this.connected = true;
				
				console.log('Connection established.');
			} catch(err) {
				console.log('Not able to connect.');
			}
		} else {
			console.log('Already connected.');
		}
	}

	async downloadData(uri) {
		if (this.connected) {
			try {
				let guid = await this.aria2.call('addUri', [uri], { dir: this.dir });
				return guid;
			} catch(err) {
				console.log('Error occurred while queuing download.', err);
				return -1;
			}
		} else {
			console.log('Connection not established. Please connect first.');
			return -1;
		}
	}
}

class CloudDownload extends Component {

	constructor(props) {
		super(props);

		this.state = {
			input: ''	
		};

		this.downloadManager = new DownloadManager('/home/admin/');

		this.handleSearch = this.handleSearch.bind(this);
		this.handleSearchClick = this.handleSearchClick.bind(this);
		this.handleSearchKeyUp = this.handleSearchKeyUp.bind(this);		
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
	}

	handleSearch(queryString, limit, offset) {
		this.props.searchContent(queryString, limit, offset, (err) => {
			if(err) {
				console.log(err);
				
				alert("Trouble fetching content from Sunbird server.");
			}
		});
	}
	
	handleSearchClick() {
		this.props.clearCurrentContent(err => {
			if(err) {
				console.log('Error occurred while clearing content. Error: ');
				console.log(err);
				
				alert("Some mess-up happened while searching for content. Try again.");
			} else {
				this.handleSearch(this.state.input, this.props.cloud.limit, 1);
			}
		});
	}

	handleSearchKeyUp(event) {
		if(event.keyCode === 13) {
			event.preventDefault();
			this.handleSearchClick();
		}
	}

	handleInputChange(event) {
		this.setState({
			...this.state,
			input: event.target.value
		});
	}

	handleLoadMoreClick() {
		const {
			queryString,
			limit,
			offset
		} = this.props.cloud;

		const newOffset = offset + limit;

		this.handleSearch(queryString, limit, newOffset);
	}

	handleDownload(uri) {
		const result = this.downloadManager.downloadData(uri);

		// if(result.value !== -1) {
		// 	console.log({ GUID: result.value });
		// } else {
		// 	alert('Couldn\'t download: ', result);
		// }
	}

	renderCloudDownloadComponent() {
		const moreContent = this.props.cloud.count > this.props.cloud.offset;

		return (
			<SideNav>
				<Grid divided='vertically' style={styles.parent}>
					<SearchBar
						handleKeyUp={this.handleSearchKeyUp}
						handleInputChange={this.handleInputChange}
						handleClick={this.handleSearchClick}
						value={this.state.input}
					/>

					<Grid.Row columns={2} style={styles.bottomRow}>
						<Results
							content={this.props.cloud.content}
							count={this.props.cloud.count}
							handleLoadMoreClick={this.handleLoadMoreClick}
							loading={this.props.cloud.searching}
							query={this.props.cloud.queryString}
							moreContent={moreContent}
							handleDownload={this.handleDownload}
						/>

						<Downloads />
					</Grid.Row>
				</Grid>
			</SideNav>
		);
	}

	componentDidMount() {
		document.title = 'Cloud Download';
		
		this.handleSearchClick();
		this.downloadManager.connect();
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