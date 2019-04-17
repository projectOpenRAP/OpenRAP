import { CLOUD_DOWNLOAD_CONFIG } from '../../config/config';

import Aria2 from 'aria2';
const aria2 = new Aria2(CLOUD_DOWNLOAD_CONFIG);

export default class DownloadManager {

	constructor(dir) {
		this.connected = false;
		this.dir = dir;
		this.aria2 = aria2;

		this.aria2.on('close', () => {
			console.log('Disconnected from the download manager.');
			this.connected = false;
			this.connect();
		});

		this.aria2.on('open', () => {
			console.log('Connected to the download manager.');
			this.connected = true;
		});
	}

	async connect() {
		if (this.connected) {
			console.log('Already connected.');
		} else {
			try {
				await this.aria2.open();
			} catch(err) {
				console.log('Error occured while connecting to the download manager.');
				console.log({ err });
			}
		}
	}

	async downloadData(uri, ecarName, retries = 1) {
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
		} else if (retries == 0) {
			console.log('Couldn\'t connect to the download manager.');
			return -1;
		} else {
			await this.connect();
			return this.downloadData(uri, ecarName, --retries);
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

	async getActiveDownloads() {
		const details = await this.aria2.call('tellActive');
		return details;
	}

	async getWaitingDownloads(offset, num) {
		const details = await this.aria2.call('tellWaiting', offset, num);
		return details;
	}

	async getGlobalStat() {
		const details = await this.aria2.call('getGlobalStat');
		return details;
	}
}