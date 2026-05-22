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
import { InnerBlocks, InspectorControls, MediaUpload, ColorPalette } from '@wordpress/block-editor';
import { PanelBody, TextControl, IconButton, ToggleControl  } from '@wordpress/components';

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
const Edit = ({attributes, setAttributes}) => {
  const { width, backgroundColor, className } = attributes;
  const contentStyles = width ? { width } : null;

  console.log(attributes);

  return ([
    <InspectorControls key="business-hero-controls" style={{ marginBottom: '40px' }}>
      <PanelBody title={ 'Settings' }>
        <TextControl label="Width" value={ width } onChange={(state) => setAttributes({ width: state})} />
        <TextControl label="Background" value={backgroundColor} onChange={(state) => setAttributes({ backgroundColor: state })} />
        <p><strong>Background Color:</strong></p>
        <ColorPalette value={backgroundColor} onChange={(state) => setAttributes({ backgroundColor: state })} />
      </PanelBody>
    </InspectorControls>,
    <business-page-container className={className} key="business-page-container" style={{backgroundColor}}>
      <div style={contentStyles}>
        <InnerBlocks />
      </div>
    </business-page-container>
  ]);
}

export default Edit;
