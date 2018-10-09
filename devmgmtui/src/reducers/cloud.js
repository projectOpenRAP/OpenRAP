export default function (state = {}, action) {
	switch(action.type) {
		case 'SEARCH_CONTENT':
			return {
				...state,
				content: action.content,
				count: action.count
			};
		default:
			return state;
		}
}