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
//# sourceMappingURL=grope.js.map