/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
 import { InnerBlocks } from '@wordpress/block-editor';

 /**
  * The save function defines the way in which the different attributes should
  * be combined into the final markup, which is then serialized by the block
  * editor into `post_content`.
  *
  * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
  *
  * @return {WPElement} Element to render.
  */
 const Save = ({attributes}) => {
	 const { height, overlayColor, overlayValue, backgroundImage, backgroundImageMobile, containWidth } = attributes;

	 return (
		<business-hero large={backgroundImageMobile} full={backgroundImage} style={{ height, display: 'block' }}>
			<div className={`container ${containWidth ? 'max': ''}`}>
				<InnerBlocks.Content />
			</div>
			<div className="overlay" style={{ backgroundColor: overlayColor, opacity: overlayValue }}></div>
		</business-hero>
	 );
 }

 export default Save;
