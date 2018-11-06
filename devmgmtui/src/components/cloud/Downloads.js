import React from 'react';

import { Grid, Segment, Header, Loader, Icon, List, Transition, Button } from 'semantic-ui-react';

const styles = {
	parent: {
		margin: '0px',
		padding: '32px 40px 32px 32px',
		height: 'calc(100vh - 240px)',
		overflowY: 'scroll'
	},
	downloadCard: {
		width: '100%'
	},
	downloadCardList: {
		paddingBottom: '32px'
	},
	noDownloads: {
		paddingTop: '16vh',
		textAlign: 'center'
	},
	loadContent: {
		fontSize: '16px',
		width: '100%'
	}
};

function DownloadCard(props) {
	const {
		name,
		size,
		status
	} = props;

	let cardStatusIndicator = null;

	switch(status) {
		case 'ongoing': cardStatusIndicator = <Loader active />; break;
		case 'done': cardStatusIndicator = <Icon name='check circle' size='big' color='green' />; break;
		case 'failed': cardStatusIndicator = <Icon name='warning circle' size='big' color='red' />; break;
	}

	return (
		<Segment compact style={styles.downloadCard}>
			<Grid columns={2}>
				<Grid.Column width={13} stretched>
					<Header as='h2' floated='left'>
						<Header.Content>
							{name}
							<Header.Subheader>Size {size}</Header.Subheader>
						</Header.Content>
					</Header>
				</Grid.Column>

				<Grid.Column width={3} textAlign='center' verticalAlign='middle'>
					{cardStatusIndicator}
				</Grid.Column>
			</Grid>
		</Segment>
	);
}

function renderDownloadCards(downloads) {
	const downloadCards = downloads.map((item, index) => {
		return (
			<List.Item key={index}>
				<DownloadCard name={item.name} size={item.size} status={item.status} />
			</List.Item>
		);
	});

	return (
		<Transition.Group as={List} duration={200}>
			{downloadCards}
		</Transition.Group>
	);
}

function renderNoDownloads() {
	return (
		<div style={styles.noDownloads}>
			<Icon name='download' size='huge' />
			<h2>No downloads in progress.</h2>
		</div>
	);
}

function isListEmpty(list) {
	let flag = true;

	if (list && list.length > 0) {
		const filteredList = list.filter(item => item); // filtering empty (null/undefined) items here

		if (filteredList.length > 0) {
			flag = false;
		}
	}

	return flag;
}

function renderLoadContentButton(clickHandler) {
	return (
		<Button
			primary
			onClick={clickHandler}
			style={styles.loadContent}
		>
			Load Content Into Plugin
		</Button>
	);
}

function renderDownloadCardsAndLoadContentButton(downloads, loadContentClickHandler) {
	return (
		<div>
			{renderLoadContentButton(loadContentClickHandler)}
			{renderDownloadCards(downloads)}
		</div>
	);
}

function Downloads(props) {
	const {
		downloads,
		handleLoadContentClick
	} = props;

	return (
		<Grid.Column stretched width={4} style={styles.parent}>		
			{
				isListEmpty(downloads)
					? renderNoDownloads()
					: renderDownloadCardsAndLoadContentButton(downloads, handleLoadContentClick)
			}
		</Grid.Column>
	);
}

export default Downloads;