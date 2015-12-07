require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = require('react');

var Option = React.createClass({

	displayName: 'Value',

	propTypes: {
		label: React.PropTypes.string.isRequired,
		deletable: React.PropTypes.bool
	},

	blockEvent: function blockEvent(event) {
		event.stopPropagation();
	},

	render: function render() {
		var label = this.props.label;

		if (this.props.optionLabelClick) {
			label = React.createElement(
				'a',
				{ className: 'Select-item-label__a',
					onMouseDown: this.blockEvent,
					onTouchEnd: this.props.onOptionLabelClick,
					onClick: this.props.onOptionLabelClick },
				label
			);
		}

		if (this.props.deletable) {
			var removeIcon = React.createElement(
				'span',
				{ className: 'Select-item-icon',
					onMouseDown: this.blockEvent,
					onClick: this.props.onRemove,
					onTouchEnd: this.props.onRemove },
				'×'
			);
		}

		return React.createElement(
			'div',
			{ className: 'Select-item' },
			removeIcon,
			React.createElement(
				'span',
				{ className: 'Select-item-label' },
				label
			)
		);
	}

});

module.exports = Option;

},{"react":undefined}],"react-select":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var Input = require('react-input-autosize');
var classes = require('classnames');
var Value = require('./Value');

var requestId = 0;

var Select = React.createClass({

	displayName: 'Select',

	propTypes: {
		value: React.PropTypes.any, // initial field value
		multi: React.PropTypes.bool, // multi-value input
		list: React.PropTypes.bool, // list-value input
		disabled: React.PropTypes.bool, // whether the Select is disabled or not
		options: React.PropTypes.array, // array of options
		delimiter: React.PropTypes.string, // delimiter to use to join multiple values
		asyncOptions: React.PropTypes.func, // function to call to get options
		autoload: React.PropTypes.bool, // whether to auto-load the default async options set
		placeholder: React.PropTypes.string, // field placeholder, displayed when there's no value
		noResultsText: React.PropTypes.string, // placeholder displayed when there are no matching search results
		loadingText: React.PropTypes.string, // placeholder displayed when results are still loading
		clearable: React.PropTypes.bool, // should it be possible to reset value
		clearValueText: React.PropTypes.string, // title for the "clear" control
		clearAllText: React.PropTypes.string, // title for the "clear" control when multi: true
		searchable: React.PropTypes.bool, // whether to enable searching feature or not
		searchPromptText: React.PropTypes.string, // label to prompt for search input
		name: React.PropTypes.string, // field name, for hidden <input /> tag
		onChange: React.PropTypes.func, // onChange handler: function(newValue) {}
		onFocus: React.PropTypes.func, // onFocus handler: function(event) {}
		onBlur: React.PropTypes.func, // onBlur handler: function(event) {}
		className: React.PropTypes.string, // className for the outer element
		filterOption: React.PropTypes.func, // method to filter a single option: function(option, filterString)
		filterOptions: React.PropTypes.func, // method to filter the options array: function([options], filterString, [values])
		matchPos: React.PropTypes.string, // (any|start) match the start or entire string when filtering
		matchProp: React.PropTypes.string, // (any|label|value) which option property to filter on
		inputProps: React.PropTypes.object, // custom attributes for the Input (in the Select-control) e.g: {'data-foo': 'bar'}
		listReadOnlyMode: React.PropTypes.bool, // Non editable list mode currently implemented for List select only
		maxMultiSelection: React.PropTypes.number, // Number of maximum allowed options to select on multi mode
		replaceIfMax: React.PropTypes.bool, // Replace selected values if max selection number is reached
		clearValuesOnEsc: React.PropTypes.bool, // if true pressing esc when the selector is focused and closed will clear selected values

		/*
  * Allow user to make option label clickable. When this handler is defined we should
  * wrap label into <a>label</a> tag.
  *
  * onOptionLabelClick handler: function (value, event) {}
  *
  */
		onOptionLabelClick: React.PropTypes.func
	},

	getDefaultProps: function getDefaultProps() {
		return {
			value: undefined,
			options: undefined,
			disabled: false,
			delimiter: ',',
			asyncOptions: undefined,
			autoload: true,
			placeholder: 'Select...',
			noResultsText: 'No results found',
			loadingText: 'Loading...',
			clearable: true,
			clearValueText: 'Clear value',
			clearAllText: 'Clear all',
			searchable: true,
			searchPromptText: 'Type to search',
			name: undefined,
			onChange: undefined,
			className: undefined,
			matchPos: 'any',
			matchProp: 'any',
			inputProps: {},
			listReadOnlyMode: false,
			maxMultiSelection: -1,
			replaceIfMax: false,
			clearValuesOnEsc: false,

			onOptionLabelClick: undefined
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
			options: this.props.options,
			isFocused: false,
			isOpen: false,
			isLoading: false,
			isReadOnly: this.props.listReadOnlyMode
		};
	},

	componentWillMount: function componentWillMount() {
		this._optionsCache = {};
		this._optionsFilterString = '';
		this.setState(this.getStateFromValue(this.props.value));

		if (this.props.asyncOptions && this.props.autoload) {
			this.setState({
				isLoading: true
			});
			this.autoloadAsyncOptions();
		}

		var self = this;
		this._closeMenuIfClickedOutside = function (event) {
			if (!self.state.isOpen) {
				return;
			}
			var menuElem = self.refs.selectMenuContainer.getDOMNode();
			var controlElem = self.refs.control.getDOMNode();

			var eventOccuredOutsideMenu = self.clickedOutsideElement(menuElem, event);
			var eventOccuredOutsideControl = self.clickedOutsideElement(controlElem, event);

			// Hide dropdown menu if click occurred outside of menu
			if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
				self.setState({
					isOpen: false
				}, self._unbindCloseMenuIfClickedOutside);
			}
		};

		this._bindCloseMenuIfClickedOutside = function () {
			document.addEventListener('click', self._closeMenuIfClickedOutside);
		};

		this._unbindCloseMenuIfClickedOutside = function () {
			document.removeEventListener('click', self._closeMenuIfClickedOutside);
		};
	},

	componentWillUnmount: function componentWillUnmount() {
		clearTimeout(this._blurTimeout);
		clearTimeout(this._focusTimeout);

		if (this.state.isOpen) {
			this._unbindCloseMenuIfClickedOutside();
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(newProps) {
		if (newProps.options !== this.props.options) {
			this.setState({
				options: newProps.options,
				filteredOptions: this.filterOptions(newProps.options)
			});
		}
		if (newProps.value !== this.state.value) {
			var stateChanges = this.getStateFromValue(newProps.value, newProps.options);
			stateChanges.isLoading = false;
			delete stateChanges.inputValue;
			this.setState(stateChanges);
		}
	},

	componentDidUpdate: function componentDidUpdate() {
		var self = this;

		if (!this.props.disabled && this._focusAfterUpdate) {
			clearTimeout(this._blurTimeout);

			this._focusTimeout = setTimeout(function () {
				self.getInputNode().focus();
				self._focusAfterUpdate = false;
			}, 50);
		}

		if (this._focusedOptionReveal) {
			if (this.refs.focused && this.refs.menu) {
				var focusedDOM = this.refs.focused.getDOMNode();
				var menuDOM = this.refs.menu.getDOMNode();
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

	getStateFromValue: function getStateFromValue(value, options) {
		if (!options) {
			options = this.state.options;
		}

		// reset internal filter string
		this._optionsFilterString = '';

		var values = this.initValuesArray(value, options),
		    filteredOptions = this.filterOptions(options, values),
		    allowsMultiple = this.props.multi || this.props.list;

		return {
			value: values.map(function (v) {
				return v.value;
			}).join(this.props.delimiter),
			values: values,
			inputValue: '',
			filteredOptions: filteredOptions,
			placeholder: !allowsMultiple && values.length ? values[0].label : this.props.placeholder,
			focusedOption: !allowsMultiple && values.length ? values[0] : filteredOptions[0]
		};
	},

	initValuesArray: function initValuesArray(values, options) {
		if (!Array.isArray(values)) {
			if (typeof values === 'string') {
				values = values.split(this.props.delimiter);
			} else {
				values = values ? [values] : [];
			}
		}

		return values.map(function (val) {
			if (typeof val === 'string') {
				for (var key in options) {
					if (options.hasOwnProperty(key) && options[key] && options[key].value === val) {
						return options[key];
					}
				}
				return { value: val, label: val };
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
		this.setValue(null);
	},

	resetValue: function resetValue() {
		this.setValue(this.state.value === '' ? null : this.state.value);
	},

	getInputNode: function getInputNode() {
		var input = this.refs.input;
		return this.props.searchable ? input : input.getDOMNode();
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

	handleInputFocus: function handleInputFocus(event) {
		var newIsOpen = this.state.isOpen || this._openAfterFocus;
		this.setState({
			isFocused: true,
			isOpen: newIsOpen
		}, function () {
			if (newIsOpen) {
				this._bindCloseMenuIfClickedOutside();
			} else {
				this._unbindCloseMenuIfClickedOutside();
			}
		});
		this._openAfterFocus = false;

		if (this.props.onFocus) {
			this.props.onFocus(event);
		}
	},

	handleInputBlur: function handleInputBlur(event) {
		var self = this;

		this._blurTimeout = setTimeout(function () {
			if (self._focusAfterUpdate) return;

			self.setState({
				isFocused: false
			});
		}, 50);

		if (this.props.onBlur) {
			this.props.onBlur(event);
		}
	},

	handleKeyDown: function handleKeyDown(event) {
		if (this.state.disabled) return;

		switch (event.keyCode) {

			case 8:
				// backspace
				if (!this.state.inputValue && !this.props.list) {
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
				this.selectFocusedOption();
				break;

			case 27:
				// escape
				if (this.state.isOpen) {
					this.resetValue();
				} else if (this.props.clearValuesOnEsc) {
					this.clearValue();
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
		return filteredOptions[0];
	},

	handleInputChange: function handleInputChange(event) {
		// assign an internal variable because we need to use
		// the latest value before setState() has completed.
		this._optionsFilterString = event.target.value;

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
		var self = this;
		this.loadAsyncOptions('', {}, function () {
			// update with fetched but don't focus
			self.setState({
				isLoading: false
			});
			self.setValue(self.props.value, false);
		});
	},

	loadAsyncOptions: function loadAsyncOptions(input, state, callback) {
		var thisRequestId = this._currentRequestId = requestId++;

		for (var i = 0; i <= input.length; i++) {
			var cacheKey = input.slice(0, i);
			if (this._optionsCache[cacheKey] && (input === cacheKey || this._optionsCache[cacheKey].complete)) {
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
				if (callback) callback({});
				return;
			}
		}

		var self = this;
		this.props.asyncOptions(input, function (err, data) {

			if (err) throw err;

			self._optionsCache[input] = data;

			if (thisRequestId !== self._currentRequestId) {
				return;
			}
			var filteredOptions = self.filterOptions(data.options);

			var newState = {
				options: data.options,
				filteredOptions: filteredOptions,
				focusedOption: self._getNewFocusedOption(filteredOptions)
			};
			for (var key in state) {
				if (state.hasOwnProperty(key)) {
					newState[key] = state[key];
				}
			}
			self.setState(newState);

			if (callback) callback({});
		});
	},

	filterOptions: function filterOptions(options, values) {
		if (!this.props.searchable) {
			return options;
		}

		var filterValue = this._optionsFilterString;
		var exclude = (values || this.state.values).map(function (i) {
			return i.value;
		});
		if (this.props.filterOptions) {
			return this.props.filterOptions.call(this, options, filterValue, exclude);
		} else {
			var filterOption = function filterOption(op) {
				if ((this.props.multi || this.props.list) && exclude.indexOf(op.value) > -1) return false;
				if (this.props.filterOption) return this.props.filterOption.call(this, op, filterValue);
				var valueTest = String(op.value),
				    labelTest = String(op.label);
				return !filterValue || this.props.matchPos === 'start' ? this.props.matchProp !== 'label' && valueTest.toLowerCase().substr(0, filterValue.length) === filterValue || this.props.matchProp !== 'value' && labelTest.toLowerCase().substr(0, filterValue.length) === filterValue : this.props.matchProp !== 'label' && valueTest.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0 || this.props.matchProp !== 'value' && labelTest.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0;
			};
			return (options || []).filter(filterOption, this);
		}
	},

	selectFocusedOption: function selectFocusedOption() {
		return this.selectValue(this.state.focusedOption);
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

		var ops = this.state.filteredOptions;

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
		return op.id ? op.id : op.value;
	},

	buildMenu: function buildMenu() {
		var focusedValue = this.state.focusedOption ? this.state.focusedOption.value : null;

		if (this.state.filteredOptions.length > 0) {
			focusedValue = focusedValue == null ? this.state.filteredOptions[0] : focusedValue;
		}

		var ops = Object.keys(this.state.filteredOptions).map(function (key) {
			var op = this.state.filteredOptions[key];
			var isFocused = focusedValue === op.value;

			var optionClass = classes({
				'Select-option': true,
				'is-focused': isFocused,
				'is-disabled': op.disabled
			});

			var ref = isFocused ? 'focused' : null;

			var mouseEnter = this.focusOption.bind(this, op);
			var mouseLeave = this.unfocusOption.bind(this, op);
			var mouseDown = this.selectValue.bind(this, op);

			if (op.disabled) {
				return React.createElement(
					'div',
					{ ref: ref, key: 'option-' + this.getIdentifier(op), className: optionClass },
					op.label
				);
			} else {
				return React.createElement(
					'div',
					{ ref: ref, key: 'option-' + this.getIdentifier(op), className: optionClass, onMouseEnter: mouseEnter, onMouseLeave: mouseLeave, onMouseDown: mouseDown, onClick: mouseDown },
					op.label
				);
			}
		}, this);
		if (this.state.isLoading && this.props.asyncOptions) {
			return ops.length ? ops : React.createElement(
				'div',
				{ className: 'Select-noresults' },
				this.props.loadingText
			);
		} else {
			return ops.length ? ops : React.createElement(
				'div',
				{ className: 'Select-noresults' },
				this.props.asyncOptions && !this.state.inputValue ? this.props.searchPromptText : this.props.noResultsText
			);
		}
	},

	toggleDropdown: function toggleDropdown(event) {
		var isOpen = this.state.isOpen;
		if (isOpen) {
			this.setState({
				isOpen: false
			});

			event.stopPropagation();
			event.preventDefault();
		}
	},

	closeDropdown: function closeDropdown() {
		this.setState({
			isOpen: false
		}, this._unbindCloseMenuIfClickedOutside);
	},

	handleOptionLabelClick: function handleOptionLabelClick(value, event) {
		var handler = this.props.onOptionLabelClick;

		if (handler) {
			handler(value, event);
		}
	},

	render: function render() {
		var selectClass = classes('Select', this.props.className, {
			'is-multi': this.props.multi,
			'is-searchable': this.props.searchable,
			'is-open': this.state.isOpen,
			'is-focused': this.state.isFocused,
			'is-loading': this.state.isLoading,
			'is-disabled': this.props.disabled,
			'has-value': this.state.value,
			'is-list': this.props.list
		});

		var value = [],
		    placeholder,
		    allowMultiple = this.props.multi || this.props.list;

		if (allowMultiple) {
			this.state.values.forEach(function (val) {
				var props = {
					key: this.getIdentifier(val),
					optionLabelClick: !!this.props.onOptionLabelClick,
					onOptionLabelClick: this.handleOptionLabelClick.bind(this, val),
					onRemove: this.removeValue.bind(this, val),
					deletable: !this.state.isReadOnly
				};
				for (var key in val) {
					if (val.hasOwnProperty(key)) {
						props[key] = val[key];
					}
				}
				value.push(React.createElement(Value, props));
			}, this);
		}

		if (this.props.disabled || !this.state.inputValue && (!this.props.multi || !value.length)) {
			if (this.props.list) {
				placeholder = React.createElement(
					'div',
					{ className: 'Select-placeholder', key: 'placeholder' },
					this.state.placeholder
				);
			} else {
				value.push(React.createElement(
					'div',
					{ className: 'Select-placeholder', key: 'placeholder' },
					this.state.placeholder
				));
			}
		}

		var loading = this.state.isLoading ? React.createElement('span', { className: 'Select-loading', 'aria-hidden': 'true' }) : null;
		var clear = this.props.clearable && this.state.value && !this.props.disabled ? React.createElement('span', { className: 'Select-clear', title: allowMultiple ? this.props.clearAllText : this.props.clearValueText, 'aria-label': allowMultiple ? this.props.clearAllText : this.props.clearValueText, onMouseDown: this.clearValue, onClick: this.clearValue, dangerouslySetInnerHTML: { __html: '&times;' } }) : null;

		var menu;
		var menuProps;
		if (this.state.isOpen) {
			menuProps = {
				ref: 'menu',
				className: 'Select-menu'
			};
			if (allowMultiple) {
				menuProps.onMouseDown = this.handleMouseDown;
			}
			menu = React.createElement(
				'div',
				{ ref: 'selectMenuContainer', className: 'Select-menu-outer' },
				React.createElement(
					'div',
					menuProps,
					this.buildMenu()
				)
			);
		}

		var input;
		var inputProps = {
			ref: 'input',
			className: 'Select-input',
			tabIndex: this.props.tabIndex || 0,
			onFocus: this.handleInputFocus,
			onBlur: this.handleInputBlur
		};
		for (var key in this.props.inputProps) {
			if (this.props.inputProps.hasOwnProperty(key)) {
				inputProps[key] = this.props.inputProps[key];
			}
		}

		if (this.props.searchable && !this.props.disabled) {
			input = React.createElement(Input, _extends({ value: this.state.inputValue, onChange: this.handleInputChange, minWidth: '5' }, inputProps));
		} else {
			input = React.createElement(
				'div',
				inputProps,
				' '
			);
		}

		if (this.props.list) {
			if (!this.state.isReadOnly) {
				var selector = React.createElement(
					'div',
					{ className: 'dropdown' },
					React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value,
						disabled: this.props.disabled }),
					React.createElement(
						'div',
						{ className: 'Select-control', ref: 'control', onClick: this.selectText, onKeyDown: this.handleKeyDown,
							onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
						placeholder,
						input,
						React.createElement('span', { className: 'Select-arrow', onMouseDown: this.toggleDropdown }),
						loading
					),
					menu
				);
			}
			return React.createElement(
				'div',
				{ ref: 'wrapper', className: selectClass },
				selector,
				value
			);
		}

		return React.createElement(
			'div',
			{ ref: 'wrapper', className: selectClass },
			React.createElement('input', { type: 'hidden', ref: 'value', name: this.props.name, value: this.state.value, disabled: this.props.disabled }),
			React.createElement(
				'div',
				{ className: 'Select-control', ref: 'control', onClick: this.selectText, onKeyDown: this.handleKeyDown, onMouseDown: this.handleMouseDown, onTouchEnd: this.handleMouseDown },
				value,
				input,
				React.createElement('span', { className: 'Select-arrow', onMouseDown: this.toggleDropdown }),
				loading,
				clear
			),
			menu
		);
	}

});

module.exports = Select;

},{"./Value":1,"classnames":undefined,"react":undefined,"react-input-autosize":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdGhvbWFzL3JlcG9zaXRvcmllcy9yZWFjdC1zZWxlY3Qvc3JjL1ZhbHVlLmpzIiwiL1VzZXJzL3Rob21hcy9yZXBvc2l0b3JpZXMvcmVhY3Qtc2VsZWN0L3NyYy9TZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0IsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFOUIsWUFBVyxFQUFFLE9BQU87O0FBRXBCLFVBQVMsRUFBRTtBQUNWLE9BQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3hDLFdBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7RUFDL0I7O0FBRUQsV0FBVSxFQUFFLG9CQUFTLEtBQUssRUFBRTtBQUMzQixPQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7RUFDeEI7O0FBRUQsT0FBTSxFQUFFLGtCQUFXO0FBQ2xCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixNQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDaEMsUUFBSyxHQUNKOztNQUFHLFNBQVMsRUFBQyxzQkFBc0I7QUFDbEMsZ0JBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDO0FBQzdCLGVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixBQUFDO0FBQzFDLFlBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixBQUFDO0lBQ3RDLEtBQUs7SUFDSCxBQUNKLENBQUM7R0FDRjs7QUFFRCxNQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFDO0FBQ3ZCLE9BQUksVUFBVSxHQUFJOztNQUFNLFNBQVMsRUFBQyxrQkFB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QUFXLEVBQUUsSUFBSSxDQUFDLGNBQWMsQUFBQyxHQUFFO0lBQ2pFLE9BQU87SUFDUCxLQUFLO0lBQ0Q7R0FDTCxJQUFJO0dBQ0EsQ0FDTDtFQUNGOztDQUVELENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgT3B0aW9uID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnVmFsdWUnLFxuXG5cdHByb3BUeXBlczoge1xuXHRcdGxhYmVsOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG5cdFx0ZGVsZXRhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuXHR9LFxuXG5cdGJsb2NrRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGFiZWwgPSB0aGlzLnByb3BzLmxhYmVsO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMub3B0aW9uTGFiZWxDbGljaykge1xuXHRcdFx0bGFiZWwgPSAoXG5cdFx0XHRcdDxhIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWxhYmVsX19hXCJcblx0XHRcdFx0XHRvbk1vdXNlRG93bj17dGhpcy5ibG9ja0V2ZW50fVxuXHRcdFx0XHRcdG9uVG91Y2hFbmQ9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrfT5cblx0XHRcdFx0XHR7bGFiZWx9XG5cdFx0XHRcdDwvYT5cblx0XHRcdCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmKHRoaXMucHJvcHMuZGVsZXRhYmxlKXtcblx0XHRcdHZhciByZW1vdmVJY29uID0gKDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtLWljb25cIlxuXHRcdFx0XHRcdFx0XHRcdG9uTW91c2VEb3duPXt0aGlzLmJsb2NrRXZlbnR9XG5cdFx0XHRcdFx0XHRcdFx0b25DbGljaz17dGhpcy5wcm9wcy5vblJlbW92ZX1cblx0XHRcdFx0XHRcdFx0XHRvblRvdWNoRW5kPXt0aGlzLnByb3BzLm9uUmVtb3ZlfT4mdGltZXM7PC9zcGFuPik7XG5cdFx0fVxuXHRcdFxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cIlNlbGVjdC1pdGVtXCI+XG5cdFx0XHRcdHtyZW1vdmVJY29ufVxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtaXRlbS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgSW5wdXQgPSByZXF1aXJlKCdyZWFjdC1pbnB1dC1hdXRvc2l6ZScpO1xudmFyIGNsYXNzZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgVmFsdWUgPSByZXF1aXJlKCcuL1ZhbHVlJyk7XG5cbnZhciByZXF1ZXN0SWQgPSAwO1xuXG52YXIgU2VsZWN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG5cdGRpc3BsYXlOYW1lOiAnU2VsZWN0JyxcblxuXHRwcm9wVHlwZXM6IHtcblx0XHR2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLmFueSwgICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBmaWVsZCB2YWx1ZVxuXHRcdG11bHRpOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgICAgICAvLyBtdWx0aS12YWx1ZSBpbnB1dFxuXHRcdGxpc3Q6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgICAgICAvLyBsaXN0LXZhbHVlIGlucHV0XG5cdFx0ZGlzYWJsZWQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAgIC8vIHdoZXRoZXIgdGhlIFNlbGVjdCBpcyBkaXNhYmxlZCBvciBub3Rcblx0XHRvcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksICAgICAgICAgICAgLy8gYXJyYXkgb2Ygb3B0aW9uc1xuXHRcdGRlbGltaXRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgICAvLyBkZWxpbWl0ZXIgdG8gdXNlIHRvIGpvaW4gbXVsdGlwbGUgdmFsdWVzXG5cdFx0YXN5bmNPcHRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYywgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGNhbGwgdG8gZ2V0IG9wdGlvbnNcblx0XHRhdXRvbG9hZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsICAgICAgICAgICAgLy8gd2hldGhlciB0byBhdXRvLWxvYWQgdGhlIGRlZmF1bHQgYXN5bmMgb3B0aW9ucyBzZXRcblx0XHRwbGFjZWhvbGRlcjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZywgICAgICAgLy8gZmllbGQgcGxhY2Vob2xkZXIsIGRpc3BsYXllZCB3aGVuIHRoZXJlJ3Mgbm8gdmFsdWVcblx0XHRub1Jlc3VsdHNUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgLy8gcGxhY2Vob2xkZXIgZGlzcGxheWVkIHdoZW4gdGhlcmUgYXJlIG5vIG1hdGNoaW5nIHNlYXJjaCByZXN1bHRzXG5cdFx0bG9hZGluZ1RleHQ6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXHQgICAvLyBwbGFjZWhvbGRlciBkaXNwbGF5ZWQgd2hlbiByZXN1bHRzIGFyZSBzdGlsbCBsb2FkaW5nXG5cdFx0Y2xlYXJhYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCwgICAgICAgICAgIC8vIHNob3VsZCBpdCBiZSBwb3NzaWJsZSB0byByZXNldCB2YWx1ZVxuXHRcdGNsZWFyVmFsdWVUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAvLyB0aXRsZSBmb3IgdGhlIFwiY2xlYXJcIiBjb250cm9sXG5cdFx0Y2xlYXJBbGxUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgIC8vIHRpdGxlIGZvciB0aGUgXCJjbGVhclwiIGNvbnRyb2wgd2hlbiBtdWx0aTogdHJ1ZVxuXHRcdHNlYXJjaGFibGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLCAgICAgICAgICAvLyB3aGV0aGVyIHRvIGVuYWJsZSBzZWFyY2hpbmcgZmVhdHVyZSBvciBub3Rcblx0XHRzZWFyY2hQcm9tcHRUZXh0OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgLy8gbGFiZWwgdG8gcHJvbXB0IGZvciBzZWFyY2ggaW5wdXRcblx0XHRuYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgICAgICAgLy8gZmllbGQgbmFtZSwgZm9yIGhpZGRlbiA8aW5wdXQgLz4gdGFnXG5cdFx0b25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgIC8vIG9uQ2hhbmdlIGhhbmRsZXI6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7fVxuXHRcdG9uRm9jdXM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgICAgICAvLyBvbkZvY3VzIGhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7fVxuXHRcdG9uQmx1cjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsICAgICAgICAgICAgICAvLyBvbkJsdXIgaGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIHt9XG5cdFx0Y2xhc3NOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIGNsYXNzTmFtZSBmb3IgdGhlIG91dGVyIGVsZW1lbnRcblx0XHRmaWx0ZXJPcHRpb246IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAgLy8gbWV0aG9kIHRvIGZpbHRlciBhIHNpbmdsZSBvcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgZmlsdGVyU3RyaW5nKVxuXHRcdGZpbHRlck9wdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLCAgICAgICAvLyBtZXRob2QgdG8gZmlsdGVyIHRoZSBvcHRpb25zIGFycmF5OiBmdW5jdGlvbihbb3B0aW9uc10sIGZpbHRlclN0cmluZywgW3ZhbHVlc10pXG5cdFx0bWF0Y2hQb3M6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsICAgICAgICAgIC8vIChhbnl8c3RhcnQpIG1hdGNoIHRoZSBzdGFydCBvciBlbnRpcmUgc3RyaW5nIHdoZW4gZmlsdGVyaW5nXG5cdFx0bWF0Y2hQcm9wOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLCAgICAgICAgIC8vIChhbnl8bGFiZWx8dmFsdWUpIHdoaWNoIG9wdGlvbiBwcm9wZXJ0eSB0byBmaWx0ZXIgb25cblx0XHRpbnB1dFByb3BzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LCAgICAgICAgLy8gY3VzdG9tIGF0dHJpYnV0ZXMgZm9yIHRoZSBJbnB1dCAoaW4gdGhlIFNlbGVjdC1jb250cm9sKSBlLmc6IHsnZGF0YS1mb28nOiAnYmFyJ31cblx0XHRsaXN0UmVhZE9ubHlNb2RlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcdCAgIC8vIE5vbiBlZGl0YWJsZSBsaXN0IG1vZGUgY3VycmVudGx5IGltcGxlbWVudGVkIGZvciBMaXN0IHNlbGVjdCBvbmx5XG5cdFx0bWF4TXVsdGlTZWxlY3Rpb246IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsIC8vIE51bWJlciBvZiBtYXhpbXVtIGFsbG93ZWQgb3B0aW9ucyB0byBzZWxlY3Qgb24gbXVsdGkgbW9kZVxuXHRcdHJlcGxhY2VJZk1heDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXHRcdCAgIC8vIFJlcGxhY2Ugc2VsZWN0ZWQgdmFsdWVzIGlmIG1heCBzZWxlY3Rpb24gbnVtYmVyIGlzIHJlYWNoZWRcblx0XHRjbGVhclZhbHVlc09uRXNjOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcdCAgIC8vIGlmIHRydWUgcHJlc3NpbmcgZXNjIHdoZW4gdGhlIHNlbGVjdG9yIGlzIGZvY3VzZWQgYW5kIGNsb3NlZCB3aWxsIGNsZWFyIHNlbGVjdGVkIHZhbHVlc1xuXG5cdFx0Lypcblx0XHQqIEFsbG93IHVzZXIgdG8gbWFrZSBvcHRpb24gbGFiZWwgY2xpY2thYmxlLiBXaGVuIHRoaXMgaGFuZGxlciBpcyBkZWZpbmVkIHdlIHNob3VsZFxuXHRcdCogd3JhcCBsYWJlbCBpbnRvIDxhPmxhYmVsPC9hPiB0YWcuXG5cdFx0KlxuXHRcdCogb25PcHRpb25MYWJlbENsaWNrIGhhbmRsZXI6IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHt9XG5cdFx0KlxuXHRcdCovXG5cdFx0b25PcHRpb25MYWJlbENsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuXHR9LFxuXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRvcHRpb25zOiB1bmRlZmluZWQsXG5cdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHRkZWxpbWl0ZXI6ICcsJyxcblx0XHRcdGFzeW5jT3B0aW9uczogdW5kZWZpbmVkLFxuXHRcdFx0YXV0b2xvYWQ6IHRydWUsXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1NlbGVjdC4uLicsXG5cdFx0XHRub1Jlc3VsdHNUZXh0OiAnTm8gcmVzdWx0cyBmb3VuZCcsXG5cdFx0XHRsb2FkaW5nVGV4dDogJ0xvYWRpbmcuLi4nLFxuXHRcdFx0Y2xlYXJhYmxlOiB0cnVlLFxuXHRcdFx0Y2xlYXJWYWx1ZVRleHQ6ICdDbGVhciB2YWx1ZScsXG5cdFx0XHRjbGVhckFsbFRleHQ6ICdDbGVhciBhbGwnLFxuXHRcdFx0c2VhcmNoYWJsZTogdHJ1ZSxcblx0XHRcdHNlYXJjaFByb21wdFRleHQ6ICdUeXBlIHRvIHNlYXJjaCcsXG5cdFx0XHRuYW1lOiB1bmRlZmluZWQsXG5cdFx0XHRvbkNoYW5nZTogdW5kZWZpbmVkLFxuXHRcdFx0Y2xhc3NOYW1lOiB1bmRlZmluZWQsXG5cdFx0XHRtYXRjaFBvczogJ2FueScsXG5cdFx0XHRtYXRjaFByb3A6ICdhbnknLFxuXHRcdFx0aW5wdXRQcm9wczoge30sXG5cdFx0XHRsaXN0UmVhZE9ubHlNb2RlOiBmYWxzZSxcblx0XHRcdG1heE11bHRpU2VsZWN0aW9uOiAtMSxcblx0XHRcdHJlcGxhY2VJZk1heDogZmFsc2UsXG5cdFx0XHRjbGVhclZhbHVlc09uRXNjOiBmYWxzZSxcblxuXHRcdFx0b25PcHRpb25MYWJlbENsaWNrOiB1bmRlZmluZWRcblx0XHR9O1xuXHR9LFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdC8qXG5cdFx0XHQgKiBzZXQgYnkgZ2V0U3RhdGVGcm9tVmFsdWUgb24gY29tcG9uZW50V2lsbE1vdW50OlxuXHRcdFx0ICogLSB2YWx1ZVxuXHRcdFx0ICogLSB2YWx1ZXNcblx0XHRcdCAqIC0gZmlsdGVyZWRPcHRpb25zXG5cdFx0XHQgKiAtIGlucHV0VmFsdWVcblx0XHRcdCAqIC0gcGxhY2Vob2xkZXJcblx0XHRcdCAqIC0gZm9jdXNlZE9wdGlvblxuXHRcdFx0Ki9cblx0XHRcdG9wdGlvbnM6IHRoaXMucHJvcHMub3B0aW9ucyxcblx0XHRcdGlzRm9jdXNlZDogZmFsc2UsXG5cdFx0XHRpc09wZW46IGZhbHNlLFxuXHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdGlzUmVhZE9ubHk6IHRoaXMucHJvcHMubGlzdFJlYWRPbmx5TW9kZVxuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9vcHRpb25zQ2FjaGUgPSB7fTtcblx0XHR0aGlzLl9vcHRpb25zRmlsdGVyU3RyaW5nID0gJyc7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLmdldFN0YXRlRnJvbVZhbHVlKHRoaXMucHJvcHMudmFsdWUpKTtcblxuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiB0aGlzLnByb3BzLmF1dG9sb2FkKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0aXNMb2FkaW5nOnRydWVcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5hdXRvbG9hZEFzeW5jT3B0aW9ucygpO1xuXHRcdH1cblxuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLl9jbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmICghc2VsZi5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1lbnVFbGVtID0gc2VsZi5yZWZzLnNlbGVjdE1lbnVDb250YWluZXIuZ2V0RE9NTm9kZSgpO1xuXHRcdFx0dmFyIGNvbnRyb2xFbGVtID0gc2VsZi5yZWZzLmNvbnRyb2wuZ2V0RE9NTm9kZSgpO1xuXG5cdFx0XHR2YXIgZXZlbnRPY2N1cmVkT3V0c2lkZU1lbnUgPSBzZWxmLmNsaWNrZWRPdXRzaWRlRWxlbWVudChtZW51RWxlbSwgZXZlbnQpO1xuXHRcdFx0dmFyIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sID0gc2VsZi5jbGlja2VkT3V0c2lkZUVsZW1lbnQoY29udHJvbEVsZW0sIGV2ZW50KTtcblxuXHRcdFx0Ly8gSGlkZSBkcm9wZG93biBtZW51IGlmIGNsaWNrIG9jY3VycmVkIG91dHNpZGUgb2YgbWVudVxuXHRcdFx0aWYgKGV2ZW50T2NjdXJlZE91dHNpZGVNZW51ICYmIGV2ZW50T2NjdXJlZE91dHNpZGVDb250cm9sKSB7XG5cdFx0XHRcdHNlbGYuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdGlzT3BlbjogZmFsc2Vcblx0XHRcdFx0fSwgc2VsZi5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH07XG5cblx0XHR0aGlzLl91bmJpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGYuX2Nsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH07XG5cdH0sXG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9ibHVyVGltZW91dCk7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2ZvY3VzVGltZW91dCk7XG5cblx0XHRpZih0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXdQcm9wcykge1xuXHRcdGlmIChuZXdQcm9wcy5vcHRpb25zICE9PSB0aGlzLnByb3BzLm9wdGlvbnMpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRvcHRpb25zOiBuZXdQcm9wcy5vcHRpb25zLFxuXHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IHRoaXMuZmlsdGVyT3B0aW9ucyhuZXdQcm9wcy5vcHRpb25zKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChuZXdQcm9wcy52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSkge1xuXHRcdFx0dmFyIHN0YXRlQ2hhbmdlcyA9IHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUobmV3UHJvcHMudmFsdWUsIG5ld1Byb3BzLm9wdGlvbnMpO1xuXHRcdFx0c3RhdGVDaGFuZ2VzLmlzTG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0ZGVsZXRlIHN0YXRlQ2hhbmdlcy5pbnB1dFZhbHVlO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZShzdGF0ZUNoYW5nZXMpO1xuXHRcdH1cblx0fSxcblxuXHRjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCAmJiB0aGlzLl9mb2N1c0FmdGVyVXBkYXRlKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5fYmx1clRpbWVvdXQpO1xuXG5cdFx0XHR0aGlzLl9mb2N1c1RpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdFx0XHRcdHNlbGYuX2ZvY3VzQWZ0ZXJVcGRhdGUgPSBmYWxzZTtcblx0XHRcdH0sIDUwKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fZm9jdXNlZE9wdGlvblJldmVhbCkge1xuXHRcdFx0aWYgKHRoaXMucmVmcy5mb2N1c2VkICYmIHRoaXMucmVmcy5tZW51KSB7XG5cdFx0XHRcdHZhciBmb2N1c2VkRE9NID0gdGhpcy5yZWZzLmZvY3VzZWQuZ2V0RE9NTm9kZSgpO1xuXHRcdFx0XHR2YXIgbWVudURPTSA9IHRoaXMucmVmcy5tZW51LmdldERPTU5vZGUoKTtcblx0XHRcdFx0dmFyIGZvY3VzZWRSZWN0ID0gZm9jdXNlZERPTS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0dmFyIG1lbnVSZWN0ID0gbWVudURPTS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdFx0XHRpZiAoZm9jdXNlZFJlY3QuYm90dG9tID4gbWVudVJlY3QuYm90dG9tIHx8XG5cdFx0XHRcdFx0Zm9jdXNlZFJlY3QudG9wIDwgbWVudVJlY3QudG9wKSB7XG5cdFx0XHRcdFx0bWVudURPTS5zY3JvbGxUb3AgPSAoZm9jdXNlZERPTS5vZmZzZXRUb3AgKyBmb2N1c2VkRE9NLmNsaWVudEhlaWdodCAtIG1lbnVET00ub2Zmc2V0SGVpZ2h0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9mb2N1c2VkT3B0aW9uUmV2ZWFsID0gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdGZvY3VzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmdldElucHV0Tm9kZSgpLmZvY3VzKCk7XG5cdH0sXG5cblx0dG9nZ2xlRWRpdCA6IGZ1bmN0aW9uKHJlYWRPbmx5KSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRpc1JlYWRPbmx5IDogcmVhZE9ubHlcblx0XHR9KTtcblx0fSxcblxuXHRjbGlja2VkT3V0c2lkZUVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGV2ZW50KSB7XG5cdFx0dmFyIGV2ZW50VGFyZ2V0ID0gKGV2ZW50LnRhcmdldCkgPyBldmVudC50YXJnZXQgOiBldmVudC5zcmNFbGVtZW50O1xuXHRcdHdoaWxlIChldmVudFRhcmdldCAhPSBudWxsKSB7XG5cdFx0XHRpZiAoZXZlbnRUYXJnZXQgPT09IGVsZW1lbnQpIHJldHVybiBmYWxzZTtcblx0XHRcdGV2ZW50VGFyZ2V0ID0gZXZlbnRUYXJnZXQub2Zmc2V0UGFyZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRnZXRTdGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSB0aGlzLnN0YXRlLm9wdGlvbnM7XG5cdFx0fVxuXG5cdFx0Ly8gcmVzZXQgaW50ZXJuYWwgZmlsdGVyIHN0cmluZ1xuXHRcdHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmcgPSAnJztcblxuXHRcdHZhciB2YWx1ZXMgPSB0aGlzLmluaXRWYWx1ZXNBcnJheSh2YWx1ZSwgb3B0aW9ucyksXG5cdFx0XHRmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMob3B0aW9ucywgdmFsdWVzKSxcblx0XHRcdGFsbG93c011bHRpcGxlID0gdGhpcy5wcm9wcy5tdWx0aSB8fCB0aGlzLnByb3BzLmxpc3Q7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dmFsdWU6IHZhbHVlcy5tYXAoZnVuY3Rpb24odikgeyByZXR1cm4gdi52YWx1ZTsgfSkuam9pbih0aGlzLnByb3BzLmRlbGltaXRlciksXG5cdFx0XHR2YWx1ZXM6IHZhbHVlcyxcblx0XHRcdGlucHV0VmFsdWU6ICcnLFxuXHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRwbGFjZWhvbGRlcjogIWFsbG93c011bHRpcGxlICYmIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXNbMF0ubGFiZWwgOiB0aGlzLnByb3BzLnBsYWNlaG9sZGVyLFxuXHRcdFx0Zm9jdXNlZE9wdGlvbjogIWFsbG93c011bHRpcGxlICYmIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXNbMF0gOiBmaWx0ZXJlZE9wdGlvbnNbMF1cblx0XHR9O1xuXHR9LFxuXG5cdGluaXRWYWx1ZXNBcnJheTogZnVuY3Rpb24odmFsdWVzLCBvcHRpb25zKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsdWVzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHR2YWx1ZXMgPSB2YWx1ZXMuc3BsaXQodGhpcy5wcm9wcy5kZWxpbWl0ZXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsdWVzID0gdmFsdWVzID8gW3ZhbHVlc10gOiBbXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWVzLm1hcChmdW5jdGlvbih2YWwpIHtcblx0XHRcdGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRcdGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KGtleSkgJiYgb3B0aW9uc1trZXldICYmIG9wdGlvbnNba2V5XS52YWx1ZSA9PT0gdmFsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb3B0aW9uc1trZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4geyB2YWx1ZTogdmFsLCBsYWJlbDogdmFsIH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdmFsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSwgZm9jdXNBZnRlclVwZGF0ZSkge1xuXHRcdGlmIChmb2N1c0FmdGVyVXBkYXRlIHx8IGZvY3VzQWZ0ZXJVcGRhdGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fZm9jdXNBZnRlclVwZGF0ZSA9IHRydWU7XG5cdFx0fVxuXHRcdHZhciBuZXdTdGF0ZSA9IHRoaXMuZ2V0U3RhdGVGcm9tVmFsdWUodmFsdWUpO1xuXHRcdG5ld1N0YXRlLmlzT3BlbiA9IGZhbHNlO1xuXHRcdHRoaXMuZmlyZUNoYW5nZUV2ZW50KG5ld1N0YXRlKTtcblx0XHR0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcblx0fSxcblxuXHRzZWxlY3RWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAoIXRoaXMucHJvcHMubXVsdGkgJiYgIXRoaXMucHJvcHMubGlzdCkge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSkge1xuXHRcdFx0dGhpcy5hZGRNdWx0aVNlbGVjdFZhbHVlKHZhbHVlKTtcblx0XHR9XG5cdFx0dGhpcy5fdW5iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHR9LFxuXHRcblx0YWRkTXVsdGlTZWxlY3RWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5tYXhNdWx0aVNlbGVjdGlvbiA+IDApIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGggKzEgPiB0aGlzLnByb3BzLm1heE11bHRpU2VsZWN0aW9uICYmIHRoaXMucHJvcHMucmVwbGFjZUlmTWF4KSB7XG5cdFx0XHRcdHRoaXMucmVwbGFjZVZhbHVlKHZhbHVlKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52YWx1ZXMubGVuZ3RoICsgMSA8PSB0aGlzLnByb3BzLm1heE11bHRpU2VsZWN0aW9uKSB7XG5cdFx0XHRcdHRoaXMuYWRkVmFsdWUodmFsdWUpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGhpcy5wcm9wcy5tYXhNdWx0aVNlbGVjdGlvbiAhPSAwKSB7XG5cdFx0XHR0aGlzLmFkZFZhbHVlKHZhbHVlKTtcblx0XHR9XG5cdH0sXG5cdFxuXHRhZGRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmNvbmNhdCh2YWx1ZSkpO1xuXHR9LFxuXHRcblx0cmVwbGFjZVZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHZhciByZW1haW5pbmdWYWx1ZXMgPSB0aGlzLnN0YXRlLnZhbHVlcy5zbGljZSgwLCB0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGggLSAxKTtcblx0XHR0aGlzLnNldFZhbHVlKHJlbWFpbmluZ1ZhbHVlcy5jb25jYXQodmFsdWUpKTtcblx0fSxcblxuXHRwb3BWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlcy5zbGljZSgwLCB0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGggLSAxKSk7XG5cdH0sXG5cblx0cmVtb3ZlVmFsdWU6IGZ1bmN0aW9uKHZhbHVlVG9SZW1vdmUpIHtcblx0XHR0aGlzLnNldFZhbHVlKHRoaXMuc3RhdGUudmFsdWVzLmZpbHRlcihmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlICE9PSB2YWx1ZVRvUmVtb3ZlO1xuXHRcdH0pKTtcblx0fSxcblxuXHRjbGVhclZhbHVlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIGlnbm9yZSBpdC5cblx0XHRpZiAoZXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuc2V0VmFsdWUobnVsbCk7XG5cdH0sXG5cblx0cmVzZXRWYWx1ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlID09PSAnJyA/IG51bGwgOiB0aGlzLnN0YXRlLnZhbHVlKTtcblx0fSxcblxuXHRnZXRJbnB1dE5vZGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaW5wdXQgPSB0aGlzLnJlZnMuaW5wdXQ7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuc2VhcmNoYWJsZSA/IGlucHV0IDogaW5wdXQuZ2V0RE9NTm9kZSgpO1xuXHR9LFxuXG5cdGZpcmVDaGFuZ2VFdmVudDogZnVuY3Rpb24obmV3U3RhdGUpIHtcblx0XHRpZiAobmV3U3RhdGUudmFsdWUgIT09IHRoaXMuc3RhdGUudmFsdWUgJiYgdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZShuZXdTdGF0ZS52YWx1ZSwgbmV3U3RhdGUudmFsdWVzKTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTW91c2VEb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIGlmIHRoZSBldmVudCB3YXMgdHJpZ2dlcmVkIGJ5IGEgbW91c2Vkb3duIGFuZCBub3QgdGhlIHByaW1hcnlcblx0XHQvLyBidXR0b24sIG9yIGlmIHRoZSBjb21wb25lbnQgaXMgZGlzYWJsZWQsIGlnbm9yZSBpdC5cblx0XHRpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgaXNNdWx0aUxpbWl0ZWRBbmRPcGVuID0gdGhpcy5wcm9wcy5tYXhNdWx0aVNlbGVjdGlvbiA+IDAgJiYgdGhpcy5zdGF0ZS5pc09wZW47XG5cdFx0dmFyIHJlcGxhY2VJZk1heFZhbHVlUmVhY2hlZCA9IHRoaXMuc3RhdGUudmFsdWVzLmxlbmd0aCA+PSB0aGlzLnByb3BzLm1heE11bHRpU2VsZWN0aW9uICYmIHRoaXMucHJvcHMucmVwbGFjZUlmTWF4O1xuXHRcdC8vIFRoaXMgZXZlbnQgaXMgY2FsbGVkIGJlZm9yZSB0aGUgdmFsdWUgaXMgYWRkZWQgdG8gdGhlIHN0YXRlIChqdXN0IGFmdGVyIGEgY2xpY2sgb24gYW4gb3B0aW9uKSwgc28gd2UgY291bnQgYWhlYWRcblx0XHR2YXIgd2lsbFJlYWNoTWF4VmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlcy5sZW5ndGggKyAxID09IHRoaXMucHJvcHMubWF4TXVsdGlTZWxlY3Rpb247XG5cdFx0XG5cdFx0aWYgKGlzTXVsdGlMaW1pdGVkQW5kT3BlbiAmJiAocmVwbGFjZUlmTWF4VmFsdWVSZWFjaGVkIHx8IHdpbGxSZWFjaE1heFZhbHVlKSkge1xuXHRcdFx0dGhpcy5jbG9zZURyb3Bkb3duKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRpZiAodGhpcy5zdGF0ZS5pc0ZvY3VzZWQpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWVcblx0XHRcdH0sIHRoaXMuX2JpbmRDbG9zZU1lbnVJZkNsaWNrZWRPdXRzaWRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fb3BlbkFmdGVyRm9jdXMgPSB0cnVlO1xuXHRcdFx0dGhpcy5nZXRJbnB1dE5vZGUoKS5mb2N1cygpO1xuXHRcdH1cblx0fSxcblxuXHRzZWxlY3RUZXh0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmdldElucHV0Tm9kZSgpLnNlbGVjdCgpO1xuXHR9LFxuXG5cdGhhbmRsZUlucHV0Rm9jdXM6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIG5ld0lzT3BlbiA9IHRoaXMuc3RhdGUuaXNPcGVuIHx8IHRoaXMuX29wZW5BZnRlckZvY3VzO1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNGb2N1c2VkOiB0cnVlLFxuXHRcdFx0aXNPcGVuOiBuZXdJc09wZW5cblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKG5ld0lzT3Blbikge1xuXHRcdFx0XHR0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9vcGVuQWZ0ZXJGb2N1cyA9IGZhbHNlO1xuXG5cdFx0aWYgKHRoaXMucHJvcHMub25Gb2N1cykge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkZvY3VzKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRCbHVyOiBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMuX2JsdXJUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGlmIChzZWxmLl9mb2N1c0FmdGVyVXBkYXRlKSByZXR1cm47XG5cblx0XHRcdHNlbGYuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc0ZvY3VzZWQ6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9LCA1MCk7XG5cblx0XHRpZiAodGhpcy5wcm9wcy5vbkJsdXIpIHtcblx0XHRcdHRoaXMucHJvcHMub25CbHVyKGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlS2V5RG93bjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5kaXNhYmxlZCkgcmV0dXJuO1xuXG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cblx0XHRcdGNhc2UgODogLy8gYmFja3NwYWNlXG5cdFx0XHRcdGlmICghdGhpcy5zdGF0ZS5pbnB1dFZhbHVlICYmICF0aGlzLnByb3BzLmxpc3QpIHtcblx0XHRcdFx0XHR0aGlzLnBvcFZhbHVlKCk7XG5cdFx0XHRcdH1cblx0XHRcdHJldHVybjtcblxuXHRcdFx0Y2FzZSA5OiAvLyB0YWJcblx0XHRcdFx0aWYgKGV2ZW50LnNoaWZ0S2V5IHx8ICF0aGlzLnN0YXRlLmlzT3BlbiB8fCAhdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMTM6IC8vIGVudGVyXG5cdFx0XHRcdHRoaXMuc2VsZWN0Rm9jdXNlZE9wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjc6IC8vIGVzY2FwZVxuXHRcdFx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdFx0XHR0aGlzLnJlc2V0VmFsdWUoKTtcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLnByb3BzLmNsZWFyVmFsdWVzT25Fc2MpIHtcblx0XHRcdFx0XHR0aGlzLmNsZWFyVmFsdWUoKTtcblx0XHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMzg6IC8vIHVwXG5cdFx0XHRcdHRoaXMuZm9jdXNQcmV2aW91c09wdGlvbigpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgNDA6IC8vIGRvd25cblx0XHRcdFx0dGhpcy5mb2N1c05leHRPcHRpb24oKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OiByZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fSxcblxuXHQvLyBFbnN1cmVzIHRoYXQgdGhlIGN1cnJlbnRseSBmb2N1c2VkIG9wdGlvbiBpcyBhdmFpbGFibGUgaW4gZmlsdGVyZWRPcHRpb25zLlxuXHQvLyBJZiBub3QsIHJldHVybnMgdGhlIGZpcnN0IGF2YWlsYWJsZSBvcHRpb24uXG5cdF9nZXROZXdGb2N1c2VkT3B0aW9uOiBmdW5jdGlvbihmaWx0ZXJlZE9wdGlvbnMpIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gZmlsdGVyZWRPcHRpb25zKSB7XG5cdFx0XHRpZiAoZmlsdGVyZWRPcHRpb25zLmhhc093blByb3BlcnR5KGtleSkgJiYgZmlsdGVyZWRPcHRpb25zW2tleV0gPT09IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gZmlsdGVyZWRPcHRpb25zW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmaWx0ZXJlZE9wdGlvbnNbMF07XG5cdH0sXG5cblx0aGFuZGxlSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gYXNzaWduIGFuIGludGVybmFsIHZhcmlhYmxlIGJlY2F1c2Ugd2UgbmVlZCB0byB1c2Vcblx0XHQvLyB0aGUgbGF0ZXN0IHZhbHVlIGJlZm9yZSBzZXRTdGF0ZSgpIGhhcyBjb21wbGV0ZWQuXG5cdFx0dGhpcy5fb3B0aW9uc0ZpbHRlclN0cmluZyA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuXHRcdGlmICh0aGlzLnByb3BzLmFzeW5jT3B0aW9ucykge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzTG9hZGluZzogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucyhldmVudC50YXJnZXQudmFsdWUsIHtcblx0XHRcdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHRcdFx0aXNPcGVuOiB0cnVlXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IHRydWUsXG5cdFx0XHRcdGlucHV0VmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZSxcblx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuX2dldE5ld0ZvY3VzZWRPcHRpb24oZmlsdGVyZWRPcHRpb25zKVxuXHRcdFx0fSwgdGhpcy5fYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHRcdH1cblx0fSxcblxuXHRhdXRvbG9hZEFzeW5jT3B0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMubG9hZEFzeW5jT3B0aW9ucygnJywge30sIGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIHVwZGF0ZSB3aXRoIGZldGNoZWQgYnV0IGRvbid0IGZvY3VzXG5cdFx0XHRzZWxmLnNldFN0YXRlKHtcblx0XHRcdFx0aXNMb2FkaW5nOmZhbHNlXG5cdFx0XHR9KTtcblx0XHRcdHNlbGYuc2V0VmFsdWUoc2VsZi5wcm9wcy52YWx1ZSwgZmFsc2UpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGxvYWRBc3luY09wdGlvbnM6IGZ1bmN0aW9uKGlucHV0LCBzdGF0ZSwgY2FsbGJhY2spIHtcblx0XHR2YXIgdGhpc1JlcXVlc3RJZCA9IHRoaXMuX2N1cnJlbnRSZXF1ZXN0SWQgPSByZXF1ZXN0SWQrKztcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDw9IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgY2FjaGVLZXkgPSBpbnB1dC5zbGljZSgwLCBpKTtcblx0XHRcdGlmICh0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldICYmIChpbnB1dCA9PT0gY2FjaGVLZXkgfHwgdGhpcy5fb3B0aW9uc0NhY2hlW2NhY2hlS2V5XS5jb21wbGV0ZSkpIHtcblx0XHRcdFx0dmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zQ2FjaGVbY2FjaGVLZXldLm9wdGlvbnM7XG5cdFx0XHRcdHZhciBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbHRlck9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRcdFx0dmFyIG5ld1N0YXRlID0ge1xuXHRcdFx0XHRcdG9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRcdFx0ZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG5cdFx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogdGhpcy5fZ2V0TmV3Rm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpXG5cdFx0XHRcdH07XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiBzdGF0ZSkge1xuXHRcdFx0XHRcdGlmIChzdGF0ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRcdFx0XHRuZXdTdGF0ZVtrZXldID0gc3RhdGVba2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKSBjYWxsYmFjayh7fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy5wcm9wcy5hc3luY09wdGlvbnMoaW5wdXQsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuXG5cdFx0XHRpZiAoZXJyKSB0aHJvdyBlcnI7XG5cblx0XHRcdHNlbGYuX29wdGlvbnNDYWNoZVtpbnB1dF0gPSBkYXRhO1xuXG5cdFx0XHRpZiAodGhpc1JlcXVlc3RJZCAhPT0gc2VsZi5fY3VycmVudFJlcXVlc3RJZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgZmlsdGVyZWRPcHRpb25zID0gc2VsZi5maWx0ZXJPcHRpb25zKGRhdGEub3B0aW9ucyk7XG5cblx0XHRcdHZhciBuZXdTdGF0ZSA9IHtcblx0XHRcdFx0b3B0aW9uczogZGF0YS5vcHRpb25zLFxuXHRcdFx0XHRmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbjogc2VsZi5fZ2V0TmV3Rm9jdXNlZE9wdGlvbihmaWx0ZXJlZE9wdGlvbnMpXG5cdFx0XHR9O1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIHN0YXRlKSB7XG5cdFx0XHRcdGlmIChzdGF0ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRcdFx0bmV3U3RhdGVba2V5XSA9IHN0YXRlW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHNlbGYuc2V0U3RhdGUobmV3U3RhdGUpO1xuXG5cdFx0XHRpZihjYWxsYmFjaykgY2FsbGJhY2soe30pO1xuXG5cdFx0fSk7XG5cdH0sXG5cblx0ZmlsdGVyT3B0aW9uczogZnVuY3Rpb24ob3B0aW9ucywgdmFsdWVzKSB7XG5cdFx0aWYgKCF0aGlzLnByb3BzLnNlYXJjaGFibGUpIHtcblx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdH1cblxuXHRcdHZhciBmaWx0ZXJWYWx1ZSA9IHRoaXMuX29wdGlvbnNGaWx0ZXJTdHJpbmc7XG5cdFx0dmFyIGV4Y2x1ZGUgPSAodmFsdWVzIHx8IHRoaXMuc3RhdGUudmFsdWVzKS5tYXAoZnVuY3Rpb24oaSkge1xuXHRcdFx0cmV0dXJuIGkudmFsdWU7XG5cdFx0fSk7XG5cdFx0aWYgKHRoaXMucHJvcHMuZmlsdGVyT3B0aW9ucykge1xuXHRcdFx0cmV0dXJuIHRoaXMucHJvcHMuZmlsdGVyT3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMsIGZpbHRlclZhbHVlLCBleGNsdWRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGZpbHRlck9wdGlvbiA9IGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHRcdGlmICgodGhpcy5wcm9wcy5tdWx0aSB8fCB0aGlzLnByb3BzLmxpc3QpICYmIGV4Y2x1ZGUuaW5kZXhPZihvcC52YWx1ZSkgPiAtMSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZiAodGhpcy5wcm9wcy5maWx0ZXJPcHRpb24pIHJldHVybiB0aGlzLnByb3BzLmZpbHRlck9wdGlvbi5jYWxsKHRoaXMsIG9wLCBmaWx0ZXJWYWx1ZSk7XG5cdFx0XHRcdHZhciB2YWx1ZVRlc3QgPSBTdHJpbmcob3AudmFsdWUpLCBsYWJlbFRlc3QgPSBTdHJpbmcob3AubGFiZWwpO1xuXHRcdFx0XHRyZXR1cm4gIWZpbHRlclZhbHVlIHx8ICh0aGlzLnByb3BzLm1hdGNoUG9zID09PSAnc3RhcnQnKSA/IChcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICdsYWJlbCcgJiYgdmFsdWVUZXN0LnRvTG93ZXJDYXNlKCkuc3Vic3RyKDAsIGZpbHRlclZhbHVlLmxlbmd0aCkgPT09IGZpbHRlclZhbHVlKSB8fFxuXHRcdFx0XHRcdCh0aGlzLnByb3BzLm1hdGNoUHJvcCAhPT0gJ3ZhbHVlJyAmJiBsYWJlbFRlc3QudG9Mb3dlckNhc2UoKS5zdWJzdHIoMCwgZmlsdGVyVmFsdWUubGVuZ3RoKSA9PT0gZmlsdGVyVmFsdWUpXG5cdFx0XHRcdCkgOiAoXG5cdFx0XHRcdFx0KHRoaXMucHJvcHMubWF0Y2hQcm9wICE9PSAnbGFiZWwnICYmIHZhbHVlVGVzdC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKSkgPj0gMCkgfHxcblx0XHRcdFx0XHQodGhpcy5wcm9wcy5tYXRjaFByb3AgIT09ICd2YWx1ZScgJiYgbGFiZWxUZXN0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXJWYWx1ZS50b0xvd2VyQ2FzZSgpKSA+PSAwKVxuXHRcdFx0XHQpO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiAob3B0aW9ucyB8fCBbXSkuZmlsdGVyKGZpbHRlck9wdGlvbiwgdGhpcyk7XG5cdFx0fVxuXHR9LFxuXG5cdHNlbGVjdEZvY3VzZWRPcHRpb246IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnNlbGVjdFZhbHVlKHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbik7XG5cdH0sXG5cblx0Zm9jdXNPcHRpb246IGZ1bmN0aW9uKG9wKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmb2N1c2VkT3B0aW9uOiBvcFxuXHRcdH0pO1xuXHR9LFxuXG5cdGZvY3VzTmV4dE9wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCduZXh0Jyk7XG5cdH0sXG5cblx0Zm9jdXNQcmV2aW91c09wdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mb2N1c0FkamFjZW50T3B0aW9uKCdwcmV2aW91cycpO1xuXHR9LFxuXG5cdGZvY3VzQWRqYWNlbnRPcHRpb246IGZ1bmN0aW9uKGRpcikge1xuXHRcdHRoaXMuX2ZvY3VzZWRPcHRpb25SZXZlYWwgPSB0cnVlO1xuXG5cdFx0dmFyIG9wcyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zO1xuXG5cdFx0aWYgKCF0aGlzLnN0YXRlLmlzT3Blbikge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGlzT3BlbjogdHJ1ZSxcblx0XHRcdFx0aW5wdXRWYWx1ZTogJycsXG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IHRoaXMuc3RhdGUuZm9jdXNlZE9wdGlvbiB8fCBvcHNbZGlyID09PSAnbmV4dCcgPyAwIDogb3BzLmxlbmd0aCAtIDFdXG5cdFx0XHR9LCB0aGlzLl9iaW5kQ2xvc2VNZW51SWZDbGlja2VkT3V0c2lkZSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCFvcHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGZvY3VzZWRJbmRleCA9IC0xO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvcHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlLmZvY3VzZWRPcHRpb24gPT09IG9wc1tpXSkge1xuXHRcdFx0XHRmb2N1c2VkSW5kZXggPSBpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgZm9jdXNlZE9wdGlvbiA9IG9wc1swXTtcblxuXHRcdGlmIChkaXIgPT09ICduZXh0JyAmJiBmb2N1c2VkSW5kZXggPiAtMSAmJiBmb2N1c2VkSW5kZXggPCBvcHMubGVuZ3RoIC0gMSkge1xuXHRcdFx0Zm9jdXNlZE9wdGlvbiA9IG9wc1tmb2N1c2VkSW5kZXggKyAxXTtcblx0XHR9IGVsc2UgaWYgKGRpciA9PT0gJ3ByZXZpb3VzJykge1xuXHRcdFx0aWYgKGZvY3VzZWRJbmRleCA+IDApIHtcblx0XHRcdFx0Zm9jdXNlZE9wdGlvbiA9IG9wc1tmb2N1c2VkSW5kZXggLSAxXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb24gPSBvcHNbb3BzLmxlbmd0aCAtIDFdO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0Zm9jdXNlZE9wdGlvbjogZm9jdXNlZE9wdGlvblxuXHRcdH0pO1xuXG5cdH0sXG5cblx0dW5mb2N1c09wdGlvbjogZnVuY3Rpb24ob3ApIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID09PSBvcCkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGZvY3VzZWRPcHRpb246IG51bGxcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuICBnZXRJZGVudGlmaWVyOiBmdW5jdGlvbihvcCkge1xuICAgIHJldHVybiBvcC5pZCA/IG9wLmlkIDogb3AudmFsdWU7XG4gIH0sXG5cblx0YnVpbGRNZW51OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZm9jdXNlZFZhbHVlID0gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uID8gdGhpcy5zdGF0ZS5mb2N1c2VkT3B0aW9uLnZhbHVlIDogbnVsbDtcblxuXHRcdGlmKHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLmxlbmd0aCA+IDApIHtcblx0XHRcdGZvY3VzZWRWYWx1ZSA9IGZvY3VzZWRWYWx1ZSA9PSBudWxsID8gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnNbMF0gOiBmb2N1c2VkVmFsdWU7XG5cdFx0fVxuXG5cdFx0dmFyIG9wcyA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHR2YXIgb3AgPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9uc1trZXldO1xuXHRcdFx0dmFyIGlzRm9jdXNlZCA9IGZvY3VzZWRWYWx1ZSA9PT0gb3AudmFsdWU7XG5cblx0XHRcdHZhciBvcHRpb25DbGFzcyA9IGNsYXNzZXMoe1xuXHRcdFx0XHQnU2VsZWN0LW9wdGlvbic6IHRydWUsXG5cdFx0XHRcdCdpcy1mb2N1c2VkJzogaXNGb2N1c2VkLFxuXHRcdFx0XHQnaXMtZGlzYWJsZWQnOiBvcC5kaXNhYmxlZFxuXHRcdFx0fSk7XG5cblx0XHRcdHZhciByZWYgPSBpc0ZvY3VzZWQgPyAnZm9jdXNlZCcgOiBudWxsO1xuXG5cdFx0XHR2YXIgbW91c2VFbnRlciA9IHRoaXMuZm9jdXNPcHRpb24uYmluZCh0aGlzLCBvcCk7XG5cdFx0XHR2YXIgbW91c2VMZWF2ZSA9IHRoaXMudW5mb2N1c09wdGlvbi5iaW5kKHRoaXMsIG9wKTtcblx0XHRcdHZhciBtb3VzZURvd24gPSB0aGlzLnNlbGVjdFZhbHVlLmJpbmQodGhpcywgb3ApO1xuXG5cdFx0XHRpZiAob3AuZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuIDxkaXYgcmVmPXtyZWZ9IGtleT17J29wdGlvbi0nICsgdGhpcy5nZXRJZGVudGlmaWVyKG9wKX0gY2xhc3NOYW1lPXtvcHRpb25DbGFzc30+e29wLmxhYmVsfTwvZGl2Pjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiA8ZGl2IHJlZj17cmVmfSBrZXk9eydvcHRpb24tJyArIHRoaXMuZ2V0SWRlbnRpZmllcihvcCl9IGNsYXNzTmFtZT17b3B0aW9uQ2xhc3N9IG9uTW91c2VFbnRlcj17bW91c2VFbnRlcn0gb25Nb3VzZUxlYXZlPXttb3VzZUxlYXZlfSBvbk1vdXNlRG93bj17bW91c2VEb3dufSBvbkNsaWNrPXttb3VzZURvd259PntvcC5sYWJlbH08L2Rpdj47XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyk7XG5cdFx0aWYgKHRoaXMuc3RhdGUuaXNMb2FkaW5nICYmIHRoaXMucHJvcHMuYXN5bmNPcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gb3BzLmxlbmd0aCA/IG9wcyA6IChcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3Qtbm9yZXN1bHRzXCI+XG5cdFx0XHRcdFx0e3RoaXMucHJvcHMubG9hZGluZ1RleHR9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG9wcy5sZW5ndGggPyBvcHMgOiAoXG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LW5vcmVzdWx0c1wiPlxuXHRcdFx0XHRcdHt0aGlzLnByb3BzLmFzeW5jT3B0aW9ucyAmJiAhdGhpcy5zdGF0ZS5pbnB1dFZhbHVlID8gdGhpcy5wcm9wcy5zZWFyY2hQcm9tcHRUZXh0IDogdGhpcy5wcm9wcy5ub1Jlc3VsdHNUZXh0fVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdH0sXG5cblx0dG9nZ2xlRHJvcGRvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIGlzT3BlbiA9IHRoaXMuc3RhdGUuaXNPcGVuO1xuXHRcdGlmIChpc09wZW4pIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRpc09wZW46IGZhbHNlXG5cdFx0XHR9KTtcblxuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fSxcblx0XG5cdGNsb3NlRHJvcGRvd246IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aXNPcGVuOiBmYWxzZVxuXHRcdH0sIHRoaXMuX3VuYmluZENsb3NlTWVudUlmQ2xpY2tlZE91dHNpZGUpO1xuXHR9LFxuXG5cdGhhbmRsZU9wdGlvbkxhYmVsQ2xpY2s6IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHtcblx0XHR2YXIgaGFuZGxlciA9IHRoaXMucHJvcHMub25PcHRpb25MYWJlbENsaWNrO1xuXG5cdFx0aWYgKGhhbmRsZXIpIHtcblx0XHRcdGhhbmRsZXIodmFsdWUsIGV2ZW50KTtcblx0XHR9XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0Q2xhc3MgPSBjbGFzc2VzKCdTZWxlY3QnLCB0aGlzLnByb3BzLmNsYXNzTmFtZSwge1xuXHRcdFx0J2lzLW11bHRpJzogdGhpcy5wcm9wcy5tdWx0aSxcblx0XHRcdCdpcy1zZWFyY2hhYmxlJzogdGhpcy5wcm9wcy5zZWFyY2hhYmxlLFxuXHRcdFx0J2lzLW9wZW4nOiB0aGlzLnN0YXRlLmlzT3Blbixcblx0XHRcdCdpcy1mb2N1c2VkJzogdGhpcy5zdGF0ZS5pc0ZvY3VzZWQsXG5cdFx0XHQnaXMtbG9hZGluZyc6IHRoaXMuc3RhdGUuaXNMb2FkaW5nLFxuXHRcdFx0J2lzLWRpc2FibGVkJzogdGhpcy5wcm9wcy5kaXNhYmxlZCxcblx0XHRcdCdoYXMtdmFsdWUnOiB0aGlzLnN0YXRlLnZhbHVlLFxuXHRcdFx0J2lzLWxpc3QnOiB0aGlzLnByb3BzLmxpc3Rcblx0XHR9KTtcblxuXHRcdHZhciB2YWx1ZSA9IFtdLFxuXHRcdFx0cGxhY2Vob2xkZXIsXG5cdFx0XHRhbGxvd011bHRpcGxlID0gdGhpcy5wcm9wcy5tdWx0aSB8fCB0aGlzLnByb3BzLmxpc3Q7XG5cblx0XHRpZiAoYWxsb3dNdWx0aXBsZSkge1xuXHRcdFx0dGhpcy5zdGF0ZS52YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWwpIHtcblx0XHRcdFx0dmFyIHByb3BzID0ge1xuXHRcdFx0XHRcdGtleTogdGhpcy5nZXRJZGVudGlmaWVyKHZhbCksXG5cdFx0XHRcdFx0b3B0aW9uTGFiZWxDbGljazogISF0aGlzLnByb3BzLm9uT3B0aW9uTGFiZWxDbGljayxcblx0XHRcdFx0XHRvbk9wdGlvbkxhYmVsQ2xpY2s6IHRoaXMuaGFuZGxlT3B0aW9uTGFiZWxDbGljay5iaW5kKHRoaXMsIHZhbCksXG5cdFx0XHRcdFx0b25SZW1vdmU6IHRoaXMucmVtb3ZlVmFsdWUuYmluZCh0aGlzLCB2YWwpLFxuXHRcdFx0XHRcdGRlbGV0YWJsZTogIXRoaXMuc3RhdGUuaXNSZWFkT25seVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdmFsKSB7XG5cdFx0XHRcdFx0aWYgKHZhbC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRcdFx0XHRwcm9wc1trZXldID0gdmFsW2tleV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHZhbHVlLnB1c2goPFZhbHVlIHsuLi5wcm9wc30gLz4pO1xuXHRcdFx0fSwgdGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvcHMuZGlzYWJsZWQgfHwgKCF0aGlzLnN0YXRlLmlucHV0VmFsdWUgJiYgKCF0aGlzLnByb3BzLm11bHRpIHx8ICF2YWx1ZS5sZW5ndGgpKSkge1xuXHRcdFx0aWYgKHRoaXMucHJvcHMubGlzdCkge1xuXHRcdFx0XHRwbGFjZWhvbGRlciA9IDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LXBsYWNlaG9sZGVyXCIga2V5PVwicGxhY2Vob2xkZXJcIj57dGhpcy5zdGF0ZS5wbGFjZWhvbGRlcn08L2Rpdj47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZS5wdXNoKDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LXBsYWNlaG9sZGVyXCIga2V5PVwicGxhY2Vob2xkZXJcIj57dGhpcy5zdGF0ZS5wbGFjZWhvbGRlcn08L2Rpdj4pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBsb2FkaW5nID0gdGhpcy5zdGF0ZS5pc0xvYWRpbmcgPyA8c3BhbiBjbGFzc05hbWU9XCJTZWxlY3QtbG9hZGluZ1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbDtcblx0XHR2YXIgY2xlYXIgPSB0aGlzLnByb3BzLmNsZWFyYWJsZSAmJiB0aGlzLnN0YXRlLnZhbHVlICYmICF0aGlzLnByb3BzLmRpc2FibGVkID8gPHNwYW4gY2xhc3NOYW1lPVwiU2VsZWN0LWNsZWFyXCIgdGl0bGU9e2FsbG93TXVsdGlwbGUgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IGFyaWEtbGFiZWw9e2FsbG93TXVsdGlwbGUgPyB0aGlzLnByb3BzLmNsZWFyQWxsVGV4dCA6IHRoaXMucHJvcHMuY2xlYXJWYWx1ZVRleHR9IG9uTW91c2VEb3duPXt0aGlzLmNsZWFyVmFsdWV9IG9uQ2xpY2s9e3RoaXMuY2xlYXJWYWx1ZX0gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiAnJnRpbWVzOycgfX0gLz4gOiBudWxsO1xuXG5cdFx0dmFyIG1lbnU7XG5cdFx0dmFyIG1lbnVQcm9wcztcblx0XHRpZiAodGhpcy5zdGF0ZS5pc09wZW4pIHtcblx0XHRcdG1lbnVQcm9wcyA9IHtcblx0XHRcdFx0cmVmOiAnbWVudScsXG5cdFx0XHRcdGNsYXNzTmFtZTogJ1NlbGVjdC1tZW51J1xuXHRcdFx0fTtcblx0XHRcdGlmIChhbGxvd011bHRpcGxlKSB7XG5cdFx0XHRcdG1lbnVQcm9wcy5vbk1vdXNlRG93biA9IHRoaXMuaGFuZGxlTW91c2VEb3duO1xuXHRcdFx0fVxuXHRcdFx0bWVudSA9IChcblx0XHRcdFx0PGRpdiByZWY9XCJzZWxlY3RNZW51Q29udGFpbmVyXCIgY2xhc3NOYW1lPVwiU2VsZWN0LW1lbnUtb3V0ZXJcIj5cblx0XHRcdFx0XHQ8ZGl2IHsuLi5tZW51UHJvcHN9Pnt0aGlzLmJ1aWxkTWVudSgpfTwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dmFyIGlucHV0O1xuXHRcdHZhciBpbnB1dFByb3BzID0ge1xuXHRcdFx0cmVmOiAnaW5wdXQnLFxuXHRcdFx0Y2xhc3NOYW1lOiAnU2VsZWN0LWlucHV0Jyxcblx0XHRcdHRhYkluZGV4OiB0aGlzLnByb3BzLnRhYkluZGV4IHx8IDAsXG5cdFx0XHRvbkZvY3VzOiB0aGlzLmhhbmRsZUlucHV0Rm9jdXMsXG5cdFx0XHRvbkJsdXI6IHRoaXMuaGFuZGxlSW5wdXRCbHVyXG5cdFx0fTtcblx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5wcm9wcy5pbnB1dFByb3BzKSB7XG5cdFx0XHRpZiAodGhpcy5wcm9wcy5pbnB1dFByb3BzLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0aW5wdXRQcm9wc1trZXldID0gdGhpcy5wcm9wcy5pbnB1dFByb3BzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucHJvcHMuc2VhcmNoYWJsZSAmJiAhdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuXHRcdFx0aW5wdXQgPSA8SW5wdXQgdmFsdWU9e3RoaXMuc3RhdGUuaW5wdXRWYWx1ZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlSW5wdXRDaGFuZ2V9IG1pbldpZHRoPVwiNVwiIHsuLi5pbnB1dFByb3BzfSAvPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aW5wdXQgPSA8ZGl2IHsuLi5pbnB1dFByb3BzfT4mbmJzcDs8L2Rpdj47XG5cdFx0fVxuXG5cdFx0aWYodGhpcy5wcm9wcy5saXN0KSB7XG5cdFx0XHRpZighdGhpcy5zdGF0ZS5pc1JlYWRPbmx5KVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgc2VsZWN0b3IgPSAoPGRpdiBjbGFzc05hbWU9XCJkcm9wZG93blwiPlxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgcmVmPVwidmFsdWVcIiBuYW1lPXt0aGlzLnByb3BzLm5hbWV9IHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfVxuXHRcdFx0XHRcdFx0ICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9Lz5cblxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiU2VsZWN0LWNvbnRyb2xcIiByZWY9XCJjb250cm9sXCIgb25DbGljaz17dGhpcy5zZWxlY3RUZXh0fSBvbktleURvd249e3RoaXMuaGFuZGxlS2V5RG93bn1cblx0XHRcdFx0XHRcdCBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlTW91c2VEb3dufT5cblx0XHRcdFx0XHRcdHtwbGFjZWhvbGRlcn1cblx0XHRcdFx0XHRcdHtpbnB1dH1cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvd1wiIG9uTW91c2VEb3duPXt0aGlzLnRvZ2dsZURyb3Bkb3dufS8+XG5cdFx0XHRcdFx0XHR7bG9hZGluZ31cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHR7bWVudX1cblx0XHRcdFx0PC9kaXY+KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxkaXYgcmVmPVwid3JhcHBlclwiIGNsYXNzTmFtZT17c2VsZWN0Q2xhc3N9PlxuXHRcdFx0XHRcdHtzZWxlY3Rvcn1cblx0XHRcdFx0XHR7dmFsdWV9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiByZWY9XCJ3cmFwcGVyXCIgY2xhc3NOYW1lPXtzZWxlY3RDbGFzc30+XG5cdFx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgcmVmPVwidmFsdWVcIiBuYW1lPXt0aGlzLnByb3BzLm5hbWV9IHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfSBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH0gLz5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJTZWxlY3QtY29udHJvbFwiIHJlZj1cImNvbnRyb2xcIiBvbkNsaWNrPXt0aGlzLnNlbGVjdFRleHR9IG9uS2V5RG93bj17dGhpcy5oYW5kbGVLZXlEb3dufSBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259IG9uVG91Y2hFbmQ9e3RoaXMuaGFuZGxlTW91c2VEb3dufT5cblx0XHRcdFx0XHR7dmFsdWV9XG5cdFx0XHRcdFx0e2lucHV0fVxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cIlNlbGVjdC1hcnJvd1wiIG9uTW91c2VEb3duPXt0aGlzLnRvZ2dsZURyb3Bkb3dufS8+XG5cdFx0XHRcdFx0e2xvYWRpbmd9XG5cdFx0XHRcdFx0e2NsZWFyfVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0e21lbnV9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdDtcbiJdfQ==
