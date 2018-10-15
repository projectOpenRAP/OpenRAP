import React from 'react';

import { Grid, Button } from 'semantic-ui-react';

function DownloadSection(props) {
	const styles = {
		parent: {
			margin: '0'
		}
	};

	return (
		<Grid.Column stretched width={4} style={styles.parent}>
			<Button onClick={props.handleDownload}> Download </Button>
		</Grid.Column>
	);
}

export default DownloadSection;