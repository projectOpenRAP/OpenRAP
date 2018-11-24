import React from 'react';

import { Segment, Table, Checkbox, Icon, Image, Header, Statistic, Button } from 'semantic-ui-react';

import './cloud.css';

const styles = {
	parent: {
		overflowY: 'scroll'
	},
	about: {
		color: 'grey',
		display: 'inline',
		fontSize: '16px',
		justifyItems: 'center'
	},
	noResults: {
		paddingTop: '16vh'
	}
};

function truncateExcess(text, threshold = 147) {
	const suffix = text.length > threshold ? '...' : '';
	return `${text.substring(0, threshold)}${suffix}`;
}

function formatBytes(bytes = 0, decimals) {
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
				<Image rounded spaced='right' src={`data:image/jpeg;base64,${appIcon}`} alt='app_icon' />
				<Header.Content>
					{name}
					<span style={styles.about}>{about.toString()}</span>
					<Header.Subheader>{description}</Header.Subheader>
				</Header.Content>
			</Header>
		</Segment>
	);
}

function renderRow(data, key, handleDownload) {
	const {	
		name,
		size,
		downloadUrl,
		contentType,
		identifier,
		pkgVersion
	} = data;

	return (
		data && 
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
					<Button 
						primary
						basic
						icon='download'
						size='massive'
						onClick={() => handleDownload(name, formatBytes(size, 1), downloadUrl, contentType, identifier, pkgVersion, true)}
					/>
				</Table.Cell>
			</Table.Row>
	);
}
	
function renderBody(content, handleDownload) {
	const rows = content.map((item, index) => renderRow(item, index, handleDownload));

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

function renderTable(content, handleDownload) {
	// const header = renderHeader(content);
	const body = renderBody(content, handleDownload);

	return (
		<Table className='ui very basic table' striped>
			{/* {header} */}
			{body}
		</Table>
	);
}

function renderNoResultsFound(query) {
	return (
		<div style={styles.noResults}>
			<Icon name='search' size='massive'/>
			<h2>No results found for "{query}"</h2>
		</div>
	);
}

function ContentArea(props) {
	const {
		content,
		loading,
		count,
		query,

		handleDownload
	} = props;

	const hasContent = count > 0 && content && content.length > 0;

	return (
		<Segment
			padded
			textAlign='center'
			loading={loading}
			style={styles.parent}
		>
			{
				hasContent
					? renderTable(content, handleDownload)
					: renderNoResultsFound(query)
			}
		</Segment>
	);
}

export default ContentArea;