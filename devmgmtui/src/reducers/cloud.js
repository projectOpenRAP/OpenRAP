const defaultState = {
	content: [],
	count: 0,
	limit: 33,
	offset: 1,
	queryString: '',
	searching: false,
	downloads: []
};

export default function (state = defaultState, action) {
	const {
		type,
		payload
	} = action;

	switch(type) {
		case 'SEARCHED_CONTENT':
			return {
				...state,
				...payload,
				content: state.content.concat(payload.content),
			};
		case 'SEARCHING_CONTENT':
			return {
				...state,
				searching: payload
			};
		case 'CLEAR_CONTENT':
			return {
				...state,
				...payload
			};
		case 'UPDATE_DOWNLOAD_QUEUE':
			return {
				...state,
				downloads: payload
			};
		default:
			return state;
		}
}