var React = require('react');
var classes = require('classnames');

var Value = React.createClass({

	displayName: 'Value',

	propTypes: {
		disabled: React.PropTypes.bool,                   // disabled prop passed to ReactSelect
		onOptionLabelClick: React.PropTypes.func,         // method to handle click on value label
		onRemove: React.PropTypes.func,                   // method to handle remove of that value
		option: React.PropTypes.object.isRequired,        // option passed to component
		optionLabelClick: React.PropTypes.bool,           // indicates if onOptionLabelClick should be handled
		renderer: React.PropTypes.func,                   // method to render option label passed to ReactSelect
		deletable: React.PropTypes.bool,					  // indicates if the value can be deleted
		overlay: React.PropTypes.node,               // Popover overlay for deletable X icon
		isItemDeletable: React.PropTypes.func // method to individually check if an item is deletable
	},

	blockEvent (event) {
		event.stopPropagation();
	},

	handleOnRemove (event) {
		if (!this.props.disabled) {
			this.props.onRemove(event);
		}
	},

	getInitialState () {
		return {
			popOverOpen: false
		};
	},

	_showPopover () {
		this.setState({ popOverOpen: true });
	},

	_hidePopover () {
		this.setState({ popOverOpen: false });
	},

	render () {
		var label = this.props.option.label;
		if (this.props.renderer) {
			label = this.props.renderer(this.props.option);
		}

		if (!this.props.onRemove && !this.props.optionLabelClick) {
			return React.createElement(
				'div',
				{
					className: classes('Select-value', this.props.option.className),
					style: this.props.option.style,
					title: this.props.option.title
				},
				label
			);
		}

		if (this.props.optionLabelClick) {
			label = React.createElement(
				'a',
				{ className: classes('Select-item-label__a', this.props.option.className),
					onMouseDown: this.blockEvent,
					onTouchEnd: this.props.onOptionLabelClick,
					onClick: this.props.onOptionLabelClick,
					style: this.props.option.style,
					title: this.props.option.title },
				label
			);
		}

		var removeIcon;
		var popOverContent = this.state.popOverOpen ? this.props.overlay : null;
		if ((this.props.isItemDeletable && this.props.isItemDeletable(this.props.option)) || this.props.deletable) {
			removeIcon = React.createElement(
				'span',
				{ className: 'Select-item-icon',
					onMouseDown: this.blockEvent,
					onMouseEnter: this._showPopover,
					onMouseLeave: this._hidePopover,
					onClick: this.handleOnRemove,
					onTouchEnd: this.handleOnRemove },
				'×'
			);
		}

		return React.createElement(
			'div',
			{ className: classes('Select-item', this.props.option.className),
				style: this.props.option.style,
				title: this.props.option.title,
				onMouseOut: this._hidePopover },
			popOverContent,
			removeIcon,
			React.createElement(
				'span',
				{ className: 'Select-item-label' },
				label
			)
		);
	}

});

module.exports = Value;
