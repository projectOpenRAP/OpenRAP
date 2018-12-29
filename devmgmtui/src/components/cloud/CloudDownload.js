import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from '../../actions/cloud';

import { Grid } from 'semantic-ui-react';
import axios from 'axios';

import SearchBar from './SearchBar';
import Results from './Results';
import Downloads from './Downloads';
import SideNav from '../common/Sidebar';
import DownloadManager from './DownloadManager';

import { BASE_URL } from '../../config/config';

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
		this.handleSearchClick = this.handleSearchClick.bind(this);
		this.handleSearchKeyUp = this.handleSearchKeyUp.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
		this.addNewDownload = this.addNewDownload.bind(this);
		this.updateDownloadGuid = this.updateDownloadGuid.bind(this);
		this.removeDownload = this.removeDownload.bind(this);
		this.handleFailedDownload = this.handleFailedDownload.bind(this);
		this.handleLoadContentClick = this.handleLoadContentClick.bind(this);
		
		this.downloadManager = new DownloadManager('/home/admin/diksha'); // TODO: Make download path configurable
		this.downloadManager.onDownloadComplete(this.removeDownload);
		this.downloadManager.onDownloadError(this.handleFailedDownload);
	}

	formatBytes(bytes = 0, decimals) {
		if(bytes === 0) return '0 Bytes';
		const k = 1024,
			dm = decimals || 2,
			sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
			i = Math.floor(Math.log(bytes) / Math.log(k));
	
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	getEcarName(id, ver) {
		return `${id}_${ver.toFixed(1)}.ecar`
	}

	fetchAndDownloadDependencies(id, rootName, ver) {
		const parent = this.getEcarName(id, ver);
		const url = `${BASE_URL}/cloud/dependencies/${encodeURIComponent(parent)}`;

		axios.get(url)
			.then(res => {
				if (res.data.success) {
					// alert(`Fetched dependencies for "${parent}".`);
					const dependencies = res.data.data;
					
					dependencies.forEach(item => {
						const {
							downloadUrl,
							contentType,
							identifier,
							pkgVersion,
							size,
							name
						} = item;

						this.handleDownload(`${name} (Root: ${rootName})`, this.formatBytes(size, 1), downloadUrl, contentType, identifier, pkgVersion, false);
					});
				} else {
					throw res.data.err;
				}
			})
			.catch(err => {
				alert(`Couldn\'t fetch the dependencies for "${parent}".`);
				console.log(err);
			});
	}

	addNewDownload(guid, name, id, ver, size, uri, isRoot) {
		let {
			downloads
		} = this.props.cloud;

		downloads.push({
			guid,
			name,
			size,
			uri,
			id,
			ver,
			isRoot,
			status: 'ongoing'
		});

		this.props.updateDownloadQueue(downloads, () => console.log('Queued: ', guid));
	}

	updateDownloadGuid(oldGuid, newGuid) {
		let {
			downloads
		} = this.props.cloud;

		downloads = downloads.map(item => {
			if(item.guid === oldGuid) {
				item.guid = newGuid;
				item.status = 'ongoing';
			}

			return item;
		});

		this.props.updateDownloadQueue(downloads, () => console.log(`Updated ${oldGuid} to ${newGuid}`));
	}

	// TODO: Add a getter for tellActive under DownloadManager and clear any dangling downloads inside removeDownload().
	removeDownload(guid) {
		let {
			downloads
		} = this.props.cloud;

		downloads = downloads.map(item => {
			if(item.guid === guid) {
				item.status = 'done';

				if (item.isRoot) {
					this.fetchAndDownloadDependencies(item.id, item.name, item.ver);
				}
			}

			return item;
		});

		this.props.updateDownloadQueue(downloads, () => console.log('Done: ', guid));
	}

	handleFailedDownload(guid) {
		let {
			downloads
		} = this.props.cloud;

		downloads = downloads.map(item => {
			if(item.guid === guid) {
				item.status = 'failed';
			}

			return item;
		});

		this.props.updateDownloadQueue(downloads, () => console.log('Failed: ', guid));
	}
	
	handleSearch(queryString, limit, offset) {
		this.props.searchContent(queryString, limit, offset, (err) => {
			if(err) {
				console.log(err);
				
				alert('Trouble fetching content from Diksha server.');
			}
		});
	}
	
	handleSearchClick() {
		this.props.clearCurrentContent(err => {
			if(err) {
				console.log('Error occurred while clearing content. Error: ');
				console.log(err);
				
				alert('Some mess-up happened while searching for content. Try again.');
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

	async handleDownload(name, size, uri, type, id, ver, isRoot) {
		let {
			downloads
		} = this.props.cloud;

		let oldGuid = null;
		let newGuid = null;

		let alreadyQueued = false;
		let status;

		downloads.forEach(item => {
			if(item.uri === uri) {
				oldGuid = item.guid;
				alreadyQueued = true;
				status = item.status;
			}
		});

		if(!alreadyQueued) {
			newGuid = await this.downloadManager.downloadData(uri, this.getEcarName(id, ver));
			
			if(newGuid !== -1) {
				this.addNewDownload(newGuid, name, id, ver, size, uri, isRoot);
			} else {
				alert('Not able to download', name);
			}
		} else {
			switch(status) {
				case 'ongoing':
					alert(`"${name}" is being downladed.`);
					break;
				case 'done':
					alert(`"${name}" has been downlaoded.`);
					break;
				case 'failed':
					newGuid = await this.downloadManager.downloadData(uri, this.getEcarName(id, ver));

					if(newGuid !== -1) {
						this.updateDownloadGuid(oldGuid, newGuid);
					} else {
						alert(`Not able to download "${name}".`);
					}
					break;
			}
		}
	}

	handleLoadContentClick() {
		if(window.confirm('Some services might be interrupted for a moment. Do you still wish to proceed?')) {
			this.props.loadContent(err => {
				if (err) {
					console.log('Error occured while applying changes.');
					console.log(err);

					alert('Failed to apply changes.');
				} else {
					alert('Changes applied successfully.');
				}
			});
		} else {
			alert('No changes were applied.');
		}
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

						<Downloads
							downloads={this.props.cloud.downloads}
							handleLoadContentClick={this.handleLoadContentClick}
						/>
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