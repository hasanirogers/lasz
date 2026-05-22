import { useBlockProps } from '@wordpress/block-editor';

const Save = ({attributes}) => {
	const { url, width, height } = attributes;
	const blockProps = useBlockProps.save();

	return (
		<business-map {...blockProps}>
			<iframe src={ url } width={ width } height={ height }  style={{ border:'0' }} allowfullscreen="" loading="lazy"></iframe>
		</business-map>
	);
}

export default Save;
