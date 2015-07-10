var React = require('react');

var Option = React.createClass({

	displayName: 'Value',

	propTypes: {
		label: React.PropTypes.string.isRequired,
		deletable: React.PropTypes.bool
	},

	blockEvent: function(event) {
		event.stopPropagation();
	},

	render: function() {
		var label = this.props.label;

		if (this.props.optionLabelClick) {
			label = (
				<a className="Select-item-label__a"
					onMouseDown={this.blockEvent}
					onTouchEnd={this.props.onOptionLabelClick}
					onClick={this.props.onOptionLabelClick}>
					{label}
				</a>
			);
		}
		
		if(this.props.deletable){
			var removeIcon = (<span className="Select-item-icon"
								onMouseDown={this.blockEvent}
								onClick={this.props.onRemove}
								onTouchEnd={this.props.onRemove}>&times;</span>);
		}
		
		return (
			<div className="Select-item">
				{removeIcon}
				<span className="Select-item-label">{label}</span>
			</div>
		);
	}

});

module.exports = Option;
