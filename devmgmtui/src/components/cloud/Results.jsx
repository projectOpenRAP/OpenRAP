'use strict';

import React from 'react';

import {
	Grid,
	Icon,
	Header,
	Input
} from 'semantic-ui-react';

function ResultSection(props) {
	const styles = {
		parent: {
			backgroundColor: 'white',
			margin: '0'
		}
	};

	// processContent(content) {

	// }

	// TODO Check how to fetch more than 99 search hits. Possible limit on the content being returned. 

	return (
		<Grid.Column stretched width={12} style={styles.parent}>
			{/* {props.content} */}
		</Grid.Column>
	);
}

export default ResultSection;