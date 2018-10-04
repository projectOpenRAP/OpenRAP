import axios from 'axios';
import { BASE_URL } from '../config/config';

export const searchContent = (queryString = '', cb) => (dispatch) => {
	axios.get(`${BASE_URL}/cloud/search?query=${queryString}`)
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
