import React from 'react';

import { Grid, Button, Icon } from 'semantic-ui-react';

import ContentArea from './ContentArea';

const styles = {
	parent: {
		backgroundColor: 'white',
		margin: '0px',
		padding: '32px 32px 32px 48px',
		height: 'calc(100vh - 240px)',
		minHeight: 'calc(100vh - 240px)'
	},
	loadButton: {
		maxHeight: '40px',
		width: 'calc((100vh*2)/10)',
		alignSelf: 'center',
		minHeight: '40px'
	}
};

function ResultSection(props) {
	const {
		content,
		count,
		loading,
		query,
		moreContent
	} = props;

	const disabled = !moreContent;
	const buttonContent = disabled ? 'Reached Bottom' : 'Load More';

	return (
		<Grid.Column stretched width={12} style={styles.parent}>		
			<ContentArea
				loading={loading}
				content={content}
				count={count}
				query={query}
			/>
			
			<Button 
				primary
				disabled={disabled}
				onClick={props.handleLoadMoreClick}
				style={styles.loadButton}
				loading={loading}
			>
				<Button.Content>
					{buttonContent}
				</Button.Content>
			</Button>
			
		</Grid.Column>
	);
}

export default ResultSection;