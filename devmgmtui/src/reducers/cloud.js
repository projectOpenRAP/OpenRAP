export default function (state = {}, action) {
	switch(action.type) {
		case 'SEARCH_CONTENT':
			return {
				...state,
				content: action.payload
			};
		default:
			return state;
		}
}