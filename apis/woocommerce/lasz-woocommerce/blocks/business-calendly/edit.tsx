import React from 'react';
// import '../../src/elements/business-calendly/business-calendly';

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

import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
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
 * @return {Element} Element to render.
 */

const Edit = ({ attributes, setAttributes }) => {
	const { url, minWidth, height } = attributes;
  const blockProps = useBlockProps();

	return (
    <>
      <InspectorControls>
        <PanelBody title={'Attributes'}>
          <TextControl label="URL" value={url} onChange={(newURL) => setAttributes({ url: newURL })} />
          <TextControl label="Min Width" value={minWidth} onChange={(newMinWidth) => setAttributes({ minWidth: newMinWidth })} />
          <TextControl label="Height" value={height} onChange={(newHeight) => setAttributes({ height: newHeight })} />
        </PanelBody>
      </InspectorControls>,
      <business-calendly mode="edit" {...blockProps} class="block-editor-rich-text__editable block-editor-block-list__block wp-block wp-block-paragraph rich-text"></business-calendly>
	  </>
  );
}

export default Edit;
