import React from 'react';

import { Segment, Table, Checkbox, Icon, Image, Header, Statistic } from 'semantic-ui-react';

import './cloud.css';

const styles = {
	parent: {
		overflowY: 'scroll'
	}
};

function truncateExcess(text, threshold = 147) {
	const suffix = text.length > threshold ? '...' : '';
	return `${text.substring(0, threshold)}${suffix}`;
}

function formatBytes(bytes, decimals) {
	if(bytes === 0) return '0 Bytes';
	const k = 1024,
		dm = decimals || 2,
		sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function renderDetailsCard(data) {
	let {
		name,
		language,
		contentType,
		subject,
		size,
		description,
		creator,
		appIcon
	} = data;

	appIcon = appIcon || 'https://react.semantic-ui.com/images/wireframe/image.png';
	name = name ? truncateExcess(name, 40) : 'Untitled';
	description = description ? truncateExcess(description, 96) : 'No description';
	contentType = contentType || 'Type N/A';
	subject = subject || 'Subject N/A';
	language = (language && language.length !== 0) ? language.join(', ') : 'Language N/A';
	creator = creator || 'Creator N/A';
	size = size ? formatBytes(size, 1) : 'Size N/A';

	const about = [
		'',
		contentType,
		subject,
		// language,
		creator,
		size
	].join(' \u2027 ');


	return (
		<Segment basic>
			<Header as='h2'>
				<Image rounded spaced='right' src={appIcon} />
				<Header.Content>
					{name}
					<span style={{ color: 'grey', display: 'inline', fontSize: '16px', justifyItems: 'center' }}>{about.toString()}</span>
					<Header.Subheader>{description}</Header.Subheader>
				</Header.Content>
			</Header>
		</Segment>
	);
}

function renderRow(data, key) {
	return (
		<Table.Row key={key}>
			<Table.Cell collapsing>
				{/* <Checkbox style={{ width: '20px' }} /> */}

				<Statistic size='tiny'>
					<Statistic.Value>{(key+1) + '.'}</Statistic.Value>
				</Statistic>
			</Table.Cell>

			<Table.Cell>
				{renderDetailsCard(data)}
			</Table.Cell>

			<Table.Cell collapsing>

				<a href={data.downloadUrl} download>
					<Icon name='cloud download' size='huge' color='blue' />
				</a>
			</Table.Cell>
		</Table.Row>
	);
}
	
function renderBody(content) {
	const rows = content.map((item, index) => renderRow(item, index));

	return (
		<Table.Body>
			{rows}
		</Table.Body>
	);
}

// function renderHeader() {
// 	return (
// 		<Table.Header>
// 			<Table.Row>
// 				<Table.HeaderCell colSpan='3'>Results</Table.HeaderCell>
// 			</Table.Row>
// 		</Table.Header>
// 	);
// }

function renderTable(content) {
	// const header = renderHeader(content);
	const body = renderBody(content);

	return (
		<Table className='ui very basic table' striped>
			{/* {header} */}
			{body}
		</Table>
	);
}

function renderNoResultsFound(query) {
	return (
		<div style={{ paddingTop: '16vh' }}>
			<Icon name='search' size='massive'/>
			<h2>No results found for "{query}".</h2>
		</div>
	);
}

function ContentArea(props) {
	const {
		content,
		loading,
		count,
		query
	} = props;

	return (
		<Segment
			padded
			textAlign='center'
			loading={loading}
			style={styles.parent}
		>
			{
				count > 0
					? renderTable(content)
					: renderNoResultsFound(query)
			}
		</Segment>
	);
}

export default ContentArea;