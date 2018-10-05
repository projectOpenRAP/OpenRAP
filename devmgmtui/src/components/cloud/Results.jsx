import React from 'react';

import {
	Grid,
	Table,
	Checkbox,
	Icon,
	Header,
	Input
} from 'semantic-ui-react';

// TODO Check how to fetch more than 99 search hits. Possible limit on the content being returned.

const styles = {
	parent: {
		backgroundColor: 'white',
		marginTop: '0px',
		marginLeft: '8px',
		padding: '0px 0px 16px 0px'
	}
};

function getKeysToDisplay() {
	return ['name', 'description', 'size', 'appIcon'];
}

function renderHeaderRow(headings) {
	const keysToDisplay = getKeysToDisplay();
	const headerCells = headings
		.filter(heading => keysToDisplay.indexOf(heading) !== -1)
		.map((heading, index) => (<Table.HeaderCell key={index}>{heading}</Table.HeaderCell>));
	
	return (
		<Table.Row>
			<Table.HeaderCell />
			{headerCells}
		</Table.Row>
	);
}

function renderHeader(content) {
	const headings = Object.keys(content[0]);

	return (
		<Table.Header>
			{renderHeaderRow(headings)}
		</Table.Header>
	);
}

function renderBodyRow(dataObj, key) {
	const keysToDisplay = getKeysToDisplay();
	const dataCells = Object.keys(dataObj)
		.filter(key => keysToDisplay.indexOf(key) !== -1)
		.map((key, index) => (<Table.Cell key={index}>{dataObj[key]}</Table.Cell>));
	
	return (
		<Table.Row key={key}>
			<Table.Cell collapsing>
				<Checkbox />
			</Table.Cell>
			{dataCells}
		</Table.Row>
	);
}

function renderBody(data) {
	const dataRows = data.map((item, index) => renderBodyRow(item, index));

	return (
		<Table.Body>
			{dataRows}
		</Table.Body>
	);
}

function renderTable(content) {
	const header = renderHeader(content);
	const body = renderBody(content);

	return (
		<Table compact celled>
			{header}
			{body}
		</Table>
	);
}

function ResultSection(props) {
	const { content } = props;

	return (
		<Grid.Column stretched width={12} style={styles.parent}>
			{ content && renderTable(content) }
		</Grid.Column>
	);
}

export default ResultSection;