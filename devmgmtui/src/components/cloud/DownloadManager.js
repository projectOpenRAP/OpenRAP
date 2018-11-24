import { CLOUD_DOWNLOAD_CONFIG } from '../../config/config';

import Aria2 from 'aria2';
const aria2 = new Aria2(CLOUD_DOWNLOAD_CONFIG);

export default class DownloadManager {

	constructor(dir) {
		this.connected = false;
		this.dir = dir;
		this.aria2 = aria2;
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

	async downloadData(uri, ecarName) {
		if (this.connected) {
			try {
				// Add option to overwriting existing files
				const options = {
					out: ecarName,
					dir: this.dir
				};

				const guid = await this.aria2.call('addUri', [uri], options);
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

	onDownloadComplete(cb) {
		this.aria2.on('onDownloadComplete', ([params]) => {
			cb(params.gid);
		});
	}

	onDownloadStart(cb) {
		this.aria2.on('onDownloadStart', ([params]) => {
			cb(params.gid);
		});
	}

	onDownloadError(cb) {
		this.aria2.on('onDownloadError', ([params]) => {
			cb(params.gid);
		});
	}

	async getDetails(guid) {
		const details = await this.aria2.call('tellStatus', guid);
		return details;
	}
}