/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { RichText } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */


const Save = ({ attributes }) => {
	const { label, type, outlined, iconLeft, iconRight, iconSize, disabled, link, customIconLeft, customIconRight } = attributes;
	const htmlToElement = (html) => RawHTML({ children: html });

	const makeIconLeft = () => {
		if (customIconLeft !== '') {
			return <div slot="left">{htmlToElement(customIconLeft)}</div>;
		}

		return iconLeft && iconLeft !== ''
			? <kemet-icon slot="left" icon={iconLeft} size={iconSize}></kemet-icon>
			: null;
	}

	const makeIconRight = () => {
		if (customIconRight !== '') {
			return <div slot="right">{htmlToElement(customIconRight)}</div>;
		}

		return iconRight && iconRight !== ''
			? <kemet-icon slot="right" icon={iconRight} size={iconSize}></kemet-icon>
			: null;
	}

	// Note: the save function needs the raw html for its function
	// Note: The weird syntax conditionally renders the attributes
	return (
		<kemet-button variant={type} {...(outlined && { outlined: '' })} disabled={disabled} {...(link !== '' && { link: link })}>
			{makeIconLeft()}
			<RichText.Content tagName="span" value={label} />
			{makeIconRight()}
		</kemet-button>
	);
}

export default Save;
