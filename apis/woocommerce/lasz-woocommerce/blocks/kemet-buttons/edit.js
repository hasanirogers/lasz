/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';

import { PanelBody, TextControl } from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
const Edit = ({ attributes, setAttributes }) => {
	const { marginTop, marginRight, marginBottom, marginLeft } = attributes;

	const template = [
		['core/group', {"layout": {"type":"flex", "flexWrap":"nowrap", "justifyContent":"center"}}, [
			['core/columns', {}, [['business-blocks/kemet-button'], ['business-blocks/kemet-button']]]
		]]
	];

	return ([
		<InspectorControls key="kemet-buttons" style={{ marginBottom: '40px' }}>
			<PanelBody title={ 'Margin Settings' }>
          <TextControl
            label="Margin Top"
						value={marginTop}
						onChange={(newMargin) => setAttributes({ marginTop: newMargin })}
          />
					<TextControl
            label="Margin Right"
						value={marginRight}
						onChange={(newMargin) => setAttributes({ marginRight: newMargin })}
          />
					<TextControl
            label="Margin Bottom"
						value={marginBottom}
						onChange={(newMargin) => setAttributes({ marginBottom: newMargin })}
          />
					<TextControl
            label="Margin Left"
						value={marginLeft}
						onChange={(newMargin) => setAttributes({ marginLeft: newMargin })}
          />
			</PanelBody>
		</InspectorControls>,
		<div key="test1">
			<InnerBlocks template={template} templateLock={false}  />
		</div>
	]);
}

export default Edit;
