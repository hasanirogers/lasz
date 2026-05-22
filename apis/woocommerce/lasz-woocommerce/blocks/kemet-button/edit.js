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
import { RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl, TextControl, TextareaControl  } from '@wordpress/components';
import { RawHTML } from '@wordpress/element';


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

import * as React from 'react';
import { createComponent } from '@lit/react';
import HTMLElementKemetButton from 'kemet-ui/elements/button';
import HTMLElementKemetIconBootstrap from 'kemet-ui/elements/icon-bootstrap';


export const KemetButton = createComponent({
	tagName: 'kemet-button',
	elementClass: HTMLElementKemetButton,
	react: React,
});

export const KemetIcon = createComponent({
	tagName: 'kemet-icon-bootstrap',
	elementClass: HTMLElementKemetIconBootstrap,
	react: React,
});


const Edit = ({ attributes, setAttributes }) => {
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

	return ([
		<InspectorControls key="kemet-button" style={{ marginBottom: '40px' }}>
			<PanelBody title={'Properties'}>
				<TextControl label="Link" value={link} onChange={(newLink) => setAttributes({ link: newLink})} />
				<SelectControl
					label="Type"
					value={type}
					options={ [
							{ label: 'Standard', value: 'standard' },
							{ label: 'Text', value: 'text' },
							{ label: 'Circle', value: 'circle' },
							{ label: 'Rounded', value: 'rounded' },
							{ label: 'Pill', value: 'pill' },
					] }
					onChange={(newType) => setAttributes({ type: newType })}
					__nextHasNoMarginBottom
				/>

				<ToggleControl
					label="Outlined"
					help={outlined ? 'Is outlined.' : 'Not outlined.' }
					checked={outlined}
					onChange={(state) => setAttributes({ outlined: state })}
				/>

				<TextControl label="Icon Left" value={iconLeft} onChange={(newIconLeft) => setAttributes({ iconLeft: newIconLeft})} />
				<TextControl label="Icon Right" value={iconRight} onChange={(newIconRight) => setAttributes({ iconRight: newIconRight})} />
				<TextControl label="Icon SIze" value={iconSize} onChange={(newIconSize) => setAttributes({ iconSize: newIconSize})} />

				<ToggleControl
					label="Disabled"
					help={disabled ? 'Is disabled.' : 'Not disabled.' }
					checked={disabled}
					onChange={(state) => setAttributes({ disabled: state })}
				/>

				<TextareaControl
					label="Custom left icon."
					help="Enter the svg for a custom icon."
					value={customIconLeft}
					onChange={(newSVG) => setAttributes({ customIconLeft: newSVG} )}
        		/>

				<TextareaControl
					label="Custom right icon."
					help="Enter the svg for a custom icon."
					value={customIconRight}
					onChange={(newSVG) => setAttributes({ customIconRight: newSVG} )}
        		/>
			</PanelBody>
		</InspectorControls>,
		// Note: the edit function needs a react wrapper for web components
		<KemetButton key="test" variant={type} outlined={outlined} disabled={disabled} link={link}>
			{makeIconLeft()}
			<RichText key="editable" tagName="span" placeholder="Button Text" value={label} onChange={(newLabel) => setAttributes({ label: newLabel })} />
			{makeIconRight()}
		</KemetButton>
	]);
}

export default Edit;
