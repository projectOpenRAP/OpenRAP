import axios from 'axios';
import { BASE_URL } from '../config/config';


export const clearCurrentContent = (cb) => (dispatch) => {
	dispatch({
		type: 'SEARCH_CONTENT',
		payload: []
	});

	cb(null);
};

export const searchContent = (queryString = '', limit, offset, cb) => (dispatch) => {
	axios.get(`${BASE_URL}/cloud/search?query=${queryString}&limit=${limit}&offset=${offset}`)
		.then(({ data }) => {
			if(data.success) {
				dispatch({
					type: 'SEARCH_CONTENT',
					payload: data.hits
				});

				cb(null);
			} else {
				dispatch({
					type: 'SEARCH_CONTENT',
					payload: []
				});

				throw new Error(data.err);
			}
		})
		.catch(err => {
			cb(err);
		});
};
