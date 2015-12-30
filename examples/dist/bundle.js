require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var Option = React.createClass({
	displayName: 'Option',

	propTypes: {
		addLabelText: React.PropTypes.string, // string rendered in case of allowCreate option passed to ReactSelect
		className: React.PropTypes.string, // className (based on mouse position)
		mouseDown: React.PropTypes.func, // method to handle click on option element
		mouseEnter: React.PropTypes.func, // method to handle mouseEnter on option element
		mouseLeave: React.PropTypes.func, // method to handle mouseLeave on option element
		option: React.PropTypes.object.isRequired, // object that is base for that option
		renderFunc: React.PropTypes.func // method passed to ReactSelect component to render label text
	},
	blockEvent: function blockEvent(event) {
		event.preventDefault();
		if (event.target.tagName !== 'A' || !('href' in event.target)) {
			return;
		}

		if (event.target.target) {
			window.open(event.target.href);
		} else {
			window.location.href = event.target.href;
		}
	},
	handleMouseDown: function handleMouseDown(e) {
		this.props.mouseDown(this.props.option, e);
	},
	handleMouseEnter: function handleMouseEnter(e) {
		this.props.mouseEnter(this.props.option, e);
	},
	handleMouseLeave: function handleMouseLeave(e) {
		this.props.mouseLeave(this.props.option, e);
	},
	render: function render() {
		var option = this.props.option;
		var label = option.create ? this.props.addLabelText.replace('{label}', option.label) : this.props.renderFunc(option);
		var optionClasses = classes(this.props.className, option.className);

		return option.disabled ? React.createElement(
			'div',
			{ className: optionClasses,
				onMouseDown: this.blockEvent,
				onClick: this.blockEvent },
			label
		) : React.createElement(
			'div',
			{ className: optionClasses,
				style: option.style,
				onMouseDown: this.handleMouseDown,
				onMouseEnter: this.handleMouseEnter,
				onMouseLeave: this.handleMouseLeave,
				onClick: this.handleMouseDown,
				title: option.title },
			label
		);
	}
});

module.exports = Option;

},{"classnames":undefined,"react":undefined}],2:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var SingleValue = React.createClass({
	displayName: 'SingleValue',

	propTypes: {
		placeholder: React.PropTypes.string, // this is default value provided by React-Select based component
		value: React.PropTypes.object // selected option
	},
	render: function render() {
		var classNames = classes('Select-placeholder', this.props.value && this.props.value.className);
		return React.createElement(
			'div',
			{
				className: classNames,
				style: this.props.value && this.props.value.style,
				title: this.props.value && this.props.value.title
			},
			this.props.placeholder
		);
	}
});

module.exports = SingleValue;

},{"classnames":undefined,"react":undefined}],3:[function(require,module,exports){
'use strict';

var React = require('react');
var classes = require('classnames');

var Value = React.createClass({

	displayName: 'Value',

	propTypes: {
		disabled: React.PropTypes.bool, // disabled prop passed to ReactSelect
		onOptionLabelClick: React.PropTypes.func, // method to handle click on value label
		onRemove: React.PropTypes.func, // method to handle remove of that value
		option: React.PropTypes.object.isRequired, // option passed to component
		optionLabelClick: React.PropTypes.bool, // indicates if onOptionLabelClick should be handled
		renderer: React.PropTypes.func, // method to render option label passed to ReactSelect
		deletable: React.PropTypes.bool // indicates if the value can be deleted
	},

	blockEvent: function blockEvent(event) {
		event.stopPropagation();
	},

	handleOnRemove: function handleOnRemove(event) {
		if (!this.props.disabled) {
			this.props.onRemove(event);
		}
	},

	render: function render() {
		var label = this.props.option.label;
		if (this.props.renderer) {
			label = this.props.renderer(this.props.option);
		}

		if (!this.props.onRemove && !this.props.optionLabelClick) {
			return React.createElement('div', {
				className: classes('Select-value', this.props.option.className),
				style: this.props.option.style,
				title: this.props.option.title
			}, label);
		}

		if (this.props.optionLabelClick) {
			label = React.createElement('a', { className: classes('Select-item-label__a', this.props.option.className),
				onMouseDown: this.blockEvent,
				onTouchEnd: this.props.onOptionLabelClick,
				onClick: this.props.onOptionLabelClick,
				style: this.props.option.style,
				title: this.props.option.title }, label);
		}

		var removeIcon;
		if (this.props.deletable) {
			removeIcon = React.createElement('span', { className: 'Select-item-icon',
				onMouseDown: this.blockEvent,
				onClick: this.handleOnRemove,
				onTouchEnd: this.handleOnRemove }, '×');
		}

		return React.createElement('div', { className: classes('Select-item', this.props.option.className),
			style: this.props.option.style,
			title: this.props.option.title }, removeIcon, React.createElement('span', { className: 'Select-item-label' }, label));
	}

});

module.exports = Value;

},{"classnames":undefined,"react":undefined}],"react-select":[function(require,module,exports){
/* disable some rules until we refactor more completely; fixing them now would
   cause conflicts with some open PRs unnecessarily. */
/* eslint react/jsx-sort-prop-types: 0, react/sort-comp: 0, react/prop-types: 0 */

'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _extends = Object.assign || function (target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
		}
	}return target;
};

var React = require('react');
var ReactDOM = require('react-dom');
var Input = require('react-input-autosize');
var classes = require('classnames');
var Value = require('./Value');
var SingleValue = require('./SingleValue');
var Option = require('./Option');

var requestId = 0;

var Select = React.createClass({

	displayName: 'Select',
	valueKeyId: 0,

	propTypes: {
		addLabelText: React.PropTypes.string, // placeholder displayed when you want to add a label on a multi-value input
		allowCreate: React.PropTypes.bool, // whether to allow creation of new entries
		asyncOptions: React.PropTypes.func, // function to call to get options
		autoload: React.PropTypes.bool, // whether to auto-load the default async options set
		backspaceRemoves: React.PropTypes.bool, // whether backspace removes an item if there is no text input
		cacheAsyncResults: React.PropTypes.bool, // whether to allow cache
		className: React.PropTypes.string, // className for the outer element
		clearAllText: React.PropTypes.string, // title for the "clear" control when multi: true
		clearValueText: React.PropTypes.string, // title for the "clear" control
		clearable: React.PropTypes.bool, // should it be possible to reset value
		delimiter: React.PropTypes.string, // delimiter to use to join multiple values
		disabled: React.PropTypes.bool, // whether the Select is disabled or not
		filterOption: React.PropTypes.func, // method to filter a single option  (option, filterString)
		filterOptions: React.PropTypes.func, // method to filter the options array: function ([options], filterString, [values])
		ignoreCase: React.PropTypes.bool, // whether to perform case-insensitive filtering
		inputProps: React.PropTypes.object, // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
		isLoading: React.PropTypes.bool, // whether the Select is loading externally or not (such as options being loaded)
		labelKey: React.PropTypes.string, // path of the label value in option objects
		list: React.PropTypes.bool, // list-value input
		matchPos: React.PropTypes.string, // (any|start) match the start or entire string when filtering
		matchProp: React.PropTypes.string, // (any|label|value) which option property to filter on
		multi: React.PropTypes.bool, // multi-value input
		name: React.PropTypes.string, // field name, for hidden <input /> tag
		newOptionCreator: React.PropTypes.func, // factory to create new options when allowCreate set
		noResultsText: React.PropTypes.string, // placeholder displayed when there are no matching search results
		onBlur: React.PropTypes.func, // onBlur handler: function (event) {}
		onChange: React.PropTypes.func, // onChange handler: function (newValue) {}
		onFocus: React.PropTypes.func, // onFocus handler: function (event) {}
		onInputChange: React.PropTypes.func, // onInputChange handler: function (inputValue) {}
		onOptionLabelClick: React.PropTypes.func, // onCLick handler for value labels: function (value, event) {}
		optionComponent: React.PropTypes.func, // option component to render in dropdown
		optionRenderer: React.PropTypes.func, // optionRenderer: function (option) {}
		options: React.PropTypes.array, // array of options
		placeholder: React.PropTypes.string, // field placeholder, displayed when there's no value
		searchable: React.PropTypes.bool, // whether to enable searching feature or not
		searchingText: React.PropTypes.string, // message to display whilst options are loading via asyncOptions
		searchPromptText: React.PropTypes.string, // label to prompt for search input
		singleValueComponent: React.PropTypes.func, // single value component when multiple is set to false
		value: React.PropTypes.any, // initial field value
		valueComponent: React.PropTypes.func, // value component to render in multiple mode
		valueKey: React.PropTypes.string, // path of the label value in option objects
		valueRenderer: React.PropTypes.func, // valueRenderer: function (option) {}

		/* New for wizeline react-select */
		listReadOnlyMode: React.PropTypes.bool, // Non editable list mode currently implemented for List select only
		maxMultiSelection: React.PropTypes.number, // Number of maximum allowed options to select on multi mode
		replaceIfMax: React.PropTypes.bool, // Replace selected values if max selection number is reached
		clearValuesOnEsc: React.PropTypes.bool // if true pressing esc when the selector is focused and closed will clear selected values
	},

	getDefaultProps: function getDefaultProps() {
		return {
			addLabelText: 'Add "{label}"?',
			allowCreate: false,
			asyncOptions: undefined,
			autoload: true,
			backspaceRemoves: true,
			cacheAsyncResults: true,
			className: undefined,
			clearAllText: 'Clear all',
			clearValueText: 'Clear value',
			clearable: true,
			delimiter: ',',
			disabled: false,
			ignoreCase: true,
			inputProps: {},
			isLoading: false,
			labelKey: 'label',
			matchPos: 'any',
			matchProp: 'any',
			name: undefined,
			newOptionCreator: undefined,
			noResultsText: 'No results found',
			onChange: undefined,
			onInputChange: undefined,
			onOptionLabelClick: undefined,
			optionComponent: Option,
			options: undefined,
			placeholder: 'Select...',
			searchable: true,
			searchingText: 'Searching...',
			searchPromptText: 'Type to search',
			singleValueComponent: SingleValue,
			value: undefined,
			valueComponent: Value,
			valueKey: 'value',

			/* new for wizeline react-select */
			listReadOnlyMode: false,
			maxMultiSelection: -1,
			replaceIfMax: false,
			clearValuesOnEsc: false
		};
	},

	getInitialState: function getInitialState() {
		return {
			/*
    * set by getStateFromValue on componentWillMount:
    * - value
    * - values
    * - filteredOptions
    * - inputValue
    * - placeholder
    * - focusedOption
   */
			isFocused: false,
			isLoading: false,
			isOpen: false,
			options: this.props.options,
			isReadOnly: this.props.listReadOnlyMode
		};
	},

	componentWillMount: function componentWillMount() {
		var _this = this;

		this._optionsCache = {};
		this._optionsFilterString = '';
		this._closeMenuIfClickedOutside = function (event) {
			if (!_this.state.isOpen) {
				return;
			}
			var menuElem = ReactDOM.findDOMNode(_this.refs.selectMenuContainer);
			var controlElem = ReactDOM.findDOMNode(_this.refs.control);

			var eventOccuredOutsideMenu = _this.clickedOutsideElement(menuElem, event);
			var eventOccuredOutsideControl = _this.clickedOutsideElement(controlElem, event);

			// Hide dropdown menu if click occurred outside of menu
			if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
				_this.setState({
					isOpen: false
				}, _this._unbindCloseMenuIfClickedOutside);
			}
		};
		this._bindCloseMenuIfClickedOutside = function () {
			if (!document.addEventListener && document.attachEvent) {
				document.attachEvent('onclick', _this._closeMenuIfClickedOutside);
			} else {
				document.addEventListener('click', _this._closeMenuIfClickedOutside);
			}
		};
		this._unbindCloseMenuIfClickedOutside = function () {
			if (!document.removeEventListener && document.detachEvent) {
				document.detachEvent('onclick', _this._closeMenuIfClickedOutside);
			} else {
				document.removeEventListener('click', _this._closeMenuIfClickedOutside);
			}
		};
		this.setState(this.getStateFromValue(this.props.value));
	},

	componentDidMount: function componentDidMount() {
		if (this.props.asyncOptions && this.props.autoload) {
			this.autoloadAsyncOptions();
		}
	},

	componentWillUnmount: function componentWillUnmount() {
		clearTimeout(this._blurTimeout);
		clearTimeout(this._focusTimeout);
		if (this.state.isOpen) {
			this._unbindCloseMenuIfClickedOutside();
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(newProps) {
		var _this2 = this;

		var optionsChanged = false;
		if (newProps.options !== this.props.options) {
			optionsChanged = true;
			this.setState({
				options: newProps.options,
				filteredOptions: this.filterOptions(newProps.options)
			});
		}
		if (newProps.value !== this.state.value || newProps.placeholder !== this.props.placeholder || optionsChanged) {
			var setState = function setState(newState) {
				var stateChanges = _this2.getStateFromValue(newProps.value, newState && newState.options || newProps.options, newProps.placeholder);
				stateChanges.isLoading = false;
				delete stateChanges.inputValue;
				_this2.setState(stateChanges);
			};
			if (this.props.asyncOptions) {
				this.loadAsyncOptions(newProps.value, {}, setState);
			} else {
				setState();
			}
		}
	},

	componentDidUpdate: function componentDidUpdate() {
		var _this3 = this;

		if (!this.props.disabled && this._focusAfterUpdate) {
			clearTimeout(this._blurTimeout);
			clearTimeout(this._focusTimeout);
			this._focusTimeout = setTimeout(function () {
				if (!_this3.isMounted()) return;
				_this3.getInputNode().focus();
				_this3._focusAfterUpdate = false;
			}, 50);
		}
		if (this._focusedOptionReveal) {
			if (this.refs.focused && this.refs.menu) {
				var focusedDOM = ReactDOM.findDOMNode(this.refs.focused);
				var menuDOM = ReactDOM.findDOMNode(this.refs.menu);
				var focusedRect = focusedDOM.getBoundingClientRect();
				var menuRect = menuDOM.getBoundingClientRect();

				if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
					menuDOM.scrollTop = focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight;
				}
			}
			this._focusedOptionReveal = false;
		}
	},

	focus: function focus() {
		this.getInputNode().focus();
	},

	toggleEdit: function toggleEdit(readOnly) {
		this.setState({
			isReadOnly: readOnly
		});
	},

	clickedOutsideElement: function clickedOutsideElement(element, event) {
		var eventTarget = event.target ? event.target : event.srcElement;
		while (eventTarget != null) {
			if (eventTarget === element) return false;
			eventTarget = eventTarget.offsetParent;
		}
		return true;
	},

	getStateFromValue: function getStateFromValue(value, options, placeholder) {
		var _this4 = this;

		if (!options) {
			options = this.state.options;
		}
		if (!placeholder) {
			placeholder = this.props.placeholder;
		}

		// reset internal filter string
		this._optionsFilterString = '';

		var values = this.initValuesArray(value, options);
		var filteredOptions = this.filterOptions(options, values);
		var allowsMultiple = this.props.multi || this.props.list;

		var focusedOption;
		var valueForState = null;
		if (!allowsMultiple && values.length) {
			focusedOption = values[0];
			valueForState = values[0][this.props.valueKey];
		} else {
			focusedOption = this.getFirstFocusableOption(filteredOptions);
			valueForState = values.map(function (v) {
				return v[_this4.props.valueKey];
			}).join(this.props.delimiter);
		}
		return {
			value: valueForState,
			values: values,
			inputValue: '',
			filteredOptions: filteredOptions,
			placeholder: !allowsMultiple && values.length ? values[0][this.props.labelKey] : placeholder,
			focusedOption: focusedOption
		};
	},

	getFirstFocusableOption: function getFirstFocusableOption(options) {
		for (var optionIndex = 0; optionIndex < options.length; ++optionIndex) {
			if (!options[optionIndex].disabled) {
				return options[optionIndex];
			}
		}
	},

	initValuesArray: function initValuesArray(values, options) {
		var _this5 = this;

		if (!Array.isArray(values)) {
			if (typeof values === 'string') {
				values = values === '' ? [] : this.props.multi || this.props.list ? values.split(this.props.delimiter) : [values];
			} else {
				values = values !== undefined && values !== null ? [values] : [];
			}
		}
		return values.map(function (val) {
			if (typeof val === 'string' || typeof val === 'number') {
				var _ref;

				for (var key in options) {
					if (options.hasOwnProperty(key) && options[key] && (options[key][_this5.props.valueKey] === val || typeof options[key][_this5.props.valueKey] === 'number' && options[key][_this5.props.valueKey].toString() === val)) {
						return options[key];
					}
				}
				return _ref = {}, _defineProperty(_ref, _this5.props.valueKey, val), _defineProperty(_ref, _this5.props.labelKey, val), _ref;
			} else {
				return val;
			}
		});
	},

	setValue: function setValue(value, focusAfterUpdate) {
		if (focusAfterUpdate || focusAfterUpdate === undefined) {
			this._focusAfterUpdate = true;
		}
		var newState = this.getStateFromValue(value);
		newState.isOpen = false;
		this.fireChangeEvent(newState);
		this.setState(newState);
	},

	selectValue: function selectValue(value) {
		if (!this.props.multi && !this.props.list) {
			this.setValue(value);
		} else if (value) {
			this.addMultiSelectValue(value);
		}
		this._unbindCloseMenuIfClickedOutside();
	},

	addMultiSelectValue: function addMultiSelectValue(value) {
		if (this.props.maxMultiSelection > 0) {
			if (this.state.values.length + 1 > this.props.maxMultiSelection && this.props.replaceIfMax) {
				this.replaceValue(value);
			} else if (this.state.values.length + 1 <= this.props.maxMultiSelection) {
				this.addValue(value);
			}
		} else if (this.props.maxMultiSelection != 0) {
			this.addValue(value);
		}
	},

	addValue: function addValue(value) {
		this.setValue(this.state.values.concat(value));
	},

	replaceValue: function replaceValue(value) {
		var remainingValues = this.state.values.slice(0, this.state.values.length - 1);
		this.setValue(remainingValues.concat(value));
	},

	popValue: function popValue() {
		this.setValue(this.state.values.slice(0, this.state.values.length - 1));
	},

	removeValue: function removeValue(valueToRemove) {
		this.setValue(this.state.values.filter(function (value) {
			return value !== valueToRemove;
		}));
	},

	clearValue: function clearValue(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, ignore it.
		if (event && event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setValue(null);
	},

	resetValue: function resetValue() {
		this.setValue(this.state.value === '' ? null : this.state.value);
	},

	getInputNode: function getInputNode() {
		var input = this.refs.input;
		return this.props.searchable ? input : ReactDOM.findDOMNode(input);
	},

	fireChangeEvent: function fireChangeEvent(newState) {
		if (newState.value !== this.state.value && this.props.onChange) {
			this.props.onChange(newState.value, newState.values);
		}
	},

	handleMouseDown: function handleMouseDown(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}

		var isMultiLimitedAndOpen = this.props.maxMultiSelection > 0 && this.state.isOpen;
		var replaceIfMaxValueReached = this.state.values.length >= this.props.maxMultiSelection && this.props.replaceIfMax;
		// This event is called before the value is added to the state (just after a click on an option), so we count ahead
		var willReachMaxValue = this.state.values.length + 1 == this.props.maxMultiSelection;

		if (isMultiLimitedAndOpen && (replaceIfMaxValueReached || willReachMaxValue)) {
			this.closeDropdown();
			return;
		}

		event.stopPropagation();
		event.preventDefault();

		// for the non-searchable select, close the dropdown when button is clicked
		if (this.state.isOpen && !this.props.searchable) {
			this.setState({
				isOpen: false
			}, this._unbindCloseMenuIfClickedOutside);
			return;
		}

		if (this.state.isFocused) {
			this.setState({
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			this._openAfterFocus = true;
			this.getInputNode().focus();
		}
	},

	selectText: function selectText() {
		this.getInputNode().select();
	},

	handleMouseDownOnMenu: function handleMouseDownOnMenu(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
	},

	handleMouseDownOnArrow: function handleMouseDownOnArrow(event) {
		// if the event was triggered by a mousedown and not the primary
		// button, or if the component is disabled, ignore it.
		if (this.props.disabled || event.type === 'mousedown' && event.button !== 0) {
			return;
		}
		// If not focused, handleMouseDown will handle it
		if (!this.state.isOpen) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.setState({
			isOpen: false
		}, this._unbindCloseMenuIfClickedOutside);
	},

	handleInputFocus: function handleInputFocus(event) {
		var _this6 = this;

		var newIsOpen = this.state.isOpen || this._openAfterFocus;
		this.setState({
			isFocused: true,
			isOpen: newIsOpen
		}, function () {
			if (newIsOpen) {
				_this6._bindCloseMenuIfClickedOutside();
			} else {
				_this6._unbindCloseMenuIfClickedOutside();
			}
		});
		this._openAfterFocus = false;
		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
	},

	handleInputBlur: function handleInputBlur(event) {
		var _this7 = this;

		var menuDOM = ReactDOM.findDOMNode(this.refs.menu);
		if (document.activeElement.isEqualNode(menuDOM)) {
			return;
		}
		this._blurTimeout = setTimeout(function () {
			if (_this7._focusAfterUpdate || !_this7.isMounted()) return;
			_this7.setState({
				inputValue: '',
				isFocused: false,
				isOpen: false
			});
		}, 50);
		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
	},

	handleKeyDown: function handleKeyDown(event) {
		if (this.props.disabled) return;
		switch (event.keyCode) {
			case 8:
				// backspace
				if (!this.state.inputValue && this.props.backspaceRemoves && !this.props.list) {
					event.preventDefault();
					this.popValue();
				}
				return;
			case 9:
				// tab
				if (event.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
					return;
				}
				this.selectFocusedOption();
				break;
			case 13:
				// enter
				if (!this.state.isOpen) return;
				this.selectFocusedOption();
				break;
			case 27:
				// escape
				if (this.state.isOpen) {
					this.resetValue();
				} else if (this.props.clearable && this.props.clearValuesOnEsc) {
					this.clearValue(event);
				}
				break;
			case 38:
				// up
				this.focusPreviousOption();
				break;
			case 40:
				// down
				this.focusNextOption();
				break;
			case 188:
				// ,
				if (this.props.allowCreate && this.props.multi) {
					event.preventDefault();
					event.stopPropagation();
					this.selectFocusedOption();
				} else {
					return;
				}
				break;
			default:
				return;
		}
		event.preventDefault();
	},

	// Ensures that the currently focused option is available in filteredOptions.
	// If not, returns the first available option.
	_getNewFocusedOption: function _getNewFocusedOption(filteredOptions) {
		for (var key in filteredOptions) {
			if (filteredOptions.hasOwnProperty(key) && filteredOptions[key] === this.state.focusedOption) {
				return filteredOptions[key];
			}
		}
		return this.getFirstFocusableOption(filteredOptions);
	},

	handleInputChange: function handleInputChange(event) {
		// assign an internal variable because we need to use
		// the latest value before setState() has completed.
		this._optionsFilterString = event.target.value;
		if (this.props.onInputChange) {
			this.props.onInputChange(event.target.value);
		}
		if (this.props.asyncOptions) {
			this.setState({
				isLoading: true,
				inputValue: event.target.value
			});
			this.loadAsyncOptions(event.target.value, {
				isLoading: false,
				isOpen: true
			}, this._bindCloseMenuIfClickedOutside);
		} else {
			var filteredOptions = this.filterOptions(this.state.options);
			this.setState({
				isOpen: true,
				inputValue: event.target.value,
				filteredOptions: filteredOptions,
				focusedOption: this._getNewFocusedOption(filteredOptions)
			}, this._bindCloseMenuIfClickedOutside);
		}
	},

	autoloadAsyncOptions: function autoloadAsyncOptions() {
		var _this8 = this;

		this.setState({
			isLoading: true
		});
		this.loadAsyncOptions('', { isLoading: false }, function () {
			// update with new options but don't focus
			_this8.setValue(_this8.props.value, false);
		});
	},

	loadAsyncOptions: function loadAsyncOptions(input, state, callback) {
		if (input === undefined) input = '';

		var _this9 = this;

		var thisRequestId = this._currentRequestId = requestId++;
		if (this.props.cacheAsyncResults) {
			for (var i = 0; i <= input.length; i++) {
				var cacheKey = input.slice(0, i);
				if (this._optionsCache[cacheKey] && (input && input.length && input[0] === cacheKey[0] || this._optionsCache[cacheKey].complete)) {
					var options = this._optionsCache[cacheKey].options;
					var filteredOptions = this.filterOptions(options);
					var newState = {
						options: options,
						filteredOptions: filteredOptions,
						focusedOption: this._getNewFocusedOption(filteredOptions)
					};
					for (var key in state) {
						if (state.hasOwnProperty(key)) {
							newState[key] = state[key];
						}
					}
					this.setState(newState);
					if (callback) callback.call(this, newState);
					return;
				}
			}
		}

		var optionsResponseHandler = function optionsResponseHandler(err, data) {
			if (err) throw err;
			if (_this9.props.cacheAsyncResults) {
				_this9._optionsCache[input] = data;
			}
			if (thisRequestId !== _this9._currentRequestId) {
				return;
			}
			var filteredOptions = _this9.filterOptions(data.options);
			var newState = {
				options: data.options,
				filteredOptions: filteredOptions,
				focusedOption: _this9._getNewFocusedOption(filteredOptions)
			};
			for (var key in state) {
				if (state.hasOwnProperty(key)) {
					newState[key] = state[key];
				}
			}
			_this9.setState(newState);
			if (callback) callback.call(_this9, newState);
		};

		var asyncOpts = this.props.asyncOptions(input, optionsResponseHandler);

		if (asyncOpts && typeof asyncOpts.then === 'function') {
			asyncOpts.then(function (data) {
				optionsResponseHandler(null, data);
			}, function (err) {
				optionsResponseHandler(err);
			});
		}
	},

	filterOptions: function filterOptions(options, values) {
		var _this10 = this;

		var filterValue = this._optionsFilterString;
		var exclude = (values || this.state.values).map(function (i) {
			return i[_this10.props.valueKey];
		});
		if (this.props.filterOptions) {
			return this.props.filterOptions.call(this, options, filterValue, exclude);
		} else {
			var filterOption = function filterOption(op) {
				if ((this.props.multi || this.props.list) && exclude.indexOf(op[this.props.valueKey]) > -1) return false;
				if (this.props.filterOption) return this.props.filterOption.call(this, op, filterValue);
				var valueTest = String(op[this.props.valueKey]);
				var labelTest = String(op[this.props.labelKey]);
				if (this.props.ignoreCase) {
					valueTest = valueTest.toLowerCase();
					labelTest = labelTest.toLowerCase();
					filterValue = filterValue.toLowerCase();
				}
				return !filterValue || this.props.matchPos === 'start' ? this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue || this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue : this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0 || this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0;
			};
			return (options || []).filter(filterOption, this);
		}
	},

	selectFocusedOption: function selectFocusedOption() {
		if (this.props.allowCreate && !this.state.focusedOption) {
			return this.selectValue(this.state.inputValue);
		}

		if (this.state.focusedOption) {
			return this.selectValue(this.state.focusedOption);
		}
	},

	focusOption: function focusOption(op) {
		this.setState({
			focusedOption: op
		});
	},

	focusNextOption: function focusNextOption() {
		this.focusAdjacentOption('next');
	},

	focusPreviousOption: function focusPreviousOption() {
		this.focusAdjacentOption('previous');
	},

	focusAdjacentOption: function focusAdjacentOption(dir) {
		this._focusedOptionReveal = true;
		var ops = this.state.filteredOptions.filter(function (op) {
			return !op.disabled;
		});
		if (!this.state.isOpen) {
			this.setState({
				isOpen: true,
				inputValue: '',
				focusedOption: this.state.focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
			}, this._bindCloseMenuIfClickedOutside);
			return;
		}
		if (!ops.length) {
			return;
		}
		var focusedIndex = -1;
		for (var i = 0; i < ops.length; i++) {
			if (this.state.focusedOption === ops[i]) {
				focusedIndex = i;
				break;
			}
		}
		var focusedOption = ops[0];
		if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
			focusedOption = ops[focusedIndex + 1];
		} else if (dir === 'previous') {
			if (focusedIndex > 0) {
				focusedOption = ops[focusedIndex - 1];
			} else {
				focusedOption = ops[ops.length - 1];
			}
		}
		this.setState({
			focusedOption: focusedOption
		});
	},

	unfocusOption: function unfocusOption(op) {
		if (this.state.focusedOption === op) {
			this.setState({
				focusedOption: null
			});
		}
	},

	getIdentifier: function getIdentifier(op) {
		var key = op[this.props.labelKey] ? op[this.props.labelKey] : op[this.props.valueKey];

		if (op.id) {
			return op.id;
		}

		return !key ? this.valueKeyId++ : key;
	},

	renderOptionLabel: function renderOptionLabel(op) {
		return op[this.props.labelKey];
	},

	buildMenu: function buildMenu() {
		var focusedValue = this.state.focusedOption ? this.state.focusedOption[this.props.valueKey] : null;
		var renderLabel = this.props.optionRenderer || this.renderOptionLabel;
		if (this.state.filteredOptions.length > 0) {
			focusedValue = focusedValue == null ? this.state.filteredOptions[0] : focusedValue;
		}
		// Add the current value to the filtered options in last resort
		var options = this.state.filteredOptions;
		if (this.props.allowCreate && this.state.inputValue.trim()) {
			var inputValue = this.state.inputValue;
			options = options.slice();
			var newOption = this.props.newOptionCreator ? this.props.newOptionCreator(inputValue) : {
				value: inputValue,
				label: inputValue,
				create: true
			};
			options.unshift(newOption);
		}
		var ops = Object.keys(options).map(function (key) {
			var op = options[key];
			var isSelected = this.state.value === op[this.props.valueKey];
			var isFocused = focusedValue === op[this.props.valueKey];
			var optionClass = classes({
				'Select-option': true,
				'is-selected': isSelected,
				'is-focused': isFocused,
				'is-disabled': op.disabled
			});
			var ref = isFocused ? 'focused' : null;
			var optionResult = React.createElement(this.props.optionComponent, {
				key: 'option-' + this.getIdentifier(op),
				className: optionClass,
				renderFunc: renderLabel,
				mouseDown: this.selectValue,
				mouseEnter: this.focusOption,
				mouseLeave: this.unfocusOption,
				addLabelText: this.props.addLabelText,
				option: op,
				ref: ref
			});
			return optionResult;
		}, this);

		if (ops.length) {
			return ops;
		} else {
			var noResultsText, promptClass;
			if (this.isLoading()) {
				promptClass = 'Select-searching';
				noResultsText = this.props.searchingText;
			} else if (this.state.inputValue || !this.props.asyncOptions) {
				promptClass = 'Select-noresults';
				noResultsText = this.props.noResultsText;
			} else {
				promptClass = 'Select-search-prompt';
				noResultsText = this.props.searchPromptText;
			}

			return React.createElement(
				'div',
				{ className: promptClass },
				noResultsText
			);
		}
	},

	closeDropdown: function closeDropdown() {
		this.setState({
			isOpen: false
		}, this._unbindCloseMenuIfClickedOutside);
	},

	handleOptionLabelClick: function handleOptionLabelClick(value, event) {
		if (this.props.onOptionLabelClick) {
			this.props.onOptionLabelClick(value, event);
		}
	},

	isLoading: function isLoading() {
		return this.props.isLoading || this.state.isLoading;
	},

	render: function render() {
		var selectClass = classes('Select', this.props.className, {
			'Select--multi': this.props.multi,
			'is-searchable': this.props.searchable,
			'is-open': this.state.isOpen,
			'is-focused': this.state.isFocused,
			'is-loading': this.isLoading(),
			'is-disabled': this.props.disabled,
			'has-value': this.state.value,
			'is-list': this.props.list
		});
		var value = [];
		var placeholder;
		var allowMultiple = this.props.multi || this.props.list;

		if (allowMultiple) {
			this.state.values.forEach(function (val) {
				var renderLabel = this.props.valueRenderer || this.renderOptionLabel;
				var onOptionLabelClick = this.handleOptionLabelClick.bind(this, val);
				var onRemove = this.removeValue.bind(this, val);
				var valueComponent = React.createElement(this.props.valueComponent, {
					key: this.getIdentifier(val),
					option: val,
					renderer: renderLabel,
					optionLabelClick: !!this.props.onOptionLabelClick,
					onOptionLabelClick: onOptionLabelClick,
					onRemove: onRemove,
					disabled: this.props.disabled,
					deletable: !this.state.isReadOnly
				});
				value.push(valueComponent);
			}, this);
		}

		if (this.props.disabled || !this.state.inputValue && (!this.props.multi || !value.length)) {
			var val = this.state.values[0] || null;
			if (this.props.list) {
				placeholder = React.createElement(this.props.singleValueComponent, {
					key: 'placeholder',
					value: val,
					placeholder: this.state.placeholder
				});
			} else {
				if (this.props.valueRenderer && !!this.state.values.length) {
					value.push(React.createElement(Value, {
						key: 0,
						option: val,
						renderer: this.props.valueRenderer,
						disabled: this.props.disabled }));
				} else {
					var singleValueComponent = React.createElement(this.props.singleValueComponent, {
						key: 'placeholder',
						value: val,
						placeholder: this.state.placeholder
					});
					value.push(singleValueComponent);
				}
			}
		}

		// loading spinner
		var loading = this.isLoading() ? React.createElement('span', { className: 'Select-loading-zone', 'aria-hidden': 'true' }, React.createElement('span', { className: 'Select-loading' })) : null;

		// clear "x" button
		var clear = this.props.clearable && this.state.value && !this.props.disabled && !this.isLoading() ? React.createElement('span', { className: 'Select-clear-zone', title: allowMultiple ? this.props.clearAllText : this.props.clearValueText, 'aria-label': allowMultiple ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onTouchEnd: this.clearValue, onClick: this.clearValue }, React.createElement('span', { className: 'Select-clear', dangerouslySetInnerHTML: { __html: '&times;' } })) : null;

		// indicator arrow
		var arrow = React.createElement('span', { className: 'Select-arrow-zone', onMouseDown: this.handleMouseDownOnArrow }, React.createElement('span', { className: 'Select-arrow', onMouseDown: this.handleMouseDownOnArrow }));

		var menu;
		var menuProps;
		if (this.state.isOpen) {
			menuProps = {
				ref: 'menu',
				className: 'Select-menu',
				onMouseDown: allowMultiple ? this.handleMouseDown : this.handleMouseDownOnMenu
			};

			menu = React.createElement('div', { ref: 'selectMenuContainer', className: 'Select-menu-outer' }, React.createElement('div', menuProps, this.buildMenu()));
		}

		var input;
		var inputProps = {
			ref: 'input',
			className: 'Select-input ' + (this.props.inputProps.className || ''),
			tabIndex: this.props.tabIndex || 0,
			onFocus: this.handleInputFocus,
			onBlur: this.handleInputBlur
		};
		for (var key in this.props.inputProps) {
			if (this.props.inputProps.hasOwnProperty(key) && key !== 'className') {
				inputProps[key] = this.props.inputProps[key];
			}
		}

		if (!this.props.disabled) {
			if (this.props.searchable) {
				input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: '5' }, inputProps));
			} else {
				input = React.createElement('div', inputProps, ' ');
			}
		} else if (!allowMultiple || !this.state.values.length) {
			input = React.createElement('div', { className: 'Select-input' }, ' ');
		}

		if (this.props.list) {
			if (!this.state.isReadOnly) {
				var selector = React.createElement('div', { className: 'dropdown' }, React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }), React.createElement('div', { className: 'Select-control', ref: 'control', onClick: this.selectText, onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown }, placeholder, input, loading, clear, arrow), menu);
			}
			return React.createElement('div', { ref: 'wrapper', className: selectClass }, selector, value);
		}

		return React.createElement('div', { ref: 'wrapper', className: selectClass }, React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }), React.createElement('div', { className: 'Select-control', ref: 'control', onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown }, value, input, loading, clear, arrow), menu);
	}
});

module.exports = Select;

},{"./Option":1,"./SingleValue":2,"./Value":3,"classnames":undefined,"react":undefined,"react-dom":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdGhvbWFzL3JlcG9zaXRvcmllcy9yZWFjdC1zZWxlY3Qvc3JjL09wdGlvbi5qcyIsIi9Vc2Vycy90aG9tYXMvcmVwb3NpdG9yaWVzL3JlYWN0LXNlbGVjdC9zcmMvU2luZ2xlVmFsdWUuanMiLCIvVXNlcnMvdGhvbWFzL3JlcG9zaXRvcmllcy9yZWFjdC1zZWxlY3Qvc3JjL1ZhbHVlLmpzIiwiL1VzZXJzL3Rob21hcy9yZXBvc2l0b3JpZXMvcmVhY3Qtc2VsZWN0L3NyYy9TZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXBDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUM5QixVQUFTLEVBQUU7QUFDVixjQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQ3BDLFdBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDakMsV0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUMvQixZQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO0FBQ2hDLFlBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDaEMsUUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDekMsWUFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtFQUNoQztBQUNELFdBQVUsRUFBQyxvQkFBQyxLQUFLLEVBQUU7QUFDbEIsT0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3ZCLE1BQUksQUFBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxHQUFHLElBQUssRUFBRSxN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IjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgT3B0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRwcm9wVHlwZXM6IHtcblx0XHRhZGRMYWJlbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIHN0cmluZyByZW5kZXJlZCBpbiBjYXNlIG9mIGFsbG93Q3JlYXRlIG9wdGlvbiBwYXNzZWQgdG8gUmVhY3RTZWxlY3Rcblx0XHRjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgICAgIC8vIGNsYXNzTmFtZSAoYmFzZWQgb24gbW91c2UgcG9zaXRpb24pXG5cdFx0bW91c2VEb3duOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIGNsaWNrIG9uIG9wdGlvbiBlbGVtZW50XG5cdFx0bW91c2VFbnRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBtZXRob2QgdG8gaGFuZGxlIG1vdXNlRW50ZXIgb24gb3B0aW9uIGVsZW1lbnRcblx0XHRtb3VzZUxlYXZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byBoYW5kbGUgbW91c2VMZWF2ZSBvbiBvcHRpb24gZWxlbWVudFxuXHRcdG9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgLy8gb2JqZWN0IHRoYXQgaXMgYmFzZSBmb3IgdGhhdCBvcHRpb25cblx0XHRyZW5kZXJGdW5jOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyAgICAgICAgICAgICAgIC8vIG1ldGhvZCBwYXNzZWQgdG8gUmVhY3RTZWxlY3QgY29tcG9uZW50IHRvIHJlbmRlciBsYWJlbCB0ZXh0XG5cdH0sXG5cdGJsb2NrRXZlbnQgKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRpZiAoKGV2ZW50LnRhcmdldC50YWdOYW1lICE9PSAnQScpIHx8ICEoJ2hyZWYnIGluIGV2ZW50LnRhcmdldCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoZXZlbnQudGFyZ2V0LnRhcmdldCkge1xuXHRcdFx0d2luZG93Lm9wZW4oZXZlbnQudGFyZ2V0LmhyZWYpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGV2ZW50LnRhcmdldC5ocmVmO1xuXHRcdH1cblx0fSxcblx0aGFuZGxlTW91c2VEb3duIChlKSB7XG5cdFx0dGhpcy5wcm9wcy5tb3VzZURvd24odGhpcy5wcm9wcy5vcHRpb24sIGUpO1xuXHR9LFxuXHRoYW5kbGVNb3VzZUVudGVyIChlKSB7XG5cdFx0dGhpcy5wcm9wcy5tb3VzZUVudGVyKHRoaXMucHJvcHMub3B0aW9uLCBlKTtcblx0fSxcblx0aGFuZGxlTW91c2VMZWF2ZSAoZSkge1xuXHRcdHRoaXMucHJvcHMubW91c2VMZWF2ZSh0aGlzLnByb3BzLm9wdGlvbiwgZSk7XG5cdH0sXG5cdHJlbmRlciAoKSB7XG5cdFx0dmFyIG9wdGlvbiA9IHRoaXMucHJvcHMub3B0aW9uO1xuXHRcdHZhciBsYWJlbCA9IG9wdGlvbi5jcmVhdGUgPyB0aGlzLnByb3BzLmFkZExhYmVsVGV4dC5yZXBsYWNlKCd7bGFiZWx9Jywgb3B0aW9uLmxhYmVsKSA6IHRoaXMucHJvcHMucmVuZGVyRnVuYyhvcHRpb24pO1xuXHRcdHZhciBvcHRpb25DbGFzc2VzID0gY2xhc3Nlcyh0aGlzLnByb3BzLmNsYXNzTmFtZSwgb3B0aW9uLmNsYXNzTmFtZSk7XG5cblx0XHRyZXR1cm4gb3B0aW9uLmRpc2FibGVkID8gKFxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e29wdGlvbkNsYXNzZXN9XG5cdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLmJsb2NrRXZlbnR9XG5cdFx0XHRcdG9uQ2xpY2s9e3RoaXMuYmxvY2tFdmVudH0+XG5cdFx0XHRcdHtsYWJlbH1cblx0XHRcdDwvZGl2PlxuXHRcdCkgOiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17b3B0aW9uQ2xhc3Nlc31cblx0XHRcdFx0c3R5bGU9e29wdGlvbi5zdHlsZX1cblx0XHRcdFx0b25Nb3VzZURvd249e3RoaXMuaGFuZGxlTW91c2VEb3dufVxuXHRcdFx0XHRvbk1vdXNlRW50ZXI9e3RoaXMuaGFuZGxlTW91c2VFbnRlcn1cblx0XHRcdFx0b25Nb3VzZUxlYXZlPXt0aGlzLmhhbmRsZU1vdXNlTGVhdmV9XG5cdFx0XHRcdG9uQ2xpY2s9e3RoaXMuaGFuZGxlTW91c2VEb3dufVxuXHRcdFx0XHR0aXRsZT17b3B0aW9uLnRpdGxlfT5cblx0XHRcdFx0e2xhYmVsfVxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9uO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgU2luZ2xlVmFsdWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHByb3BUeXBlczoge1xuXHRcdHBsYWNlaG9sZGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAvLyB0aGlzIGlzIGRlZmF1bHQgdmFsdWUgcHJvdmlkZWQgYnkgUmVhY3QtU2VsZWN0IGJhc2VkIGNvbXBvbmVudFxuXHRcdHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0ICAgICAgICAgICAgICAvLyBzZWxlY3RlZCBvcHRpb25cblx0fSxcblx0cmVuZGVyICgpIHtcblx0XHR2YXIgY2xhc3NOYW1lcyA9IGNsYXNzZXMoJ1NlbGVjdC1wbGFjZWhvbGRlcicsIHRoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy52YWx1ZS5jbGFzc05hbWUpO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2XG5cdFx0XHRcdGNsYXNzTmFtZT17Y2xhc3NOYW1lc31cblx0XHRcdFx0c3R5bGU9e3RoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy52YWx1ZS5zdHlsZX1cblx0XHRcdFx0dGl0bGU9e3RoaXMucHJvcHMudmFsdWUgJiYgdGhpcy5wcm9wcy52YWx1ZS50aXRsZX1cblx0XHRcdFx0Pnt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfTwvZGl2PlxuXHRcdCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZVZhbHVlO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc2VzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgVmFsdWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0ZGlzcGxheU5hbWU6ICdWYWx1ZScsXG5cblx0cHJvcFR5cGVzOiB7XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgICAgICAvLyBkaXNhYmxlZCBwcm9wIHBhc3NlZCB0byBSZWFjdFNlbGVjdFxuXHRcdG9uT3B0aW9uTGFiZWxDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSBjbGljayBvbiB2YWx1ZSBsYWJlbFxuXHRcdG9uUmVtb3ZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAgICAgICAgLy8gbWV0aG9kIHRvIGhhbmRsZSByZW1vdmUgb2YgdGhhdCB2YWx1ZVxuXHRcdG9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAgICAgICAgLy8gb3B0aW9uIHBhc3NlZCB0byBjb21wb25lbnRcblx0XHRvcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIGluZGljYXRlcyBpZiBvbk9wdGlvbkxhYmVsQ2xpY2sgc2hvdWxkIGJlIGhhbmRsZWRcblx0XHRyZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZCB0byByZW5kZXIgb3B0aW9uIGxhYmVsIHBhc3NlZCB0byBSZWFjdFNlbGVjdFxuXHRcdGRlbGV0YWJsZTogUmVhY3QuUHJvcFR5cGVzLmJvb2xcdFx0XHRcdFx0ICAvLyBpbmRpY2F0ZXMgaWYgdGhlIHZhbHVlIGNhbiBiZSBkZWxldGVkXG5cdH0sXG5cblx0YmxvY2tFdmVudCAoZXZlbnQpIHtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0fSxcblxuXHRoYW5kbGVPblJlbW92ZSAoZXZlbnQpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMuZGlzYWJsZWQpIHtcblx0XHRcdHRoaXMucHJvcHMub25SZW1vdmUoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciBsYWJlbCA9IHRoaXMucHJvcHMub3B0aW9uLmxhYmVsO1xuXHRcdGlmICh0aGlzLnByb3BzLnJlbmRlcmVyKSB7XG5cdFx0XHRsYWJlbCA9IHRoaXMucHJvcHMucmVuZGVyZXIodGhpcy5wcm9wcy5vcHRpb24pO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5wcm9wcy5vblJlbW92ZSAmJiAhdGhpcy5wcm9wcy5vcHRpb25MYWJlbENsaWNrKSB7XG5cdFx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjbGFzc05hbWU6IGNsYXNzZXMoJ1NlbGVjdC12YWx1ZScsIHRoaXMucHJvcHMub3B0aW9uLmNsYXNzTmFtZSksXG5cdFx0XHRcdFx0c3R5bGU6IHRoaXMucHJvcHMub3B0aW9uLnN0eWxlLFxuXHRcdFx0XHRcdHRpdGxlOiB0aGlzLnByb3BzLm9wdGlvbi50aXRsZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRsYWJlbFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wcm9wcy5vcHRpb25MYWJlbENsaWNrKSB7XG5cdFx0XHRsYWJlbCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdhJyxcblx0XHRcdFx0eyBjbGFzc05hbWU6IGNsYXNzZXMoJ1NlbGVjdC1pdGVtLWxhYmVsX19hJywgdGhpcy5wcm9wcy5vcHRpb24uY2xhc3NOYW1lKSxcblx0XHRcdFx0XHRvbk1vdXNlRG93bjogdGhpcy5ibG9ja0V2ZW50LFxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ6IHRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrLFxuXHRcdFx0XHRcdG9uQ2xpY2s6IHRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrLFxuXHRcdFx0XHRcdHN0eWxlOiB0aGlzLnByb3BzLm9wdGlvbi5zdHlsZSxcblx0XHRcdFx0XHR0aXRsZTogdGhpcy5wcm9wcy5vcHRpb24udGl0bGUgfSxcblx0XHRcdFx0bGFiZWxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dmFyIHJlbW92ZUljb247XG5cdFx0aWYgKHRoaXMucHJvcHMuZGVsZXRhYmxlKSB7XG5cdFx0XHRyZW1vdmVJY29uID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHR7IGNsYXNzTmFtZTogJ1NlbGVjdC1pdGVtLWljb24nLFxuXHRcdFx0XHRcdG9uTW91c2VEb3duOiB0aGlzLmJsb2NrRXZlbnQsXG5cdFx0XHRcdFx0b25DbGljazogdGhpcy5oYW5kbGVPblJlbW92ZSxcblx0XHRcdFx0XHRvblRvdWNoRW5kOiB0aGlzLmhhbmRsZU9uUmVtb3ZlIH0sXG5cdFx0XHRcdCfDlydcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiBjbGFzc2VzKCdTZWxlY3QtaXRlbScsIHRoaXMucHJvcHMub3B0aW9uLmNsYXNzTmFtZSksXG5cdFx0XHRcdHN0eWxlOiB0aGlzLnByb3BzLm9wdGlvbi5zdHlsZSxcblx0XHRcdFx0dGl0bGU6IHRoaXMucHJvcHMub3B0aW9uLnRpdGxlIH0sXG5cdFx0XHRyZW1vdmVJY29uLFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHR7IGNsYXNzTmFtZTogJ1NlbGVjdC1pdGVtLWxhYmVsJyB9LFxuXHRcdFx0XHRsYWJlbFxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmFsdWU7XG4iLCIvKiBkaXNhYmxlIHNvbWUgcnVsZXMgdW50aWwgd2UgcmVmYWN0b3IgbW9yZSBjb21wbGV0ZWx5OyBmaXhpbmcgdGhlbSBub3cgd291bGRcbiAgIGNhdXNlIGNvbmZsaWN0cyB3aXRoIHNvbWUgb3BlbiBQUnMgdW5uZWNlc3NhcmlseS4gKi9cbi8qIGVzbGludCByZWFjdC9qc3gtc29ydC1wcm9wLXR5cGVzOiAwLCByZWFjdC9zb3J0LWNvbXA6IDAsIHJlYWN0L3Byb3AtdHlwZXM6IDAgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJlYWN0RE9NID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG52YXIgSW5wdXQgPSByZXF1aXJlKCdyZWFjdC1pbnB1dC1hdXRvc2l6ZScpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgVmFsdWUgPSByZXF1aXJlKCcuL1ZhbHVlJyk7XG52YXIgU2luZ2xlVmFsdWUgPSByZXF1aXJlKCcuL1NpbmdsZVZhbHVlJyk7XG52YXIgT3B0aW9uID0gcmVxdWlyZSgnLi9PcHRpb24nKTtcblxudmFyIHJlcXVlc3RJZCA9IDA7XG5cbnZhciBTZWxlY3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cblx0ZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXHR2YWx1ZUtleUlkOiAwLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGFkZExhYmVsVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAvLyBwbGFjZWhvbGRlciBkaXNwbGF5ZWQgd2hlbiB5b3Ugd2FudCB0byBhZGQgYSBsYWJlbCBvbiBhIG11bHRpLXZhbHVlIGlucHV0XG5cdFx0YWxsb3dDcmVhdGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgIC8vIHdoZXRoZXIgdG8gYWxsb3cgY3JlYXRpb24gb2YgbmV3IGVudHJpZXNcblx0XHRhc3luY09wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gZnVuY3Rpb24gdG8gY2FsbCB0byBnZXQgb3B0aW9uc1xuXHRcdGF1dG9sb2FkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAvLyB3aGV0aGVyIHRvIGF1dG8tbG9hZCB0aGUgZGVmYXVsdCBhc3luYyBvcHRpb25zIHNldFxuXHRcdGJhY2tzcGFjZVJlbW92ZXM6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAvLyB3aGV0aGVyIGJhY2tzcGFjZSByZW1vdmVzIGFuIGl0ZW0gaWYgdGhlcmUgaXMgbm8gdGV4dCBpbnB1dFxuXHRcdGNhY2hlQXN5bmNSZXN1bHRzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAvLyB3aGV0aGVyIHRvIGFsbG93IGNhY2hlXG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIGNsYXNzTmFtZSBmb3IgdGhlIG91dGVyIGVsZW1lbnRcblx0XHRjbGVhckFsbFRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgLy8gdGl0bGUgZm9yIHRoZSBcImNsZWFyXCIgY29udHJvbCB3aGVuIG11bHRpOiB0cnVlXG5cdFx0Y2xlYXJWYWx1ZVRleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgIC8vIHRpdGxlIGZvciB0aGUgXCJjbGVhclwiIGNvbnRyb2xcblx0XHRjbGVhcmFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgLy8gc2hvdWxkIGl0IGJlIHBvc3NpYmxlIHRvIHJlc2V0IHZhbHVlXG5cdFx0ZGVsaW1pdGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIGRlbGltaXRlciB0byB1c2UgdG8gam9pbiBtdWx0aXBsZSB2YWx1ZXNcblx0XHRkaXNhYmxlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgLy8gd2hldGhlciB0aGUgU2VsZWN0IGlzIGRpc2FibGVkIG9yIG5vdFxuXHRcdGZpbHRlck9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAvLyBtZXRob2QgdG8gZmlsdGVyIGEgc2luZ2xlIG9wdGlvbiAgKG9wdGlvbiwgZmlsdGVyU3RyaW5nKVxuXHRcdGZpbHRlck9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAvLyBtZXRob2QgdG8gZmlsdGVyIHRoZSBvcHRpb25zIGFycmF5OiBmdW5jdGlvbiAoW29wdGlvbnNdLCBmaWx0ZXJTdHJpbmcsIFt2YWx1ZXNdKVxuXHRcdGlnbm9yZUNhc2U6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyB3aGV0aGVyIHRvIHBlcmZvcm0gY2FzZS1pbnNlbnNpdGl2ZSBmaWx0ZXJpbmdcblx0XHRpbnB1dFByb3BzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LCAgICAgICAgLy8gY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIHRoZSBJbnB1dCAoaW4gdGhlIFNlbGVjdC1jb250cm9sKSBlLmc6IHsnZGF0YS1mb28nOiAnYmFyJ31cblx0XHRpc0xvYWRpbmc6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgLy8gd2hldGhlciB0aGUgU2VsZWN0IGlzIGxvYWRpbmcgZXh0ZXJuYWxseSBvciBub3QgKHN1Y2ggYXMgb3B0aW9ucyBiZWluZyBsb2FkZWQpXG5cdFx0bGFiZWxLZXk6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIHBhdGggb2YgdGhlIGxhYmVsIHZhbHVlIGluIG9wdGlvbiBvYmplY3RzXG4gICAgICAgIGxpc3Q6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgICAvLyBsaXN0LXZhbHVlIGlucHV0XG5cdFx0bWF0Y2hQb3M6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIChhbnl8c3RhcnQpIG1hdGNoIHRoZSBzdGFydCBvciBlbnRpcmUgc3RyaW5nIHdoZW4gZmlsdGVyaW5nXG5cdFx0bWF0Y2hQcm9wOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIChhbnl8bGFiZWx8dmFsdWUpIHdoaWNoIG9wdGlvbiBwcm9wZXJ0eSB0byBmaWx0ZXIgb25cblx0XHRtdWx0aTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgICAgLy8gbXVsdGktdmFsdWUgaW5wdXRcblx0XHRuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgICAgLy8gZmllbGQgbmFtZSwgZm9yIGhpZGRlbiA8aW5wdXQgLz4gdGFnXG5cdFx0bmV3T3B0aW9uQ3JlYXRvcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgIC8vIGZhY3RvcnkgdG8gY3JlYXRlIG5ldyBvcHRpb25zIHdoZW4gYWxsb3dDcmVhdGUgc2V0XG5cdFx0bm9SZXN1bHRzVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgIC8vIHBsYWNlaG9sZGVyIGRpc3BsYXllZCB3aGVuIHRoZXJlIGFyZSBubyBtYXRjaGluZyBzZWFyY2ggcmVzdWx0c1xuXHRcdG9uQmx1cjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBvbkJsdXIgaGFuZGxlcjogZnVuY3Rpb24gKGV2ZW50KSB7fVxuXHRcdG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgICAgICAvLyBvbkNoYW5nZSBoYW5kbGVyOiBmdW5jdGlvbiAobmV3VmFsdWUpIHt9XG5cdFx0b25Gb2N1czogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgIC8vIG9uRm9jdXMgaGFuZGxlcjogZnVuY3Rpb24gKGV2ZW50KSB7fVxuXHRcdG9uSW5wdXRDaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAvLyBvbklucHV0Q2hhbmdlIGhhbmRsZXI6IGZ1bmN0aW9uIChpbnB1dFZhbHVlKSB7fVxuXHRcdG9uT3B0aW9uTGFiZWxDbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAvLyBvbkNMaWNrIGhhbmRsZXIgZm9yIHZhbHVlIGxhYmVsczogZnVuY3Rpb24gKHZhbHVlLCBldmVudCkge31cblx0XHRvcHRpb25Db21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgLy8gb3B0aW9uIGNvbXBvbmVudCB0byByZW5kZXIgaW4gZHJvcGRvd25cblx0XHRvcHRpb25SZW5kZXJlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgLy8gb3B0aW9uUmVuZGVyZXI6IGZ1bmN0aW9uIChvcHRpb24pIHt9XG5cdFx0b3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LCAgICAgICAgICAgIC8vIGFycmF5IG9mIG9wdGlvbnNcblx0XHRwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gZmllbGQgcGxhY2Vob2xkZXIsIGRpc3BsYXllZCB3aGVuIHRoZXJlJ3Mgbm8gdmFsdWVcblx0XHRzZWFyY2hhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgLy8gd2hldGhlciB0byBlbmFibGUgc2VhcmNoaW5nIGZlYXR1cmUgb3Igbm90XG5cdFx0c2VhcmNoaW5nVGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgIC8vIG1lc3NhZ2UgdG8gZGlzcGxheSB3aGlsc3Qgb3B0aW9ucyBhcmUgbG9hZGluZyB2aWEgYXN5bmNPcHRpb25zXG5cdFx0c2VhcmNoUHJvbXB0VGV4dDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgIC8vIGxhYmVsIHRvIHByb21wdCBmb3Igc2VhcmNoIGlucHV0XG5cdFx0c2luZ2xlVmFsdWVDb21wb25lbnQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLC8vIHNpbmdsZSB2YWx1ZSBjb21wb25lbnQgd2hlbiBtdWx0aXBsZSBpcyBzZXQgdG8gZmFsc2Vcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLmFueSwgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBmaWVsZCB2YWx1ZVxuXHRcdHZhbHVlQ29tcG9uZW50OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAvLyB2YWx1ZSBjb21wb25lbnQgdG8gcmVuZGVyIGluIG11bHRpcGxlIG1vZGVcblx0XHR2YWx1ZUtleTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAgLy8gcGF0aCBvZiB0aGUgbGFiZWwgdmFsdWUgaW4gb3B0aW9uIG9iamVjdHNcblx0XHR2YWx1ZVJlbmRlcmVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIHZhbHVlUmVuZGVyZXI6IGZ1bmN0aW9uIChvcHRpb24pIHt9XG5cbiAgICAgICAgLyogTmV3IGZvciB3aXplbGluZSByZWFjdC1zZWxlY3QgKi9cbiAgICAgICAgbGlzdFJlYWRPbmx5TW9kZTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXHQgICAvLyBOb24gZWRpdGFibGUgbGlzdCBtb2RlIGN1cnJlbnRseSBpbXBsZW1lbnRlZCBmb3IgTGlzdCBzZWxlY3Qgb25seVxuXHRcdG1heE11bHRpU2VsZWN0aW9uOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLCAvLyBOdW1iZXIgb2YgbWF4aW11bSBhbGxvd2VkIG9wdGlvbnMgdG8gc2VsZWN0IG9uIG11bHRpIG1vZGVcblx0XHRyZXBsYWNlSWZNYXg6IFJlYWN0LlByb3BUeXBlcy5ib29sLFx0XHQgICAvLyBSZXBsYWNlIHNlbGVjdGVkIHZhbHVlcyBpZiBtYXggc2VsZWN0aW9uIG51bWJlciBpcyByZWFjaGVkXG5cdFx0Y2xlYXJWYWx1ZXNPbkVzYzogUmVhY3QuUHJvcFR5cGVzLmJvb2xcdCAgIC8vIGlmIHRydWUgcHJlc3NpbmcgZXNjIHdoZW4gdGhlIHNlbGVjdG9yIGlzIGZvY3VzZWQgYW5kIGNsb3NlZCB3aWxsIGNsZWFyIHNlbGVjdGVkIHZhbHVlc1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wcyAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGFkZExhYmVsVGV4dDogJ0FkZCBcIntsYWJlbH1cIj8nLFxuXHRcdFx0YWxsb3dDcmVhdGU6IGZhbHNlLFxuXHRcdFx0YXN5bmNPcHRpb25zOiB1bmRlZmluZWQsXG5cdFx0XHRhdXRvbG9hZDogdHJ1ZSxcblx0XHRcdGJhY2tzcGFjZVJlbW92ZXM6IHRydWUsXG5cdFx0XHRjYWNoZUFzeW5jUmVzdWx0czogdHJ1ZSxcblx0XHRcdGNsYXNzTmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0Y2xlYXJBbGxUZXh0OiAnQ2xlYXIgYWxsJyxcblx0XHRcdGNsZWFyVmFsdWVUZXh0OiAnQ2xlYXIgdmFsdWUnLFxuXHRcdFx0Y2xlYXJhYmxlOiB0cnVlLFxuXHRcdFx0ZGVsaW1pdGVyOiAnLCcsXG5cdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHRpZ25vcmVDYXNlOiB0cnVlLFxuXHRcdFx0aW5wdXRQcm9wczoge30sXG5cdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0bGFiZWxLZXk6ICdsYWJlbCcsXG5cdFx0XHRtYXRjaFBvczogJ2FueScsXG5cdFx0XHRtYXRjaFByb3A6ICdhbnknLFxuXHRcdFx0bmFtZTogdW5kZWZpbmVkLFxuXHRcdFx0bmV3T3B0aW9uQ3JlYXRvcjogdW5kZWZpbmVkLFxuXHRcdFx0bm9SZXN1bHRzVGV4dDogJ05vIHJlc3VsdHMgZm91bmQnLFxuXHRcdFx0b25DaGFuZ2U6IHVuZGVmaW5lZCxcblx0XHRcdG9uSW5wdXRDaGFuZ2U6IHVuZGVmaW5lZCxcblx0XHRcdG9uT3B0aW9uTGFiZWxDbGljazogdW5kZWZpbmVkLFxuXHRcdFx0b3B0aW9uQ29tcG9uZW50OiBPcHRpb24sXG5cdFx0XHRvcHRpb25zOiB1bmRlZmluZWQsXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1NlbGVjdC4uLicsXG5cdFx0XHRzZWFyY2hhYmxlOiB0cnVlLFxuXHRcdFx0c2VhcmNoaW5nVGV4dDogJ1NlYXJjaGluZy4uLicsXG5cdFx0XHRzZWFyY2hQcm9tcHRUZXh0OiAnVHlwZSB0byBzZWFyY2gnLFxuXHRcdFx0c2luZ2xlVmFsdWVDb21wb25lbnQ6IFNpbmdsZVZhbHVlLFxuXHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdHZhbHVlQ29tcG9uZW50OiBWYWx1ZSxcblx0XHRcdHZhbHVlS2V5OiAndmFsdWUnLFxuXG5cdFx0XHQvKiBuZXcgZm9yIHdpemVsaW5lIHJlYWN0LXNlbGVjdCAqL1xuXHRcdFx0bGlzdFJlYWRPbmx5TW9kZTogZmFsc2UsXG5cdFx0XHRtYXhNdWx0aVNlbGVjdGlvbjogLTEsXG5cdFx0XHRyZXBsYWNlSWZNYXg6IGZhbHNlLFxuXHRcdFx0Y2xlYXJWYWx1ZXNPbkVzYzogZmFsc2Vcblx0XHR9O1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZSAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdC8qXG5cdFx0XHQgKiBzZXQgYnkgZ2V0U3RhdGVGcm9tVmFsdWUgb24gY29tcG9uZW50V2lsbE1vdW50OlxuXHRcdFx0ICogLSB2YWx1ZVxuXHRcdFx0ICogLSB2YWx1ZXNcblx0XHRcdCAqIC0gZmlsdGVyZWRPcHRpb25zXG5cdFx0XHQgKiAtIGlucHV0VmFsdWVcblx0XHRcdCAqIC0gcGxhY2Vob2xkZXJcblx0XHRcdCAqIC0gZm9jdXNlZE9wdGlvblxuXHRcdFx0Ki9cblx0XHRcdGlzRm9jdXNlZDogZmFsc2UsXG5cdFx0XHRpc0xvYWRpbmc6IGZhbHNlLFxuXHRcdFx0aXNPcGVuOiBmYWxzZSxcblx0XHRcdG9wdGlvbnM6IHRoaXMucHJvcHMub3B0aW9ucyxcblx0XHRcdGlzUmVhZE9ubHk6IHRoaXMucHJvcHMubGlzdFJlYWRPbmx5TW9kZVxuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbE1vdW50ICgpIHtcblx0XHRcdHRoaXMuX29wdGlvbnNDYWNoZSA9IHt9O1xuXHRcdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9ICcnO1xuXHRcdFx0dGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSA9IChldmVudCkgPT4ge1xuXHRcdFx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBtZW51RWxlbSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5zZWxlY3RNZW51Q29udGFpbmVyKTtcblx0XHRcdFx0dmFyIGNvbnRyb2xFbGVtID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzLmNvbnRyb2wpO1xuXG5cdFx0XHRcdHZhciBldmVudE9jY3VyZWRPdXRzaWRlTWVudSA9IHRoaXMuY2xpY2tlZE91dHNpZGVFbGVtZW50KG1lbnVFbGVtLCBldmVudCk7XG5cdFx0XHRcdHZhciBldmVudE9jY3VyZWRPdXRzaWRlQ29udHJvbCA9IHRoaXMuY2xpY2tlZE91dHNpZGVFbGVtZW50KGNvbnRyb2xFbGVtLCBldmVudCk7XG5cblx0XHRcdFx0Ly8gSGlkZSBkcm9wZG93biBtZW51IGlmIGNsaWNrIG9jY3VycmVkIG91dHNpZGUgb2YgbWVudVxuXHRcdFx0XHRpZiAoZXZlbnRPY2N1cmVkT3V0c2lkZU1lbnUgJiYgZXZlbnRPY2N1cmVkT3V0c2lkZUNvbnRyb2wpIHtcblx0XHRcdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHRcdFx0XHR9LCB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJiYgZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHtcblx0XHRcdFx0XHRkb2N1bWVudC5hdHRhY2hFdmVudCgnb25jbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJiYgZG9jdW1lbnQuZGV0YWNoRXZlbnQpIHtcblx0XHRcdFx0XHRkb2N1bWVudC5kZXRhY2hFdmVudCgnb25jbGljaycsIHRoaXMuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHR0aGlzLnNldFN0YXRlKHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUodGhpcy5wcm9wcy52YWx1ZSkpO1xuXHRcdH0sXG5cblx0Y29tcG9uZW50RGlkTW91bnQgKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiB0aGlzLnByb3BzLmF1dG9sb2FkKSB7XG5cdFx0XHR0aGlzLmF1dG9sb2FkQXN5bmNPcHRpb25zKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50ICgpIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5fYmx1clRpbWVvdXQpO1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9mb2N1c1RpbWVvdXQpO1xuXHRcdGlmICh0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIChuZXdQcm9wcykge1xuXHRcdFx0dmFyIG9wdGlvbnNDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRpZiAobmV3UHJvcHMub3B0aW9ucyAhPT0gdGhpcy5wcm9wcy5vcHRpb25zKSB7XG5cdFx0XHRcdG9wdGlvbnNDaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0b3B0aW9uczogbmV3UHJvcHMub3B0aW9ucyxcblx0XHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IHRoaXMuZmlsdGVyT3B0aW9ucyhuZXdQcm9wcy5vcHRpb25zKVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGlmIChuZXdQcm9wcy52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSB8fCBuZXdQcm9wcy5wbGFjZWhvbGRlciAhPT0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlciB8fCBvcHRpb25zQ2hhbmdlZCkge1xuXHRcdFx0XHR2YXIgc2V0U3RhdGUgPSAobmV3U3RhdGUpID0+IHtcblx0XHRcdFx0XHR2YXIgc3RhdGVDaGFuZ2VzID0gdGhpcy5nZXRTdGF0ZUZyb21WYWx1ZShuZXdQcm9wcy52YWx1ZSxcblx0XHRcdFx0XHRcdChuZXdTdGF0ZSAmJiBuZXdTdGF0ZS5vcHRpb25zKSB8fCBuZXdQcm9wcy5vcHRpb25zLFxuXHRcdFx0XHRcdFx0bmV3UHJvcHMucGxhY2Vob2xkZXJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHN0YXRlQ2hhbmdlcy5pc0xvYWRpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRkZWxldGUgc3RhdGVDaGFuZ2VzLmlucHV0VmFsdWU7XG5cdFx0XHRcdFx0dGhpcy5zZXRTdGF0ZShzdGF0ZUNoYW5nZXMpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5hc3luY09wdGlvbnMpIHtcblx0XHRcdFx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMobmV3UHJvcHMudmFsdWUsIHt9LCBzZXRTdGF0ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2V0U3RhdGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0Y29tcG9uZW50RGlkVXBkYXRlICgpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMuZGlzYWJsZWQgJiYgdGhpcy5fZm9jdXNBZnRlclVwZGF0ZSkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2JsdXJUaW1lb3V0KTtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLl9mb2N1c1RpbWVvdXQpO1xuXHRcdFx0dGhpcy5fZm9jdXNUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdGlmICghdGhpcy5pc01vdW50ZWQoKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdFx0XHRcdHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgPSBmYWxzZTtcblx0XHRcdH0sIDUwKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwpIHtcblx0XHRcdGlmICh0aGlzLnJlZnMuZm9jdXNlZCAmJiB0aGlzLnJlZnMubWVudSkge1xuXHRcdFx0XHR2YXIgZm9jdXNlZERPTSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5mb2N1c2VkKTtcblx0XHRcdFx0dmFyIG1lbnVET00gPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnMubWVudSk7XG5cdFx0XHRcdHZhciBmb2N1c2VkUmVjdCA9IGZvY3VzZWRET00uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdHZhciBtZW51UmVjdCA9IG1lbnVET00uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRcdFx0aWYgKGZvY3VzZWRSZWN0LmJvdHRvbSA+IG1lbnVSZWN0LmJvdHRvbSB8fCBmb2N1c2VkUmVjdC50b3AgPCBtZW51UmVjdC50b3ApIHtcblx0XHRcdFx0XHRtZW51RE9NLnNjcm9sbFRvcCA9IChmb2N1c2VkRE9NLm9mZnNldFRvcCArIGZvY3VzZWRET00uY2xpZW50SGVpZ2h0IC0gbWVudURPTS5vZmZzZXRIZWlnaHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsID0gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdGZvY3VzICgpIHtcblx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdH0sXG5cblx0dG9nZ2xlRWRpdCAocmVhZE9ubHkpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzUmVhZE9ubHkgOiByZWFkT25seVxuXHRcdH0pO1xuXHR9LFxuXG5cdGNsaWNrZWRPdXRzaWRlRWxlbWVudCAoZWxlbWVudCwgZXZlbnQpIHtcblx0XHR2YXIgZXZlbnRUYXJnZXQgPSAoZXZlbnQudGFyZ2V0KSA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnNyY0VsZW1lbnQ7XG5cdFx0d2hpbGUgKGV2ZW50VGFyZ2V0ICE9IG51bGwpIHtcblx0XHRcdGlmIChldmVudFRhcmdldCA9PT0gZWxlbWVudCkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0ZXZlbnRUYXJnZXQgPSBldmVudFRhcmdldC5vZmZzZXRQYXJlbnQ7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdGdldFN0YXRlRnJvbVZhbHVlICh2YWx1ZSwgb3B0aW9ucywgcGxhY2Vob2xkZXIpIHtcblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnM7XG5cdFx0fVxuXHRcdGlmICghcGxhY2Vob2xkZXIpIHtcblx0XHRcdHBsYWNlaG9sZGVyID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlcjtcblx0XHR9XG5cblx0XHQvLyByZXNldCBpbnRlcm5hbCBmaWx0ZXIgc3RyaW5nXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9ICcnO1xuXG5cdFx0dmFyIHZhbHVlcyA9IHRoaXMuaW5pdFZhbHVlc0FycmF5KHZhbHVlLCBvcHRpb25zKTtcblx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5maWx0ZXJPcHRpb25zKG9wdGlvbnMsIHZhbHVlcyk7XG5cdFx0dmFyIGFsbG93c011bHRpcGxlID0gdGhpcy5wcm9wcy5tdWx0aSB8fCB0aGlzLnByb3BzLmxpc3Q7XG5cblx0XHR2YXIgZm9jdXNlZE9wdGlvbjtcblx0XHR2YXIgdmFsdWVGb3JTdGF0ZSA9IG51bGw7XG5cdFx0aWYgKCFhbGxvd3NNdWx0aXBsZSAmJiB2YWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRmb2N1c2VkT3B0aW9uID0gdmFsdWVzWzBdO1xuXHRcdFx0dmFsdWVGb3JTdGF0ZSA9IHZhbHVlc1swXVt0aGlzLnByb3BzLnZhbHVlS2V5XTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9jdXNlZE9wdGlvbiA9IHRoaXMuZ2V0Rmlyc3RGb2N1c2FibGVPcHRpb24oZmlsdGVyZWRPcHRpb25zKTtcblx0XHRcdHZhbHVlRm9yU3RhdGUgPSB2YWx1ZXMubWFwKCh2KSA9PiB7IHJldHVybiB2W3RoaXMucHJvcHMudmFsdWVLZXldOyB9KS5qb2luKHRoaXMucHJvcHMuZGVsaW1pdGVyKTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdHZhbHVlOiB2YWx1ZUZvclN0YXRlLFxuXHRcdFx0dmFsdWVzOiB2YWx1ZXMsXG5cdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuXHRcdFx0cGxhY2Vob2xkZXI6ICFhbGxvd3NNdWx0aXBsZSAmJiB2YWx1ZXMubGVuZ3RoID8gdmFsdWVzWzBdW3RoaXMucHJvcHMubGFiZWxLZXldIDogcGxhY2Vob2xkZXIsXG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fTtcblx0fSxcblxuXHRnZXRGaXJzdEZvY3VzYWJsZU9wdGlvbiAgKG9wdGlvbnMpIHtcblx0XHRmb3IgKHZhciBvcHRpb25JbmRleCA9IDA7IG9wdGlvbkluZGV4IDwgb3B0aW9ucy5sZW5ndGg7ICsrb3B0aW9uSW5kZXgpIHtcblx0XHRcdGlmICghb3B0aW9uc1tvcHRpb25JbmRleF0uZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnNbb3B0aW9uSW5kZXhdO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRpbml0VmFsdWVzQXJyYXkgKHZhbHVlcywgb3B0aW9ucykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlcyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0dmFsdWVzID0gdmFsdWVzID09PSAnJ1xuXHRcdFx0XHRcdD8gW11cblx0XHRcdFx0XHQ6ICh0aGlzLnByb3BzLm11bHRpIHx8IHRoaXMucHJvcHMubGlzdClcblx0XHRcdFx0XHRcdD8gdmFsdWVzLnNwbGl0KHRoaXMucHJvcHMuZGVsaW1pdGVyKVxuXHRcdFx0XHRcdFx0OiBbIHZhbHVlcyBdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzID0gdmFsdWVzICE9PSB1bmRlZmluZWQgJiYgdmFsdWVzICE9PSBudWxsID8gW3ZhbHVlc10gOiBbXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHZhbHVlcy5tYXAoKHZhbCkgPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoa2V5KSAmJlxuXHRcdFx0XHRcdFx0b3B0aW9uc1trZXldICYmXG5cdFx0XHRcdFx0XHQob3B0aW9uc1trZXldW3RoaXMucHJvcHMudmFsdWVLZXldID09PSB2YWwgfHxcblx0XHRcdFx0XHRcdFx0dHlwZW9mIG9wdGlvbnNba2V5XVt0aGlzLnByb3BzLnZhbHVlS2V5XSA9PT0gJ251bWJlcicgJiZcblx0XHRcdFx0XHRcdFx0b3B0aW9uc1trZXldW3RoaXMucHJvcHMudmFsdWVLZXldLnRvU3RyaW5nKCkgPT09IHZhbFxuXHRcdFx0XHRcdFx0KSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9wdGlvbnNba2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRbdGhpcy5wcm9wcy52YWx1ZUtleV06IHZhbCxcblx0XHRcdFx0XHRbdGhpcy5wcm9wcy5sYWJlbEtleV06IHZhbFxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHZhbDtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRzZXRWYWx1ZSAodmFsdWUsIGZvY3VzQWZ0ZXJVcGRhdGUpIHtcblx0XHRpZiAoZm9jdXNBZnRlclVwZGF0ZSB8fCBmb2N1c0FmdGVyVXBkYXRlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgPSB0cnVlO1xuXHRcdH1cblx0XHR2YXIgbmV3U3RhdGUgPSB0aGlzLmdldFN0YXRlRnJvbVZhbHVlKHZhbHVlKTtcblx0XHRuZXdTdGF0ZS5pc09wZW4gPSBmYWxzZTtcblx0XHR0aGlzLmZpcmVDaGFuZ2VFdmVudChuZXdTdGF0ZSk7XG5cdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdH0sXG5cblx0c2VsZWN0VmFsdWUgKHZhbHVlKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLm11bHRpICYmICF0aGlzLnByb3BzLmxpc3QpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUodmFsdWUpO1xuXHRcdH0gZWxzZSBpZiAodmFsdWUpIHtcblx0XHRcdHRoaXMuYWRkTXVsdGlTZWxlY3RWYWx1ZSh2YWx1ZSk7XG5cdFx0fVxuXHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0fSxcblxuXHRhZGRNdWx0aVNlbGVjdFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdGlmICh0aGlzLnByb3BzLm1heE11bHRpU2VsZWN0aW9uID4gMCkge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUudmFsdWVzLmxlbmd0aCArMSA+IHRoaXMucHJvcHMubWF4TXVsdGlTZWxlY3Rpb24gJiYgdGhpcy5wcm9wcy5yZXBsYWNlSWZNYXgpIHtcblx0XHRcdFx0dGhpcy5yZXBsYWNlVmFsdWUodmFsdWUpO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGggKyAxIDw9IHRoaXMucHJvcHMubWF4TXVsdGlTZWxlY3Rpb24pIHtcblx0XHRcdFx0dGhpcy5hZGRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLnByb3BzLm1heE11bHRpU2VsZWN0aW9uICE9IDApIHtcblx0XHRcdHRoaXMuYWRkVmFsdWUodmFsdWUpO1xuXHRcdH1cblx0fSxcblxuXHRhZGRWYWx1ZSAodmFsdWUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmNvbmNhdCh2YWx1ZSkpO1xuXHR9LFxuXG5cdHJlcGxhY2VWYWx1ZSAodmFsdWUpIHtcblx0XHR2YXIgcmVtYWluaW5nVmFsdWVzID0gdGhpcy5zdGF0ZS52YWx1ZXMuc2xpY2UoMCwgdGhpcy5zdGF0ZS52YWx1ZXMubGVuZ3RoIC0gMSk7XG5cdFx0dGhpcy5zZXRWYWx1ZShyZW1haW5pbmdWYWx1ZXMuY29uY2F0KHZhbHVlKSk7XG5cdH0sXG5cblx0cG9wVmFsdWUgKCkge1xuXHRcdHRoaXMuc2V0VmFsdWUodGhpcy5zdGF0ZS52YWx1ZXMuc2xpY2UoMCwgdGhpcy5zdGF0ZS52YWx1ZXMubGVuZ3RoIC0gMSkpO1xuXHR9LFxuXG5cdHJlbW92ZVZhbHVlICh2YWx1ZVRvUmVtb3ZlKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5maWx0ZXIoZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHJldHVybiB2YWx1ZSAhPT0gdmFsdWVUb1JlbW92ZTtcblx0XHR9KSk7XG5cdH0sXG5cblx0Y2xlYXJWYWx1ZSAoZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBpZ25vcmUgaXQuXG5cdFx0aWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuc2V0VmFsdWUobnVsbCk7XG5cdH0sXG5cblx0cmVzZXRWYWx1ZSAoKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlID09PSAnJyA/IG51bGwgOiB0aGlzLnN0YXRlLnZhbHVlKTtcblx0fSxcblxuXHRnZXRJbnB1dE5vZGUgICgpIHtcblx0XHR2YXIgaW5wdXQgPSB0aGlzLnJlZnMuaW5wdXQ7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuc2VhcmNoYWJsZSA/IGlucHV0IDogUmVhY3RET00uZmluZERPTU5vZGUoaW5wdXQpO1xuXHR9LFxuXG5cdGZpcmVDaGFuZ2VFdmVudCAobmV3U3RhdGUpIHtcblx0XHRpZiAobmV3U3RhdGUudmFsdWUgIT09IHRoaXMuc3RhdGUudmFsdWUgJiYgdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZShuZXdTdGF0ZS52YWx1ZSwgbmV3U3RhdGUudmFsdWVzKTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duIChldmVudCkge1xuXHRcdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdFx0Ly8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG5cdFx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBpc011bHRpTGltaXRlZEFuZE9wZW4gPSB0aGlzLnByb3BzLm1heE11bHRpU2VsZWN0aW9uID4gMCAmJiB0aGlzLnN0YXRlLmlzT3Blbjtcblx0XHRcdHZhciByZXBsYWNlSWZNYXhWYWx1ZVJlYWNoZWQgPSB0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGggPj0gdGhpcy5wcm9wcy5tYXhNdWx0aVNlbGVjdGlvbiAmJiB0aGlzLnByb3BzLnJlcGxhY2VJZk1heDtcblx0XHRcdC8vIFRoaXMgZXZlbnQgaXMgY2FsbGVkIGJlZm9yZSB0aGUgdmFsdWUgaXMgYWRkZWQgdG8gdGhlIHN0YXRlIChqdXN0IGFmdGVyIGEgY2xpY2sgb24gYW4gb3B0aW9uKSwgc28gd2UgY291bnQgYWhlYWRcblx0XHRcdHZhciB3aWxsUmVhY2hNYXhWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWVzLmxlbmd0aCArIDEgPT0gdGhpcy5wcm9wcy5tYXhNdWx0aVNlbGVjdGlvbjtcblxuXHRcdFx0aWYgKGlzTXVsdGlMaW1pdGVkQW5kT3BlbiAmJiAocmVwbGFjZUlmTWF4VmFsdWVSZWFjaGVkIHx8IHdpbGxSZWFjaE1heFZhbHVlKSkge1xuXHRcdFx0XHR0aGlzLmNsb3NlRHJvcGRvd24oKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdC8vIGZvciB0aGUgbm9uLXNlYXJjaGFibGUgc2VsZWN0LCBjbG9zZSB0aGUgZHJvcGRvd24gd2hlbiBidXR0b24gaXMgY2xpY2tlZFxuXHRcdFx0aWYgKHRoaXMuc3RhdGUuaXNPcGVuICYmICF0aGlzLnByb3BzLnNlYXJjaGFibGUpIHtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdFx0XHR9LCB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5zdGF0ZS5pc0ZvY3VzZWQpIHtcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX29wZW5BZnRlckZvY3VzID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0c2VsZWN0VGV4dDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5zZWxlY3QoKTtcblx0fSxcblxuXHRoYW5kbGVNb3VzZURvd25Pbk1lbnUgKGV2ZW50KSB7XG5cdFx0Ly8gaWYgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgYSBtb3VzZWRvd24gYW5kIG5vdCB0aGUgcHJpbWFyeVxuXHRcdC8vIGJ1dHRvbiwgb3IgaWYgdGhlIGNvbXBvbmVudCBpcyBkaXNhYmxlZCwgaWdub3JlIGl0LlxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8IChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyAmJiBldmVudC5idXR0b24gIT09IDApKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duT25BcnJvdyAoZXZlbnQpIHtcblx0XHQvLyBpZiB0aGUgZXZlbnQgd2FzIHRyaWdnZXJlZCBieSBhIG1vdXNlZG93biBhbmQgbm90IHRoZSBwcmltYXJ5XG5cdFx0Ly8gYnV0dG9uLCBvciBpZiB0aGUgY29tcG9uZW50IGlzIGRpc2FibGVkLCBpZ25vcmUgaXQuXG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Ly8gSWYgbm90IGZvY3VzZWQsIGhhbmRsZU1vdXNlRG93biB3aWxsIGhhbmRsZSBpdFxuXHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9LCB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0fSxcblxuXHRoYW5kbGVJbnB1dEZvY3VzIChldmVudCkge1xuXHRcdHZhciBuZXdJc09wZW4gPSB0aGlzLnN0YXRlLmlzT3BlbiB8fCB0aGlzLl9vcGVuQWZ0ZXJGb2N1cztcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzRm9jdXNlZDogdHJ1ZSxcblx0XHRcdGlzT3BlbjogbmV3SXNPcGVuXG5cdFx0fSwgKCkgPT4ge1xuXHRcdFx0aWYgKG5ld0lzT3Blbikge1xuXHRcdFx0XHR0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9vcGVuQWZ0ZXJGb2N1cyA9IGZhbHNlO1xuXHRcdGlmICh0aGlzLnByb3BzLm9uRm9jdXMpIHtcblx0XHRcdHRoaXMucHJvcHMub25Gb2N1cyhldmVudCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZUlucHV0Qmx1ciAoZXZlbnQpIHtcblx0XHR2YXIgbWVudURPTSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5tZW51KTtcblx0XHRpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5pc0VxdWFsTm9kZShtZW51RE9NKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLl9ibHVyVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX2ZvY3VzQWZ0ZXJVcGRhdGUgfHwgIXRoaXMuaXNNb3VudGVkKCkpIHJldHVybjtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0aXNGb2N1c2VkOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0fSwgNTApO1xuXHRcdGlmICh0aGlzLnByb3BzLm9uQmx1cikge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkJsdXIoZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVLZXlEb3duIChldmVudCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSByZXR1cm47XG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIDg6XG5cdFx0XHRcdC8vIGJhY2tzcGFjZVxuXHRcdFx0XHRpZiAoIXRoaXMuc3RhdGUuaW5wdXRWYWx1ZSAmJiB0aGlzLnByb3BzLmJhY2tzcGFjZVJlbW92ZXMgJiYgIXRoaXMucHJvcHMubGlzdCkge1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0dGhpcy5wb3BWYWx1ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgOTpcblx0XHRcdC8vIHRhYlxuXHRcdFx0XHRpZiAoZXZlbnQuc2hpZnRLZXkgfHwgIXRoaXMuc3RhdGUuaXNPcGVuIHx8ICF0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZWxlY3RGb2N1c2VkT3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTM6IC8vIGVudGVyXG5cdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pc09wZW4pIHJldHVybjtcblx0XHRcdFx0dGhpcy5zZWxlY3RGb2N1c2VkT3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMjc6IC8vIGVzY2FwZVxuXHRcdFx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdFx0XHR0aGlzLnJlc2V0VmFsdWUoKTtcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLnByb3BzLmNsZWFyYWJsZSAmJiB0aGlzLnByb3BzLmNsZWFyVmFsdWVzT25Fc2MpIHtcblx0XHRcdFx0XHR0aGlzLmNsZWFyVmFsdWUoZXZlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzg6IC8vIHVwXG5cdFx0XHRcdHRoaXMuZm9jdXNQcmV2aW91c09wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDQwOiAvLyBkb3duXG5cdFx0XHRcdHRoaXMuZm9jdXNOZXh0T3B0aW9uKCk7XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTg4OiAvLyAsXG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmIHRoaXMucHJvcHMubXVsdGkpIHtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OiByZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cblx0Ly8gRW5zdXJlcyB0aGF0IHRoZSBjdXJyZW50bHkgZm9jdXNlZCBvcHRpb24gaXMgYXZhaWxhYmxlIGluIGZpbHRlcmVkT3B0aW9ucy5cblx0Ly8gSWYgbm90LCByZXR1cm5zIHRoZSBmaXJzdCBhdmFpbGFibGUgb3B0aW9uLlxuXHRfZ2V0TmV3Rm9jdXNlZE9wdGlvbiAoZmlsdGVyZWRPcHRpb25zKSB7XG5cdFx0Zm9yICh2YXIga2V5IGluIGZpbHRlcmVkT3B0aW9ucykge1xuXHRcdFx0aWYgKGZpbHRlcmVkT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGZpbHRlcmVkT3B0aW9uc1trZXldID09PSB0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pIHtcblx0XHRcdFx0cmV0dXJuIGZpbHRlcmVkT3B0aW9uc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5nZXRGaXJzdEZvY3VzYWJsZU9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpO1xuXHR9LFxuXG5cdGhhbmRsZUlucHV0Q2hhbmdlIChldmVudCkge1xuXHRcdC8vIGFzc2lnbiBhbiBpbnRlcm5hbCB2YXJpYWJsZSBiZWNhdXNlIHdlIG5lZWQgdG8gdXNlXG5cdFx0Ly8gdGhlIGxhdGVzdCB2YWx1ZSBiZWZvcmUgc2V0U3RhdGUoKSBoYXMgY29tcGxldGVkLlxuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSBldmVudC50YXJnZXQudmFsdWU7XG5cdFx0aWYgKHRoaXMucHJvcHMub25JbnB1dENoYW5nZSkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbklucHV0Q2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzTG9hZGluZzogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucyhldmVudC50YXJnZXQudmFsdWUsIHtcblx0XHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH1cblx0fSxcblxuXHRhdXRvbG9hZEFzeW5jT3B0aW9ucyAoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc0xvYWRpbmc6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLmxvYWRBc3luY09wdGlvbnMoJycsIHsgaXNMb2FkaW5nOiBmYWxzZSB9LCAoKSA9PiB7XG5cdFx0XHQvLyB1cGRhdGUgd2l0aCBuZXcgb3B0aW9ucyBidXQgZG9uJ3QgZm9jdXNcblx0XHRcdHRoaXMuc2V0VmFsdWUodGhpcy5wcm9wcy52YWx1ZSwgZmFsc2UpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGxvYWRBc3luY09wdGlvbnMgKGlucHV0ID0gJycsIHN0YXRlLCBjYWxsYmFjaykge1xuXHRcdHZhciB0aGlzUmVxdWVzdElkID0gdGhpcy5fY3VycmVudFJlcXVlc3RJZCA9IHJlcXVlc3RJZCsrO1xuXHRcdGlmICh0aGlzLnByb3BzLmNhY2hlQXN5bmNSZXN1bHRzKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8PSBpbnB1dC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgY2FjaGVLZXkgPSBpbnB1dC5zbGljZSgwLCBpKTtcblx0XHRcdFx0aWYgKHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV1cblx0XHRcdFx0XHQmJiAoKGlucHV0ICYmIGlucHV0Lmxlbmd0aCAmJiBpbnB1dFswXSA9PT0gY2FjaGVLZXlbMF0pIHx8IHRoaXMuX29wdGlvbnNDYWNoZVtjYWNoZUtleV0uY29tcGxldGUpKSB7XG5cdFx0XHRcdFx0dmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLm9wdGlvbnM7XG5cdFx0XHRcdFx0dmFyIGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyT3B0aW9ucyhvcHRpb25zKTtcblx0XHRcdFx0XHR2YXIgbmV3U3RhdGUgPSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdFx0XHRmb2N1c2VkT3B0aW9uOiB0aGlzLl9nZXROZXdGb2N1c2VkT3B0aW9uKGZpbHRlcmVkT3B0aW9ucylcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBzdGF0ZSkge1xuXHRcdFx0XHRcdFx0aWYgKHN0YXRlLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRcdFx0bmV3U3RhdGVba2V5XSA9IHN0YXRlW2tleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuXHRcdFx0XHRcdGlmIChjYWxsYmFjaykgY2FsbGJhY2suY2FsbCh0aGlzLCBuZXdTdGF0ZSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIG9wdGlvbnNSZXNwb25zZUhhbmRsZXIgPSAoZXJyLCBkYXRhKSA9PiB7XG5cdFx0XHRpZiAoZXJyKSB0aHJvdyBlcnI7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5jYWNoZUFzeW5jUmVzdWx0cykge1xuXHRcdFx0XHR0aGlzLl9vcHRpb25zQ2FjaGVbaW5wdXRdID0gZGF0YTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzUmVxdWVzdElkICE9PSB0aGlzLl9jdXJyZW50UmVxdWVzdElkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMoZGF0YS5vcHRpb25zKTtcblx0XHRcdHZhciBuZXdTdGF0ZSA9IHtcblx0XHRcdFx0b3B0aW9uczogZGF0YS5vcHRpb25zLFxuXHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5fZ2V0TmV3Rm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIHN0YXRlKSB7XG5cdFx0XHRcdGlmIChzdGF0ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRcdFx0bmV3U3RhdGVba2V5XSA9IHN0YXRlW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuXHRcdFx0aWYgKGNhbGxiYWNrKSBjYWxsYmFjay5jYWxsKHRoaXMsIG5ld1N0YXRlKTtcblx0XHR9O1xuXG5cdFx0dmFyIGFzeW5jT3B0cyA9IHRoaXMucHJvcHMuYXN5bmNPcHRpb25zKGlucHV0LCBvcHRpb25zUmVzcG9uc2VIYW5kbGVyKTtcblxuXHRcdGlmIChhc3luY09wdHMgJiYgdHlwZW9mIGFzeW5jT3B0cy50aGVuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRhc3luY09wdHMudGhlbigoZGF0YSkgPT4ge1xuXHRcdFx0XHRvcHRpb25zUmVzcG9uc2VIYW5kbGVyKG51bGwsIGRhdGEpXG5cdFx0XHR9LCAoZXJyKSA9PiB7XG5cdFx0XHRcdG9wdGlvbnNSZXNwb25zZUhhbmRsZXIoZXJyKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdGZpbHRlck9wdGlvbnMgKG9wdGlvbnMsIHZhbHVlcykge1xuXHRcdHZhciBmaWx0ZXJWYWx1ZSA9IHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmc7XG5cdFx0dmFyIGV4Y2x1ZGUgPSAodmFsdWVzIHx8IHRoaXMuc3RhdGUudmFsdWVzKS5tYXAoaSA9PiBpW3RoaXMucHJvcHMudmFsdWVLZXldKTtcblx0XHRpZiAodGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucywgZmlsdGVyVmFsdWUsIGV4Y2x1ZGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZmlsdGVyT3B0aW9uID0gZnVuY3Rpb24ob3ApIHtcblx0XHRcdFx0aWYgKCh0aGlzLnByb3BzLm11bHRpIHx8IHRoaXMucHJvcHMubGlzdCkgJiYgZXhjbHVkZS5pbmRleE9mKG9wW3RoaXMucHJvcHMudmFsdWVLZXldKSA+IC0xKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICh0aGlzLnByb3BzLmZpbHRlck9wdGlvbikgcmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9uLmNhbGwodGhpcywgb3AsIGZpbHRlclZhbHVlKTtcblx0XHRcdFx0dmFyIHZhbHVlVGVzdCA9IFN0cmluZyhvcFt0aGlzLnByb3BzLnZhbHVlS2V5XSk7XG5cdFx0XHRcdHZhciBsYWJlbFRlc3QgPSBTdHJpbmcob3BbdGhpcy5wcm9wcy5sYWJlbEtleV0pO1xuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5pZ25vcmVDYXNlKSB7XG5cdFx0XHRcdFx0dmFsdWVUZXN0ID0gdmFsdWVUZXN0LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0bGFiZWxUZXN0ID0gbGFiZWxUZXN0LnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0ZmlsdGVyVmFsdWUgPSBmaWx0ZXJWYWx1ZS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAhZmlsdGVyVmFsdWUgfHwgKHRoaXMucHJvcHMubWF0Y2hQb3MgPT09ICdzdGFydCcpID8gKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3Quc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKSB8fFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3Quc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKVxuXHRcdFx0XHQpIDogKFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ2xhYmVsJyAmJiB2YWx1ZVRlc3QuaW5kZXhPZihmaWx0ZXJWYWx1ZSkgPj0gMCkgfHxcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScgJiYgbGFiZWxUZXN0LmluZGV4T2YoZmlsdGVyVmFsdWUpID49IDApXG5cdFx0XHRcdCk7XG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIChvcHRpb25zIHx8IFtdKS5maWx0ZXIoZmlsdGVyT3B0aW9uLCB0aGlzKTtcblx0XHR9XG5cdH0sXG5cblx0c2VsZWN0Rm9jdXNlZE9wdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuYWxsb3dDcmVhdGUgJiYgIXRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0cmV0dXJuIHRoaXMuc2VsZWN0VmFsdWUodGhpcy5zdGF0ZS5pbnB1dFZhbHVlKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZWxlY3RWYWx1ZSh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24pO1xuXHRcdH1cblx0fSxcblxuXHRmb2N1c09wdGlvbiAob3ApIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGZvY3VzZWRPcHRpb246IG9wXG5cdFx0fSk7XG5cdH0sXG5cblx0Zm9jdXNOZXh0T3B0aW9uICgpIHtcblx0XHR0aGlzLmZvY3VzQWRqYWNlbnRPcHRpb24oJ25leHQnKTtcblx0fSxcblxuXHRmb2N1c1ByZXZpb3VzT3B0aW9uICgpIHtcblx0XHR0aGlzLmZvY3VzQWRqYWNlbnRPcHRpb24oJ3ByZXZpb3VzJyk7XG5cdH0sXG5cblx0Zm9jdXNBZGphY2VudE9wdGlvbiAoZGlyKSB7XG5cdFx0dGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCA9IHRydWU7XG5cdFx0dmFyIG9wcyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLmZpbHRlcihmdW5jdGlvbihvcCkge1xuXHRcdFx0cmV0dXJuICFvcC5kaXNhYmxlZDtcblx0XHR9KTtcblx0XHRpZiAoIXRoaXMuc3RhdGUuaXNPcGVuKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNPcGVuOiB0cnVlLFxuXHRcdFx0XHRpbnB1dFZhbHVlOiAnJyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uIHx8IG9wc1tkaXIgPT09ICduZXh0JyA/IDAgOiBvcHMubGVuZ3RoIC0gMV1cblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCFvcHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHZhciBmb2N1c2VkSW5kZXggPSAtMTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA9PT0gb3BzW2ldKSB7XG5cdFx0XHRcdGZvY3VzZWRJbmRleCA9IGk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgZm9jdXNlZE9wdGlvbiA9IG9wc1swXTtcblx0XHRpZiAoZGlyID09PSAnbmV4dCcgJiYgZm9jdXNlZEluZGV4ID4gLTEgJiYgZm9jdXNlZEluZGV4IDwgb3BzLmxlbmd0aCAtIDEpIHtcblx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbZm9jdXNlZEluZGV4ICsgMV07XG5cdFx0fSBlbHNlIGlmIChkaXIgPT09ICdwcmV2aW91cycpIHtcblx0XHRcdGlmIChmb2N1c2VkSW5kZXggPiAwKSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbZm9jdXNlZEluZGV4IC0gMV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb2N1c2VkT3B0aW9uID0gb3BzW29wcy5sZW5ndGggLSAxXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBmb2N1c2VkT3B0aW9uXG5cdFx0fSk7XG5cdH0sXG5cblx0dW5mb2N1c09wdGlvbiAob3ApIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID09PSBvcCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IG51bGxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRnZXRJZGVudGlmaWVyOiBmdW5jdGlvbihvcCkge1xuXHRcdHZhciBrZXkgPSBvcFt0aGlzLnByb3BzLmxhYmVsS2V5XSA/IG9wW3RoaXMucHJvcHMubGFiZWxLZXldIDogb3BbdGhpcy5wcm9wcy52YWx1ZUtleV07XG5cblx0XHRpZihvcC5pZCkge1xuXHRcdFx0cmV0dXJuIG9wLmlkO1xuXHRcdH1cblxuXHRcdHJldHVybiAha2V5ID8gdGhpcy52YWx1ZUtleUlkKysgOiBrZXk7XG5cdH0sXG5cblx0cmVuZGVyT3B0aW9uTGFiZWwgKG9wKSB7XG5cdFx0cmV0dXJuIG9wW3RoaXMucHJvcHMubGFiZWxLZXldO1xuXHR9LFxuXG5cdGJ1aWxkTWVudSAoKSB7XG5cdFx0dmFyIGZvY3VzZWRWYWx1ZSA9IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiA/IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvblt0aGlzLnByb3BzLnZhbHVlS2V5XSA6IG51bGw7XG5cdFx0dmFyIHJlbmRlckxhYmVsID0gdGhpcy5wcm9wcy5vcHRpb25SZW5kZXJlciB8fCB0aGlzLnJlbmRlck9wdGlvbkxhYmVsO1xuXHRcdGlmICh0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb2N1c2VkVmFsdWUgPSBmb2N1c2VkVmFsdWUgPT0gbnVsbCA/IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zWzBdIDogZm9jdXNlZFZhbHVlO1xuXHRcdH1cblx0XHQvLyBBZGQgdGhlIGN1cnJlbnQgdmFsdWUgdG8gdGhlIGZpbHRlcmVkIG9wdGlvbnMgaW4gbGFzdCByZXNvcnRcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zO1xuXHRcdGlmICh0aGlzLnByb3BzLmFsbG93Q3JlYXRlICYmIHRoaXMuc3RhdGUuaW5wdXRWYWx1ZS50cmltKCkpIHtcblx0XHRcdHZhciBpbnB1dFZhbHVlID0gdGhpcy5zdGF0ZS5pbnB1dFZhbHVlO1xuXHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMuc2xpY2UoKTtcblx0XHRcdHZhciBuZXdPcHRpb24gPSB0aGlzLnByb3BzLm5ld09wdGlvbkNyZWF0b3IgPyB0aGlzLnByb3BzLm5ld09wdGlvbkNyZWF0b3IoaW5wdXRWYWx1ZSkgOiB7XG5cdFx0XHRcdHZhbHVlOiBpbnB1dFZhbHVlLFxuXHRcdFx0XHRsYWJlbDogaW5wdXRWYWx1ZSxcblx0XHRcdFx0Y3JlYXRlOiB0cnVlXG5cdFx0XHR9O1xuXHRcdFx0b3B0aW9ucy51bnNoaWZ0KG5ld09wdGlvbik7XG5cdFx0fVxuXHRcdHZhciBvcHMgPSBPYmplY3Qua2V5cyhvcHRpb25zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHR2YXIgb3AgPSBvcHRpb25zW2tleV07XG5cdFx0XHR2YXIgaXNTZWxlY3RlZCA9IHRoaXMuc3RhdGUudmFsdWUgPT09IG9wW3RoaXMucHJvcHMudmFsdWVLZXldO1xuXHRcdFx0dmFyIGlzRm9jdXNlZCA9IGZvY3VzZWRWYWx1ZSA9PT0gb3BbdGhpcy5wcm9wcy52YWx1ZUtleV07XG5cdFx0XHR2YXIgb3B0aW9uQ2xhc3MgPSBjbGFzc2VzKHtcblx0XHRcdFx0J1NlbGVjdC1vcHRpb24nOiB0cnVlLFxuXHRcdFx0XHQnaXMtc2VsZWN0ZWQnOiBpc1NlbGVjdGVkLFxuXHRcdFx0XHQnaXMtZm9jdXNlZCc6IGlzRm9jdXNlZCxcblx0XHRcdFx0J2lzLWRpc2FibGVkJzogb3AuZGlzYWJsZWRcblx0XHRcdH0pO1xuXHRcdFx0dmFyIHJlZiA9IGlzRm9jdXNlZCA/ICdmb2N1c2VkJyA6IG51bGw7XG5cdFx0XHR2YXIgb3B0aW9uUmVzdWx0ID0gUmVhY3QuY3JlYXRlRWxlbWVudCh0aGlzLnByb3BzLm9wdGlvbkNvbXBvbmVudCwge1xuXHRcdFx0XHRrZXk6ICdvcHRpb24tJyArIHRoaXMuZ2V0SWRlbnRpZmllcihvcCksXG5cdFx0XHRcdGNsYXNzTmFtZTogb3B0aW9uQ2xhc3MsXG5cdFx0XHRcdHJlbmRlckZ1bmM6IHJlbmRlckxhYmVsLFxuXHRcdFx0XHRtb3VzZURvd246IHRoaXMuc2VsZWN0VmFsdWUsXG5cdFx0XHRcdG1vdXNlRW50ZXI6IHRoaXMuZm9jdXNPcHRpb24sXG5cdFx0XHRcdG1vdXNlTGVhdmU6IHRoaXMudW5mb2N1c09wdGlvbixcblx0XHRcdFx0YWRkTGFiZWxUZXh0OiB0aGlzLnByb3BzLmFkZExhYmVsVGV4dCxcblx0XHRcdFx0b3B0aW9uOiBvcCxcblx0XHRcdFx0cmVmOiByZWZcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG9wdGlvblJlc3VsdDtcblx0XHR9LCB0aGlzKTtcblxuXHRcdGlmIChvcHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gb3BzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgbm9SZXN1bHRzVGV4dCwgcHJvbXB0Q2xhc3M7XG5cdFx0XHRpZiAodGhpcy5pc0xvYWRpbmcoKSkge1xuXHRcdFx0XHRwcm9tcHRDbGFzcyA9ICdTZWxlY3Qtc2VhcmNoaW5nJztcblx0XHRcdFx0bm9SZXN1bHRzVGV4dCA9IHRoaXMucHJvcHMuc2VhcmNoaW5nVGV4dDtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5pbnB1dFZhbHVlIHx8ICF0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuXHRcdFx0XHRwcm9tcHRDbGFzcyA9ICdTZWxlY3Qtbm9yZXN1bHRzJztcblx0XHRcdFx0bm9SZXN1bHRzVGV4dCA9IHRoaXMucHJvcHMubm9SZXN1bHRzVGV4dDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHByb21wdENsYXNzID0gJ1NlbGVjdC1zZWFyY2gtcHJvbXB0Jztcblx0XHRcdFx0bm9SZXN1bHRzVGV4dCA9IHRoaXMucHJvcHMuc2VhcmNoUHJvbXB0VGV4dDtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9e3Byb21wdENsYXNzfT5cblx0XHRcdFx0XHR7bm9SZXN1bHRzVGV4dH1cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQpO1xuXHRcdH1cblx0fSxcblxuXHRjbG9zZURyb3Bkb3duOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHR9LCB0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0fSxcblxuXHRoYW5kbGVPcHRpb25MYWJlbENsaWNrICAodmFsdWUsIGV2ZW50KSB7XG5cdFx0aWYgKHRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrKSB7XG5cdFx0XHR0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljayh2YWx1ZSwgZXZlbnQpO1xuXHRcdH1cblx0fSxcblxuXHRpc0xvYWRpbmcgKCkge1xuXHRcdHJldHVybiB0aGlzLnByb3BzLmlzTG9hZGluZyB8fCB0aGlzLnN0YXRlLmlzTG9hZGluZztcblx0fSxcblxuXHRyZW5kZXIgKCkge1xuXHRcdHZhciBzZWxlY3RDbGFzcyA9IGNsYXNzZXMoJ1NlbGVjdCcsIHRoaXMucHJvcHMuY2xhc3NOYW1lLCB7XG5cdFx0XHQnU2VsZWN0LS1tdWx0aSc6IHRoaXMucHJvcHMubXVsdGksXG5cdFx0XHQnaXMtc2VhcmNoYWJsZSc6IHRoaXMucHJvcHMuc2VhcmNoYWJsZSxcblx0XHRcdCdpcy1vcGVuJzogdGhpcy5zdGF0ZS5pc09wZW4sXG5cdFx0XHQnaXMtZm9jdXNlZCc6IHRoaXMuc3RhdGUuaXNGb2N1c2VkLFxuXHRcdFx0J2lzLWxvYWRpbmcnOiB0aGlzLmlzTG9hZGluZygpLFxuXHRcdFx0J2lzLWRpc2FibGVkJzogdGhpcy5wcm9wcy5kaXNhYmxlZCxcblx0XHRcdCdoYXMtdmFsdWUnOiB0aGlzLnN0YXRlLnZhbHVlLFxuXHRcdFx0J2lzLWxpc3QnOiB0aGlzLnByb3BzLmxpc3Rcblx0XHR9KTtcblx0XHR2YXIgdmFsdWUgPSBbXTtcblx0XHR2YXIgcGxhY2Vob2xkZXI7XG5cdFx0dmFyIGFsbG93TXVsdGlwbGUgPSB0aGlzLnByb3BzLm11bHRpIHx8IHRoaXMucHJvcHMubGlzdDtcblxuXHRcdGlmIChhbGxvd011bHRpcGxlKSB7XG5cdFx0XHR0aGlzLnN0YXRlLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWwpIHtcblx0XHRcdFx0dmFyIHJlbmRlckxhYmVsID0gdGhpcy5wcm9wcy52YWx1ZVJlbmRlcmVyIHx8IHRoaXMucmVuZGVyT3B0aW9uTGFiZWw7XG5cdFx0XHRcdHZhciBvbk9wdGlvbkxhYmVsQ2xpY2sgPSB0aGlzLmhhbmRsZU9wdGlvbkxhYmVsQ2xpY2suYmluZCh0aGlzLCB2YWwpO1xuXHRcdFx0XHR2YXIgb25SZW1vdmUgPSB0aGlzLnJlbW92ZVZhbHVlLmJpbmQodGhpcywgdmFsKTtcblx0XHRcdFx0dmFyIHZhbHVlQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudCh0aGlzLnByb3BzLnZhbHVlQ29tcG9uZW50LCB7XG5cdFx0XHRcdFx0a2V5OiB0aGlzLmdldElkZW50aWZpZXIodmFsKSxcblx0XHRcdFx0XHRvcHRpb246IHZhbCxcblx0XHRcdFx0XHRyZW5kZXJlcjogcmVuZGVyTGFiZWwsXG5cdFx0XHRcdFx0b3B0aW9uTGFiZWxDbGljazogISF0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IG9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvblJlbW92ZTogb25SZW1vdmUsXG5cdFx0XHRcdFx0ZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG5cdFx0XHRcdFx0ZGVsZXRhYmxlOiAhdGhpcy5zdGF0ZS5pc1JlYWRPbmx5XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR2YWx1ZS5wdXNoKHZhbHVlQ29tcG9uZW50KTtcblx0XHRcdH0sIHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8ICghdGhpcy5zdGF0ZS5pbnB1dFZhbHVlICYmICghdGhpcy5wcm9wcy5tdWx0aSB8fCAhdmFsdWUubGVuZ3RoKSkpIHtcblx0XHRcdHZhciB2YWwgPSB0aGlzLnN0YXRlLnZhbHVlc1swXSB8fCBudWxsO1xuXHRcdFx0aWYgKHRoaXMucHJvcHMubGlzdCkge1xuXHRcdFx0XHRwbGFjZWhvbGRlciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5zaW5nbGVWYWx1ZUNvbXBvbmVudCwge1xuXHRcdFx0XHRcdGtleTogJ3BsYWNlaG9sZGVyJyxcblx0XHRcdFx0XHR2YWx1ZTogdmFsLFxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyOiB0aGlzLnN0YXRlLnBsYWNlaG9sZGVyXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHRoaXMucHJvcHMudmFsdWVSZW5kZXJlciAmJiAhIXRoaXMuc3RhdGUudmFsdWVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHZhbHVlLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChWYWx1ZSwge1xuXHRcdFx0XHRcdFx0a2V5OiAwLFxuXHRcdFx0XHRcdFx0b3B0aW9uOiB2YWwsXG5cdFx0XHRcdFx0XHRyZW5kZXJlcjogdGhpcy5wcm9wcy52YWx1ZVJlbmRlcmVyLFxuXHRcdFx0XHRcdFx0ZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQgfSkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBzaW5nbGVWYWx1ZUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQodGhpcy5wcm9wcy5zaW5nbGVWYWx1ZUNvbXBvbmVudCwge1xuXHRcdFx0XHRcdFx0a2V5OiAncGxhY2Vob2xkZXInLFxuXHRcdFx0XHRcdFx0dmFsdWU6IHZhbCxcblx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyOiB0aGlzLnN0YXRlLnBsYWNlaG9sZGVyXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0dmFsdWUucHVzaChzaW5nbGVWYWx1ZUNvbXBvbmVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBsb2FkaW5nIHNwaW5uZXJcblx0XHR2YXIgbG9hZGluZyA9IHRoaXMuaXNMb2FkaW5nKCkgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J3NwYW4nLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdTZWxlY3QtbG9hZGluZy16b25lJywgJ2FyaWEtaGlkZGVuJzogJ3RydWUnIH0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdTZWxlY3QtbG9hZGluZycgfSlcblx0XHQpIDogbnVsbDtcblxuXHRcdC8vIGNsZWFyIFwieFwiIGJ1dHRvblxuXHRcdHZhciBjbGVhciA9IHRoaXMucHJvcHMuY2xlYXJhYmxlICYmIHRoaXMuc3RhdGUudmFsdWUgJiYgIXRoaXMucHJvcHMuZGlzYWJsZWQgJiYgIXRoaXMuaXNMb2FkaW5nKCkgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J3NwYW4nLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdTZWxlY3QtY2xlYXItem9uZScsIHRpdGxlOiBhbGxvd011bHRpcGxlID8gdGhpcy5wcm9wcy5jbGVhckFsbFRleHQgOiB0aGlzLnByb3BzLmNsZWFyVmFsdWVUZXh0LCAnYXJpYS1sYWJlbCc6IGFsbG93TXVsdGlwbGUgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHQsIG9uTW91c2VEb3duOiB0aGlzLmNsZWFyVmFsdWUsIG9uVG91Y2hFbmQ6IHRoaXMuY2xlYXJWYWx1ZSwgb25DbGljazogdGhpcy5jbGVhclZhbHVlIH0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdTZWxlY3QtY2xlYXInLCBkYW5nZXJvdXNseVNldElubmVySFRNTDogeyBfX2h0bWw6ICcmdGltZXM7JyB9IH0pXG5cdFx0KSA6IG51bGw7XG5cblx0XHQvLyBpbmRpY2F0b3IgYXJyb3dcblx0XHR2YXIgYXJyb3cgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J3NwYW4nLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdTZWxlY3QtYXJyb3ctem9uZScsIG9uTW91c2VEb3duOiB0aGlzLmhhbmRsZU1vdXNlRG93bk9uQXJyb3cgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ1NlbGVjdC1hcnJvdycsIG9uTW91c2VEb3duOiB0aGlzLmhhbmRsZU1vdXNlRG93bk9uQXJyb3cgfSlcblx0XHQpO1xuXG5cdFx0dmFyIG1lbnU7XG5cdFx0dmFyIG1lbnVQcm9wcztcblx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdG1lbnVQcm9wcyA9IHtcblx0XHRcdFx0cmVmOiAnbWVudScsXG5cdFx0XHRcdGNsYXNzTmFtZTogJ1NlbGVjdC1tZW51Jyxcblx0XHRcdFx0b25Nb3VzZURvd246IGFsbG93TXVsdGlwbGUgPyB0aGlzLmhhbmRsZU1vdXNlRG93biA6IHRoaXMuaGFuZGxlTW91c2VEb3duT25NZW51XG5cdFx0XHR9O1xuXG5cdFx0XHRtZW51ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdHsgcmVmOiAnc2VsZWN0TWVudUNvbnRhaW5lcicsIGNsYXNzTmFtZTogJ1NlbGVjdC1tZW51LW91dGVyJyB9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdG1lbnVQcm9wcyxcblx0XHRcdFx0XHR0aGlzLmJ1aWxkTWVudSgpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dmFyIGlucHV0O1xuXHRcdHZhciBpbnB1dFByb3BzID0ge1xuXHRcdFx0cmVmOiAnaW5wdXQnLFxuXHRcdFx0Y2xhc3NOYW1lOiAnU2VsZWN0LWlucHV0ICcgKyAodGhpcy5wcm9wcy5pbnB1dFByb3BzLmNsYXNzTmFtZSB8fCAnJyksXG5cdFx0XHR0YWJJbmRleDogdGhpcy5wcm9wcy50YWJJbmRleCB8fCAwLFxuXHRcdFx0b25Gb2N1czogdGhpcy5oYW5kbGVJbnB1dEZvY3VzLFxuXHRcdFx0b25CbHVyOiB0aGlzLmhhbmRsZUlucHV0Qmx1clxuXHRcdH07XG5cdFx0Zm9yICh2YXIga2V5IGluIHRoaXMucHJvcHMuaW5wdXRQcm9wcykge1xuXHRcdFx0aWYgKHRoaXMucHJvcHMuaW5wdXRQcm9wcy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPT0gJ2NsYXNzTmFtZScpIHtcblx0XHRcdFx0aW5wdXRQcm9wc1trZXldID0gdGhpcy5wcm9wcy5pbnB1dFByb3BzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnByb3BzLmRpc2FibGVkKSB7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5zZWFyY2hhYmxlKSB7XG5cdFx0XHRcdGlucHV0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChJbnB1dCwgX2V4dGVuZHMoeyB2YWx1ZTogdGhpcy5zdGF0ZS5pbnB1dFZhbHVlLCBvbkNoYW5nZTogdGhpcy5oYW5kbGVJbnB1dENoYW5nZSwgbWluV2lkdGg6ICc1JyB9LCBpbnB1dFByb3BzKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbnB1dCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0aW5wdXRQcm9wcyxcblx0XHRcdFx0XHQnICdcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFhbGxvd011bHRpcGxlIHx8ICF0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGgpIHtcblx0XHRcdGlucHV0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdHsgY2xhc3NOYW1lOiAnU2VsZWN0LWlucHV0JyB9LFxuXHRcdFx0XHQnICdcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvcHMubGlzdCkge1xuXHRcdFx0aWYgKCF0aGlzLnN0YXRlLmlzUmVhZE9ubHkpIHtcblx0XHRcdFx0dmFyIHNlbGVjdG9yID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ2Ryb3Bkb3duJyB9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgeyB0eXBlOiAnaGlkZGVuJywgcmVmOiAndmFsdWUnLCBuYW1lOiB0aGlzLnByb3BzLm5hbWUsIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLCBkaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCB9KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ1NlbGVjdC1jb250cm9sJywgcmVmOiAnY29udHJvbCcsIG9uQ2xpY2s6IHRoaXMuc2VsZWN0VGV4dCwgb25LZXlEb3duOiB0aGlzLmhhbmRsZUtleURvd24sIG9uTW91c2VEb3duOiB0aGlzLmhhbmRsZU1vdXNlRG93biwgb25Ub3VjaEVuZDogdGhpcy5oYW5kbGVNb3VzZURvd24gfSxcblx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyLFxuXHRcdFx0XHRcdFx0aW5wdXQsXG5cdFx0XHRcdFx0XHRsb2FkaW5nLFxuXHRcdFx0XHRcdFx0Y2xlYXIsXG5cdFx0XHRcdFx0XHRhcnJvd1xuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0bWVudVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHR7IHJlZjogJ3dyYXBwZXInLCBjbGFzc05hbWU6IHNlbGVjdENsYXNzIH0sXG5cdFx0XHRcdHNlbGVjdG9yLFxuXHRcdFx0XHR2YWx1ZVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyByZWY6ICd3cmFwcGVyJywgY2xhc3NOYW1lOiBzZWxlY3RDbGFzcyB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICdoaWRkZW4nLCByZWY6ICd2YWx1ZScsIG5hbWU6IHRoaXMucHJvcHMubmFtZSwgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsIGRpc2FibGVkOiB0aGlzLnByb3BzLmRpc2FibGVkIH0pLFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdHsgY2xhc3NOYW1lOiAnU2VsZWN0LWNvbnRyb2wnLCByZWY6ICdjb250cm9sJywgb25LZXlEb3duOiB0aGlzLmhhbmRsZUtleURvd24sIG9uTW91c2VEb3duOiB0aGlzLmhhbmRsZU1vdXNlRG93biwgb25Ub3VjaEVuZDogdGhpcy5oYW5kbGVNb3VzZURvd24gfSxcblx0XHRcdFx0dmFsdWUsXG5cdFx0XHRcdGlucHV0LFxuXHRcdFx0XHRsb2FkaW5nLFxuXHRcdFx0XHRjbGVhcixcblx0XHRcdFx0YXJyb3dcblx0XHRcdCksXG5cdFx0XHRtZW51XG5cdFx0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0O1xuIl19
