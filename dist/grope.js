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
                /* CSS style classes */
                this.classGropable = 'gr-gropable';
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
                for (var _i = 0, _a = this.containers; _i < _a.length; _i++) {
                    var container = _a[_i];
                    for (var _b = 0, _c = container.querySelectorAll(this.options.elements.join(', ')); _b < _c.length; _b++) {
                        var el = _c[_b];
                        this.gropableElements.push(el);
                        el.className += " " + this.classGropable + " ";
                        /* mousedown handler */
                        var callback = function (e) { return _this.mouseDown(e); };
                        var c = this.mouseDownHandlers.push(callback);
                        this.addEventListener(el, 'mousedown', callback);
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
                console.log(typeof this.gropeElement);
                console.log(this.gropeElement instanceof HTMLElement);
                console.log(this.gropeElement);
                this.gropeClone = this.gropeElement.cloneNode(true);
                this.copyComputedStyle(this.gropeElement, this.gropeClone);
                this.gropeClone.style.width = this.gropeElement.offsetWidth + 'px';
                this.gropeClone.style.height = this.gropeElement.offsetHeight + 'px';
                this.gropeClone.className += " " + this.classGroping + " ";
                this.gropeElement.className += " " + this.classDisappear + " ";
                document.body.className += " " + this.classModeGroping + " ";
                var rect = this.gropeElement.getBoundingClientRect();
                this.deltaX = e.clientX - rect.left;
                this.deltaY = e.clientY - rect.top;
                this.mouseMove(e);
                document.body.appendChild(this.gropeClone);
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
                var re = new RegExp(" " + this.classDisappear + " ");
                this.gropeElement.className = this.gropeElement.className.replace(re, '');
                var re = new RegExp(" " + this.classModeGroping + " ");
                document.body.className = document.body.className.replace(re, '');
                document.body.removeChild(this.gropeClone);
                this.gropeElement = null;
                this.gropeClone = null;
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
                //console.log(x, y, this.gropeClone.style.left, this.gropeClone.style.top, this.gropeElement);
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
            Grope.prototype.getElementBehindCursor = function (x, y) {
                var elementBehindCursor = document.elementFromPoint(x, y);
                /* find the next parent which is an inner element */
                var innerRe = new RegExp(" " + this.classGropable + " ");
                while (elementBehindCursor && !elementBehindCursor.className.match(innerRe)) {
                    elementBehindCursor = elementBehindCursor.parentElement;
                }
                return elementBehindCursor;
            };
            Grope.prototype.getDropzoneBehindCursor = function (x, y) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJncm9wZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YXIgdiA9IGZhY3RvcnkocmVxdWlyZSwgZXhwb3J0cyk7IGlmICh2ICE9PSB1bmRlZmluZWQpIG1vZHVsZS5leHBvcnRzID0gdjtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCJyZXF1aXJlXCIsIFwiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gICAgfVxufSkoZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAvKipcbiAgICAgKiBFeHBvcnQgZnVuY3Rpb24gb2YgdGhlIG1vZHVsZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIC0gVGhlIEhUTUxFbGVtZW50IHRvIGdyb3BlIDstKVxuICAgICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9ucyAtIHRoZSBvcHRpb25zIG9iamVjdCB0byBjb25maWd1cmUgR3JvcGVcbiAgICAgKiBAcmV0dXJuIHtHcm9wZX0gLSBHcm9wZSBvYmplY3QgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBncm9wZShjb250YWluZXJzLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgICAgIHZhciBjID0gY29udGFpbmVycyBpbnN0YW5jZW9mIEFycmF5ID8gY29udGFpbmVycyA6IG5ldyBBcnJheShjb250YWluZXJzKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBvbHlmaWxsIGJpbmQgZnVuY3Rpb24gZm9yIG9sZGVyIGJyb3dzZXJzXG4gICAgICAgICAqIFRoZSBiaW5kIGZ1bmN0aW9uIGlzIGFuIGFkZGl0aW9uIHRvIEVDTUEtMjYyLCA1dGggZWRpdGlvblxuICAgICAgICAgKiBAc2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9iaW5kXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gICAgICAgICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgICAgICAgICAgICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmVG9CaW5kID0gdGhpcywgZk5PUCA9IGZ1bmN0aW9uICgpIHsgfSwgZkJvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG9UaGlzLCBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uLnByb3RvdHlwZSBkb2Vzbid0IGhhdmUgYSBwcm90b3R5cGUgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZCb3VuZDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgLyogbGlzdCBvZiByZWFsIGV2ZW50cyAqL1xuICAgICAgICB2YXIgaHRtbEV2ZW50cyA9IHtcbiAgICAgICAgICAgIC8qIDxib2R5PiBhbmQgPGZyYW1lc2V0PiBFdmVudHMgKi9cbiAgICAgICAgICAgIG9ubG9hZDogMSxcbiAgICAgICAgICAgIG9udW5sb2FkOiAxLFxuICAgICAgICAgICAgLyogRm9ybSBFdmVudHMgKi9cbiAgICAgICAgICAgIG9uYmx1cjogMSxcbiAgICAgICAgICAgIG9uY2hhbmdlOiAxLFxuICAgICAgICAgICAgb25mb2N1czogMSxcbiAgICAgICAgICAgIG9ucmVzZXQ6IDEsXG4gICAgICAgICAgICBvbnNlbGVjdDogMSxcbiAgICAgICAgICAgIG9uc3VibWl0OiAxLFxuICAgICAgICAgICAgLyogSW1hZ2UgRXZlbnRzICovXG4gICAgICAgICAgICBvbmFib3J0OiAxLFxuICAgICAgICAgICAgLyogS2V5Ym9hcmQgRXZlbnRzICovXG4gICAgICAgICAgICBvbmtleWRvd246IDEsXG4gICAgICAgICAgICBvbmtleXByZXNzOiAxLFxuICAgICAgICAgICAgb25rZXl1cDogMSxcbiAgICAgICAgICAgIC8qIE1vdXNlIEV2ZW50cyAqL1xuICAgICAgICAgICAgb25jbGljazogMSxcbiAgICAgICAgICAgIG9uZGJsY2xpY2s6IDEsXG4gICAgICAgICAgICBvbm1vdXNlZG93bjogMSxcbiAgICAgICAgICAgIG9ubW91c2Vtb3ZlOiAxLFxuICAgICAgICAgICAgb25tb3VzZW91dDogMSxcbiAgICAgICAgICAgIG9ubW91c2VvdmVyOiAxLFxuICAgICAgICAgICAgb25tb3VzZXVwOiAxXG4gICAgICAgIH07XG4gICAgICAgIHZhciBtYXBFdmVudHMgPSB7XG4gICAgICAgICAgICBvbnNjcm9sbDogd2luZG93XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHcm9wZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXV0aG9yIFJvbWFuIEdydWJlciA8cDEwMjAzODlAeWFob28uY29tPlxuICAgICAgICAgKiBAdmVyc2lvbiAxLjBcbiAgICAgICAgICovXG4gICAgICAgIHZhciBHcm9wZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBHcm9wZShjb250YWluZXJzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJzID0gY29udGFpbmVycztcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGFibGVFbGVtZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIC8qIENTUyBzdHlsZSBjbGFzc2VzICovXG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc0dyb3BhYmxlID0gJ2dyLWdyb3BhYmxlJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzR3JvcGluZyA9ICdnci1ncm9waW5nJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzTW9kZUdyb3BpbmcgPSAnZ3ItbW9kZS1ncm9waW5nJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzRGlzYXBwZWFyID0gJ2dyLWRpc2FwcGVhcic7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc0FwcGVhciA9ICdnci1hcHBlYXInO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NSZWFwcGVhciA9ICdnci1yZWFwcGVhcic7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZURvd25IYW5kbGVycyA9IFtdO1xuICAgICAgICAgICAgICAgIC8qIGFycmF5IGhvbGRpbmcgdGhlIGN1c3RvbSBldmVudHMgbWFwcGluZyBjYWxsYmFja3MgdG8gYm91bmQgY2FsbGJhY2tzICovXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21FdmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lcnMgPSBjb250YWluZXJzO1xuICAgICAgICAgICAgICAgIC8qIHNldCBkZWZhdWx0IG9wdGlvbnMgKi9cbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzOiBbJ2RpdiddXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvKiBtZXJnZSB0aGUgZGVmYXVsdCBvcHRpb24gb2JqZWN0cyB3aXRoIHRoZSBwcm92aWRlZCBvbmUgKi9cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnNba2V5XSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG9rZXkgaW4gb3B0aW9uc1trZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zW2tleV0uaGFzT3duUHJvcGVydHkob2tleSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XVtva2V5XSA9IG9wdGlvbnNba2V5XVtva2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5pdGlhbGl6ZSBET00gbWFuaXB1bGF0aW9ucyBhbmQgZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLmNvbnRhaW5lcnM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuZWxlbWVudHMuam9pbignLCAnKSk7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSBfY1tfYl07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3BhYmxlRWxlbWVudHMucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc05hbWUgKz0gXCIgXCIgKyB0aGlzLmNsYXNzR3JvcGFibGUgKyBcIiBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIG1vdXNlZG93biBoYW5kbGVyICovXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMubW91c2VEb3duKGUpOyB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSB0aGlzLm1vdXNlRG93bkhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKGVsLCAnbW91c2Vkb3duJywgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmVpbml0aWFsaXplIHRoZSBncm9wZSBlbGVtZW50XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHJldHVybiB7R3JvcGV9IC0gVGhlIEdyb3BlIG9iamVjdCBpbnN0YW5jZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUucmVpbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTW91c2UgZG93biBoYW5kbGVyXG4gICAgICAgICAgICAgKiBUT0RPXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIC0gVGhlIG1vdXNlIGRvd24gZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVFbGVtZW50ID0gdGhpcy5nZXRFbGVtZW50QmVoaW5kQ3Vyc29yKGUuY2xpZW50WCwgZS5jbGllbnRZKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0eXBlb2YgdGhpcy5ncm9wZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZ3JvcGVFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZ3JvcGVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUgPSB0aGlzLmdyb3BlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb3B5Q29tcHV0ZWRTdHlsZSh0aGlzLmdyb3BlRWxlbWVudCwgdGhpcy5ncm9wZUNsb25lKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUud2lkdGggPSB0aGlzLmdyb3BlRWxlbWVudC5vZmZzZXRXaWR0aCArICdweCc7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNsb25lLnN0eWxlLmhlaWdodCA9IHRoaXMuZ3JvcGVFbGVtZW50Lm9mZnNldEhlaWdodCArICdweCc7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUNsb25lLmNsYXNzTmFtZSArPSBcIiBcIiArIHRoaXMuY2xhc3NHcm9waW5nICsgXCIgXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm9wZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIFwiICsgdGhpcy5jbGFzc0Rpc2FwcGVhciArIFwiIFwiO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lICs9IFwiIFwiICsgdGhpcy5jbGFzc01vZGVHcm9waW5nICsgXCIgXCI7XG4gICAgICAgICAgICAgICAgdmFyIHJlY3QgPSB0aGlzLmdyb3BlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbHRhWCA9IGUuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbHRhWSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5ncm9wZUNsb25lKTtcbiAgICAgICAgICAgICAgICAvKiBtb3VzZW1vdmUgaGFuZGxlciAqL1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5tb3VzZU1vdmUoZSk7IH07XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgLyogbW91c2Vtb3ZlIGhhbmRsZXIgKi9cbiAgICAgICAgICAgICAgICB0aGlzLm1vdXNlVXBIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIF90aGlzLm1vdXNlVXAoZSk7IH07XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBIYW5kbGVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1vdXNlIHVwIGhhbmRsZXJcbiAgICAgICAgICAgICAqIFRPRE9cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgLSBUaGUgbW91c2UgdXAgZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUubW91c2VVcCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKFwiIFwiICsgdGhpcy5jbGFzc0Rpc2FwcGVhciArIFwiIFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlRWxlbWVudC5jbGFzc05hbWUgPSB0aGlzLmdyb3BlRWxlbWVudC5jbGFzc05hbWUucmVwbGFjZShyZSwgJycpO1xuICAgICAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoXCIgXCIgKyB0aGlzLmNsYXNzTW9kZUdyb3BpbmcgKyBcIiBcIik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZS5yZXBsYWNlKHJlLCAnJyk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLmdyb3BlQ2xvbmUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvcGVFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTW91c2UgbW92ZSBoYW5kbGVyXG4gICAgICAgICAgICAgKiBUT0RPXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlIC0gVGhlIG1vdXNlIG1vdmUgZXZlbnQgb2JqZWN0XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUubW91c2VNb3ZlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAvKiBpZiB0aGUgbW91c2UgbGVmdCB0aGUgd2luZG93IGFuZCB0aGUgYnV0dG9uIGlzIG5vdCBwcmVzc2VkIGFueW1vcmUsIGFib3J0IG1vdmluZyAqL1xuICAgICAgICAgICAgICAgIGlmICgoXCJ3aGljaFwiIGluIGUgJiYgZS53aGljaCA9PSAwKSB8fCAodHlwZW9mIGUud2hpY2ggPT0gJ3VuZGVmaW5lZCcgJiYgXCJidXR0b25cIiBpbiBlICYmIGUuYnV0dG9uID09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW91c2VVcChlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgeCA9IGUuY2xpZW50WDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IGUuY2xpZW50WTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUubGVmdCA9ICh4IC0gdGhpcy5kZWx0YVgpICsgJ3B4JztcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3BlQ2xvbmUuc3R5bGUudG9wID0gKHkgLSB0aGlzLmRlbHRhWSkgKyAncHgnO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coeCwgeSwgdGhpcy5ncm9wZUNsb25lLnN0eWxlLmxlZnQsIHRoaXMuZ3JvcGVDbG9uZS5zdHlsZS50b3AsIHRoaXMuZ3JvcGVFbGVtZW50KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBHcm9wZS5wcm90b3R5cGUuY29weUNvbXB1dGVkU3R5bGUgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcHV0ZWRTdHlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbXB1dGVkU3R5bGUgPSBmcm9tLmN1cnJlbnRTdHlsZSB8fCBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGZyb20sIG51bGwpO1xuICAgICAgICAgICAgICAgIGlmICghY29tcHV0ZWRTdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBjb21wdXRlZFN0eWxlOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbXB1dGVkU3R5bGVbcHJvcGVydHldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgJiYgdHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB2YWx1ZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiB2YWx1ZSAhPSBwYXJzZUludCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvLnN0eWxlW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5nZXRFbGVtZW50QmVoaW5kQ3Vyc29yID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudEJlaGluZEN1cnNvciA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICAgICAgICAgICAgLyogZmluZCB0aGUgbmV4dCBwYXJlbnQgd2hpY2ggaXMgYW4gaW5uZXIgZWxlbWVudCAqL1xuICAgICAgICAgICAgICAgIHZhciBpbm5lclJlID0gbmV3IFJlZ0V4cChcIiBcIiArIHRoaXMuY2xhc3NHcm9wYWJsZSArIFwiIFwiKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoZWxlbWVudEJlaGluZEN1cnNvciAmJiAhZWxlbWVudEJlaGluZEN1cnNvci5jbGFzc05hbWUubWF0Y2goaW5uZXJSZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudEJlaGluZEN1cnNvciA9IGVsZW1lbnRCZWhpbmRDdXJzb3IucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnRCZWhpbmRDdXJzb3I7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmdldERyb3B6b25lQmVoaW5kQ3Vyc29yID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBCcm93c2VyIGluZGVwZW5kZW50IGV2ZW50IHJlZ2lzdHJhdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7YW55fSBvYmogLSBUaGUgSFRNTEVsZW1lbnQgdG8gYXR0YWNoIHRoZSBldmVudCB0b1xuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gVGhlIGV2ZW50IG5hbWUgd2l0aG91dCB0aGUgbGVhZGluZyBcIm9uXCJcbiAgICAgICAgICAgICAqIEBwYXJhbSB7KGU6IEV2ZW50KSA9PiB2b2lkfSBjYWxsYmFjayAtIEEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYXR0YWNoIHRvIHRoZSBldmVudFxuICAgICAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBib3VuZCAtIHdoZXRoZXIgdG8gYmluZCB0aGUgY2FsbGJhY2sgdG8gdGhlIG9iamVjdCBpbnN0YW5jZSBvciBub3RcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKG9iaiwgZXZlbnQsIGNhbGxiYWNrLCBib3VuZCkge1xuICAgICAgICAgICAgICAgIGlmIChib3VuZCA9PT0gdm9pZCAwKSB7IGJvdW5kID0gdHJ1ZTsgfVxuICAgICAgICAgICAgICAgIHZhciBib3VuZENhbGxiYWNrID0gYm91bmQgPyBjYWxsYmFjay5iaW5kKHRoaXMpIDogY2FsbGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmouYWRkRXZlbnRMaXN0ZW5lciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXBFdmVudHNbJ29uJyArIGV2ZW50XSAmJiBvYmoudGFnTmFtZSA9PSBcIkJPRFlcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gbWFwRXZlbnRzWydvbicgKyBldmVudF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGJvdW5kQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2JqLmF0dGFjaEV2ZW50ID09ICdvYmplY3QnICYmIGh0bWxFdmVudHNbJ29uJyArIGV2ZW50XSkge1xuICAgICAgICAgICAgICAgICAgICBvYmouYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCBib3VuZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9iai5hdHRhY2hFdmVudCA9PSAnb2JqZWN0JyAmJiBtYXBFdmVudHNbJ29uJyArIGV2ZW50XSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqLnRhZ05hbWUgPT0gXCJCT0RZXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwID0gJ29uJyArIGV2ZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogZXhhbXBsZTogd2luZG93Lm9uc2Nyb2xsID0gYm91bmRDYWxsYmFjayAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwRXZlbnRzW3BdW3BdID0gYm91bmRDYWxsYmFjaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIFRPRE86IG9iai5vbnNjcm9sbCA/PyAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLm9uc2Nyb2xsID0gYm91bmRDYWxsYmFjaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2JqLmF0dGFjaEV2ZW50ID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialtldmVudF0gPSAxO1xuICAgICAgICAgICAgICAgICAgICBib3VuZENhbGxiYWNrID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIFRPRE86IGUgaXMgdGhlIG9ucHJvcGVydHljaGFuZ2UgZXZlbnQgbm90IG9uZSBvZiB0aGUgY3VzdG9tIGV2ZW50IG9iamVjdHMgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnByb3BlcnR5TmFtZSA9PSBldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBvYmouYXR0YWNoRXZlbnQoJ29ucHJvcGVydHljaGFuZ2UnLCBib3VuZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialsnb24nICsgZXZlbnRdID0gYm91bmRDYWxsYmFjaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21FdmVudHNbZXZlbnRdID8gbnVsbCA6ICh0aGlzLmN1c3RvbUV2ZW50c1tldmVudF0gPSBbXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21FdmVudHNbZXZlbnRdLnB1c2goW2NhbGxiYWNrLCBib3VuZENhbGxiYWNrXSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBCcm93c2VyIGluZGVwZW5kZW50IGV2ZW50IGRlcmVnaXN0cmF0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHthbnl9IG9iaiAtIFRoZSBIVE1MRWxlbWVudCBvciB3aW5kb3cgd2hvc2UgZXZlbnQgc2hvdWxkIGJlIGRldGFjaGVkXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZSB3aXRob3V0IHRoZSBsZWFkaW5nIFwib25cIlxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IHZvaWR9IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gYXR0YWNoZWRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQFRPRE86IHVucmVnaXN0ZXJpbmcgb2YgbWFwRXZlbnRzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKG9iaiwgZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50IGluIHRoaXMuY3VzdG9tRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5jdXN0b21FdmVudHNbZXZlbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpZiB0aGUgZXZlbnQgd2FzIGZvdW5kIGluIHRoZSBhcnJheSBieSBpdHMgY2FsbGJhY2sgcmVmZXJlbmNlICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXN0b21FdmVudHNbZXZlbnRdW2ldWzBdID09IGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogcmVtb3ZlIHRoZSBsaXN0ZW5lciBmcm9tIHRoZSBhcnJheSBieSBpdHMgYm91bmQgY2FsbGJhY2sgcmVmZXJlbmNlICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgPSB0aGlzLmN1c3RvbUV2ZW50c1tldmVudF1baV1bMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXN0b21FdmVudHNbZXZlbnRdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9iai5yZW1vdmVFdmVudExpc3RlbmVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9iai5kZXRhY2hFdmVudCA9PSAnb2JqZWN0JyAmJiBodG1sRXZlbnRzWydvbicgKyBldmVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmRldGFjaEV2ZW50KCdvbicgKyBldmVudCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2JqLmRldGFjaEV2ZW50ID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kZXRhY2hFdmVudCgnb25wcm9wZXJ0eWNoYW5nZScsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialsnb24nICsgZXZlbnRdID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBCcm93c2VyIGluZGVwZW5kZW50IGV2ZW50IHRyaWdnZXIgZnVuY3Rpb25cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBvYmogLSBUaGUgSFRNTEVsZW1lbnQgd2hpY2ggdHJpZ2dlcnMgdGhlIGV2ZW50XG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIGV2ZW50IG5hbWUgd2l0aG91dCB0aGUgbGVhZGluZyBcIm9uXCJcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS50cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiAob2JqLCBldmVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkhUTUxFdmVudHNcIik7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmV2ZW50VHlwZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXZlbnQuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICAgICAgICAgIGlmIChvYmouZGlzcGF0Y2hFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBvYmouZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9ialtldmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialtldmVudE5hbWVdKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9iai5maXJlRXZlbnQgJiYgaHRtbEV2ZW50c1snb24nICsgZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBvYmouZmlyZUV2ZW50KCdvbicgKyBldmVudC5ldmVudFR5cGUsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob2JqW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2V2ZW50TmFtZV0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob2JqWydvbicgKyBldmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialsnb24nICsgZXZlbnROYW1lXSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdldCBhIGNzcyBzdHlsZSBwcm9wZXJ0eSB2YWx1ZSBicm93c2VyIGluZGVwZW5kZW50XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWwgLSBUaGUgSFRNTEVsZW1lbnQgdG8gbG9va3VwXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30ganNQcm9wZXJ0eSAtIFRoZSBjc3MgcHJvcGVydHkgbmFtZSBpbiBqYXZhc2NyaXB0IGluIGNhbWVsQ2FzZSAoZS5nLiBcIm1hcmdpbkxlZnRcIiwgbm90IFwibWFyZ2luLWxlZnRcIilcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgcHJvcGVydHkgdmFsdWVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmdldFN0eWxlID0gZnVuY3Rpb24gKGVsLCBqc1Byb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1Byb3BlcnR5ID0ganNQcm9wZXJ0eS5yZXBsYWNlKC8oW0EtWl0pL2csIFwiLSQxXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZ2V0UHJvcGVydHlWYWx1ZShjc3NQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuY3VycmVudFN0eWxlW2pzUHJvcGVydHldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJlZ2lzdGVyIGN1c3RvbSBldmVudCBjYWxsYmFja3NcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IGFueX0gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgcmFpc2VzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtHcm9wZX0gLSBUaGUgR3JvcGUgb2JqZWN0IGluc3RhbmNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIEdyb3BlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERlcmVnaXN0ZXIgY3VzdG9tIGV2ZW50IGNhbGxiYWNrc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCAtIFRoZSBldmVudCBuYW1lXG4gICAgICAgICAgICAgKiBAcGFyYW0geyhlOiBFdmVudCkgPT4gYW55fSBjYWxsYmFjayAtIEEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIHRoZSBldmVudCByYWlzZXNcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0dyb3BlfSAtIFRoZSBHcm9wZSBvYmplY3QgaW5zdGFuY2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJldmVydCBhbGwgRE9NIG1hbmlwdWxhdGlvbnMgYW5kIGRlcmVnaXN0ZXIgYWxsIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgR3JvcGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBHcm9wZTtcbiAgICAgICAgfSgpKTtcbiAgICAgICAgLyogcmV0dXJuIGFuIGluc3RhbmNlIG9mIHRoZSBjbGFzcyAqL1xuICAgICAgICByZXR1cm4gbmV3IEdyb3BlKGMsIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gZ3JvcGU7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdyb3BlLmpzLm1hcCJdfQ==
