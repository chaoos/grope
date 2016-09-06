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
                this.gropableElements = [];
                this.gropeElement = null;
                this.gropeClone = null;
                this.gropeContainer = null;
                this.activeGropeContainer = null;
                this.activeGropeElement = null;
                this.mapping = []; //TODO: not any
                this.rectCache = []; //TODO: not any
                this.live = true;
                /* CSS style classes */
                this.classGropable = 'gr-gropable';
                this.classTossZone = 'gr-tosszone';
                this.classGroping = 'gr-groping';
                this.classModeGroping = 'gr-mode-groping';
                this.classDisappear = 'gr-disappear';
                this.classAppear = 'gr-appear';
                this.classReappear = 'gr-reappear';
                this.mouseDownHandlers = [];
                /* array holding the custom events mapping callbacks to bound callbacks */
                this.customEvents = [];
                this.containers = containers;
                /* set default options */
                this.options = {
                    elements: ['div']
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
                        this.gropableElements.push(el);
                        this.addClass(el, this.classGropable);
                        this.mapping[i][a] = el;
                        /* mousedown handler */
                        var callback = function (e) { return _this.mouseDown(e); };
                        var c = this.mouseDownHandlers.push(callback);
                        this.addEventListener(el, 'mousedown', callback);
                        a++;
                    }
                }
                console.log(this.mapping);
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
                for (var i in this.containers) {
                    this.mapping[i] = [];
                    var a = 0;
                    for (var _i = 0, _a = this.containers[i].querySelectorAll(this.options.elements.join(', ')); _i < _a.length; _i++) {
                        var el = _a[_i];
                        this.mapping[i][a] = el;
                        a++;
                    }
                }
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
                this.gropeElement = this.getElementBehindCursor(e.clientX, e.clientY);
                this.gropeClone = this.gropeElement.cloneNode(true);
                this.copyComputedStyle(this.gropeElement, this.gropeClone);
                this.gropeClone.style.width = this.gropeElement.offsetWidth + 'px';
                this.gropeClone.style.height = this.gropeElement.offsetHeight + 'px';
                this.addClass(this.gropeClone, this.classGroping);
                this.addClass(this.gropeElement, this.classDisappear);
                this.addClass(document.body, this.classModeGroping);
                this.live = true;
                this.rectCache = [];
                var rect = this.getRect(this.gropeElement, this.live);
                this.deltaX = e.clientX - rect.left;
                this.deltaY = e.clientY - rect.top;
                this.gropeContainer = this.getContainerByGropeElement(this.gropeElement);
                this.mouseMove(e);
                this.gropeContainer.appendChild(this.gropeClone);
                /* mousemove handler */
                this.mouseMoveHandler = function (e) { return _this.mouseMove(e); };
                this.addEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler);
                /* mousemove handler */
                this.mouseUpHandler = function (e) { return _this.mouseUp(e); };
                this.addEventListener(document.documentElement, 'mouseup', this.mouseUpHandler);
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
                this.removeClass(this.gropeElement, this.classAppear);
                this.removeClass(this.gropeElement, this.classReappear);
                this.removeClass(document.body, this.classModeGroping);
                //this.gropeContainer.removeChild(this.gropeClone);
                this.gropeClone.parentNode.removeChild(this.gropeClone);
                for (var _i = 0, _a = this.containers; _i < _a.length; _i++) {
                    var container = _a[_i];
                    this.removeClass(container, 'active');
                }
                for (var _b = 0, _c = this.gropableElements; _b < _c.length; _b++) {
                    var gropeElement = _c[_b];
                    this.removeClass(gropeElement, 'active');
                }
                //document.body.removeChild(this.gropeClone);
                this.gropeElement = null;
                this.gropeClone = null;
                this.gropeContainer = null;
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
                var x = e.clientX;
                var y = e.clientY;
                this.gropeClone.style.left = (x - this.deltaX) + 'px';
                this.gropeClone.style.top = (y - this.deltaY) + 'px';
                var found = false;
                for (var _i = 0, _a = this.gropableElements; _i < _a.length; _i++) {
                    var gropeElement = _a[_i];
                    var coords = this.getRect(gropeElement, this.live);
                    if (found === false
                        && x >= coords.left
                        && x <= (gropeElement.offsetWidth * (1 / 2) + coords.left)
                        && y >= coords.top
                        && y <= (gropeElement.offsetHeight + coords.top)) {
                        this.addClass(gropeElement, 'active');
                        this.activeGropeElement = gropeElement;
                        this.activeGropeContainer = this.getContainerByGropeElement(this.activeGropeElement);
                        this.addClass(this.activeGropeContainer, 'active');
                        this.activeGropeContainer.insertBefore(this.gropeElement, this.activeGropeElement);
                        this.remap();
                        //TODO: always on mousemove -> performance?
                        found = true;
                    }
                    else if (found === false
                        && x >= coords.left + (gropeElement.offsetWidth * (1 / 2))
                        && x <= (gropeElement.offsetWidth + coords.left)
                        && y >= coords.top
                        && y <= (gropeElement.offsetHeight + coords.top)) {
                        this.addClass(gropeElement, 'active');
                        this.activeGropeElement = gropeElement;
                        this.activeGropeContainer = this.getContainerByGropeElement(this.activeGropeElement);
                        this.addClass(this.activeGropeContainer, 'active');
                        this.activeGropeContainer.insertBefore(this.gropeElement, this.activeGropeElement.nextSibling);
                        this.remap();
                        found = true;
                    }
                    else {
                        this.removeClass(gropeElement, 'active');
                    }
                }
                if (found === false) {
                    for (var _b = 0, _c = this.containers; _b < _c.length; _b++) {
                        var container = _c[_b];
                        var coords = this.getRect(container, this.live);
                        if (found === false
                            && x >= coords.left
                            && x <= (container.offsetWidth + coords.left)
                            && y >= coords.top
                            && y <= (container.offsetHeight + coords.top)) {
                            this.addClass(container, 'active');
                            this.activeGropeContainer = container;
                            this.activeGropeContainer.appendChild(this.gropeElement);
                            this.activeGropeContainer.appendChild(this.gropeClone);
                            this.remap();
                            found = true;
                        }
                        else {
                            this.removeClass(container, 'active');
                        }
                    }
                }
                this.live = false;
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
                var re = new RegExp(" " + cssClass + " ");
                if (!el.className.match(re)) {
                    el.className += " " + cssClass + " ";
                }
            };
            Grope.prototype.removeClass = function (el, cssClass) {
                var re = new RegExp(" " + cssClass + " ", 'g');
                el.className = el.className.replace(re, '');
            };
            Grope.prototype.getOffsetCoordsByElement = function (el) {
                var left = 0;
                var top = 0;
                while (el) {
                    if (window.getComputedStyle(el, null).getPropertyValue('position') != "relative") {
                        left += el.offsetLeft;
                        top += el.offsetTop;
                    }
                    el = el.parentElement;
                }
                return [left, top];
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
                return false;
            };
            Grope.prototype.getElementBehindCursor = function (x, y) {
                var elementBehindCursor = document.elementFromPoint(x, y);
                /* find the next parent which is an gropable element */
                var innerRe = new RegExp(" " + this.classGropable + " ");
                while (elementBehindCursor && !elementBehindCursor.className.match(innerRe)) {
                    elementBehindCursor = elementBehindCursor.parentElement;
                }
                return elementBehindCursor;
            };
            Grope.prototype.getDropzoneBehindCursor = function (x, y) {
                //console.log((<HTMLElement>this.gropeElement).elementFromPoint(x, y));
                return;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJncm9wZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7IGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAvKipcbiAgICAgKiBFeHBvcnQgZnVuY3Rpb24gb2YgdGhlIG1vZHVsZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIC0gVGhlIEhUTUxFbGVtZW50IHRvIGdyb3BlIDstKVxuICAgICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9ucyAtIHRoZSBvcHRpb25zIG9iamVjdCB0byBjb25maWd1cmUgR3JvcGVcbiAgICAgKiBAcmV0dXJuIHtHcm9wZX0gLSBHcm9wZSBvYmplY3QgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBncm9wZShjb250YWluZXJzLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgICAgIHZhciBjID0gY29udGFpbmVycyBpbnN0YW5jZW9mIEFycmF5ID8gY29udGFpbmVycyA6IG5ldyBBcnJheShjb250YWluZXJzKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBvbHlmaWxsIGJpbmQgZnVuY3Rpb24gZm9yIG9sZGVyIGJyb3dzZXJzXG4gICAgICAgICAqIFRoZSBiaW5kIGZ1bmN0aW9uIGlzIGFuIGFkZGl0aW9uIHRvIEVDTUEtMjYyLCA1dGggZWRpdGlvblxuICAgICAgICAgKiBAc2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9iaW5kXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gICAgICAgICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgICAgICAgICAgICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmVG9CaW5kID0gdGhpcywgZk5PUCA9IGZ1bmN0aW9uICgpIHsgfSwgZkJvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG9UaGlzLCBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uLnByb3RvdHlwZSBkb2Vzbid0IGhhdmUgYSBwcm90b3R5cGUgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZCb3VuZDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgLyogbGlzdCBvZiByZWFsIGV2ZW50cyAqL1xuICAgICAgICB2YXIgaHRtbEV2ZW50cyA9IHtcbiAgICAgICAgICAgIC8qIDxib2R5PiBhbmQgPGZyYW1lc2V0PiBFdmVudHMgKi9cbiAgICAgICAgICAgIG9ubG9hZDogMSxcbiAgICAgICAgICAgIG9udW5sb2FkOiAxLFxuICAgICAgICAgICAgLyogRm9ybSBFdmVudHMgKi9cbiAgICAgICAgICAgIG9uYmx1cjogMSxcbiAgICAgICAgICAgIG9uY2hhbmdlOiAxLFxuICAgICAgICAgICAgb25mb2N1czogMSxcbiAgICAgICAgICAgIG9ucmVzZXQ6IDEsXG4gICAgICAgICAgICBvbnNlbGVjdDogMSxcbiAgICAgICAgICAgIG9uc3VibWl0OiAxLFxuICAgICAgICAgICAgLyogSW1hZ2UgRXZlbnRzICovXG4gICAgICAgICAgICBvbmFib3J0OiAxLFxuICAgICAgICAgICAgLyogS2V5Ym9hcmQgRXZlbnRzICovXG4gICAgICAgICAgICBvbmtleWRvd246IDEsXG4gICAgICAgICAgICBvbmtleXByZXNzOiAxLFxuICAgICAgICAgICAgb25rZXl1cDogMSxcbiAgICAgICAgICAgIC8qIE1vdXNlIEV2ZW50cyAqL1xuICAgICAgICAgICAgb25jbGljazogMSxcbiAgICAgICAgICAgIG9uZGJsY2xpY2s6IDEsXG4gICAgICAgICAgICBvbm1vdXNlZG93bjogMSxcbiAgICAgICAgICAgIG9ubW91c2Vtb3ZlOiAxLFxuICAgICAgICAgICAgb25tb3VzZW91dDogMSxcbiAgICAgICAgICAgIG9ubW91c2VvdmVyOiAxLFxuICAgICAgICAgICAgb25tb3VzZXVwOiAxXG4gICAgICAgIH07XG4gICAgICAgIHZhciBtYXBFdmVudHMgPSB7XG4gICAgICAgICAgICBvbnNjcm9sbDogd2luZG93XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHcm9wZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXV0aG9yIFJvbWFuIEdydWJlciA8cDEwMjAzODlAeWFob28uY29tPlxuICAgICAgICAgKiBAdmVyc2lvbiAxLjBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBHcm9wZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBHcm9wZShjb250YWluZXJzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJzID0gY29udGFpbmVycztcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGFibGVFbGVtZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVDb250YWluZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlR3JvcGVDb250YWluZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlR3JvcGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcHBpbmcgPSBbXTsgLy9UT0RPOiBub3QgYW55XG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0Q2FjaGUgPSBbXTsgLy9UT0RPOiBub3QgYW55XG4gICAgICAgICAgICAgICAgdGhpcy5saXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAvKiBDU1Mgc3R5bGUgY2xhc3NlcyAqL1xuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NHcm9wYWJsZSA9ICdnci1ncm9wYWJsZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc1Rvc3Nab25lID0gJ2dyLXRvc3N6b25lJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzR3JvcGluZyA9ICdnci1ncm9waW5nJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTW9kZUdyb3BpbmcgPSAnZ3ItbW9kZS1ncm9waW5nJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzRGlzYXBwZWFyID0gJ2dyLWRpc2FwcGVhcic7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc0FwcGVhciA9ICdnci1hcHBlYXInO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NSZWFwcGVhciA9ICdnci1yZWFwcGVhcic7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZURvd25IYW5kbGVycyA9IFtdO1xuICAgICAgICAgICAgICAgIC8qIGFycmF5IGhvbGRpbmcgdGhlIGN1c3RvbSBldmVudHMgbWFwcGluZyBjYWxsYmFja3MgdG8gYm91bmQgY2FsbGJhY2tzICovXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21FdmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgICAgICAgICAgICAgIC8qIHNldCBkZWZhdWx0IG9wdGlvbnMgKi9cbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzOiBbJ2RpdiddXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvKiBtZXJnZSB0aGUgZGVmYXVsdCBvcHRpb24gb2JqZWN0cyB3aXRoIHRoZSBwcm92aWRlZCBvbmUgKi9cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnNba2V5XSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG9rZXkgaW4gb3B0aW9uc1trZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zW2tleV0uaGFzT3duUHJvcGVydHkob2tleSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XVtva2V5XSA9IG9wdGlvbnNba2V5XVtva2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5pdGlhbGl6ZSBET00gbWFuaXB1bGF0aW9ucyBhbmQgZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIC8vZm9yICh2YXIgY29udGFpbmVyIG9mIHRoaXMuY29udGFpbmVycykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5jb250YWluZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoY29udGFpbmVyLCB0aGlzLmNsYXNzVG9zc1pvbmUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwcGluZ1tpXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5vcHRpb25zLmVsZW1lbnRzLmpvaW4oJywgJykpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm9wYWJsZUVsZW1lbnRzLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhlbCwgdGhpcy5jbGFzc0dyb3BhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwcGluZ1tpXVthXSA9IGVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogbW91c2Vkb3duIGhhbmRsZXIgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5tb3VzZURvd24oZSk7IH07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IHRoaXMubW91c2VEb3duSGFuZGxlcnMucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoZWwsICdtb3VzZWRvd24nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5tYXBwaW5nKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJlaW5pdGlhbGl6ZSB0aGUgZ3JvcGUgZWxlbWVudFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0dyb3BlfSAtIFRoZSBHcm9wZSBvYmplY3QgaW5zdGFuY2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLnJlaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUucmVtYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXBwaW5nID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLmNvbnRhaW5lcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXBwaW5nW2ldID0gW107XG4gICAgICAgICAgICAgICAgICAgIHZhciBhID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuY29udGFpbmVyc1tpXS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0aW9ucy5lbGVtZW50cy5qb2luKCcsICcpKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwcGluZ1tpXVthXSA9IGVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYSsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTW91c2UgZG93biBoYW5kbGVyXG4gICAgICAgICAgICAgKiBUT0RPXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIC0gVGhlIG1vdXNlIGRvd24gZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVFbGVtZW50ID0gdGhpcy5nZXRFbGVtZW50QmVoaW5kQ3Vyc29yKGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUgPSB0aGlzLmdyb3BlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb3B5Q29tcHV0ZWRTdHlsZSh0aGlzLmdyb3BlRWxlbWVudCwgdGhpcy5ncm9wZUNsb25lKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUud2lkdGggPSB0aGlzLmdyb3BlRWxlbWVudC5vZmZzZXRXaWR0aCArICdweCc7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNsb25lLnN0eWxlLmhlaWdodCA9IHRoaXMuZ3JvcGVFbGVtZW50Lm9mZnNldEhlaWdodCArICdweCc7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyh0aGlzLmdyb3BlQ2xvbmUsIHRoaXMuY2xhc3NHcm9waW5nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENsYXNzKHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmNsYXNzRGlzYXBwZWFyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZENsYXNzKGRvY3VtZW50LmJvZHksIHRoaXMuY2xhc3NNb2RlR3JvcGluZyk7XG4gICAgICAgICAgICAgICAgdGhpcy5saXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3RDYWNoZSA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciByZWN0ID0gdGhpcy5nZXRSZWN0KHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmxpdmUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsdGFYID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsdGFZID0gZS5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNvbnRhaW5lciA9IHRoaXMuZ2V0Q29udGFpbmVyQnlHcm9wZUVsZW1lbnQodGhpcy5ncm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5ncm9wZUNsb25lKTtcbiAgICAgICAgICAgICAgICAvKiBtb3VzZW1vdmUgaGFuZGxlciAqL1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5tb3VzZU1vdmUoZSk7IH07XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgLyogbW91c2Vtb3ZlIGhhbmRsZXIgKi9cbiAgICAgICAgICAgICAgICB0aGlzLm1vdXNlVXBIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIF90aGlzLm1vdXNlVXAoZSk7IH07XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBIYW5kbGVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1vdXNlIHVwIGhhbmRsZXJcbiAgICAgICAgICAgICAqIFRPRE9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgLSBUaGUgbW91c2UgdXAgZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUubW91c2VVcCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmNsYXNzRGlzYXBwZWFyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmNsYXNzQXBwZWFyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHRoaXMuZ3JvcGVFbGVtZW50LCB0aGlzLmNsYXNzUmVhcHBlYXIpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgdGhpcy5jbGFzc01vZGVHcm9waW5nKTtcbiAgICAgICAgICAgICAgICAvL3RoaXMuZ3JvcGVDb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5ncm9wZUNsb25lKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmdyb3BlQ2xvbmUpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmNvbnRhaW5lcnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoY29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSB0aGlzLmdyb3BhYmxlRWxlbWVudHM7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBncm9wZUVsZW1lbnQgPSBfY1tfYl07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoZ3JvcGVFbGVtZW50LCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLmdyb3BlQ2xvbmUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVDb250YWluZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTW91c2UgbW92ZSBoYW5kbGVyXG4gICAgICAgICAgICAgKiBUT0RPXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIC0gVGhlIG1vdXNlIG1vdmUgZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUubW91c2VNb3ZlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAvKiBpZiB0aGUgbW91c2UgbGVmdCB0aGUgd2luZG93IGFuZCB0aGUgYnV0dG9uIGlzIG5vdCBwcmVzc2VkIGFueW1vcmUsIGFib3J0IG1vdmluZyAqL1xuICAgICAgICAgICAgICAgIGlmICgoXCJ3aGljaFwiIGluIGUgJiYgZS53aGljaCA9PSAwKSB8fCAodHlwZW9mIGUud2hpY2ggPT0gJ3VuZGVmaW5lZCcgJiYgXCJidXR0b25cIiBpbiBlICYmIGUuYnV0dG9uID09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW91c2VVcChlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgeCA9IGUuY2xpZW50WDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IGUuY2xpZW50WTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUubGVmdCA9ICh4IC0gdGhpcy5kZWx0YVgpICsgJ3B4JztcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUudG9wID0gKHkgLSB0aGlzLmRlbHRhWSkgKyAncHgnO1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmdyb3BhYmxlRWxlbWVudHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBncm9wZUVsZW1lbnQgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb29yZHMgPSB0aGlzLmdldFJlY3QoZ3JvcGVFbGVtZW50LCB0aGlzLmxpdmUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZm91bmQgPT09IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB4ID49IGNvb3Jkcy5sZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB4IDw9IChncm9wZUVsZW1lbnQub2Zmc2V0V2lkdGggKiAoMSAvIDIpICsgY29vcmRzLmxlZnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB5ID49IGNvb3Jkcy50b3BcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHkgPD0gKGdyb3BlRWxlbWVudC5vZmZzZXRIZWlnaHQgKyBjb29yZHMudG9wKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhncm9wZUVsZW1lbnQsICdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlR3JvcGVFbGVtZW50ID0gZ3JvcGVFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVHcm9wZUNvbnRhaW5lciA9IHRoaXMuZ2V0Q29udGFpbmVyQnlHcm9wZUVsZW1lbnQodGhpcy5hY3RpdmVHcm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyh0aGlzLmFjdGl2ZUdyb3BlQ29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUdyb3BlQ29udGFpbmVyLmluc2VydEJlZm9yZSh0aGlzLmdyb3BlRWxlbWVudCwgdGhpcy5hY3RpdmVHcm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBhbHdheXMgb24gbW91c2Vtb3ZlIC0+IHBlcmZvcm1hbmNlP1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZvdW5kID09PSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgeCA+PSBjb29yZHMubGVmdCArIChncm9wZUVsZW1lbnQub2Zmc2V0V2lkdGggKiAoMSAvIDIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgeCA8PSAoZ3JvcGVFbGVtZW50Lm9mZnNldFdpZHRoICsgY29vcmRzLmxlZnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB5ID49IGNvb3Jkcy50b3BcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHkgPD0gKGdyb3BlRWxlbWVudC5vZmZzZXRIZWlnaHQgKyBjb29yZHMudG9wKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhncm9wZUVsZW1lbnQsICdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlR3JvcGVFbGVtZW50ID0gZ3JvcGVFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVHcm9wZUNvbnRhaW5lciA9IHRoaXMuZ2V0Q29udGFpbmVyQnlHcm9wZUVsZW1lbnQodGhpcy5hY3RpdmVHcm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyh0aGlzLmFjdGl2ZUdyb3BlQ29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUdyb3BlQ29udGFpbmVyLmluc2VydEJlZm9yZSh0aGlzLmdyb3BlRWxlbWVudCwgdGhpcy5hY3RpdmVHcm9wZUVsZW1lbnQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhncm9wZUVsZW1lbnQsICdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZm91bmQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSB0aGlzLmNvbnRhaW5lcnM7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyID0gX2NbX2JdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkcyA9IHRoaXMuZ2V0UmVjdChjb250YWluZXIsIHRoaXMubGl2ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZm91bmQgPT09IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgeCA+PSBjb29yZHMubGVmdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHggPD0gKGNvbnRhaW5lci5vZmZzZXRXaWR0aCArIGNvb3Jkcy5sZWZ0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHkgPj0gY29vcmRzLnRvcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHkgPD0gKGNvbnRhaW5lci5vZmZzZXRIZWlnaHQgKyBjb29yZHMudG9wKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoY29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVHcm9wZUNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUdyb3BlQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZ3JvcGVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUdyb3BlQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZ3JvcGVDbG9uZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoY29udGFpbmVyLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5saXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmdldFJlY3QgPSBmdW5jdGlvbiAoZWwsIGxpdmUpIHtcbiAgICAgICAgICAgICAgICBpZiAobGl2ZSA9PT0gdm9pZCAwKSB7IGxpdmUgPSBmYWxzZTsgfVxuICAgICAgICAgICAgICAgIGlmIChsaXZlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5yZWN0Q2FjaGU7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLm9iamVjdCA9PSBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLnJlY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3RDYWNoZS5wdXNoKHsgb2JqZWN0OiBlbCwgcmVjdDogcmVjdCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuY29weUNvbXB1dGVkU3R5bGUgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcHV0ZWRTdHlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbXB1dGVkU3R5bGUgPSBmcm9tLmN1cnJlbnRTdHlsZSB8fCBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGZyb20sIG51bGwpO1xuICAgICAgICAgICAgICAgIGlmICghY29tcHV0ZWRTdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBjb21wdXRlZFN0eWxlOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbXB1dGVkU3R5bGVbcHJvcGVydHldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB2YWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB2YWx1ZSAhPSBwYXJzZUludCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvLnN0eWxlW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5hZGRDbGFzcyA9IGZ1bmN0aW9uIChlbCwgY3NzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKFwiIFwiICsgY3NzQ2xhc3MgKyBcIiBcIik7XG4gICAgICAgICAgICAgICAgaWYgKCFlbC5jbGFzc05hbWUubWF0Y2gocmUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTmFtZSArPSBcIiBcIiArIGNzc0NsYXNzICsgXCIgXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChlbCwgY3NzQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKFwiIFwiICsgY3NzQ2xhc3MgKyBcIiBcIiwgJ2cnKTtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShyZSwgJycpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5nZXRPZmZzZXRDb29yZHNCeUVsZW1lbnQgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGVmdCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHRvcCA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgncG9zaXRpb24nKSAhPSBcInJlbGF0aXZlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgKz0gZWwub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcCArPSBlbC5vZmZzZXRUb3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gW2xlZnQsIHRvcF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmdldENvbnRhaW5lckJ5R3JvcGVFbGVtZW50ID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLm1hcHBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMubWFwcGluZ1tpXTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBncm9wZUVsZW1lbnQgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvcGVFbGVtZW50ID09IGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmdldEVsZW1lbnRCZWhpbmRDdXJzb3IgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgICAgICAgICAvKiBmaW5kIHRoZSBuZXh0IHBhcmVudCB3aGljaCBpcyBhbiBncm9wYWJsZSBlbGVtZW50ICovXG4gICAgICAgICAgICAgICAgdmFyIGlubmVyUmUgPSBuZXcgUmVnRXhwKFwiIFwiICsgdGhpcy5jbGFzc0dyb3BhYmxlICsgXCIgXCIpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChlbGVtZW50QmVoaW5kQ3Vyc29yICYmICFlbGVtZW50QmVoaW5kQ3Vyc29yLmNsYXNzTmFtZS5tYXRjaChpbm5lclJlKSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZWxlbWVudEJlaGluZEN1cnNvci5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudEJlaGluZEN1cnNvcjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuZ2V0RHJvcHpvbmVCZWhpbmRDdXJzb3IgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coKDxIVE1MRWxlbWVudD50aGlzLmdyb3BlRWxlbWVudCkuZWxlbWVudEZyb21Qb2ludCh4LCB5KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQnJvd3NlciBpbmRlcGVuZGVudCBldmVudCByZWdpc3RyYXRpb25cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2FueX0gb2JqIC0gVGhlIEhUTUxFbGVtZW50IHRvIGF0dGFjaCB0aGUgZXZlbnQgdG9cbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIFRoZSBldmVudCBuYW1lIHdpdGhvdXQgdGhlIGxlYWRpbmcgXCJvblwiXG4gICAgICAgICAgICAgKiBAcGFyYW0geyhlOiBFdmVudCkgPT4gdm9pZH0gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGF0dGFjaCB0byB0aGUgZXZlbnRcbiAgICAgICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYm91bmQgLSB3aGV0aGVyIHRvIGJpbmQgdGhlIGNhbGxiYWNrIHRvIHRoZSBvYmplY3QgaW5zdGFuY2Ugb3Igbm90XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChvYmosIGV2ZW50LCBjYWxsYmFjaywgYm91bmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYm91bmQgPT09IHZvaWQgMCkgeyBib3VuZCA9IHRydWU7IH1cbiAgICAgICAgICAgICAgICB2YXIgYm91bmRDYWxsYmFjayA9IGJvdW5kID8gY2FsbGJhY2suYmluZCh0aGlzKSA6IGNhbGxiYWNrO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqLmFkZEV2ZW50TGlzdGVuZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWFwRXZlbnRzWydvbicgKyBldmVudF0gJiYgb2JqLnRhZ05hbWUgPT0gXCJCT0RZXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IG1hcEV2ZW50c1snb24nICsgZXZlbnRdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBib3VuZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9iai5hdHRhY2hFdmVudCA9PSAnb2JqZWN0JyAmJiBodG1sRXZlbnRzWydvbicgKyBldmVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudCwgYm91bmRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmouYXR0YWNoRXZlbnQgPT0gJ29iamVjdCcgJiYgbWFwRXZlbnRzWydvbicgKyBldmVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai50YWdOYW1lID09IFwiQk9EWVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcCA9ICdvbicgKyBldmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGV4YW1wbGU6IHdpbmRvdy5vbnNjcm9sbCA9IGJvdW5kQ2FsbGJhY2sgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcEV2ZW50c1twXVtwXSA9IGJvdW5kQ2FsbGJhY2s7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBUT0RPOiBvYmoub25zY3JvbGwgPz8gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIG9iai5vbnNjcm9sbCA9IGJvdW5kQ2FsbGJhY2s7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9iai5hdHRhY2hFdmVudCA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBvYmpbZXZlbnRdID0gMTtcbiAgICAgICAgICAgICAgICAgICAgYm91bmRDYWxsYmFjayA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBUT0RPOiBlIGlzIHRoZSBvbnByb3BlcnR5Y2hhbmdlIGV2ZW50IG5vdCBvbmUgb2YgdGhlIGN1c3RvbSBldmVudCBvYmplY3RzICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5wcm9wZXJ0eU5hbWUgPT0gZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmF0dGFjaEV2ZW50KCdvbnByb3BlcnR5Y2hhbmdlJywgYm91bmRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYmpbJ29uJyArIGV2ZW50XSA9IGJvdW5kQ2FsbGJhY2s7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XSA/IG51bGwgOiAodGhpcy5jdXN0b21FdmVudHNbZXZlbnRdID0gW10pO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XS5wdXNoKFtjYWxsYmFjaywgYm91bmRDYWxsYmFja10pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQnJvd3NlciBpbmRlcGVuZGVudCBldmVudCBkZXJlZ2lzdHJhdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7YW55fSBvYmogLSBUaGUgSFRNTEVsZW1lbnQgb3Igd2luZG93IHdob3NlIGV2ZW50IHNob3VsZCBiZSBkZXRhY2hlZFxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gVGhlIGV2ZW50IG5hbWUgd2l0aG91dCB0aGUgbGVhZGluZyBcIm9uXCJcbiAgICAgICAgICAgICAqIEBwYXJhbSB7KGU6IEV2ZW50KSA9PiB2b2lkfSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGF0dGFjaGVkXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBUT0RPOiB1bnJlZ2lzdGVyaW5nIG9mIG1hcEV2ZW50c1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChvYmosIGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChldmVudCBpbiB0aGlzLmN1c3RvbUV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaWYgdGhlIGV2ZW50IHdhcyBmb3VuZCBpbiB0aGUgYXJyYXkgYnkgaXRzIGNhbGxiYWNrIHJlZmVyZW5jZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XVtpXVswXSA9PSBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIHJlbW92ZSB0aGUgbGlzdGVuZXIgZnJvbSB0aGUgYXJyYXkgYnkgaXRzIGJvdW5kIGNhbGxiYWNrIHJlZmVyZW5jZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gdGhpcy5jdXN0b21FdmVudHNbZXZlbnRdW2ldWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmouZGV0YWNoRXZlbnQgPT0gJ29iamVjdCcgJiYgaHRtbEV2ZW50c1snb24nICsgZXZlbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kZXRhY2hFdmVudCgnb24nICsgZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9iai5kZXRhY2hFdmVudCA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBvYmouZGV0YWNoRXZlbnQoJ29ucHJvcGVydHljaGFuZ2UnLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYmpbJ29uJyArIGV2ZW50XSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQnJvd3NlciBpbmRlcGVuZGVudCBldmVudCB0cmlnZ2VyIGZ1bmN0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gb2JqIC0gVGhlIEhUTUxFbGVtZW50IHdoaWNoIHRyaWdnZXJzIHRoZSBldmVudFxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBldmVudCBuYW1lIHdpdGhvdXQgdGhlIGxlYWRpbmcgXCJvblwiXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUudHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24gKG9iaiwgZXZlbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFdmVudCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJIVE1MRXZlbnRzXCIpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5ldmVudFR5cGUgPSBldmVudE5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV2ZW50LmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmRpc3BhdGNoRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYmpbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBvYmpbZXZlbnROYW1lXSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYmouZmlyZUV2ZW50ICYmIGh0bWxFdmVudHNbJ29uJyArIGV2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmZpcmVFdmVudCgnb24nICsgZXZlbnQuZXZlbnRUeXBlLCBldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9ialtldmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialtldmVudE5hbWVdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9ialsnb24nICsgZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBvYmpbJ29uJyArIGV2ZW50TmFtZV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHZXQgYSBjc3Mgc3R5bGUgcHJvcGVydHkgdmFsdWUgYnJvd3NlciBpbmRlcGVuZGVudFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsIC0gVGhlIEhUTUxFbGVtZW50IHRvIGxvb2t1cFxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGpzUHJvcGVydHkgLSBUaGUgY3NzIHByb3BlcnR5IG5hbWUgaW4gamF2YXNjcmlwdCBpbiBjYW1lbENhc2UgKGUuZy4gXCJtYXJnaW5MZWZ0XCIsIG5vdCBcIm1hcmdpbi1sZWZ0XCIpXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIHByb3BlcnR5IHZhbHVlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5nZXRTdHlsZSA9IGZ1bmN0aW9uIChlbCwganNQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHZhciBjc3NQcm9wZXJ0eSA9IGpzUHJvcGVydHkucmVwbGFjZSgvKFtBLVpdKS9nLCBcIi0kMVwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93LmdldENvbXB1dGVkU3R5bGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUoY3NzUHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsLmN1cnJlbnRTdHlsZVtqc1Byb3BlcnR5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZWdpc3RlciBjdXN0b20gZXZlbnQgY2FsbGJhY2tzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSB7KGU6IEV2ZW50KSA9PiBhbnl9IGNhbGxiYWNrIC0gQSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IHJhaXNlc1xuICAgICAgICAgICAgICogQHJldHVybiB7R3JvcGV9IC0gVGhlIEdyb3BlIG9iamVjdCBpbnN0YW5jZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEZXJlZ2lzdGVyIGN1c3RvbSBldmVudCBjYWxsYmFja3NcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IGFueX0gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgcmFpc2VzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtHcm9wZX0gLSBUaGUgR3JvcGUgb2JqZWN0IGluc3RhbmNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXZlcnQgYWxsIERPTSBtYW5pcHVsYXRpb25zIGFuZCBkZXJlZ2lzdGVyIGFsbCBldmVudCBoYW5kbGVyc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gR3JvcGU7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIC8qIHJldHVybiBhbiBpbnN0YW5jZSBvZiB0aGUgY2xhc3MgKi9cbiAgICAgICAgcmV0dXJuIG5ldyBHcm9wZShjLCBvcHRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGdyb3BlO1xufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ncm9wZS5qcy5tYXAiXX0=
