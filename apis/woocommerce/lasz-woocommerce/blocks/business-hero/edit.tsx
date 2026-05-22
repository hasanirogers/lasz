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
const Edit = ({ attributes, setAttributes }) => {
	const { height, overlayColor, overlayValue, backgroundID, backgroundImage, containWidth } = attributes;

    const template = [
      [ 'core/heading', { placeholder: 'Add a heading.' } ],
      [ 'core/paragraph', { placeholder: 'Enter a some descriptive text.' } ]
    ];

    const backgroundValue = backgroundImage ? `url(${backgroundImage})` : 'none';

		const handleBackgroundImage = (newMedia) => {
			setAttributes({ backgroundID: newMedia.id });
			setAttributes({ backgroundImage: newMedia.sizes.full.url });
			setAttributes({ backgroundImageMobile: newMedia.sizes.large.url });
		}

    return ([
      <InspectorControls key="business-hero-controls" style={{ marginBottom: '40px' }}>
        <PanelBody title={ 'Background Settings' }>
          <TextControl label="Height" value={ height } onChange={(state) => setAttributes({ height: state})} />
          <p><strong>Select a Background Image:</strong></p>
          <MediaUpload
            onSelect={(newMedia) => handleBackgroundImage(newMedia)}
            type="image"
            value={backgroundID}
            render={({open}) => (
              <IconButton
                className="editor-media-placeholder__button is-button is-default is-large"
                icon="upload"
                onClick={open}>
                Background Image
              </IconButton>
            )}
          />
        </PanelBody>
        <PanelBody title={'Overlay Settings'}>
          <TextControl label="Overlay Value" value={overlayValue} onChange={(newOverlayValue) => setAttributes({ overlayValue: newOverlayValue })} />
          <p><strong>Overlay Color:</strong></p>
          <ColorPalette value={overlayColor} onChange={(newOverlayColor) => setAttributes({ overlayColor: newOverlayColor })} />
        </PanelBody>
        <PanelBody title={'Content'}>
          <ToggleControl
            label="Apply max-width to content."
            help={
              containWidth
                ? 'Max width applied.'
                : 'Max width not applied.'
            }
            checked={containWidth}
            onChange={(state) => setAttributes({ containWidth: state })}
          />
        </PanelBody>
      </InspectorControls>,
      <business-hero key="business-hero" style={{ height, backgroundImage: backgroundValue }}>
        <div className={`container ${containWidth ? 'max': ''}`}>
          <InnerBlocks template={template} templateLock={false} />
        </div>
        <div className="overlay" style={{ backgroundColor: overlayColor, opacity: overlayValue }}></div>
      </business-hero>
    ]);
}

export default Edit;
