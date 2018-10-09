import React from 'react';

import {
	Grid,
	Table,
	Checkbox,
	Icon,
	Header,
	Input
} from 'semantic-ui-react';

import ContentArea from './ContentArea';

const styles = {
	parent: {
		backgroundColor: 'white',
		margin: '0px',
		padding: '32px 32px 104px 48px',
		height: 'calc(100vh - 240px)'
	}
};

function ResultSection(props) {
	const {
		content,
		count
	} = props;

	return (
		<Grid.Column stretched width={12} style={styles.parent}>		
			{
				content && count > 0
					? <ContentArea loading={false} content={content}/>
					: <ContentArea loading={true} content={null}/>
			}
		</Grid.Column>
	);
}

export default ResultSection;