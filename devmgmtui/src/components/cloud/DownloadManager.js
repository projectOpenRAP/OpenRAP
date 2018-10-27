import { CLOUD_DOWNLOAD_CONFIG } from '../../config/config';

import Aria2 from 'aria2';
const aria2 = new Aria2(CLOUD_DOWNLOAD_CONFIG);

export default class DownloadManager {

	constructor(dir) {
		this.connected = false;
		this.dir = dir;
		this.aria2 = aria2;	
		this.registerWithEvents();
	}

	async handleDownloadComplete(guid) {
		const { files } = await this.aria2.call('tellStatus', guid);
		alert(`Successfully downloaded content at "${files[0].path}".`);
	}

	registerWithEvents() {
		// this.aria2.on('onDownloadStart', m => console.log(m));
		this.aria2.on('onDownloadComplete', ([params]) => {
			this.handleDownloadComplete(params.gid);
		});
	}

	async connect() {
		if(!this.connected) {
			try {
				const connectStatus = await this.aria2.open();
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
				const guid = await this.aria2.call('addUri', [uri], { dir: this.dir });
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