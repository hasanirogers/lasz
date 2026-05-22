export default {
	label: {
		type: 'string',
		source: 'html',
      	selector: 'span'
	},
	type: {
		type: 'string',
	},
	outlined: {
		type: 'boolean',
		default: false
	},
	iconLeft: {
		type: 'string',
	},
	iconRight: {
		type: 'string'
	},
	iconSize: {
		type: 'string',
		default: '24'
	},
	disabled: {
		type: 'boolean',
		default: false
	},
	link: {
		type: 'string',
		default: '',
	},
	customIconLeft: {
		type: 'string',
		default: '',
	},
	customIconRight: {
		type: 'string',
		default: '',
	}
};
