import axios from 'axios';
import { BASE_URL } from '../config/config';

export const clearCurrentContent = (cb) => (dispatch) => {
	const defaultSearchState = {
		content: [],
		count: 0,
		limit: 33,
		offset: 1,
		queryString: '',
		searching: false
	};

	dispatch({
		type: 'CLEAR_CONTENT',
		payload: defaultSearchState
	});

	cb(null);
};

export const searchContent = (queryString = '', limit, offset, cb) => (dispatch) => {
	dispatch({
		type: 'SEARCHING_CONTENT',
		payload: true
	});

	axios.get(`${BASE_URL}/cloud/search?query=${queryString}&limit=${limit}&offset=${offset}`)
		.then(({ data }) => {
			if (data.success) {
				const newSearchState = {
					content: data.hits.content,
					count: data.hits.count,
					queryString,
					offset,
					searching: false
				}

				dispatch({
					type: 'SEARCHED_CONTENT',
					payload: newSearchState
				});

				cb(null);
			} else {
				throw new Error(data.err);
			}
		})
		.catch(err => {
			cb(err);
		});
};

const sortByStatus = (downloads, statusMap) => {
	return downloads.sort((a, b) => statusMap[a.status] - statusMap[b.status]);
};

export const updateDownloadQueue = (downloads, cb) => (dispatch) => {
	const statusMap = {
		'ongoing': 1,
		'waiting': 2,
		'failed': 3,
		'done': 4
	};

	downloads = sortByStatus(downloads, statusMap);

	dispatch({
		type: 'UPDATE_DOWNLOAD_QUEUE',
		payload: downloads
	});

	cb(null);
};

export const loadContent = (cb) => (dispatch) => {
	axios.put(`${BASE_URL}/file/apply`)
		.then(response => {
			if (response.data.success) {
				cb(null);
			} else {
				throw new Error(response.data.message);
			}
		})
		.catch(error => {
			cb(error);
		});
};