import React from 'react';

import { Grid, Icon, Header, Input } from 'semantic-ui-react';

function SearchBar(props) {
	const searchHeading = 'Search for Collections, Workbooks, Stories and more';
	
	const styles = {
		parent: {
			height: '16em',
			backgroundColor: 'white'
		},

		leftCol: {
			backgroundColor: 'white'
		},

		header: {
			padding: '48px 0px 0px 64px',
			margin: '0px',
			fontWeight: 'normal'
		},

		input: {
			border: 'none',
			borderRadius: '0px',
			fontSize: '72px',
			fontWeight: 'bold',
			padding: '0px 0px 0px 56px'
		},

		rightCol: {
			backgroundColor: 'white'
		}
	};

	return (
		<Grid.Row columns={2} style={styles.parent}>
			<Grid.Column width={14} style={styles.leftCol}>
				<Header size='huge' style={styles.header}>
					{searchHeading}
				</Header>
				
				<Input
					input={<input style={styles.input} />}
					value={props.input}
					onChange={props.handleInputChange}
					onKeyUp={props.handleKeyUp}
					fluid
					placeholder='Start typing...'
				/>
			</Grid.Column>

			<Grid.Column
				width={2}
				textAlign='center'
				verticalAlign='middle'
				style={styles.rightCol}
			>
				<Icon
					name='search'
					fitted
					size='huge'
					onClick={props.handleClick}
				/>
			</Grid.Column>
		</Grid.Row>
	);
}

export default SearchBar;