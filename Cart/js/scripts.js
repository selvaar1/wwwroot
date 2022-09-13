
https://github.com/gnarf/jquery-ajaxQueue/blob/master/dist/jquery.ajaxQueue.min.js

/*! jQuery Ajax Queue v0.1.2pre | (c) 2013 Corey Frang | Licensed MIT */
(function (e) { var r = e({}); e.ajaxQueue = function (n) { function t(r) { u = e.ajax(n), u.done(a.resolve).fail(a.reject).then(r, r) } var u, a = e.Deferred(), i = a.promise(); return r.queue(t), i.abort = function (o) { if (u) return u.abort(o); var c = r.queue(), f = e.inArray(t, c); return f > -1 && c.splice(f, 1), a.rejectWith(n.context || n, [i, o, ""]), i }, i } })(jQuery);
//@ sourceMappingURL=dist/jquery.ajaxQueue.min.map


/**
*  Ajax Autocomplete for jQuery, version %version%
*  (c) 2017 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, single: true, this: true, multivar: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var
        utils = (function () {
            return {
                escapeRegExChars: function (value) {
                    return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
                },
                createNode: function (containerClass) {
                    //console.log(1234, containerClass);
                    var div = document.createElement('div');
                    div.className = containerClass;
                    div.style.position = 'absolute';
                    div.style.display = 'none';

                    //console.log(1234, div);

                    return div;
                }
            };
        }()),

        keys = {
            ESC: 27,
            TAB: 9,
            RETURN: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        },

        noop = $.noop;

    function Autocomplete(el, options) {
        var that = this;

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.timeoutId = null;
        that.cachedResponse = {};
        that.onChangeTimeout = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, Autocomplete.defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.defaults = {
        ajaxSettings: {},
        autoSelectFirst: false,
        appendTo: document.body,
        serviceUrl: null,
        lookup: null,
        onSelect: null,
        width: 'auto',
        minChars: 1,
        maxHeight: 300,
        deferRequestBy: 0,
        params: {},
        formatResult: _formatResult,
        formatGroup: _formatGroup,
        delimiter: null,
        zIndex: 9999,
        type: 'GET',
        noCache: false,
        onSearchStart: noop,
        onSearchComplete: noop,
        onSearchError: noop,
        preserveInput: false,
        containerClass: 'autocomplete-suggestions',
        tabDisabled: false,
        dataType: 'text',
        currentRequest: null,
        triggerSelectOnValidInput: true,
        preventBadQueries: true,
        lookupFilter: _lookupFilter,
        paramName: 'query',
        transformResult: _transformResult,
        showNoSuggestionNotice: false,
        noSuggestionNotice: 'No results',
        orientation: 'bottom',
        forceFixPosition: false
    };

    function _lookupFilter(suggestion, originalQuery, queryLowerCase) {
        return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
    };

    function _transformResult(response) {
        return typeof response === 'string' ? $.parseJSON(response) : response;
    };

    function _formatResult(suggestion, currentValue) {
        // Do not replace anything if the current value is empty
        if (!currentValue) {
            return suggestion.value;
        }

        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value
            .replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    function _formatGroup(suggestion, category) {
        return '<div class="autocomplete-group">' + category + '</div>';
    };

    Autocomplete.prototype = {

        initialize: function () {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>')
                                          .html(this.options.noSuggestionNotice).get(0);


            
            

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo);

            //console.log(5, options.appendTo);


            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.css('width', options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });


            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
            });

            container.on('click.autocomplete', function () {
                clearTimeout(that.blurTimeoutId);
            })

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) { that.onKeyPress(e); });
            that.el.on('keyup.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('blur.autocomplete', function () { that.onBlur(); });
            that.el.on('focus.autocomplete', function () { that.onFocus(); });
            that.el.on('change.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('input.autocomplete', function (e) { that.onKeyUp(e); });
        },

        onFocus: function () {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function () {
            var that = this;

            // If user clicked on a suggestion, hide() will
            // be canceled, otherwise close suggestions
            that.blurTimeoutId = setTimeout(function () {
                that.hide();
            }, 200);
        },

        abortAjax: function () {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function (suppliedOptions) {
            var that = this,
                options = that.options;

            $.extend(options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });
        },


        clearCache: function () {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function () {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function () {
            var that = this;
            that.disabled = true;
            clearTimeout(that.onChangeTimeout);
            that.abortAjax();
        },

        enable: function () {
            this.disabled = false;
        },

        fixPosition: function () {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }

            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = that.el.outerHeight(),
                offset = that.el.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = (Math.max(topOverflow, bottomOverflow) === topOverflow) ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if (containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                if (!that.visible) {
                    $container.css('opacity', 0).show();
                }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible) {
                    $container.css('opacity', opacity).hide();
                }
            }

            if (that.options.width === 'auto') {
                styles.width = that.el.outerWidth() + 'px';
            }

            $container.css(styles);
        },

        isCursorAtEnd: function () {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function (e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function (e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearTimeout(that.onChangeTimeout);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeTimeout = setTimeout(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function () {
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearTimeout(that.onChangeTimeout);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function (query) {
            var suggestions = this.suggestions;

            return (suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase());
        },

        getQuery: function (value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function (query) {
            
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;


            console.log("getSuggestionsLocal", options.lookup.length);

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };

            console.log("getSuggestionsLocal data", data);
            

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function (q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            params = options.ignoreParams ? null : options.params;

            if ($.isFunction(options.lookup)) {
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function (q) {
            if (!this.options.preventBadQueries) {
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function () {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearTimeout(that.onChangeTimeout);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function () {
            console.log("this.suggestions.length", this.suggestions.length);
            if (!this.suggestions.length) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function (suggestion, index) {
                    var currentCategory = suggestion.data[groupBy];

                    if (category === currentCategory) {
                        return '';
                    }

                    category = currentCategory;

                    return options.formatGroup(suggestion, category);
                };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy) {
                    html += formatGroup(suggestion, value, i);
                }

                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value, i) + '</div>';
            });

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function () {
            var that = this,
                beforeRender = that.options.beforeRender,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer);

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();

            // clean suggestions if any
            container.empty();
            container.append(noSuggestionsContainer);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function () {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (options.width === 'auto') {
                width = that.el.outerWidth();
                container.css('width', width > 0 ? width : 300);
            } else if (options.width === 'flex') {
                // Trust the source! Unset the width property so it will be the max length
                // the containing elements.
                container.css('width', '');
            }
        },

        findBestHint: function () {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function (suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function (suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function (orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if ($.inArray(orientation, ['auto', 'bottom', 'top']) === -1) {
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function (result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && !result.suggestions.length) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function (index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function () {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function (i) {
            var that = this;
            that.hide();
            that.onSelect(i);
        },

        moveUp: function () {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function () {
            var that = this;

            if (that.selectedIndex === (that.suggestions.length - 1)) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function (index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function (index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function (value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function () {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (!arguments.length) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };

    // Don't overwrite if it already exists
    if (!$.fn.autocomplete) {
        $.fn.autocomplete = $.fn.devbridgeAutocomplete;
    }
}));


//http://www.eyecon.ro/bootstrap-datepicker/
//https://eonasdan.github.io/bootstrap-datetimepicker/!!

(function (a) { if (typeof define === "function" && define.amd) { define(["jquery"], a) } else { if (typeof exports === "object") { a(require("jquery")) } else { a(jQuery) } } }(function (f, c) { if (!("indexOf" in Array.prototype)) { Array.prototype.indexOf = function (k, j) { if (j === c) { j = 0 } if (j < 0) { j += this.length } if (j < 0) { j = 0 } for (var l = this.length; j < l; j++) { if (j in this && this[j] === k) { return j } } return -1 } } function e(l) { var k = f(l); var j = k.add(k.parents()); var m = false; j.each(function () { if (f(this).css("position") === "fixed") { m = true; return false } }); return m } function h() { return new Date(Date.UTC.apply(Date, arguments)) } function d() { var j = new Date(); return h(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate(), j.getUTCHours(), j.getUTCMinutes(), j.getUTCSeconds(), 0) } var i = function (l, k) { var n = this; this.element = f(l); this.container = k.container || "body"; this.language = k.language || this.element.data("date-language") || "en"; this.language = this.language in a ? this.language : this.language.split("-")[0]; this.language = this.language in a ? this.language : "en"; this.isRTL = a[this.language].rtl || false; this.formatType = k.formatType || this.element.data("format-type") || "standard"; this.format = g.parseFormat(k.format || this.element.data("date-format") || a[this.language].format || g.getDefaultFormat(this.formatType, "input"), this.formatType); this.isInline = false; this.isVisible = false; this.isInput = this.element.is("input"); this.fontAwesome = k.fontAwesome || this.element.data("font-awesome") || false; this.bootcssVer = k.bootcssVer || (this.isInput ? (this.element.is(".form-control") ? 3 : 2) : (this.bootcssVer = this.element.is(".input-group") ? 3 : 2)); this.component = this.element.is(".date") ? (this.bootcssVer == 3 ? this.element.find(".input-group-addon .glyphicon-th, .input-group-addon .glyphicon-time, .input-group-addon .glyphicon-remove, .input-group-addon .glyphicon-calendar, .input-group-addon .fa-calendar, .input-group-addon .fa-clock-o").parent() : this.element.find(".add-on .icon-th, .add-on .icon-time, .add-on .icon-calendar, .add-on .fa-calendar, .add-on .fa-clock-o").parent()) : false; this.componentReset = this.element.is(".date") ? (this.bootcssVer == 3 ? this.element.find(".input-group-addon .glyphicon-remove, .input-group-addon .fa-times").parent() : this.element.find(".add-on .icon-remove, .add-on .fa-times").parent()) : false; this.hasInput = this.component && this.element.find("input").length; if (this.component && this.component.length === 0) { this.component = false } this.linkField = k.linkField || this.element.data("link-field") || false; this.linkFormat = g.parseFormat(k.linkFormat || this.element.data("link-format") || g.getDefaultFormat(this.formatType, "link"), this.formatType); this.minuteStep = k.minuteStep || this.element.data("minute-step") || 5; this.pickerPosition = k.pickerPosition || this.element.data("picker-position") || "bottom-right"; this.showMeridian = k.showMeridian || this.element.data("show-meridian") || false; this.initialDate = k.initialDate || new Date(); this.zIndex = k.zIndex || this.element.data("z-index") || c; this.title = typeof k.title === "undefined" ? false : k.title; this.defaultTimeZone = (new Date).toString().split("(")[1].slice(0, -1); this.timezone = k.timezone || this.defaultTimeZone; this.icons = { leftArrow: this.fontAwesome ? "fa-arrow-left" : (this.bootcssVer === 3 ? "glyphicon-arrow-left" : "icon-arrow-left"), rightArrow: this.fontAwesome ? "fa-arrow-right" : (this.bootcssVer === 3 ? "glyphicon-arrow-right" : "icon-arrow-right") }; this.icontype = this.fontAwesome ? "fa" : "glyphicon"; this._attachEvents(); this.clickedOutside = function (o) { if (f(o.target).closest(".datetimepicker").length === 0) { n.hide() } }; this.formatViewType = "datetime"; if ("formatViewType" in k) { this.formatViewType = k.formatViewType } else { if ("formatViewType" in this.element.data()) { this.formatViewType = this.element.data("formatViewType") } } this.minView = 0; if ("minView" in k) { this.minView = k.minView } else { if ("minView" in this.element.data()) { this.minView = this.element.data("min-view") } } this.minView = g.convertViewMode(this.minView); this.maxView = g.modes.length - 1; if ("maxView" in k) { this.maxView = k.maxView } else { if ("maxView" in this.element.data()) { this.maxView = this.element.data("max-view") } } this.maxView = g.convertViewMode(this.maxView); this.wheelViewModeNavigation = false; if ("wheelViewModeNavigation" in k) { this.wheelViewModeNavigation = k.wheelViewModeNavigation } else { if ("wheelViewModeNavigation" in this.element.data()) { this.wheelViewModeNavigation = this.element.data("view-mode-wheel-navigation") } } this.wheelViewModeNavigationInverseDirection = false; if ("wheelViewModeNavigationInverseDirection" in k) { this.wheelViewModeNavigationInverseDirection = k.wheelViewModeNavigationInverseDirection } else { if ("wheelViewModeNavigationInverseDirection" in this.element.data()) { this.wheelViewModeNavigationInverseDirection = this.element.data("view-mode-wheel-navigation-inverse-dir") } } this.wheelViewModeNavigationDelay = 100; if ("wheelViewModeNavigationDelay" in k) { this.wheelViewModeNavigationDelay = k.wheelViewModeNavigationDelay } else { if ("wheelViewModeNavigationDelay" in this.element.data()) { this.wheelViewModeNavigationDelay = this.element.data("view-mode-wheel-navigation-delay") } } this.startViewMode = 2; if ("startView" in k) { this.startViewMode = k.startView } else { if ("startView" in this.element.data()) { this.startViewMode = this.element.data("start-view") } } this.startViewMode = g.convertViewMode(this.startViewMode); this.viewMode = this.startViewMode; this.viewSelect = this.minView; if ("viewSelect" in k) { this.viewSelect = k.viewSelect } else { if ("viewSelect" in this.element.data()) { this.viewSelect = this.element.data("view-select") } } this.viewSelect = g.convertViewMode(this.viewSelect); this.forceParse = true; if ("forceParse" in k) { this.forceParse = k.forceParse } else { if ("dateForceParse" in this.element.data()) { this.forceParse = this.element.data("date-force-parse") } } var m = this.bootcssVer === 3 ? g.templateV3 : g.template; while (m.indexOf("{iconType}") !== -1) { m = m.replace("{iconType}", this.icontype) } while (m.indexOf("{leftArrow}") !== -1) { m = m.replace("{leftArrow}", this.icons.leftArrow) } while (m.indexOf("{rightArrow}") !== -1) { m = m.replace("{rightArrow}", this.icons.rightArrow) } this.picker = f(m).appendTo(this.isInline ? this.element : this.container).on({ click: f.proxy(this.click, this), mousedown: f.proxy(this.mousedown, this) }); if (this.wheelViewModeNavigation) { if (f.fn.mousewheel) { this.picker.on({ mousewheel: f.proxy(this.mousewheel, this) }) } else { console.log("Mouse Wheel event is not supported. Please include the jQuery Mouse Wheel plugin before enabling this option") } } if (this.isInline) { this.picker.addClass("datetimepicker-inline") } else { this.picker.addClass("datetimepicker-dropdown-" + this.pickerPosition + " dropdown-menu") } if (this.isRTL) { this.picker.addClass("datetimepicker-rtl"); var j = this.bootcssVer === 3 ? ".prev span, .next span" : ".prev i, .next i"; this.picker.find(j).toggleClass(this.icons.leftArrow + " " + this.icons.rightArrow) } f(document).on("mousedown", this.clickedOutside); this.autoclose = false; if ("autoclose" in k) { this.autoclose = k.autoclose } else { if ("dateAutoclose" in this.element.data()) { this.autoclose = this.element.data("date-autoclose") } } this.keyboardNavigation = true; if ("keyboardNavigation" in k) { this.keyboardNavigation = k.keyboardNavigation } else { if ("dateKeyboardNavigation" in this.element.data()) { this.keyboardNavigation = this.element.data("date-keyboard-navigation") } } this.todayBtn = (k.todayBtn || this.element.data("date-today-btn") || false); this.clearBtn = (k.clearBtn || this.element.data("date-clear-btn") || false); this.todayHighlight = (k.todayHighlight || this.element.data("date-today-highlight") || false); this.weekStart = ((k.weekStart || this.element.data("date-weekstart") || a[this.language].weekStart || 0) % 7); this.weekEnd = ((this.weekStart + 6) % 7); this.startDate = -Infinity; this.endDate = Infinity; this.datesDisabled = []; this.daysOfWeekDisabled = []; this.setStartDate(k.startDate || this.element.data("date-startdate")); this.setEndDate(k.endDate || this.element.data("date-enddate")); this.setDatesDisabled(k.datesDisabled || this.element.data("date-dates-disabled")); this.setDaysOfWeekDisabled(k.daysOfWeekDisabled || this.element.data("date-days-of-week-disabled")); this.setMinutesDisabled(k.minutesDisabled || this.element.data("date-minute-disabled")); this.setHoursDisabled(k.hoursDisabled || this.element.data("date-hour-disabled")); this.fillDow(); this.fillMonths(); this.update(); this.showMode(); if (this.isInline) { this.show() } }; i.prototype = { constructor: i, _events: [], _attachEvents: function () { this._detachEvents(); if (this.isInput) { this._events = [[this.element, { focus: f.proxy(this.show, this), keyup: f.proxy(this.update, this), keydown: f.proxy(this.keydown, this) }]] } else { if (this.component && this.hasInput) { this._events = [[this.element.find("input"), { focus: f.proxy(this.show, this), keyup: f.proxy(this.update, this), keydown: f.proxy(this.keydown, this) }], [this.component, { click: f.proxy(this.show, this) }]]; if (this.componentReset) { this._events.push([this.componentReset, { click: f.proxy(this.reset, this) }]) } } else { if (this.element.is("div")) { this.isInline = true } else { this._events = [[this.element, { click: f.proxy(this.show, this) }]] } } } for (var j = 0, k, l; j < this._events.length; j++) { k = this._events[j][0]; l = this._events[j][1]; k.on(l) } }, _detachEvents: function () { for (var j = 0, k, l; j < this._events.length; j++) { k = this._events[j][0]; l = this._events[j][1]; k.off(l) } this._events = [] }, show: function (j) { this.picker.show(); this.height = this.component ? this.component.outerHeight() : this.element.outerHeight(); if (this.forceParse) { this.update() } this.place(); f(window).on("resize", f.proxy(this.place, this)); if (j) { j.stopPropagation(); j.preventDefault() } this.isVisible = true; this.element.trigger({ type: "show", date: this.date }) }, hide: function (j) { if (!this.isVisible) { return } if (this.isInline) { return } this.picker.hide(); f(window).off("resize", this.place); this.viewMode = this.startViewMode; this.showMode(); if (!this.isInput) { f(document).off("mousedown", this.hide) } if (this.forceParse && (this.isInput && this.element.val() || this.hasInput && this.element.find("input").val())) { this.setValue() } this.isVisible = false; this.element.trigger({ type: "hide", date: this.date }) }, remove: function () { this._detachEvents(); f(document).off("mousedown", this.clickedOutside); this.picker.remove(); delete this.picker; delete this.element.data().datetimepicker }, getDate: function () { var j = this.getUTCDate(); return new Date(j.getTime() + (j.getTimezoneOffset() * 60000)) }, getUTCDate: function () { return this.date }, getInitialDate: function () { return this.initialDate }, setInitialDate: function (j) { this.initialDate = j }, setDate: function (j) { this.setUTCDate(new Date(j.getTime() - (j.getTimezoneOffset() * 60000))) }, setUTCDate: function (j) { if (j >= this.startDate && j <= this.endDate) { this.date = j; this.setValue(); this.viewDate = this.date; this.fill() } else { this.element.trigger({ type: "outOfRange", date: j, startDate: this.startDate, endDate: this.endDate }) } }, setFormat: function (k) { this.format = g.parseFormat(k, this.formatType); var j; if (this.isInput) { j = this.element } else { if (this.component) { j = this.element.find("input") } } if (j && j.val()) { this.setValue() } }, setValue: function () { var j = this.getFormattedDate(); if (!this.isInput) { if (this.component) { this.element.find("input").val(j) } this.element.data("date", j) } else { this.element.val(j) } if (this.linkField) { f("#" + this.linkField).val(this.getFormattedDate(this.linkFormat)) } }, getFormattedDate: function (j) { if (j == c) { j = this.format } return g.formatDate(this.date, j, this.language, this.formatType, this.timezone) }, setStartDate: function (j) { this.startDate = j || -Infinity; if (this.startDate !== -Infinity) { this.startDate = g.parseDate(this.startDate, this.format, this.language, this.formatType, this.timezone) } this.update(); this.updateNavArrows() }, setEndDate: function (j) { this.endDate = j || Infinity; if (this.endDate !== Infinity) { this.endDate = g.parseDate(this.endDate, this.format, this.language, this.formatType, this.timezone) } this.update(); this.updateNavArrows() }, setDatesDisabled: function (j) { this.datesDisabled = j || []; if (!f.isArray(this.datesDisabled)) { this.datesDisabled = this.datesDisabled.split(/,\s*/) } this.datesDisabled = f.map(this.datesDisabled, function (k) { return g.parseDate(k, this.format, this.language, this.formatType, this.timezone).toDateString() }); this.update(); this.updateNavArrows() }, setTitle: function (j, k) { return this.picker.find(j).find("th:eq(1)").text(this.title === false ? k : this.title) }, setDaysOfWeekDisabled: function (j) { this.daysOfWeekDisabled = j || []; if (!f.isArray(this.daysOfWeekDisabled)) { this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/) } this.daysOfWeekDisabled = f.map(this.daysOfWeekDisabled, function (k) { return parseInt(k, 10) }); this.update(); this.updateNavArrows() }, setMinutesDisabled: function (j) { this.minutesDisabled = j || []; if (!f.isArray(this.minutesDisabled)) { this.minutesDisabled = this.minutesDisabled.split(/,\s*/) } this.minutesDisabled = f.map(this.minutesDisabled, function (k) { return parseInt(k, 10) }); this.update(); this.updateNavArrows() }, setHoursDisabled: function (j) { this.hoursDisabled = j || []; if (!f.isArray(this.hoursDisabled)) { this.hoursDisabled = this.hoursDisabled.split(/,\s*/) } this.hoursDisabled = f.map(this.hoursDisabled, function (k) { return parseInt(k, 10) }); this.update(); this.updateNavArrows() }, place: function () { if (this.isInline) { return } if (!this.zIndex) { var k = 0; f("div").each(function () { var p = parseInt(f(this).css("zIndex"), 10); if (p > k) { k = p } }); this.zIndex = k + 10 } var o, n, m, l; if (this.container instanceof f) { l = this.container.offset() } else { l = f(this.container).offset() } if (this.component) { o = this.component.offset(); m = o.left; if (this.pickerPosition == "bottom-left" || this.pickerPosition == "top-left") { m += this.component.outerWidth() - this.picker.outerWidth() } } else { o = this.element.offset(); m = o.left; if (this.pickerPosition == "bottom-left" || this.pickerPosition == "top-left") { m += this.element.outerWidth() - this.picker.outerWidth() } } var j = document.body.clientWidth || window.innerWidth; if (m + 220 > j) { m = j - 220 } if (this.pickerPosition == "top-left" || this.pickerPosition == "top-right") { n = o.top - this.picker.outerHeight() } else { n = o.top + this.height } n = n - l.top; m = m - l.left; this.picker.css({ top: n, left: m, zIndex: this.zIndex }) }, update: function () { var j, k = false; if (arguments && arguments.length && (typeof arguments[0] === "string" || arguments[0] instanceof Date)) { j = arguments[0]; k = true } else { j = (this.isInput ? this.element.val() : this.element.find("input").val()) || this.element.data("date") || this.initialDate; if (typeof j == "string" || j instanceof String) { j = j.replace(/^\s+|\s+$/g, "") } } if (!j) { j = new Date(); k = false } this.date = g.parseDate(j, this.format, this.language, this.formatType, this.timezone); if (k) { this.setValue() } if (this.date < this.startDate) { this.viewDate = new Date(this.startDate) } else { if (this.date > this.endDate) { this.viewDate = new Date(this.endDate) } else { this.viewDate = new Date(this.date) } } this.fill() }, fillDow: function () { var j = this.weekStart, k = "<tr>"; while (j < this.weekStart + 7) { k += '<th class="dow">' + a[this.language].daysMin[(j++) % 7] + "</th>" } k += "</tr>"; this.picker.find(".datetimepicker-days thead").append(k) }, fillMonths: function () { var k = "", j = 0; while (j < 12) { k += '<span class="month">' + a[this.language].monthsShort[j++] + "</span>" } this.picker.find(".datetimepicker-months td").html(k) }, fill: function () { if (this.date == null || this.viewDate == null) { return } var H = new Date(this.viewDate), u = H.getUTCFullYear(), I = H.getUTCMonth(), n = H.getUTCDate(), D = H.getUTCHours(), y = H.getUTCMinutes(), z = this.startDate !== -Infinity ? this.startDate.getUTCFullYear() : -Infinity, E = this.startDate !== -Infinity ? this.startDate.getUTCMonth() : -Infinity, q = this.endDate !== Infinity ? this.endDate.getUTCFullYear() : Infinity, A = this.endDate !== Infinity ? this.endDate.getUTCMonth() + 1 : Infinity, r = (new h(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())).valueOf(), G = new Date(); this.setTitle(".datetimepicker-days", a[this.language].months[I] + " " + u); if (this.formatViewType == "time") { var k = this.getFormattedDate(); this.setTitle(".datetimepicker-hours", k); this.setTitle(".datetimepicker-minutes", k) } else { this.setTitle(".datetimepicker-hours", n + " " + a[this.language].months[I] + " " + u); this.setTitle(".datetimepicker-minutes", n + " " + a[this.language].months[I] + " " + u) } this.picker.find("tfoot th.today").text(a[this.language].today || a.en.today).toggle(this.todayBtn !== false); this.picker.find("tfoot th.clear").text(a[this.language].clear || a.en.clear).toggle(this.clearBtn !== false); this.updateNavArrows(); this.fillMonths(); var K = h(u, I - 1, 28, 0, 0, 0, 0), C = g.getDaysInMonth(K.getUTCFullYear(), K.getUTCMonth()); K.setUTCDate(C); K.setUTCDate(C - (K.getUTCDay() - this.weekStart + 7) % 7); var j = new Date(K); j.setUTCDate(j.getUTCDate() + 42); j = j.valueOf(); var s = []; var v; while (K.valueOf() < j) { if (K.getUTCDay() == this.weekStart) { s.push("<tr>") } v = ""; if (K.getUTCFullYear() < u || (K.getUTCFullYear() == u && K.getUTCMonth() < I)) { v += " old" } else { if (K.getUTCFullYear() > u || (K.getUTCFullYear() == u && K.getUTCMonth() > I)) { v += " new" } } if (this.todayHighlight && K.getUTCFullYear() == G.getFullYear() && K.getUTCMonth() == G.getMonth() && K.getUTCDate() == G.getDate()) { v += " today" } if (K.valueOf() == r) { v += " active" } if ((K.valueOf() + 86400000) <= this.startDate || K.valueOf() > this.endDate || f.inArray(K.getUTCDay(), this.daysOfWeekDisabled) !== -1 || f.inArray(K.toDateString(), this.datesDisabled) !== -1) { v += " disabled" } s.push('<td class="day' + v + '">' + K.getUTCDate() + "</td>"); if (K.getUTCDay() == this.weekEnd) { s.push("</tr>") } K.setUTCDate(K.getUTCDate() + 1) } this.picker.find(".datetimepicker-days tbody").empty().append(s.join("")); s = []; var w = "", F = "", t = ""; var l = this.hoursDisabled || []; for (var B = 0; B < 24; B++) { if (l.indexOf(B) !== -1) { continue } var x = h(u, I, n, B); v = ""; if ((x.valueOf() + 3600000) <= this.startDate || x.valueOf() > this.endDate) { v += " disabled" } else { if (D == B) { v += " active" } } if (this.showMeridian && a[this.language].meridiem.length == 2) { F = (B < 12 ? a[this.language].meridiem[0] : a[this.language].meridiem[1]); if (F != t) { if (t != "") { s.push("</fieldset>") } s.push('<fieldset class="hour"><legend>' + F.toUpperCase() + "</legend>") } t = F; w = (B % 12 ? B % 12 : 12); s.push('<span class="hour' + v + " hour_" + (B < 12 ? "am" : "pm") + '">' + w + "</span>"); if (B == 23) { s.push("</fieldset>") } } else { w = B + ":00"; s.push('<span class="hour' + v + '">' + w + "</span>") } } this.picker.find(".datetimepicker-hours td").html(s.join("")); s = []; w = "", F = "", t = ""; var m = this.minutesDisabled || []; for (var B = 0; B < 60; B += this.minuteStep) { if (m.indexOf(B) !== -1) { continue } var x = h(u, I, n, D, B, 0); v = ""; if (x.valueOf() < this.startDate || x.valueOf() > this.endDate) { v += " disabled" } else { if (Math.floor(y / this.minuteStep) == Math.floor(B / this.minuteStep)) { v += " active" } } if (this.showMeridian && a[this.language].meridiem.length == 2) { F = (D < 12 ? a[this.language].meridiem[0] : a[this.language].meridiem[1]); if (F != t) { if (t != "") { s.push("</fieldset>") } s.push('<fieldset class="minute"><legend>' + F.toUpperCase() + "</legend>") } t = F; w = (D % 12 ? D % 12 : 12); s.push('<span class="minute' + v + '">' + w + ":" + (B < 10 ? "0" + B : B) + "</span>"); if (B == 59) { s.push("</fieldset>") } } else { w = B + ":00"; s.push('<span class="minute' + v + '">' + D + ":" + (B < 10 ? "0" + B : B) + "</span>") } } this.picker.find(".datetimepicker-minutes td").html(s.join("")); var L = this.date.getUTCFullYear(); var p = this.setTitle(".datetimepicker-months", u).end().find("span").removeClass("active"); if (L == u) { var o = p.length - 12; p.eq(this.date.getUTCMonth() + o).addClass("active") } if (u < z || u > q) { p.addClass("disabled") } if (u == z) { p.slice(0, E).addClass("disabled") } if (u == q) { p.slice(A).addClass("disabled") } s = ""; u = parseInt(u / 10, 10) * 10; var J = this.setTitle(".datetimepicker-years", u + "-" + (u + 9)).end().find("td"); u -= 1; for (var B = -1; B < 11; B++) { s += '<span class="year' + (B == -1 || B == 10 ? " old" : "") + (L == u ? " active" : "") + (u < z || u > q ? " disabled" : "") + '">' + u + "</span>"; u += 1 } J.html(s); this.place() }, updateNavArrows: function () { var n = new Date(this.viewDate), l = n.getUTCFullYear(), m = n.getUTCMonth(), k = n.getUTCDate(), j = n.getUTCHours(); switch (this.viewMode) { case 0: if (this.startDate !== -Infinity && l <= this.startDate.getUTCFullYear() && m <= this.startDate.getUTCMonth() && k <= this.startDate.getUTCDate() && j <= this.startDate.getUTCHours()) { this.picker.find(".prev").css({ visibility: "hidden" }) } else { this.picker.find(".prev").css({ visibility: "visible" }) } if (this.endDate !== Infinity && l >= this.endDate.getUTCFullYear() && m >= this.endDate.getUTCMonth() && k >= this.endDate.getUTCDate() && j >= this.endDate.getUTCHours()) { this.picker.find(".next").css({ visibility: "hidden" }) } else { this.picker.find(".next").css({ visibility: "visible" }) } break; case 1: if (this.startDate !== -Infinity && l <= this.startDate.getUTCFullYear() && m <= this.startDate.getUTCMonth() && k <= this.startDate.getUTCDate()) { this.picker.find(".prev").css({ visibility: "hidden" }) } else { this.picker.find(".prev").css({ visibility: "visible" }) } if (this.endDate !== Infinity && l >= this.endDate.getUTCFullYear() && m >= this.endDate.getUTCMonth() && k >= this.endDate.getUTCDate()) { this.picker.find(".next").css({ visibility: "hidden" }) } else { this.picker.find(".next").css({ visibility: "visible" }) } break; case 2: if (this.startDate !== -Infinity && l <= this.startDate.getUTCFullYear() && m <= this.startDate.getUTCMonth()) { this.picker.find(".prev").css({ visibility: "hidden" }) } else { this.picker.find(".prev").css({ visibility: "visible" }) } if (this.endDate !== Infinity && l >= this.endDate.getUTCFullYear() && m >= this.endDate.getUTCMonth()) { this.picker.find(".next").css({ visibility: "hidden" }) } else { this.picker.find(".next").css({ visibility: "visible" }) } break; case 3: case 4: if (this.startDate !== -Infinity && l <= this.startDate.getUTCFullYear()) { this.picker.find(".prev").css({ visibility: "hidden" }) } else { this.picker.find(".prev").css({ visibility: "visible" }) } if (this.endDate !== Infinity && l >= this.endDate.getUTCFullYear()) { this.picker.find(".next").css({ visibility: "hidden" }) } else { this.picker.find(".next").css({ visibility: "visible" }) } break } }, mousewheel: function (k) { k.preventDefault(); k.stopPropagation(); if (this.wheelPause) { return } this.wheelPause = true; var j = k.originalEvent; var m = j.wheelDelta; var l = m > 0 ? 1 : (m === 0) ? 0 : -1; if (this.wheelViewModeNavigationInverseDirection) { l = -l } this.showMode(l); setTimeout(f.proxy(function () { this.wheelPause = false }, this), this.wheelViewModeNavigationDelay) }, click: function (n) { n.stopPropagation(); n.preventDefault(); var o = f(n.target).closest("span, td, th, legend"); if (o.is("." + this.icontype)) { o = f(o).parent().closest("span, td, th, legend") } if (o.length == 1) { if (o.is(".disabled")) { this.element.trigger({ type: "outOfRange", date: this.viewDate, startDate: this.startDate, endDate: this.endDate }); return } switch (o[0].nodeName.toLowerCase()) { case "th": switch (o[0].className) { case "switch": this.showMode(1); break; case "prev": case "next": var j = g.modes[this.viewMode].navStep * (o[0].className == "prev" ? -1 : 1); switch (this.viewMode) { case 0: this.viewDate = this.moveHour(this.viewDate, j); break; case 1: this.viewDate = this.moveDate(this.viewDate, j); break; case 2: this.viewDate = this.moveMonth(this.viewDate, j); break; case 3: case 4: this.viewDate = this.moveYear(this.viewDate, j); break } this.fill(); this.element.trigger({ type: o[0].className + ":" + this.convertViewModeText(this.viewMode), date: this.viewDate, startDate: this.startDate, endDate: this.endDate }); break; case "clear": this.reset(); if (this.autoclose) { this.hide() } break; case "today": var k = new Date(); k = h(k.getFullYear(), k.getMonth(), k.getDate(), k.getHours(), k.getMinutes(), k.getSeconds(), 0); if (k < this.startDate) { k = this.startDate } else { if (k > this.endDate) { k = this.endDate } } this.viewMode = this.startViewMode; this.showMode(0); this._setDate(k); this.fill(); if (this.autoclose) { this.hide() } break } break; case "span": if (!o.is(".disabled")) { var q = this.viewDate.getUTCFullYear(), p = this.viewDate.getUTCMonth(), r = this.viewDate.getUTCDate(), s = this.viewDate.getUTCHours(), l = this.viewDate.getUTCMinutes(), t = this.viewDate.getUTCSeconds(); if (o.is(".month")) { this.viewDate.setUTCDate(1); p = o.parent().find("span").index(o); r = this.viewDate.getUTCDate(); this.viewDate.setUTCMonth(p); this.element.trigger({ type: "changeMonth", date: this.viewDate }); if (this.viewSelect >= 3) { this._setDate(h(q, p, r, s, l, t, 0)) } } else { if (o.is(".year")) { this.viewDate.setUTCDate(1); q = parseInt(o.text(), 10) || 0; this.viewDate.setUTCFullYear(q); this.element.trigger({ type: "changeYear", date: this.viewDate }); if (this.viewSelect >= 4) { this._setDate(h(q, p, r, s, l, t, 0)) } } else { if (o.is(".hour")) { s = parseInt(o.text(), 10) || 0; if (o.hasClass("hour_am") || o.hasClass("hour_pm")) { if (s == 12 && o.hasClass("hour_am")) { s = 0 } else { if (s != 12 && o.hasClass("hour_pm")) { s += 12 } } } this.viewDate.setUTCHours(s); this.element.trigger({ type: "changeHour", date: this.viewDate }); if (this.viewSelect >= 1) { this._setDate(h(q, p, r, s, l, t, 0)) } } else { if (o.is(".minute")) { l = parseInt(o.text().substr(o.text().indexOf(":") + 1), 10) || 0; this.viewDate.setUTCMinutes(l); this.element.trigger({ type: "changeMinute", date: this.viewDate }); if (this.viewSelect >= 0) { this._setDate(h(q, p, r, s, l, t, 0)) } } } } } if (this.viewMode != 0) { var m = this.viewMode; this.showMode(-1); this.fill(); if (m == this.viewMode && this.autoclose) { this.hide() } } else { this.fill(); if (this.autoclose) { this.hide() } } } break; case "td": if (o.is(".day") && !o.is(".disabled")) { var r = parseInt(o.text(), 10) || 1; var q = this.viewDate.getUTCFullYear(), p = this.viewDate.getUTCMonth(), s = this.viewDate.getUTCHours(), l = this.viewDate.getUTCMinutes(), t = this.viewDate.getUTCSeconds(); if (o.is(".old")) { if (p === 0) { p = 11; q -= 1 } else { p -= 1 } } else { if (o.is(".new")) { if (p == 11) { p = 0; q += 1 } else { p += 1 } } } this.viewDate.setUTCFullYear(q); this.viewDate.setUTCMonth(p, r); this.element.trigger({ type: "changeDay", date: this.viewDate }); if (this.viewSelect >= 2) { this._setDate(h(q, p, r, s, l, t, 0)) } } var m = this.viewMode; this.showMode(-1); this.fill(); if (m == this.viewMode && this.autoclose) { this.hide() } break } } }, _setDate: function (j, l) { if (!l || l == "date") { this.date = j } if (!l || l == "view") { this.viewDate = j } this.fill(); this.setValue(); var k; if (this.isInput) { k = this.element } else { if (this.component) { k = this.element.find("input") } } if (k) { k.change(); if (this.autoclose && (!l || l == "date")) { } } this.element.trigger({ type: "changeDate", date: this.getDate() }); if (j == null) { this.date = this.viewDate } }, moveMinute: function (k, j) { if (!j) { return k } var l = new Date(k.valueOf()); l.setUTCMinutes(l.getUTCMinutes() + (j * this.minuteStep)); return l }, moveHour: function (k, j) { if (!j) { return k } var l = new Date(k.valueOf()); l.setUTCHours(l.getUTCHours() + j); return l }, moveDate: function (k, j) { if (!j) { return k } var l = new Date(k.valueOf()); l.setUTCDate(l.getUTCDate() + j); return l }, moveMonth: function (j, k) { if (!k) { return j } var n = new Date(j.valueOf()), r = n.getUTCDate(), o = n.getUTCMonth(), m = Math.abs(k), q, p; k = k > 0 ? 1 : -1; if (m == 1) { p = k == -1 ? function () { return n.getUTCMonth() == o } : function () { return n.getUTCMonth() != q }; q = o + k; n.setUTCMonth(q); if (q < 0 || q > 11) { q = (q + 12) % 12 } } else { for (var l = 0; l < m; l++) { n = this.moveMonth(n, k) } q = n.getUTCMonth(); n.setUTCDate(r); p = function () { return q != n.getUTCMonth() } } while (p()) { n.setUTCDate(--r); n.setUTCMonth(q) } return n }, moveYear: function (k, j) { return this.moveMonth(k, j * 12) }, dateWithinRange: function (j) { return j >= this.startDate && j <= this.endDate }, keydown: function (n) { if (this.picker.is(":not(:visible)")) { if (n.keyCode == 27) { this.show() } return } var p = false, k, q, o, r, j; switch (n.keyCode) { case 27: this.hide(); n.preventDefault(); break; case 37: case 39: if (!this.keyboardNavigation) { break } k = n.keyCode == 37 ? -1 : 1; viewMode = this.viewMode; if (n.ctrlKey) { viewMode += 2 } else { if (n.shiftKey) { viewMode += 1 } } if (viewMode == 4) { r = this.moveYear(this.date, k); j = this.moveYear(this.viewDate, k) } else { if (viewMode == 3) { r = this.moveMonth(this.date, k); j = this.moveMonth(this.viewDate, k) } else { if (viewMode == 2) { r = this.moveDate(this.date, k); j = this.moveDate(this.viewDate, k) } else { if (viewMode == 1) { r = this.moveHour(this.date, k); j = this.moveHour(this.viewDate, k) } else { if (viewMode == 0) { r = this.moveMinute(this.date, k); j = this.moveMinute(this.viewDate, k) } } } } } if (this.dateWithinRange(r)) { this.date = r; this.viewDate = j; this.setValue(); this.update(); n.preventDefault(); p = true } break; case 38: case 40: if (!this.keyboardNavigation) { break } k = n.keyCode == 38 ? -1 : 1; viewMode = this.viewMode; if (n.ctrlKey) { viewMode += 2 } else { if (n.shiftKey) { viewMode += 1 } } if (viewMode == 4) { r = this.moveYear(this.date, k); j = this.moveYear(this.viewDate, k) } else { if (viewMode == 3) { r = this.moveMonth(this.date, k); j = this.moveMonth(this.viewDate, k) } else { if (viewMode == 2) { r = this.moveDate(this.date, k * 7); j = this.moveDate(this.viewDate, k * 7) } else { if (viewMode == 1) { if (this.showMeridian) { r = this.moveHour(this.date, k * 6); j = this.moveHour(this.viewDate, k * 6) } else { r = this.moveHour(this.date, k * 4); j = this.moveHour(this.viewDate, k * 4) } } else { if (viewMode == 0) { r = this.moveMinute(this.date, k * 4); j = this.moveMinute(this.viewDate, k * 4) } } } } } if (this.dateWithinRange(r)) { this.date = r; this.viewDate = j; this.setValue(); this.update(); n.preventDefault(); p = true } break; case 13: if (this.viewMode != 0) { var m = this.viewMode; this.showMode(-1); this.fill(); if (m == this.viewMode && this.autoclose) { this.hide() } } else { this.fill(); if (this.autoclose) { this.hide() } } n.preventDefault(); break; case 9: this.hide(); break } if (p) { var l; if (this.isInput) { l = this.element } else { if (this.component) { l = this.element.find("input") } } if (l) { l.change() } this.element.trigger({ type: "changeDate", date: this.getDate() }) } }, showMode: function (j) { if (j) { var k = Math.max(0, Math.min(g.modes.length - 1, this.viewMode + j)); if (k >= this.minView && k <= this.maxView) { this.element.trigger({ type: "changeMode", date: this.viewDate, oldViewMode: this.viewMode, newViewMode: k }); this.viewMode = k } } this.picker.find(">div").hide().filter(".datetimepicker-" + g.modes[this.viewMode].clsName).css("display", "block"); this.updateNavArrows() }, reset: function (j) { this._setDate(null, "date") }, convertViewModeText: function (j) { switch (j) { case 4: return "decade"; case 3: return "year"; case 2: return "month"; case 1: return "day"; case 0: return "hour" } } }; var b = f.fn.datetimepicker; f.fn.datetimepicker = function (l) { var j = Array.apply(null, arguments); j.shift(); var k; this.each(function () { var o = f(this), n = o.data("datetimepicker"), m = typeof l == "object" && l; if (!n) { o.data("datetimepicker", (n = new i(this, f.extend({}, f.fn.datetimepicker.defaults, m)))) } if (typeof l == "string" && typeof n[l] == "function") { k = n[l].apply(n, j); if (k !== c) { return false } } }); if (k !== c) { return k } else { return this } }; f.fn.datetimepicker.defaults = {}; f.fn.datetimepicker.Constructor = i; var a = f.fn.datetimepicker.dates = { en: { days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], meridiem: ["am", "pm"], suffix: ["st", "nd", "rd", "th"], today: "Today", clear: "Clear" } }; var g = { modes: [{ clsName: "minutes", navFnc: "Hours", navStep: 1 }, { clsName: "hours", navFnc: "Date", navStep: 1 }, { clsName: "days", navFnc: "Month", navStep: 1 }, { clsName: "months", navFnc: "FullYear", navStep: 1 }, { clsName: "years", navFnc: "FullYear", navStep: 10 }], isLeapYear: function (j) { return (((j % 4 === 0) && (j % 100 !== 0)) || (j % 400 === 0)) }, getDaysInMonth: function (j, k) { return [31, (g.isLeapYear(j) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][k] }, getDefaultFormat: function (j, k) { if (j == "standard") { if (k == "input") { return "yyyy-mm-dd hh:ii" } else { return "yyyy-mm-dd hh:ii:ss" } } else { if (j == "php") { if (k == "input") { return "Y-m-d H:i" } else { return "Y-m-d H:i:s" } } else { throw new Error("Invalid format type.") } } }, validParts: function (j) { if (j == "standard") { return /t|hh?|HH?|p|P|z|Z|ii?|ss?|dd?|DD?|mm?|MM?|yy(?:yy)?/g } else { if (j == "php") { return /[dDjlNwzFmMnStyYaABgGhHis]/g } else { throw new Error("Invalid format type.") } } }, nonpunctuation: /[^ -\/:-@\[-`{-~\t\n\rTZ]+/g, parseFormat: function (m, k) { var j = m.replace(this.validParts(k), "\0").split("\0"), l = m.match(this.validParts(k)); if (!j || !j.length || !l || l.length == 0) { throw new Error("Invalid date format.") } return { separators: j, parts: l } }, parseDate: function (A, y, v, j, r) { if (A instanceof Date) { var u = new Date(A.valueOf() - A.getTimezoneOffset() * 60000); u.setMilliseconds(0); return u } if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(A)) { y = this.parseFormat("yyyy-mm-dd", j) } if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(A)) { y = this.parseFormat("yyyy-mm-dd hh:ii", j) } if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(A)) { y = this.parseFormat("yyyy-mm-dd hh:ii:ss", j) } if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(A)) { var l = /([-+]\d+)([dmwy])/, q = A.match(/([-+]\d+)([dmwy])/g), t, p; A = new Date(); for (var x = 0; x < q.length; x++) { t = l.exec(q[x]); p = parseInt(t[1]); switch (t[2]) { case "d": A.setUTCDate(A.getUTCDate() + p); break; case "m": A = i.prototype.moveMonth.call(i.prototype, A, p); break; case "w": A.setUTCDate(A.getUTCDate() + p * 7); break; case "y": A = i.prototype.moveYear.call(i.prototype, A, p); break } } return h(A.getUTCFullYear(), A.getUTCMonth(), A.getUTCDate(), A.getUTCHours(), A.getUTCMinutes(), A.getUTCSeconds(), 0) } var q = A && A.toString().match(this.nonpunctuation) || [], A = new Date(0, 0, 0, 0, 0, 0, 0), m = {}, z = ["hh", "h", "ii", "i", "ss", "s", "yyyy", "yy", "M", "MM", "m", "mm", "D", "DD", "d", "dd", "H", "HH", "p", "P", "z", "Z"], o = { hh: function (C, s) { return C.setUTCHours(s) }, h: function (C, s) { return C.setUTCHours(s) }, HH: function (C, s) { return C.setUTCHours(s == 12 ? 0 : s) }, H: function (C, s) { return C.setUTCHours(s == 12 ? 0 : s) }, ii: function (C, s) { return C.setUTCMinutes(s) }, i: function (C, s) { return C.setUTCMinutes(s) }, ss: function (C, s) { return C.setUTCSeconds(s) }, s: function (C, s) { return C.setUTCSeconds(s) }, yyyy: function (C, s) { return C.setUTCFullYear(s) }, yy: function (C, s) { return C.setUTCFullYear(2000 + s) }, m: function (C, s) { s -= 1; while (s < 0) { s += 12 } s %= 12; C.setUTCMonth(s); while (C.getUTCMonth() != s) { if (isNaN(C.getUTCMonth())) { return C } else { C.setUTCDate(C.getUTCDate() - 1) } } return C }, d: function (C, s) { return C.setUTCDate(s) }, p: function (C, s) { return C.setUTCHours(s == 1 ? C.getUTCHours() + 12 : C.getUTCHours()) }, z: function () { return r } }, B, k, t; o.M = o.MM = o.mm = o.m; o.dd = o.d; o.P = o.p; o.Z = o.z; A = h(A.getFullYear(), A.getMonth(), A.getDate(), A.getHours(), A.getMinutes(), A.getSeconds()); if (q.length == y.parts.length) { for (var x = 0, w = y.parts.length; x < w; x++) { B = parseInt(q[x], 10); t = y.parts[x]; if (isNaN(B)) { switch (t) { case "MM": k = f(a[v].months).filter(function () { var s = this.slice(0, q[x].length), C = q[x].slice(0, s.length); return s == C }); B = f.inArray(k[0], a[v].months) + 1; break; case "M": k = f(a[v].monthsShort).filter(function () { var s = this.slice(0, q[x].length), C = q[x].slice(0, s.length); return s.toLowerCase() == C.toLowerCase() }); B = f.inArray(k[0], a[v].monthsShort) + 1; break; case "p": case "P": B = f.inArray(q[x].toLowerCase(), a[v].meridiem); break; case "z": case "Z": r; break } } m[t] = B } for (var x = 0, n; x < z.length; x++) { n = z[x]; if (n in m && !isNaN(m[n])) { o[n](A, m[n]) } } } return A }, formatDate: function (l, q, m, p, o) { if (l == null) { return "" } var k; if (p == "standard") { k = { t: l.getTime(), yy: l.getUTCFullYear().toString().substring(2), yyyy: l.getUTCFullYear(), m: l.getUTCMonth() + 1, M: a[m].monthsShort[l.getUTCMonth()], MM: a[m].months[l.getUTCMonth()], d: l.getUTCDate(), D: a[m].daysShort[l.getUTCDay()], DD: a[m].days[l.getUTCDay()], p: (a[m].meridiem.length == 2 ? a[m].meridiem[l.getUTCHours() < 12 ? 0 : 1] : ""), h: l.getUTCHours(), i: l.getUTCMinutes(), s: l.getUTCSeconds(), z: o }; if (a[m].meridiem.length == 2) { k.H = (k.h % 12 == 0 ? 12 : k.h % 12) } else { k.H = k.h } k.HH = (k.H < 10 ? "0" : "") + k.H; k.P = k.p.toUpperCase(); k.Z = k.z; k.hh = (k.h < 10 ? "0" : "") + k.h; k.ii = (k.i < 10 ? "0" : "") + k.i; k.ss = (k.s < 10 ? "0" : "") + k.s; k.dd = (k.d < 10 ? "0" : "") + k.d; k.mm = (k.m < 10 ? "0" : "") + k.m } else { if (p == "php") { k = { y: l.getUTCFullYear().toString().substring(2), Y: l.getUTCFullYear(), F: a[m].months[l.getUTCMonth()], M: a[m].monthsShort[l.getUTCMonth()], n: l.getUTCMonth() + 1, t: g.getDaysInMonth(l.getUTCFullYear(), l.getUTCMonth()), j: l.getUTCDate(), l: a[m].days[l.getUTCDay()], D: a[m].daysShort[l.getUTCDay()], w: l.getUTCDay(), N: (l.getUTCDay() == 0 ? 7 : l.getUTCDay()), S: (l.getUTCDate() % 10 <= a[m].suffix.length ? a[m].suffix[l.getUTCDate() % 10 - 1] : ""), a: (a[m].meridiem.length == 2 ? a[m].meridiem[l.getUTCHours() < 12 ? 0 : 1] : ""), g: (l.getUTCHours() % 12 == 0 ? 12 : l.getUTCHours() % 12), G: l.getUTCHours(), i: l.getUTCMinutes(), s: l.getUTCSeconds() }; k.m = (k.n < 10 ? "0" : "") + k.n; k.d = (k.j < 10 ? "0" : "") + k.j; k.A = k.a.toString().toUpperCase(); k.h = (k.g < 10 ? "0" : "") + k.g; k.H = (k.G < 10 ? "0" : "") + k.G; k.i = (k.i < 10 ? "0" : "") + k.i; k.s = (k.s < 10 ? "0" : "") + k.s } else { throw new Error("Invalid format type.") } } var l = [], r = f.extend([], q.separators); for (var n = 0, j = q.parts.length; n < j; n++) { if (r.length) { l.push(r.shift()) } l.push(k[q.parts[n]]) } if (r.length) { l.push(r.shift()) } return l.join("") }, convertViewMode: function (j) { switch (j) { case 4: case "decade": j = 4; break; case 3: case "year": j = 3; break; case 2: case "month": j = 2; break; case 1: case "day": j = 1; break; case 0: case "hour": j = 0; break } return j }, headTemplate: '<thead><tr><th class="prev"><i class="{iconType} {leftArrow}"/></th><th colspan="5" class="switch"></th><th class="next"><i class="{iconType} {rightArrow}"/></th></tr></thead>', headTemplateV3: '<thead><tr><th class="prev"><span class="{iconType} {leftArrow}"></span> </th><th colspan="5" class="switch"></th><th class="next"><span class="{iconType} {rightArrow}"></span> </th></tr></thead>', contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>', footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr><tr><th colspan="7" class="clear"></th></tr></tfoot>' }; g.template = '<div class="datetimepicker"><div class="datetimepicker-minutes"><table class=" table-condensed">' + g.headTemplate + g.contTemplate + g.footTemplate + '</table></div><div class="datetimepicker-hours"><table class=" table-condensed">' + g.headTemplate + g.contTemplate + g.footTemplate + '</table></div><div class="datetimepicker-days"><table class=" table-condensed">' + g.headTemplate + "<tbody></tbody>" + g.footTemplate + '</table></div><div class="datetimepicker-months"><table class="table-condensed">' + g.headTemplate + g.contTemplate + g.footTemplate + '</table></div><div class="datetimepicker-years"><table class="table-condensed">' + g.headTemplate + g.contTemplate + g.footTemplate + "</table></div></div>"; g.templateV3 = '<div class="datetimepicker"><div class="datetimepicker-minutes"><table class=" table-condensed">' + g.headTemplateV3 + g.contTemplate + g.footTemplate + '</table></div><div class="datetimepicker-hours"><table class=" table-condensed">' + g.headTemplateV3 + g.contTemplate + g.footTemplate + '</table></div><div class="datetimepicker-days"><table class=" table-condensed">' + g.headTemplateV3 + "<tbody></tbody>" + g.footTemplate + '</table></div><div class="datetimepicker-months"><table class="table-condensed">' + g.headTemplateV3 + g.contTemplate + g.footTemplate + '</table></div><div class="datetimepicker-years"><table class="table-condensed">' + g.headTemplateV3 + g.contTemplate + g.footTemplate + "</table></div></div>"; f.fn.datetimepicker.DPGlobal = g; f.fn.datetimepicker.noConflict = function () { f.fn.datetimepicker = b; return this }; f(document).on("focus.datetimepicker.data-api click.datetimepicker.data-api", '[data-provide="datetimepicker"]', function (k) { var j = f(this); if (j.data("datetimepicker")) { return } k.preventDefault(); j.datetimepicker("show") }); f(function () { f('[data-provide="datetimepicker-inline"]').datetimepicker() }) }));



//https://github.com/igorescobar/jQuery-Mask-Plugin

// jQuery Mask Plugin v1.14.0
// github.com/igorescobar/jQuery-Mask-Plugin
(function (b) { "function" === typeof define && define.amd ? define(["jquery"], b) : "object" === typeof exports ? module.exports = b(require("jquery")) : b(jQuery || Zepto) })(function (b) {
    var y = function (a, e, d) {
        var c = {
            invalid: [], getCaret: function () { try { var r, b = 0, e = a.get(0), d = document.selection, f = e.selectionStart; if (d && -1 === navigator.appVersion.indexOf("MSIE 10")) r = d.createRange(), r.moveStart("character", -c.val().length), b = r.text.length; else if (f || "0" === f) b = f; return b } catch (g) { } }, setCaret: function (r) {
                try {
                    if (a.is(":focus")) {
                        var c,
                        b = a.get(0); b.setSelectionRange ? (b.focus(), b.setSelectionRange(r, r)) : (c = b.createTextRange(), c.collapse(!0), c.moveEnd("character", r), c.moveStart("character", r), c.select())
                    }
                } catch (e) { }
            }, events: function () {
                a.on("keydown.mask", function (c) { a.data("mask-keycode", c.keyCode || c.which) }).on(b.jMaskGlobals.useInput ? "input.mask" : "keyup.mask", c.behaviour).on("paste.mask drop.mask", function () { setTimeout(function () { a.keydown().keyup() }, 100) }).on("change.mask", function () { a.data("changed", !0) }).on("blur.mask", function () {
                    n ===
                    c.val() || a.data("changed") || a.trigger("change"); a.data("changed", !1)
                }).on("blur.mask", function () { n = c.val() }).on("focus.mask", function (a) { !0 === d.selectOnFocus && b(a.target).select() }).on("focusout.mask", function () { d.clearIfNotMatch && !p.test(c.val()) && c.val("") })
            }, getRegexMask: function () {
                for (var a = [], c, b, d, f, l = 0; l < e.length; l++) (c = g.translation[e.charAt(l)]) ? (b = c.pattern.toString().replace(/.{1}$|^.{1}/g, ""), d = c.optional, (c = c.recursive) ? (a.push(e.charAt(l)), f = { digit: e.charAt(l), pattern: b }) : a.push(d ||
                c ? b + "?" : b)) : a.push(e.charAt(l).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")); a = a.join(""); f && (a = a.replace(new RegExp("(" + f.digit + "(.*" + f.digit + ")?)"), "($1)?").replace(new RegExp(f.digit, "g"), f.pattern)); return new RegExp(a)
            }, destroyEvents: function () { a.off("input keydown keyup paste drop blur focusout ".split(" ").join(".mask ")) }, val: function (c) { var b = a.is("input") ? "val" : "text"; if (0 < arguments.length) { if (a[b]() !== c) a[b](c); b = a } else b = a[b](); return b }, getMCharsBeforeCount: function (a, c) {
                for (var b = 0, d = 0,
                f = e.length; d < f && d < a; d++) g.translation[e.charAt(d)] || (a = c ? a + 1 : a, b++); return b
            }, caretPos: function (a, b, d, h) { return g.translation[e.charAt(Math.min(a - 1, e.length - 1))] ? Math.min(a + d - b - h, d) : c.caretPos(a + 1, b, d, h) }, behaviour: function (d) {
                d = d || window.event; c.invalid = []; var e = a.data("mask-keycode"); if (-1 === b.inArray(e, g.byPassKeys)) {
                    var m = c.getCaret(), h = c.val().length, f = c.getMasked(), l = f.length, k = c.getMCharsBeforeCount(l - 1) - c.getMCharsBeforeCount(h - 1), n = m < h; c.val(f); n && (8 !== e && 46 !== e && (m = c.caretPos(m, h, l, k)),
                    c.setCaret(m)); return c.callbacks(d)
                }
            }, getMasked: function (a, b) {
                var m = [], h = void 0 === b ? c.val() : b + "", f = 0, l = e.length, k = 0, n = h.length, q = 1, p = "push", u = -1, t, w; d.reverse ? (p = "unshift", q = -1, t = 0, f = l - 1, k = n - 1, w = function () { return -1 < f && -1 < k }) : (t = l - 1, w = function () { return f < l && k < n }); for (; w() ;) {
                    var x = e.charAt(f), v = h.charAt(k), s = g.translation[x]; if (s) v.match(s.pattern) ? (m[p](v), s.recursive && (-1 === u ? u = f : f === t && (f = u - q), t === u && (f -= q)), f += q) : s.optional ? (f += q, k -= q) : s.fallback ? (m[p](s.fallback), f += q, k -= q) : c.invalid.push({
                        p: k,
                        v: v, e: s.pattern
                    }), k += q; else { if (!a) m[p](x); v === x && (k += q); f += q }
                } h = e.charAt(t); l !== n + 1 || g.translation[h] || m.push(h); return m.join("")
            }, callbacks: function (b) { var g = c.val(), m = g !== n, h = [g, b, a, d], f = function (a, b, c) { "function" === typeof d[a] && b && d[a].apply(this, c) }; f("onChange", !0 === m, h); f("onKeyPress", !0 === m, h); f("onComplete", g.length === e.length, h); f("onInvalid", 0 < c.invalid.length, [g, b, a, c.invalid, d]) }
        }; a = b(a); var g = this, n = c.val(), p; e = "function" === typeof e ? e(c.val(), void 0, a, d) : e; g.mask = e; g.options = d; g.remove =
        function () { var b = c.getCaret(); c.destroyEvents(); c.val(g.getCleanVal()); c.setCaret(b - c.getMCharsBeforeCount(b)); return a }; g.getCleanVal = function () { return c.getMasked(!0) }; g.getMaskedVal = function (a) { return c.getMasked(!1, a) }; g.init = function (e) {
            e = e || !1; d = d || {}; g.clearIfNotMatch = b.jMaskGlobals.clearIfNotMatch; g.byPassKeys = b.jMaskGlobals.byPassKeys; g.translation = b.extend({}, b.jMaskGlobals.translation, d.translation); g = b.extend(!0, {}, g, d); p = c.getRegexMask(); !1 === e ? (d.placeholder && a.attr("placeholder", d.placeholder),
            a.data("mask") && a.attr("autocomplete", "off"), c.destroyEvents(), c.events(), e = c.getCaret(), c.val(c.getMasked()), c.setCaret(e + c.getMCharsBeforeCount(e, !0))) : (c.events(), c.val(c.getMasked()))
        }; g.init(!a.is("input"))
    }; b.maskWatchers = {}; var A = function () {
        var a = b(this), e = {}, d = a.attr("data-mask"); a.attr("data-mask-reverse") && (e.reverse = !0); a.attr("data-mask-clearifnotmatch") && (e.clearIfNotMatch = !0); "true" === a.attr("data-mask-selectonfocus") && (e.selectOnFocus = !0); if (z(a, d, e)) return a.data("mask", new y(this,
        d, e))
    }, z = function (a, e, d) { d = d || {}; var c = b(a).data("mask"), g = JSON.stringify; a = b(a).val() || b(a).text(); try { return "function" === typeof e && (e = e(a)), "object" !== typeof c || g(c.options) !== g(d) || c.mask !== e } catch (n) { } }; b.fn.mask = function (a, e) {
        e = e || {}; var d = this.selector, c = b.jMaskGlobals, g = c.watchInterval, c = e.watchInputs || c.watchInputs, n = function () { if (z(this, a, e)) return b(this).data("mask", new y(this, a, e)) }; b(this).each(n); d && "" !== d && c && (clearInterval(b.maskWatchers[d]), b.maskWatchers[d] = setInterval(function () { b(document).find(d).each(n) },
        g)); return this
    }; b.fn.masked = function (a) { return this.data("mask").getMaskedVal(a) }; b.fn.unmask = function () { clearInterval(b.maskWatchers[this.selector]); delete b.maskWatchers[this.selector]; return this.each(function () { var a = b(this).data("mask"); a && a.remove().removeData("mask") }) }; b.fn.cleanVal = function () { return this.data("mask").getCleanVal() }; b.applyDataMask = function (a) { a = a || b.jMaskGlobals.maskElements; (a instanceof b ? a : b(a)).filter(b.jMaskGlobals.dataMaskAttr).each(A) }; var p = {
        maskElements: "input,td,span,div",
        dataMaskAttr: "*[data-mask]", dataMask: !0, watchInterval: 300, watchInputs: !0, useInput: function (a) { var b = document.createElement("div"), d; a = "on" + a; d = a in b; d || (b.setAttribute(a, "return;"), d = "function" === typeof b[a]); return d }("input"), watchDataMask: !1, byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91], translation: { 0: { pattern: /\d/ }, 9: { pattern: /\d/, optional: !0 }, "#": { pattern: /\d/, recursive: !0 }, A: { pattern: /[a-zA-Z0-9]/ }, S: { pattern: /[a-zA-Z]/ } }
    }; b.jMaskGlobals = b.jMaskGlobals || {}; p = b.jMaskGlobals = b.extend(!0, {}, p, b.jMaskGlobals);
    p.dataMask && b.applyDataMask(); setInterval(function () { b.jMaskGlobals.watchDataMask && b.applyDataMask() }, p.watchInterval)
});


//https://www.qodo.co.uk/blog/javascript-checking-if-a-date-is-valid/
// Checks a string to see if it in a valid date format
// of (D)D/(M)M/(YY)YY and returns true/false
function isValidDate(s) {
    // format D(D)/M(M)/(YY)YY
    var dateFormat = /^\d{1,4}[\.|\/|-]\d{1,2}[\.|\/|-]\d{1,4}$/;

    if (dateFormat.test(s)) {
        // remove any leading zeros from date values
        s = s.replace(/0*(\d*)/gi, "$1");
        var dateArray = s.split(/[\.|\/|-]/);

        // correct month value
        dateArray[1] = dateArray[1] - 1;

        // correct year value
        if (dateArray[2].length < 4) {
            // correct year value
            dateArray[2] = (parseInt(dateArray[2]) < 50) ? 2000 + parseInt(dateArray[2]) : 1900 + parseInt(dateArray[2]);
        }

        var testDate = new Date(dateArray[2], dateArray[1], dateArray[0]);
        if (testDate.getDate() != dateArray[0] || testDate.getMonth() != dateArray[1] || testDate.getFullYear() != dateArray[2]) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}


// input dropdown

//$(function(){
//			var selectBoxOne = $("#input_dropdown").editableSelect();			
//			selectBoxOne.change(function(){
//				console.log("Option: "+selectBoxOne.val());
//			});			
//			//selectBoxOne.restoreSelect();
//});

function toFloat(v) {
    //	console.log("v", v, typeof v);
    v += " ";
    var x = parseFloat(v.replace(/[^\d.-]/g, ''));
    //var x = parseFloat(v.replace( new RegExp("/[^\d.-]/g",'')));
    if (isNaN(x)) x = 0.00;
    return x;
}


Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


function isEmail(email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailReg.test( email );
}

/*
 * notifIt! by @naoxink https://github.com/naoxink/notifIt
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        var package = factory(root.b);
        root.notif = package.notif;
        root.notifit_dismiss = package.notifit_dismiss;
        root.notif_confirm = package.notif_confirm;
    }
}(this, function () {
    function notif(config) {
        // Util stuff
        var create_close_button = function () {
            return $('<span>', {
                'id': 'notifIt_close',
                'html': '&times'
            });
        }
        var create_notification = function () {
            var div = $('<div>', {
                'id': 'ui_notifIt'
            });
            var p = $('<p>', {
                html: defaults.msg
            });
            div.append(p);
            return div;
        }
        // Global timeout
        window.notifit_timeout = null;
        // We love jQuery
        var $ = jQuery;
        // Mid position
        var mid = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) / 2;
        // Available positions
        var available_positions = ['left', 'center', 'right', 'bottom'];
        // Default config
        var defaults = {
            type: "default",
            width: 400,
            height: 60,
            position: "right",
            autohide: 1,
            msg: "An error occured (99)",
            opacity: 1,
            multiline: 0,
            fade: 0,
            bgcolor: "",
            color: "",
            timeout: 10000,
            zindex: null,
            offset: 0,
            callback: null,
            clickable: false,
            animation: 'slide'
        };
        // Extend with new params
        $.extend(defaults, config);
        // Animation config
        // ** Maybe create an external js with only animations for easier customizing? **
        defaults.animations = {}
        // Slide animation [DEFAULT]
        defaults.animations.slide = {
            'center': {
                'css_start': {
                    "top": parseInt(0 - (defaults.height + 10)),
                    "left": mid - parseInt(defaults.width / 2)
                },
                'in': {
                    'top': parseInt(10 + defaults.offset)
                },
                'out': {
                    'start': {
                        'top': parseInt(defaults.height - (defaults.height / 2))
                    },
                    'end': {
                        'top': parseInt(0 - (defaults.height * 2))
                    }
                }
            },
            'bottom': {
                'css_start': {
                    "top": 'auto',
                    "bottom": parseInt(0 - (defaults.height + 10)),
                    "left": mid - parseInt(defaults.width / 2)
                },
                'in': {
                    'bottom': parseInt(10 + defaults.offset)
                },
                'out': {
                    'start': {
                        'bottom': parseInt(defaults.height - (defaults.height / 2))
                    },
                    'end': {
                        'bottom': parseInt(0 - (defaults.height * 2))
                    }
                }
            },
            'right': {
                'css_start': {
                    "right": parseInt(0 - (defaults.width + 10)),
                    "right": parseInt(0 - (defaults.width * 2))
                },
                'in': {
                    'right': parseInt(10 + defaults.offset)
                },
                'out': {
                    'start': {
                        'right': parseFloat(defaults.width - (defaults.width * 0.9))
                    },
                    'end': {
                        'right': parseInt(0 - (defaults.width * 2))
                    }
                }
            },
            'left': {
                'css_start': {
                    "left": parseInt(0 - (defaults.width + 10))
                },
                'in': {
                    'left': parseInt(10 + defaults.offset)
                },
                'out': {
                    'start': {
                        'left': parseFloat(defaults.width - (defaults.width * 0.9))
                    },
                    'end': {
                        'left': parseInt(0 - (defaults.width * 2))
                    }
                }
            }
        };
        // Zoom animation
        defaults.animations.zoom = {
            'center': { // Not working well
                'css_start': {
                    "top": 10,
                    "left": mid - parseInt(defaults.width / 2),
                    "zoom": 0.01
                },
                'in': {
                    'zoom': 1
                },
                'out': {
                    'start': {
                        'zoom': 1.3
                    },
                    'end': {
                        'zoom': 0.01
                    }
                }
            },
            'bottom': { // Not working well
                'css_start': {
                    "top": 'auto',
                    "bottom": 10,
                    "left": mid - parseInt(defaults.width / 2),
                    "zoom": 0.01
                },
                'in': {
                    'zoom': 1
                },
                'out': {
                    'start': {
                        'zoom': 1.3
                    },
                    'end': {
                        'zoom': 0.01
                    }
                }
            },
            'right': {
                'css_start': {
                    'right': 10,
                    'zoom': 0.01
                },
                'in': {
                    'right': parseInt(10 + defaults.offset),
                    'zoom': 1
                },
                'out': {
                    'start': {
                        'zoom': 1.3
                    },
                    'end': {
                        'zoom': 0.01
                    }
                }
            },
            'left': {
                'css_start': {
                    'left': 10,
                    'zoom': 0.01
                },
                'in': {
                    'zoom': 1
                },
                'out': {
                    'start': {
                        'zoom': 1.3
                    },
                    'end': {
                        'zoom': 0.01
                    }
                }
            }
        };
        // Check if animation exists
        defaults.available_animations = Object.keys(defaults.animations)
        if (!defaults.available_animations.length) {
            throw new Error('No animations')
        }
        if (!available_positions.length) {
            throw new Error('No available positions')
        }
        if (available_positions.indexOf(defaults.position) === -1) {
            defaults.position = available_positions[0]
        }
        if (defaults.available_animations.indexOf(defaults.animation) === -1) {
            defaults.animation = defaults.available_animations[0]
        }
        // Check callback
        if (typeof defaults.callback !== 'function') {
            defaults.callback = null;
        }
        // Width & Height
        if (defaults.width > 0) {
            defaults.width = defaults.width;
        } else if (defaults.width === "all") {
            defaults.width = $(window).width() - 40;
        } else {
            defaults.width = 400;
        }
        if (defaults.height < 100 && defaults.height > 0) {
            height = defaults.height;
        }
        // Create notification itself
        var div = create_notification()
        // If clickable add close button
        if (defaults.clickable) {
            div.append(create_close_button())
        }
        // Remove div before appending, we don't want to duplicate
        var destroy = function () {
            $("#ui_notifIt").remove();
            clearTimeout(window.notifit_timeout);
        }
        destroy();
        $("body").append(div);
        // Set z-index
        if (defaults.zindex) {
            $("#ui_notifIt").css("z-index", defaults.zindex);
        }
        // If multiline we have to set the padding instead line-height
        if (defaults.multiline) {
            $("#ui_notifIt").css("padding", 15);
        } else {
            $("#ui_notifIt").css("height", height);
            $("#ui_notifIt p").css("line-height", height + "px");
        }
        // Basic css
        $("#ui_notifIt").css({
            "width": defaults.width,
            "opacity": defaults.opacity,
            "background-color": defaults.bgcolor,
            "color": defaults.color
        });
        // Class 'success', 'error', 'warning', 'info'..
        $("#ui_notifIt").addClass(defaults.type);
        // Set entry animation   
        if (defaults.animations[defaults.animation][defaults.position].css_start) {
            $("#ui_notifIt").css(defaults.animations[defaults.animation][defaults.position].css_start);
        } else {
            $("#ui_notifIt").css(defaults.animations[defaults.available_animations[0]][defaults.position].css_start);
        }
        // Execute entry animation
        $("#ui_notifIt").animate(defaults.animations[defaults.animation][defaults.position].in);
        // Events
        if (!defaults.clickable) {
            $("#ui_notifIt").click(function (e) {
                e.stopPropagation();
                notifit_dismiss(defaults);
            });
        }
        $('body').on('click', '#ui_notifIt #notifIt_close', function () {
            notifit_dismiss(defaults);
        });
        if (defaults.autohide) {
            if (!isNaN(defaults.timeout)) {
                window.notifit_timeout = setTimeout(function () {
                    notifit_dismiss(defaults);
                }, defaults.timeout);
            }
        }
        return {
            'destroy': destroy
        }
    }
    function notifit_dismiss(config) {
        clearTimeout(window.notifit_timeout);
        if (config.animation != 'fade') {
            // Set animations
            if (config.animations && config.animations[config.animation] && config.animations[config.animation][config.position] && config.animations[config.animation][config.position].out && config.animations[config.animation][config.position].out.start && config.animations[config.animation][config.position].out.end) {
                animation1 = config.animations[config.animation][config.position].out.start
                animation2 = config.animations[config.animation][config.position].out.end
            } else if (config.animations[config.available_animations[0]] && config.animations[config.available_animations[0]][config.position] && config.animations[config.available_animations[0]][config.position].out && config.animations[config.available_animations[0]][config.position].out.start && config.animations[config.available_animations[0]][config.position].out.end) {
                animation1 = config.animations[config.available_animations[0]][config.position].out.start
                animation2 = config.animations[config.available_animations[0]][config.position].out.end
            } else {
                throw new Error('Invalid animation')
            }
            // Execute animations       
            $("#ui_notifIt").animate(animation1, 100, function () {
                $("#ui_notifIt").animate(animation2, 100, function () {
                    $("#ui_notifIt").remove();
                    if (config.callback) {
                        config.callback();
                    }
                });
            });
        } else {
            // jQuery's fade, why create my own?
            $("#ui_notifIt").fadeOut("slow", function () {
                $("#ui_notifIt").remove();
                if (config.callback) {
                    config.callback();
                }
            });
        }
    }
    function notif_confirm(config) {
        var $ = jQuery
        var _config = {
            'textaccept': 'Accept',
            'textcancel': 'Cancel',
            'message': 'Is that what you want to do?',
            'callback': null
        }
        var settings = $.extend({}, _config, config)
        var $confirm = $('.notifit_confirm')[0] || null
        var $bg = $('.notifit_confirm_bg')[0] || null

        function _create() {
            if ($confirm !== null) {
                return $confirm
            }
            var $acceptButton = $('<button>', {
                'class': 'notifit_confirm_accept',
                'text': settings.textaccept
            })
            var $cancelButton = $('<button>', {
                'class': 'notifit_confirm_cancel',
                'text': settings.textcancel
            })
            var $message = $('<div>', {
                'class': 'notifit_confirm_message',
                'text': settings.message
            })
            $confirm = $('<div>', {
                'class': 'notifit_confirm'
            })
            $confirm
                .append($message)
                .append($acceptButton)
                .append($cancelButton)
            $bg = $('<div>', { 'class': 'notifit_confirm_bg' })
            return $confirm
        }
        function _show() {
            if ($confirm) {
                $('body').append($bg)
                $('body').append($confirm)
                $confirm.css({
                    'top': $bg.outerHeight() / 2 - ($confirm.outerHeight() / 2),
                    'left': $bg.outerWidth() / 2 - ($confirm.outerWidth() / 2)
                })
            }
        }
        function _hide() {
            if ($confirm) {
                $confirm.remove()
            }
            if ($bg) {
                $bg.remove()
            }
        }
        function _callback() {
            _hide()
            var response = null
            if ($(this).hasClass('notifit_confirm_accept')) {
                response = true
            } else if ($(this).hasClass('notifit_confirm_cancel')) {
                response = false
            }
            if (typeof settings.callback === 'function') {
                return settings.callback(response)
            }
            return response
        }
        function _setListeners() {
            $('html').one('click', '.notifit_confirm_accept, .notifit_confirm_cancel', _callback)
        }

        // Get the party started! \o/
        _create()
        _show()
        _setListeners()
    }
    function notif_prompt(config) {
        // TODO
    }
    return {
        notif: notif,
        notifit_dismiss: notifit_dismiss,
        notif_confirm: notif_confirm
    };
}));

function nalert(text) {

    notif({
        type: "error",
        msg: text,
        width: "all",
        //autohide: false,
        multiline: true,
        position: "center",
        //offset: 150
    });
}

function dalert(text) {

    notif({
        type: "info",
        msg: text,
        width: "all",
        //autohide: false,
        multiline: true,
        position: "center",
        //offset: 150
    });
}





function renderTemplate(d, template, destination) {
    console.log("function renderTemplate ", d, template, destination);
    var templatesource = jQuery(template).html(); //console.log("templatesource", templatesource);
    var template = Handlebars.compile(templatesource); //console.log("template", template);
    var html = template(d); //console.log("html", html);
    jQuery(destination).html(html).show();

}

function getFormData($form) {
    var unindexed_array = $form.serializeArray();

    $($form).find("input:checkbox:not(:checked)").each(function () {
        unindexed_array.push({
            name: $(this).attr('name'),
            value: ""
        });
    });

    console.log("unindexed_array", unindexed_array);

    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });

    console.log("indexed_array", indexed_array);

    return indexed_array;
}

function callProxy(Action, data, success, failure) {

    //$("#imgLoading").show();

    $.ajaxQueue({
        url: Action,
        contentType: "application/json; charset=utf-8",
        type: 'POST',
        dataType: "json",
        data: JSON.stringify(data),
        success: function (response) {
            console.log('Success', response);

            if (response != null && response.Success == true) {
                console.log("Success YES");


                success(response);


            }
            else {
                console.log("NOT Success");

                if (failure != null) {
                    failure(response)
                } else {
                    nalert(response.ErrorMessage);
                }
            }

            console.log("done");

            //$("#imgLoading").hide();

            return false;
        },
        error: function () {
            console.log("Error");
            nalert("An error occured!");

            //$("#imgLoading").hide();

            return false;
        }
    });
}

String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};

function set_date_input() {

    var startDate = new Date('1915-01-01'),
   endDate = new Date('2035-01-01');


    $(".form_date").datetimepicker({
        format: 'mm/dd/yyyy',
        weekStart: 1,
        todayBtn: false,
        autoclose: 1,
        todayHighlight: 1,
        startView: 4,
        keyboardNavigation: 1,
        minView: 2,
        forceParse: 0,
        initialDate: new Date(),
        startDate: startDate, //set start date
        endDate: endDate //set end date
    });

    $('.form_date input').mask('09/09/0000'); //9 optional
}


function isDate(f) {

    var dateWrapper = new Date(jQuery(f).val());

    console.log("isDate", dateWrapper);

    return !isNaN(dateWrapper.getDate());
}

function ValidateRequired(f) {

    if (jQuery(f).val().isEmpty()) {
        jQuery(f).addClass('invalid');
        console.log('ValidateRequired false', f);
        return false;
    }
    else {
        jQuery(f).removeClass('invalid');
        console.log('ValidateRequired true', f);
    }
    return true;
}

function ValidateDate(f) {

    if (!isDate(f)) {
        jQuery(f).addClass('invalid');
        console.log('ValidateDate', f);
        return false;
    }
    else {
        jQuery(f).removeClass('invalid');
    }
    return true;
}

function Validate(id) {

    var valid = true;

    jQuery(id).find('input.required:visible, select.required:visible').each(function () {

        valid &= ValidateRequired(this);


    });

    jQuery(id).find('.form_date input:visible').each(function () {

        valid &= ValidateDate(this);


    });

    return valid;

    //return false;
}

Handlebars.registerHelper("checkedIf", function (condition) {
    console.log("checkedIf", condition);
    return (condition) ? "checked" : "";
});

Handlebars.registerHelper("selectedIf", function (value1, value2) {
    //console.log("selectedIf", value1, value2, value1 == value2);
    return (value1 != null && value2 !=null && value1 == value2) ? "selected" : "";
});

Handlebars.registerHelper('if_even', function (conditional, options) {
    if ((conditional % 2) == 0) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('if_odd', function (conditional, options) {
    if ((conditional % 2) == 1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    var operator = options.hash.operator || "==";

    var operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

    var result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

Handlebars.registerHelper('breaklines', function (text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
});
Handlebars.registerHelper("formatMoney", function (value, options) {
    if (value == null) return null;
    return toFloat(value).formatMoney();
});
Handlebars.registerHelper("formatDate", function (date) {
    if (typeof (date) == "undefined") {
        return "Unknown";
    }
    return formatDate(new Date(parseInt(date.substr(6))));
});
function formatDate(stringDate) {
    var date = new Date(stringDate);
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
}

$(document).ajaxStop(function () {
    console.debug("ajaxStop");
    $("#ajax_loader").hide();
});
$(document).ajaxStart(function () {
    console.debug("ajaxStart");
    $("#ajax_loader").show();
});

//printInvoice
function printOrder(div) {
    var divToPrint = $(div).html();
    var contents = $(div).html();
    var frame1 = document.createElement('iframe');
    frame1.name = "frame1";
    frame1.style.position = "absolute";
    frame1.style.top = "-1000000px";
    document.body.appendChild(frame1);
    var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
    frameDoc.document.open();
    frameDoc.document.write('<html><head><link href="/css/bootstrap.min.css" rel="stylesheet"><link href="/css/custom.css" rel="stylesheet" type="text/css"><style>.links{display:none;}</style></head><title>Order Contents</title>');
    frameDoc.document.write('</head><body>');
    frameDoc.document.write(contents);
    frameDoc.document.write('</body></html>');
    frameDoc.document.close();
    setTimeout(function () {
        window.frames["frame1"].focus();
        window.frames["frame1"].print();
        document.body.removeChild(frame1);
    }, 500);
    return false;
};