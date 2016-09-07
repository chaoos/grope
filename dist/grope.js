(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.grope = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * Export function of the module
     *
     * @param {HTMLElement} container - The HTMLElement to grope ;-)
     * @param {Options} options - the options object to configure Grope
     * @return {Grope} - Grope object instance
     */
    function grope(containers, options) {
        if (options === void 0) { options = {}; }
        var c = containers instanceof Array ? containers : new Array(containers);
        /**
         * Polyfill bind function for older browsers
         * The bind function is an addition to ECMA-262, 5th edition
         * @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
         */
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== 'function') {
                    // closest thing possible to the ECMAScript 5
                    // internal IsCallable function
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }
                var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () { }, fBound = function () {
                    return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };
                if (this.prototype) {
                    // Function.prototype doesn't have a prototype property
                    fNOP.prototype = this.prototype;
                }
                fBound.prototype = new fNOP();
                return fBound;
            };
        }
        /* list of real events */
        var htmlEvents = {
            /* <body> and <frameset> Events */
            onload: 1,
            onunload: 1,
            /* Form Events */
            onblur: 1,
            onchange: 1,
            onfocus: 1,
            onreset: 1,
            onselect: 1,
            onsubmit: 1,
            /* Image Events */
            onabort: 1,
            /* Keyboard Events */
            onkeydown: 1,
            onkeypress: 1,
            onkeyup: 1,
            /* Mouse Events */
            onclick: 1,
            ondblclick: 1,
            onmousedown: 1,
            onmousemove: 1,
            onmouseout: 1,
            onmouseover: 1,
            onmouseup: 1
        };
        var mapEvents = {
            onscroll: window
        };
        /**
         * Grope
         *
         * @author Roman Gruber <p1020389@yahoo.com>
         * @version 1.0
         */
        var Grope = (function () {
            function Grope(containers, options) {
                this.containers = containers;
                this.options = options;
                this.gropeElement = null;
                this.gropeClone = null;
                this.gropeContainer = null;
                this.originGropeContainer = null;
                this.copyElement = null;
                this.mapping = [];
                this.originMapping = [];
                this.rectCache = [];
                /* CSS style classes */
                this.classGropable = 'gr-gropable';
                this.classTossZone = 'gr-tosszone';
                this.classGroping = 'gr-groping';
                this.classModeGroping = 'gr-mode-groping';
                this.classMove = 'move';
                this.classCopy = 'copy';
                this.classDisappear = 'gr-disappear';
                this.mouseDownHandlers = [];
                /* array holding the custom events mapping callbacks to bound callbacks */
                this.customEvents = [];
                this.containers = containers;
                /* set default options */
                this.options = {
                    /* CSS class selector to match elements which should become dragable inside the containers */
                    elements: ['div'],
                    /* A callback returning true or false whether the element is allowed to drop. The drag will be
                     * reverted if this returns false. The callback will be invoked with the following parameters:
                     *   @param {HTMLElement} element - the dragged element (optional).
                     *   @param {HTMLElement} from - the container where the element is from (optional).
                     *   @param {HTMLElement} to - the target container (optional).
                     *   @return {boolean} - whether draging is allowed or not.
                     */
                    tossCallback: function () { return true; },
                    /* TODO: with keydown and keyup */
                    copy: false
                };
                /* merge the default option objects with the provided one */
                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        if (typeof options[key] == 'object') {
                            for (var okey in options[key]) {
                                if (options[key].hasOwnProperty(okey))
                                    this.options[key][okey] = options[key][okey];
                            }
                        }
                        else {
                            this.options[key] = options[key];
                        }
                    }
                }
                this.init();
            }
            /**
             * Initialize DOM manipulations and event handlers
             *
             * @return {void}
             */
            Grope.prototype.init = function () {
                var _this = this;
                //for (var container of this.containers) {
                for (var i in this.containers) {
                    var container = this.containers[i];
                    this.addClass(container, this.classTossZone);
                    var a = 0;
                    this.mapping[i] = [];
                    for (var _i = 0, _a = container.querySelectorAll(this.options.elements.join(', ')); _i < _a.length; _i++) {
                        var el = _a[_i];
                        this.addClass(el, this.classGropable);
                        this.addClass(el, this.options.copy ? this.classCopy : this.classMove);
                        this.mapping[i][a] = el;
                        /* mousedown handler */
                        var callback = function (e) { return _this.mouseDown(e); };
                        this.addEventListener(el, 'mousedown', callback);
                        a++;
                    }
                }
            };
            /**
             * Reinitialize the grope element
             *
             * @return {Grope} - The Grope object instance
             */
            Grope.prototype.reinit = function () {
            };
            Grope.prototype.remap = function () {
                this.mapping = [];
                this.rectCache = [];
                for (var i in this.containers) {
                    this.mapping[i] = [];
                    var a = 0;
                    for (var _i = 0, _a = this.containers[i].querySelectorAll(this.options.elements.join(', ')); _i < _a.length; _i++) {
                        var el = _a[_i];
                        if (el !== this.gropeClone) {
                            this.mapping[i][a] = el;
                            a++;
                        }
                    }
                }
                return this.mapping;
            };
            /**
             * Mouse down handler
             * TODO
             *
             * @param {MouseEvent} e - The mouse down event object
             * @return {void}
             */
            Grope.prototype.mouseDown = function (e) {
                var _this = this;
                this.originMapping = this.remap();
                this.gropeElement = this.getElementBehindCursor(e.clientX, e.clientY);
                this.gropeContainer = this.getContainerByGropeElement(this.gropeElement);
                this.originGropeContainer = this.gropeContainer;
                if (this.gropeContainer != null) {
                    if (this.options.copy === true) {
                        this.copyElement = this.gropeElement;
                        this.gropeElement = this.gropeElement.cloneNode(true);
                        ;
                        this.gropeContainer.insertBefore(this.gropeElement, this.copyElement);
                        var callback = function (e) { return _this.mouseDown(e); };
                        this.addEventListener(this.gropeElement, 'mousedown', callback);
                        this.remap();
                    }
                    this.gropeClone = this.gropeElement.cloneNode(true);
                    //TODO maybe not neccessary (copyComputedStyle), because cloneElement will be in the same parent
                    //this.copyComputedStyle(this.gropeElement, this.gropeClone);
                    this.gropeClone.style.width = this.gropeElement.offsetWidth + 'px';
                    this.gropeClone.style.height = this.gropeElement.offsetHeight + 'px';
                    this.addClass(this.gropeClone, this.classGroping);
                    this.addClass(this.gropeElement, this.classDisappear);
                    this.addClass(document.body, this.classModeGroping);
                    this.addClass(document.body, this.options.copy ? this.classCopy : this.classMove);
                    var rect = this.getRect(this.gropeElement, true);
                    this.deltaX = e.clientX - rect.left;
                    this.deltaY = e.clientY - rect.top;
                    this.mouseMove(e);
                    this.gropeContainer.appendChild(this.gropeClone);
                    /* mousemove handler */
                    this.mouseMoveHandler = function (e) { return _this.mouseMove(e); };
                    this.addEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler);
                    /* mouseup handler */
                    this.mouseUpHandler = function (e) { return _this.mouseUp(e); };
                    this.addEventListener(document.documentElement, 'mouseup', this.mouseUpHandler);
                }
            };
            /**
             * Mouse up handler
             * TODO
             *
             * @param {MouseEvent} e - The mouse up event object
             * @return {void}
             */
            Grope.prototype.mouseUp = function (e) {
                this.removeEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler);
                this.removeEventListener(document.documentElement, 'mouseup', this.mouseUpHandler);
                this.removeClass(this.gropeElement, this.classDisappear);
                this.removeClass(document.body, this.classModeGroping);
                this.removeClass(document.body, this.classCopy);
                this.removeClass(document.body, this.classMove);
                this.gropeClone.parentNode.removeChild(this.gropeClone);
                for (var _i = 0, _a = this.containers; _i < _a.length; _i++) {
                    var container = _a[_i];
                    this.removeClass(container, 'active');
                }
                if (this.options.tossCallback(this.gropeElement, this.originGropeContainer, this.gropeContainer) === false) {
                    this.revertChanges();
                }
                this.gropeElement = null;
                this.gropeClone = null;
                this.gropeContainer = null;
                this.copyElement = null;
            };
            /**
             * Mouse move handler
             * TODO
             *
             * @param {MouseEvent} e - The mouse move event object
             * @return {void}
             */
            Grope.prototype.mouseMove = function (e) {
                /* if the mouse left the window and the button is not pressed anymore, abort moving */
                if (("which" in e && e.which == 0) || (typeof e.which == 'undefined' && "button" in e && e.button == 0)) {
                    this.mouseUp(e);
                    return;
                }
                var container;
                var x = e.clientX;
                var y = e.clientY;
                this.gropeClone.style.left = (x - this.deltaX) + 'px';
                this.gropeClone.style.top = (y - this.deltaY) + 'px';
                var found = false;
                for (var i in this.mapping) {
                    for (var _i = 0, _a = this.mapping[i]; _i < _a.length; _i++) {
                        var gropeElement = _a[_i];
                        var coords = this.getRect(gropeElement);
                        if (found === false
                            && x >= coords.left
                            && x <= (gropeElement.offsetWidth + coords.left)
                            && y >= coords.top
                            && y <= (gropeElement.offsetHeight + coords.top)) {
                            found = true;
                            container = this.getContainerByGropeElement(gropeElement);
                            this.addClass(container, 'active');
                            if (gropeElement != this.gropeElement) {
                                var pos = this.gropeElement.compareDocumentPosition(gropeElement);
                                if (pos == Node.DOCUMENT_POSITION_PRECEDING) {
                                    container.insertBefore(this.gropeElement, gropeElement);
                                    this.gropeContainer = container;
                                    this.remap();
                                }
                                else if (pos == Node.DOCUMENT_POSITION_FOLLOWING) {
                                    container.insertBefore(this.gropeElement, gropeElement.nextSibling);
                                    this.gropeContainer = container;
                                    this.remap();
                                }
                            }
                        }
                    }
                }
                if (found === false) {
                    for (var _b = 0, _c = this.containers; _b < _c.length; _b++) {
                        container = _c[_b];
                        var coords = this.getRect(container);
                        /* if the element is held over a container element, but not an other grope element,
                         * it should be appended to that container */
                        if (found === false
                            && x >= coords.left
                            && x <= (container.offsetWidth + coords.left)
                            && y >= coords.top
                            && y <= (container.offsetHeight + coords.top)) {
                            found = true;
                            this.addClass(container, 'active');
                            if (container != this.gropeContainer) {
                                container.appendChild(this.gropeElement);
                                container.appendChild(this.gropeClone);
                                this.gropeContainer = container;
                                this.remap();
                            }
                        }
                        else {
                            this.removeClass(container, 'active');
                        }
                    }
                }
            };
            Grope.prototype.revertChanges = function () {
                //TODO: revert multiple changes
                this.revertCopy();
            };
            Grope.prototype.revertMove = function () {
                for (var i in this.originMapping) {
                    for (var a in this.originMapping[i]) {
                        if (this.originMapping[i][a] == this.gropeElement) {
                            this.getContainerByGropeElement(this.gropeElement).removeChild(this.gropeElement);
                            var list = this.originGropeContainer.querySelectorAll(this.options.elements.join(', '));
                            this.originGropeContainer.insertBefore(this.gropeElement, list[a]);
                            return;
                        }
                    }
                }
            };
            Grope.prototype.revertCopy = function () {
                if (this.copyElement !== null) {
                    this.getContainerByGropeElement(this.gropeElement).removeChild(this.gropeElement);
                    this.gropeElement = this.copyElement;
                    this.copyElement = null;
                }
                this.revertMove();
            };
            Grope.prototype.getRect = function (el, live) {
                if (live === void 0) { live = false; }
                if (live === false) {
                    for (var _i = 0, _a = this.rectCache; _i < _a.length; _i++) {
                        var data = _a[_i];
                        if (data.object == el) {
                            return data.rect;
                        }
                    }
                }
                var rect = el.getBoundingClientRect();
                this.rectCache.push({ object: el, rect: rect });
                return rect;
            };
            Grope.prototype.copyComputedStyle = function (from, to) {
                var computedStyle = false;
                computedStyle = from.currentStyle || document.defaultView.getComputedStyle(from, null);
                if (!computedStyle) {
                    return null;
                }
                ;
                for (var _i = 0, _a = computedStyle; _i < _a.length; _i++) {
                    var property = _a[_i];
                    var value = computedStyle[property];
                    if (typeof value !== 'undefined'
                        && typeof value !== 'object'
                        && typeof value !== 'function'
                        && value.length > 0
                        && value != parseInt(value)) {
                        to.style[property] = value;
                    }
                }
            };
            Grope.prototype.addClass = function (el, cssClass) {
                if (!this.hasClass(el, cssClass)) {
                    el.className += " " + cssClass + " ";
                }
            };
            Grope.prototype.removeClass = function (el, cssClass) {
                var re = new RegExp(" " + cssClass + " ", 'g');
                el.className = el.className.replace(re, '');
            };
            Grope.prototype.hasClass = function (el, cssClass) {
                var re = new RegExp(" " + cssClass + " ");
                return el.className.match(re) !== null;
            };
            Grope.prototype.getContainerByGropeElement = function (el) {
                for (var i in this.mapping) {
                    for (var _i = 0, _a = this.mapping[i]; _i < _a.length; _i++) {
                        var gropeElement = _a[_i];
                        if (gropeElement == el) {
                            return this.containers[i];
                        }
                    }
                }
                return null;
            };
            Grope.prototype.getElementBehindCursor = function (x, y) {
                var elementBehindCursor = document.elementFromPoint(x, y);
                /* find the next parent which is an gropable element */
                while (elementBehindCursor && !this.hasClass(elementBehindCursor, this.classGropable)) {
                    elementBehindCursor = elementBehindCursor.parentElement;
                }
                return elementBehindCursor;
            };
            /**
             * Browser independent event registration
             *
             * @param {any} obj - The HTMLElement to attach the event to
             * @param {string} event - The event name without the leading "on"
             * @param {(e: Event) => void} callback - A callback function to attach to the event
             * @param {boolean} bound - whether to bind the callback to the object instance or not
             * @return {void}
             */
            Grope.prototype.addEventListener = function (obj, event, callback, bound) {
                if (bound === void 0) { bound = true; }
                var boundCallback = bound ? callback.bind(this) : callback;
                if (typeof obj.addEventListener == 'function') {
                    if (mapEvents['on' + event] && obj.tagName == "BODY") {
                        obj = mapEvents['on' + event];
                    }
                    obj.addEventListener(event, boundCallback);
                }
                else if (typeof obj.attachEvent == 'object' && htmlEvents['on' + event]) {
                    obj.attachEvent('on' + event, boundCallback);
                }
                else if (typeof obj.attachEvent == 'object' && mapEvents['on' + event]) {
                    if (obj.tagName == "BODY") {
                        var p = 'on' + event;
                        /* example: window.onscroll = boundCallback */
                        mapEvents[p][p] = boundCallback;
                    }
                    else {
                        /* TODO: obj.onscroll ?? */
                        obj.onscroll = boundCallback;
                    }
                }
                else if (typeof obj.attachEvent == 'object') {
                    obj[event] = 1;
                    boundCallback = function (e) {
                        /* TODO: e is the onpropertychange event not one of the custom event objects */
                        if (e.propertyName == event) {
                            callback(e);
                        }
                    };
                    obj.attachEvent('onpropertychange', boundCallback);
                }
                else {
                    obj['on' + event] = boundCallback;
                }
                this.customEvents[event] ? null : (this.customEvents[event] = []);
                this.customEvents[event].push([callback, boundCallback]);
            };
            /**
             * Browser independent event deregistration
             *
             * @param {any} obj - The HTMLElement or window whose event should be detached
             * @param {string} event - The event name without the leading "on"
             * @param {(e: Event) => void} callback - The callback function when attached
             * @return {void}
             *
             * @TODO: unregistering of mapEvents
             */
            Grope.prototype.removeEventListener = function (obj, event, callback) {
                if (event in this.customEvents) {
                    for (var i in this.customEvents[event]) {
                        /* if the event was found in the array by its callback reference */
                        if (this.customEvents[event][i][0] == callback) {
                            /* remove the listener from the array by its bound callback reference */
                            callback = this.customEvents[event][i][1];
                            this.customEvents[event].splice(i, 1);
                            break;
                        }
                    }
                }
                if (typeof obj.removeEventListener == 'function') {
                    obj.removeEventListener(event, callback);
                }
                else if (typeof obj.detachEvent == 'object' && htmlEvents['on' + event]) {
                    obj.detachEvent('on' + event, callback);
                }
                else if (typeof obj.detachEvent == 'object') {
                    obj.detachEvent('onpropertychange', callback);
                }
                else {
                    obj['on' + event] = null;
                }
            };
            /**
             * Browser independent event trigger function
             *
             * @param {HTMLElement} obj - The HTMLElement which triggers the event
             * @param {string} eventName - The event name without the leading "on"
             * @return {void}
             */
            Grope.prototype.triggerEvent = function (obj, eventName) {
                var event;
                if (typeof window.CustomEvent === 'function') {
                    event = new CustomEvent(eventName);
                }
                else if (typeof document.createEvent == 'function') {
                    event = document.createEvent("HTMLEvents");
                    event.initEvent(eventName, true, true);
                }
                else if (document.createEventObject) {
                    event = document.createEventObject();
                    event.eventType = eventName;
                }
                event.eventName = eventName;
                if (obj.dispatchEvent) {
                    obj.dispatchEvent(event);
                }
                else if (obj[eventName]) {
                    obj[eventName]++;
                }
                else if (obj.fireEvent && htmlEvents['on' + eventName]) {
                    obj.fireEvent('on' + event.eventType, event);
                }
                else if (obj[eventName]) {
                    obj[eventName]();
                }
                else if (obj['on' + eventName]) {
                    obj['on' + eventName]();
                }
            };
            /**
             * Get a css style property value browser independent
             *
             * @param {HTMLElement} el - The HTMLElement to lookup
             * @param {string} jsProperty - The css property name in javascript in camelCase (e.g. "marginLeft", not "margin-left")
             * @return {string} - the property value
             */
            Grope.prototype.getStyle = function (el, jsProperty) {
                var cssProperty = jsProperty.replace(/([A-Z])/g, "-$1").toLowerCase();
                if (typeof window.getComputedStyle == 'function') {
                    return window.getComputedStyle(el).getPropertyValue(cssProperty);
                }
                else {
                    return el.currentStyle[jsProperty];
                }
            };
            /**
             * Register custom event callbacks
             * @TODO
             *
             * @param {string} event - The event name
             * @param {(e: Event) => any} callback - A callback function to execute when the event raises
             * @return {Grope} - The Grope object instance
             */
            Grope.prototype.on = function (event, callback) {
                return this;
            };
            /**
             * Deregister custom event callbacks
             * @TODO
             *
             * @param {string} event - The event name
             * @param {(e: Event) => any} callback - A callback function to execute when the event raises
             * @return {Grope} - The Grope object instance
             */
            Grope.prototype.off = function (event, callback) {
                return this;
            };
            /**
             * Revert all DOM manipulations and deregister all event handlers
             * @TODO
             *
             * @return {void}
             */
            Grope.prototype.destroy = function () {
                return;
            };
            return Grope;
        }());
        /* return an instance of the class */
        return new Grope(c, options);
    }
    return grope;
});

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJncm9wZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTsgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIC8qKlxuICAgICAqIEV4cG9ydCBmdW5jdGlvbiBvZiB0aGUgbW9kdWxlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgLSBUaGUgSFRNTEVsZW1lbnQgdG8gZ3JvcGUgOy0pXG4gICAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIC0gdGhlIG9wdGlvbnMgb2JqZWN0IHRvIGNvbmZpZ3VyZSBHcm9wZVxuICAgICAqIEByZXR1cm4ge0dyb3BlfSAtIEdyb3BlIG9iamVjdCBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdyb3BlKGNvbnRhaW5lcnMsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cbiAgICAgICAgdmFyIGMgPSBjb250YWluZXJzIGluc3RhbmNlb2YgQXJyYXkgPyBjb250YWluZXJzIDogbmV3IEFycmF5KGNvbnRhaW5lcnMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogUG9seWZpbGwgYmluZCBmdW5jdGlvbiBmb3Igb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgICogVGhlIGJpbmQgZnVuY3Rpb24gaXMgYW4gYWRkaXRpb24gdG8gRUNNQS0yNjIsIDV0aCBlZGl0aW9uXG4gICAgICAgICAqIEBzZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2JpbmRcbiAgICAgICAgICovXG4gICAgICAgIGlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgICAgICAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKG9UaGlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNVxuICAgICAgICAgICAgICAgICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBhQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZUb0JpbmQgPSB0aGlzLCBmTk9QID0gZnVuY3Rpb24gKCkgeyB9LCBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb1RoaXMsIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24ucHJvdG90eXBlIGRvZXNuJ3QgaGF2ZSBhIHByb3RvdHlwZSBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZkJvdW5kO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICAvKiBsaXN0IG9mIHJlYWwgZXZlbnRzICovXG4gICAgICAgIHZhciBodG1sRXZlbnRzID0ge1xuICAgICAgICAgICAgLyogPGJvZHk+IGFuZCA8ZnJhbWVzZXQ+IEV2ZW50cyAqL1xuICAgICAgICAgICAgb25sb2FkOiAxLFxuICAgICAgICAgICAgb251bmxvYWQ6IDEsXG4gICAgICAgICAgICAvKiBGb3JtIEV2ZW50cyAqL1xuICAgICAgICAgICAgb25ibHVyOiAxLFxuICAgICAgICAgICAgb25jaGFuZ2U6IDEsXG4gICAgICAgICAgICBvbmZvY3VzOiAxLFxuICAgICAgICAgICAgb25yZXNldDogMSxcbiAgICAgICAgICAgIG9uc2VsZWN0OiAxLFxuICAgICAgICAgICAgb25zdWJtaXQ6IDEsXG4gICAgICAgICAgICAvKiBJbWFnZSBFdmVudHMgKi9cbiAgICAgICAgICAgIG9uYWJvcnQ6IDEsXG4gICAgICAgICAgICAvKiBLZXlib2FyZCBFdmVudHMgKi9cbiAgICAgICAgICAgIG9ua2V5ZG93bjogMSxcbiAgICAgICAgICAgIG9ua2V5cHJlc3M6IDEsXG4gICAgICAgICAgICBvbmtleXVwOiAxLFxuICAgICAgICAgICAgLyogTW91c2UgRXZlbnRzICovXG4gICAgICAgICAgICBvbmNsaWNrOiAxLFxuICAgICAgICAgICAgb25kYmxjbGljazogMSxcbiAgICAgICAgICAgIG9ubW91c2Vkb3duOiAxLFxuICAgICAgICAgICAgb25tb3VzZW1vdmU6IDEsXG4gICAgICAgICAgICBvbm1vdXNlb3V0OiAxLFxuICAgICAgICAgICAgb25tb3VzZW92ZXI6IDEsXG4gICAgICAgICAgICBvbm1vdXNldXA6IDFcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG1hcEV2ZW50cyA9IHtcbiAgICAgICAgICAgIG9uc2Nyb2xsOiB3aW5kb3dcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdyb3BlXG4gICAgICAgICAqXG4gICAgICAgICAqIEBhdXRob3IgUm9tYW4gR3J1YmVyIDxwMTAyMDM4OUB5YWhvby5jb20+XG4gICAgICAgICAqIEB2ZXJzaW9uIDEuMFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIEdyb3BlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEdyb3BlKGNvbnRhaW5lcnMsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVDbG9uZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5Hcm9wZUNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jb3B5RWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXBwaW5nID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5NYXBwaW5nID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0Q2FjaGUgPSBbXTtcbiAgICAgICAgICAgICAgICAvKiBDU1Mgc3R5bGUgY2xhc3NlcyAqL1xuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NHcm9wYWJsZSA9ICdnci1ncm9wYWJsZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc1Rvc3Nab25lID0gJ2dyLXRvc3N6b25lJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzR3JvcGluZyA9ICdnci1ncm9waW5nJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTW9kZUdyb3BpbmcgPSAnZ3ItbW9kZS1ncm9waW5nJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTW92ZSA9ICdtb3ZlJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzQ29weSA9ICdjb3B5JztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzRGlzYXBwZWFyID0gJ2dyLWRpc2FwcGVhcic7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZURvd25IYW5kbGVycyA9IFtdO1xuICAgICAgICAgICAgICAgIC8qIGFycmF5IGhvbGRpbmcgdGhlIGN1c3RvbSBldmVudHMgbWFwcGluZyBjYWxsYmFja3MgdG8gYm91bmQgY2FsbGJhY2tzICovXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21FdmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgICAgICAgICAgICAgIC8qIHNldCBkZWZhdWx0IG9wdGlvbnMgKi9cbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIENTUyBjbGFzcyBzZWxlY3RvciB0byBtYXRjaCBlbGVtZW50cyB3aGljaCBzaG91bGQgYmVjb21lIGRyYWdhYmxlIGluc2lkZSB0aGUgY29udGFpbmVycyAqL1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50czogWydkaXYnXSxcbiAgICAgICAgICAgICAgICAgICAgLyogQSBjYWxsYmFjayByZXR1cm5pbmcgdHJ1ZSBvciBmYWxzZSB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIGFsbG93ZWQgdG8gZHJvcC4gVGhlIGRyYWcgd2lsbCBiZVxuICAgICAgICAgICAgICAgICAgICAgKiByZXZlcnRlZCBpZiB0aGlzIHJldHVybnMgZmFsc2UuIFRoZSBjYWxsYmFjayB3aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAgICAgICAgICAgICAgICAgICAqICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIHRoZSBkcmFnZ2VkIGVsZW1lbnQgKG9wdGlvbmFsKS5cbiAgICAgICAgICAgICAgICAgICAgICogICBAcGFyYW0ge0hUTUxFbGVtZW50fSBmcm9tIC0gdGhlIGNvbnRhaW5lciB3aGVyZSB0aGUgZWxlbWVudCBpcyBmcm9tIChvcHRpb25hbCkuXG4gICAgICAgICAgICAgICAgICAgICAqICAgQHBhcmFtIHtIVE1MRWxlbWVudH0gdG8gLSB0aGUgdGFyZ2V0IGNvbnRhaW5lciAob3B0aW9uYWwpLlxuICAgICAgICAgICAgICAgICAgICAgKiAgIEByZXR1cm4ge2Jvb2xlYW59IC0gd2hldGhlciBkcmFnaW5nIGlzIGFsbG93ZWQgb3Igbm90LlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgdG9zc0NhbGxiYWNrOiBmdW5jdGlvbiAoKSB7IHJldHVybiB0cnVlOyB9LFxuICAgICAgICAgICAgICAgICAgICAvKiBUT0RPOiB3aXRoIGtleWRvd24gYW5kIGtleXVwICovXG4gICAgICAgICAgICAgICAgICAgIGNvcHk6IGZhbHNlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvKiBtZXJnZSB0aGUgZGVmYXVsdCBvcHRpb24gb2JqZWN0cyB3aXRoIHRoZSBwcm92aWRlZCBvbmUgKi9cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnNba2V5XSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG9rZXkgaW4gb3B0aW9uc1trZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zW2tleV0uaGFzT3duUHJvcGVydHkob2tleSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XVtva2V5XSA9IG9wdGlvbnNba2V5XVtva2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5pdGlhbGl6ZSBET00gbWFuaXB1bGF0aW9ucyBhbmQgZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIC8vZm9yICh2YXIgY29udGFpbmVyIG9mIHRoaXMuY29udGFpbmVycykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5jb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoY29udGFpbmVyLCB0aGlzLmNsYXNzVG9zc1pvbmUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwcGluZ1tpXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5vcHRpb25zLmVsZW1lbnRzLmpvaW4oJywgJykpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhlbCwgdGhpcy5jbGFzc0dyb3BhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoZWwsIHRoaXMub3B0aW9ucy5jb3B5ID8gdGhpcy5jbGFzc0NvcHkgOiB0aGlzLmNsYXNzTW92ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcHBpbmdbaV1bYV0gPSBlbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIG1vdXNlZG93biBoYW5kbGVyICovXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMubW91c2VEb3duKGUpOyB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKGVsLCAnbW91c2Vkb3duJywgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgYSsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmVpbml0aWFsaXplIHRoZSBncm9wZSBlbGVtZW50XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHJldHVybiB7R3JvcGV9IC0gVGhlIEdyb3BlIG9iamVjdCBpbnN0YW5jZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUucmVpbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5yZW1hcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3RDYWNoZSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5jb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwcGluZ1tpXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmNvbnRhaW5lcnNbaV0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuZWxlbWVudHMuam9pbignLCAnKSk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWwgIT09IHRoaXMuZ3JvcGVDbG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwcGluZ1tpXVthXSA9IGVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGErKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXBwaW5nO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTW91c2UgZG93biBoYW5kbGVyXG4gICAgICAgICAgICAgKiBUT0RPXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIC0gVGhlIG1vdXNlIGRvd24gZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luTWFwcGluZyA9IHRoaXMucmVtYXAoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlRWxlbWVudCA9IHRoaXMuZ2V0RWxlbWVudEJlaGluZEN1cnNvcihlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNvbnRhaW5lciA9IHRoaXMuZ2V0Q29udGFpbmVyQnlHcm9wZUVsZW1lbnQodGhpcy5ncm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luR3JvcGVDb250YWluZXIgPSB0aGlzLmdyb3BlQ29udGFpbmVyO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyb3BlQ29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb3B5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlFbGVtZW50ID0gdGhpcy5ncm9wZUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3BlRWxlbWVudCA9IHRoaXMuZ3JvcGVFbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVDb250YWluZXIuaW5zZXJ0QmVmb3JlKHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmNvcHlFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5tb3VzZURvd24oZSk7IH07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5ncm9wZUVsZW1lbnQsICdtb3VzZWRvd24nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNsb25lID0gdGhpcy5ncm9wZUVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAvL1RPRE8gbWF5YmUgbm90IG5lY2Nlc3NhcnkgKGNvcHlDb21wdXRlZFN0eWxlKSwgYmVjYXVzZSBjbG9uZUVsZW1lbnQgd2lsbCBiZSBpbiB0aGUgc2FtZSBwYXJlbnRcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLmNvcHlDb21wdXRlZFN0eWxlKHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmdyb3BlQ2xvbmUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUud2lkdGggPSB0aGlzLmdyb3BlRWxlbWVudC5vZmZzZXRXaWR0aCArICdweCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVDbG9uZS5zdHlsZS5oZWlnaHQgPSB0aGlzLmdyb3BlRWxlbWVudC5vZmZzZXRIZWlnaHQgKyAncHgnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZENsYXNzKHRoaXMuZ3JvcGVDbG9uZSwgdGhpcy5jbGFzc0dyb3BpbmcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZENsYXNzKHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmNsYXNzRGlzYXBwZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCB0aGlzLmNsYXNzTW9kZUdyb3BpbmcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZENsYXNzKGRvY3VtZW50LmJvZHksIHRoaXMub3B0aW9ucy5jb3B5ID8gdGhpcy5jbGFzc0NvcHkgOiB0aGlzLmNsYXNzTW92ZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZWN0ID0gdGhpcy5nZXRSZWN0KHRoaXMuZ3JvcGVFbGVtZW50LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWx0YVggPSBlLmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsdGFZID0gZS5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZ3JvcGVDbG9uZSk7XG4gICAgICAgICAgICAgICAgICAgIC8qIG1vdXNlbW92ZSBoYW5kbGVyICovXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5tb3VzZU1vdmUoZSk7IH07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsICdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlTW92ZUhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICAvKiBtb3VzZXVwIGhhbmRsZXIgKi9cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZVVwSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5tb3VzZVVwKGUpOyB9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCAnbW91c2V1cCcsIHRoaXMubW91c2VVcEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1vdXNlIHVwIGhhbmRsZXJcbiAgICAgICAgICAgICAqIFRPRE9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgLSBUaGUgbW91c2UgdXAgZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUubW91c2VVcCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmNsYXNzRGlzYXBwZWFyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKGRvY3VtZW50LmJvZHksIHRoaXMuY2xhc3NNb2RlR3JvcGluZyk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCB0aGlzLmNsYXNzQ29weSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCB0aGlzLmNsYXNzTW92ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNsb25lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5ncm9wZUNsb25lKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5jb250YWluZXJzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKGNvbnRhaW5lciwgJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRvc3NDYWxsYmFjayh0aGlzLmdyb3BlRWxlbWVudCwgdGhpcy5vcmlnaW5Hcm9wZUNvbnRhaW5lciwgdGhpcy5ncm9wZUNvbnRhaW5lcikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmV2ZXJ0Q2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlRWxlbWVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNsb25lID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNvcHlFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1vdXNlIG1vdmUgaGFuZGxlclxuICAgICAgICAgICAgICogVE9ET1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSAtIFRoZSBtb3VzZSBtb3ZlIGV2ZW50IG9iamVjdFxuICAgICAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLm1vdXNlTW92ZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgLyogaWYgdGhlIG1vdXNlIGxlZnQgdGhlIHdpbmRvdyBhbmQgdGhlIGJ1dHRvbiBpcyBub3QgcHJlc3NlZCBhbnltb3JlLCBhYm9ydCBtb3ZpbmcgKi9cbiAgICAgICAgICAgICAgICBpZiAoKFwid2hpY2hcIiBpbiBlICYmIGUud2hpY2ggPT0gMCkgfHwgKHR5cGVvZiBlLndoaWNoID09ICd1bmRlZmluZWQnICYmIFwiYnV0dG9uXCIgaW4gZSAmJiBlLmJ1dHRvbiA9PSAwKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdXNlVXAoZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IGUuY2xpZW50WDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IGUuY2xpZW50WTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUubGVmdCA9ICh4IC0gdGhpcy5kZWx0YVgpICsgJ3B4JztcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUudG9wID0gKHkgLSB0aGlzLmRlbHRhWSkgKyAncHgnO1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5tYXBwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLm1hcHBpbmdbaV07IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvcGVFbGVtZW50ID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkcyA9IHRoaXMuZ2V0UmVjdChncm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kID09PSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHggPj0gY29vcmRzLmxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiB4IDw9IChncm9wZUVsZW1lbnQub2Zmc2V0V2lkdGggKyBjb29yZHMubGVmdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiB5ID49IGNvb3Jkcy50b3BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiB5IDw9IChncm9wZUVsZW1lbnQub2Zmc2V0SGVpZ2h0ICsgY29vcmRzLnRvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gdGhpcy5nZXRDb250YWluZXJCeUdyb3BlRWxlbWVudChncm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoY29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3BlRWxlbWVudCAhPSB0aGlzLmdyb3BlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9zID0gdGhpcy5ncm9wZUVsZW1lbnQuY29tcGFyZURvY3VtZW50UG9zaXRpb24oZ3JvcGVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvcyA9PSBOb2RlLkRPQ1VNRU5UX1BPU0lUSU9OX1BSRUNFRElORykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZSh0aGlzLmdyb3BlRWxlbWVudCwgZ3JvcGVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVDb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbWFwKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocG9zID09IE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fRk9MTE9XSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKHRoaXMuZ3JvcGVFbGVtZW50LCBncm9wZUVsZW1lbnQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZm91bmQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSB0aGlzLmNvbnRhaW5lcnM7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIgPSBfY1tfYl07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0gdGhpcy5nZXRSZWN0KGNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpZiB0aGUgZWxlbWVudCBpcyBoZWxkIG92ZXIgYSBjb250YWluZXIgZWxlbWVudCwgYnV0IG5vdCBhbiBvdGhlciBncm9wZSBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICogaXQgc2hvdWxkIGJlIGFwcGVuZGVkIHRvIHRoYXQgY29udGFpbmVyICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZm91bmQgPT09IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgeCA+PSBjb29yZHMubGVmdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHggPD0gKGNvbnRhaW5lci5vZmZzZXRXaWR0aCArIGNvb3Jkcy5sZWZ0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHkgPj0gY29vcmRzLnRvcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHkgPD0gKGNvbnRhaW5lci5vZmZzZXRIZWlnaHQgKyBjb29yZHMudG9wKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZENsYXNzKGNvbnRhaW5lciwgJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIgIT0gdGhpcy5ncm9wZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ncm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ncm9wZUNsb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoY29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLnJldmVydENoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy9UT0RPOiByZXZlcnQgbXVsdGlwbGUgY2hhbmdlc1xuICAgICAgICAgICAgICAgIHRoaXMucmV2ZXJ0Q29weSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5yZXZlcnRNb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5vcmlnaW5NYXBwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGEgaW4gdGhpcy5vcmlnaW5NYXBwaW5nW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcmlnaW5NYXBwaW5nW2ldW2FdID09IHRoaXMuZ3JvcGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRDb250YWluZXJCeUdyb3BlRWxlbWVudCh0aGlzLmdyb3BlRWxlbWVudCkucmVtb3ZlQ2hpbGQodGhpcy5ncm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gdGhpcy5vcmlnaW5Hcm9wZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0aW9ucy5lbGVtZW50cy5qb2luKCcsICcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbkdyb3BlQ29udGFpbmVyLmluc2VydEJlZm9yZSh0aGlzLmdyb3BlRWxlbWVudCwgbGlzdFthXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5yZXZlcnRDb3B5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvcHlFbGVtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q29udGFpbmVyQnlHcm9wZUVsZW1lbnQodGhpcy5ncm9wZUVsZW1lbnQpLnJlbW92ZUNoaWxkKHRoaXMuZ3JvcGVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm9wZUVsZW1lbnQgPSB0aGlzLmNvcHlFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvcHlFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5yZXZlcnRNb3ZlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmdldFJlY3QgPSBmdW5jdGlvbiAoZWwsIGxpdmUpIHtcbiAgICAgICAgICAgICAgICBpZiAobGl2ZSA9PT0gdm9pZCAwKSB7IGxpdmUgPSBmYWxzZTsgfVxuICAgICAgICAgICAgICAgIGlmIChsaXZlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5yZWN0Q2FjaGU7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLm9iamVjdCA9PSBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLnJlY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3RDYWNoZS5wdXNoKHsgb2JqZWN0OiBlbCwgcmVjdDogcmVjdCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuY29weUNvbXB1dGVkU3R5bGUgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcHV0ZWRTdHlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbXB1dGVkU3R5bGUgPSBmcm9tLmN1cnJlbnRTdHlsZSB8fCBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGZyb20sIG51bGwpO1xuICAgICAgICAgICAgICAgIGlmICghY29tcHV0ZWRTdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBjb21wdXRlZFN0eWxlOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbXB1dGVkU3R5bGVbcHJvcGVydHldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB2YWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB2YWx1ZSAhPSBwYXJzZUludCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvLnN0eWxlW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5hZGRDbGFzcyA9IGZ1bmN0aW9uIChlbCwgY3NzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGFzQ2xhc3MoZWwsIGNzc0NsYXNzKSkge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc05hbWUgKz0gXCIgXCIgKyBjc3NDbGFzcyArIFwiIFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoZWwsIGNzc0NsYXNzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcIiBcIiArIGNzc0NsYXNzICsgXCIgXCIsICdnJyk7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UocmUsICcnKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuaGFzQ2xhc3MgPSBmdW5jdGlvbiAoZWwsIGNzc0NsYXNzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcIiBcIiArIGNzc0NsYXNzICsgXCIgXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbC5jbGFzc05hbWUubWF0Y2gocmUpICE9PSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5nZXRDb250YWluZXJCeUdyb3BlRWxlbWVudCA9IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5tYXBwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLm1hcHBpbmdbaV07IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvcGVFbGVtZW50ID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3BlRWxlbWVudCA9PSBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lcnNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmdldEVsZW1lbnRCZWhpbmRDdXJzb3IgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgICAgICAgICAvKiBmaW5kIHRoZSBuZXh0IHBhcmVudCB3aGljaCBpcyBhbiBncm9wYWJsZSBlbGVtZW50ICovXG4gICAgICAgICAgICAgICAgd2hpbGUgKGVsZW1lbnRCZWhpbmRDdXJzb3IgJiYgIXRoaXMuaGFzQ2xhc3MoZWxlbWVudEJlaGluZEN1cnNvciwgdGhpcy5jbGFzc0dyb3BhYmxlKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZWxlbWVudEJlaGluZEN1cnNvci5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudEJlaGluZEN1cnNvcjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEJyb3dzZXIgaW5kZXBlbmRlbnQgZXZlbnQgcmVnaXN0cmF0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHthbnl9IG9iaiAtIFRoZSBIVE1MRWxlbWVudCB0byBhdHRhY2ggdGhlIGV2ZW50IHRvXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZSB3aXRob3V0IHRoZSBsZWFkaW5nIFwib25cIlxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IHZvaWR9IGNhbGxiYWNrIC0gQSBjYWxsYmFjayBmdW5jdGlvbiB0byBhdHRhY2ggdG8gdGhlIGV2ZW50XG4gICAgICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGJvdW5kIC0gd2hldGhlciB0byBiaW5kIHRoZSBjYWxsYmFjayB0byB0aGUgb2JqZWN0IGluc3RhbmNlIG9yIG5vdFxuICAgICAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAob2JqLCBldmVudCwgY2FsbGJhY2ssIGJvdW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJvdW5kID09PSB2b2lkIDApIHsgYm91bmQgPSB0cnVlOyB9XG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kQ2FsbGJhY2sgPSBib3VuZCA/IGNhbGxiYWNrLmJpbmQodGhpcykgOiBjYWxsYmFjaztcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9iai5hZGRFdmVudExpc3RlbmVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcEV2ZW50c1snb24nICsgZXZlbnRdICYmIG9iai50YWdOYW1lID09IFwiQk9EWVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmogPSBtYXBFdmVudHNbJ29uJyArIGV2ZW50XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgYm91bmRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmouYXR0YWNoRXZlbnQgPT0gJ29iamVjdCcgJiYgaHRtbEV2ZW50c1snb24nICsgZXZlbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGJvdW5kQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2JqLmF0dGFjaEV2ZW50ID09ICdvYmplY3QnICYmIG1hcEV2ZW50c1snb24nICsgZXZlbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmoudGFnTmFtZSA9PSBcIkJPRFlcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHAgPSAnb24nICsgZXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBleGFtcGxlOiB3aW5kb3cub25zY3JvbGwgPSBib3VuZENhbGxiYWNrICovXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBFdmVudHNbcF1bcF0gPSBib3VuZENhbGxiYWNrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogVE9ETzogb2JqLm9uc2Nyb2xsID8/ICovXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmoub25zY3JvbGwgPSBib3VuZENhbGxiYWNrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmouYXR0YWNoRXZlbnQgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2V2ZW50XSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogVE9ETzogZSBpcyB0aGUgb25wcm9wZXJ0eWNoYW5nZSBldmVudCBub3Qgb25lIG9mIHRoZSBjdXN0b20gZXZlbnQgb2JqZWN0cyAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUucHJvcGVydHlOYW1lID09IGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIG9iai5hdHRhY2hFdmVudCgnb25wcm9wZXJ0eWNoYW5nZScsIGJvdW5kQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqWydvbicgKyBldmVudF0gPSBib3VuZENhbGxiYWNrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUV2ZW50c1tldmVudF0gPyBudWxsIDogKHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XSA9IFtdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUV2ZW50c1tldmVudF0ucHVzaChbY2FsbGJhY2ssIGJvdW5kQ2FsbGJhY2tdKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEJyb3dzZXIgaW5kZXBlbmRlbnQgZXZlbnQgZGVyZWdpc3RyYXRpb25cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2FueX0gb2JqIC0gVGhlIEhUTUxFbGVtZW50IG9yIHdpbmRvdyB3aG9zZSBldmVudCBzaG91bGQgYmUgZGV0YWNoZWRcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIFRoZSBldmVudCBuYW1lIHdpdGhvdXQgdGhlIGxlYWRpbmcgXCJvblwiXG4gICAgICAgICAgICAgKiBAcGFyYW0geyhlOiBFdmVudCkgPT4gdm9pZH0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBhdHRhY2hlZFxuICAgICAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAVE9ETzogdW5yZWdpc3RlcmluZyBvZiBtYXBFdmVudHNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAob2JqLCBldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQgaW4gdGhpcy5jdXN0b21FdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLmN1c3RvbUV2ZW50c1tldmVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlmIHRoZSBldmVudCB3YXMgZm91bmQgaW4gdGhlIGFycmF5IGJ5IGl0cyBjYWxsYmFjayByZWZlcmVuY2UgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1c3RvbUV2ZW50c1tldmVudF1baV1bMF0gPT0gY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gdGhlIGFycmF5IGJ5IGl0cyBib3VuZCBjYWxsYmFjayByZWZlcmVuY2UgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XVtpXVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUV2ZW50c1tldmVudF0uc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2JqLmRldGFjaEV2ZW50ID09ICdvYmplY3QnICYmIGh0bWxFdmVudHNbJ29uJyArIGV2ZW50XSkge1xuICAgICAgICAgICAgICAgICAgICBvYmouZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmouZGV0YWNoRXZlbnQgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmRldGFjaEV2ZW50KCdvbnByb3BlcnR5Y2hhbmdlJywgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqWydvbicgKyBldmVudF0gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEJyb3dzZXIgaW5kZXBlbmRlbnQgZXZlbnQgdHJpZ2dlciBmdW5jdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG9iaiAtIFRoZSBIVE1MRWxlbWVudCB3aGljaCB0cmlnZ2VycyB0aGUgZXZlbnRcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgZXZlbnQgbmFtZSB3aXRob3V0IHRoZSBsZWFkaW5nIFwib25cIlxuICAgICAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uIChvYmosIGV2ZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudDtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5DdXN0b21FdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRXZlbnQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRUeXBlID0gZXZlbnROYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudC5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5kaXNwYXRjaEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob2JqW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2V2ZW50TmFtZV0rKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob2JqLmZpcmVFdmVudCAmJiBodG1sRXZlbnRzWydvbicgKyBldmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5maXJlRXZlbnQoJ29uJyArIGV2ZW50LmV2ZW50VHlwZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYmpbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBvYmpbZXZlbnROYW1lXSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYmpbJ29uJyArIGV2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqWydvbicgKyBldmVudE5hbWVdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR2V0IGEgY3NzIHN0eWxlIHByb3BlcnR5IHZhbHVlIGJyb3dzZXIgaW5kZXBlbmRlbnRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCAtIFRoZSBIVE1MRWxlbWVudCB0byBsb29rdXBcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBqc1Byb3BlcnR5IC0gVGhlIGNzcyBwcm9wZXJ0eSBuYW1lIGluIGphdmFzY3JpcHQgaW4gY2FtZWxDYXNlIChlLmcuIFwibWFyZ2luTGVmdFwiLCBub3QgXCJtYXJnaW4tbGVmdFwiKVxuICAgICAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSAtIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuZ2V0U3R5bGUgPSBmdW5jdGlvbiAoZWwsIGpzUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzUHJvcGVydHkgPSBqc1Byb3BlcnR5LnJlcGxhY2UoLyhbQS1aXSkvZywgXCItJDFcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKGNzc1Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5jdXJyZW50U3R5bGVbanNQcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmVnaXN0ZXIgY3VzdG9tIGV2ZW50IGNhbGxiYWNrc1xuICAgICAgICAgICAgICogQFRPRE9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IGFueX0gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgcmFpc2VzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtHcm9wZX0gLSBUaGUgR3JvcGUgb2JqZWN0IGluc3RhbmNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERlcmVnaXN0ZXIgY3VzdG9tIGV2ZW50IGNhbGxiYWNrc1xuICAgICAgICAgICAgICogQFRPRE9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IGFueX0gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgcmFpc2VzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtHcm9wZX0gLSBUaGUgR3JvcGUgb2JqZWN0IGluc3RhbmNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXZlcnQgYWxsIERPTSBtYW5pcHVsYXRpb25zIGFuZCBkZXJlZ2lzdGVyIGFsbCBldmVudCBoYW5kbGVyc1xuICAgICAgICAgICAgICogQFRPRE9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIEdyb3BlO1xuICAgICAgICB9KCkpO1xuICAgICAgICAvKiByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgdGhlIGNsYXNzICovXG4gICAgICAgIHJldHVybiBuZXcgR3JvcGUoYywgb3B0aW9ucyk7XG4gICAgfVxuICAgIHJldHVybiBncm9wZTtcbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z3JvcGUuanMubWFwIl19
