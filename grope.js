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
//# sourceMappingURL=grope.js.map