const defaultState = {
	content: [],
	count: 0,
	limit: 33,
	offset: 1,
	queryString: '',
	searching: false
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
		default:
			return state;
		}
}