/**
 * Export function of the module
 *
 * @param {HTMLElement} container - The HTMLElement to grope ;-)
 * @param {Options} options - the options object to configure Grope
 * @return {Grope} - Grope object instance
 */
function grope (containers: HTMLElement | Array<HTMLElement>, options = {}) {

  var c = containers instanceof Array ? containers : new Array(<HTMLElement>containers);

  /**
   * Polyfill bind function for older browsers
   * The bind function is an addition to ECMA-262, 5th edition
   * @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
   */
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs   = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP    = function() {},
          fBound  = function() {
            return fToBind.apply(this instanceof fNOP
                   ? this
                   : oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments)));
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
    onload:1,
    onunload:1,
    /* Form Events */
    onblur:1,
    onchange:1,
    onfocus:1,
    onreset:1,
    onselect:1,
    onsubmit:1,
    /* Image Events */
    onabort:1,
    /* Keyboard Events */
    onkeydown:1,
    onkeypress:1,
    onkeyup:1,
    /* Mouse Events */
    onclick:1,
    ondblclick:1,
    onmousedown:1,
    onmousemove:1,
    onmouseout:1,
    onmouseover:1,
    onmouseup:1
  }

  var mapEvents = {
    onscroll:window,
  }


  /* options object definition */
  interface Options {
    elements?: Array<string>;
  }

  /**
   * Grope
   * 
   * @author Roman Gruber <p1020389@yahoo.com>
   * @version 1.0
   */
  class Grope {
    private gropableElements: Array<HTMLElement> = [];
    private gropeElement: HTMLElement = null;
    private gropeClone: HTMLElement = null;
    private deltaX: number;
    private deltaY: number;

    /* CSS style classes */
    public classGropable: string = 'gr-gropable';
    public classGroping: string = 'gr-groping';
    public classModeGroping: string = 'gr-mode-groping';
    public classDisappear: string = 'gr-disappear';
    public classAppear: string = 'gr-appear';
    public classReappear: string = 'gr-reappear';

    private mouseDownHandlers: Array<(e: MouseEvent) => void> = [];
    private mouseUpHandler: (e: MouseEvent) => void;
    private mouseMoveHandler: (e: MouseEvent) => void;

    /* array holding the custom events mapping callbacks to bound callbacks */
    private customEvents: Array<Array<Array<(e: Event) => void>>> = [];

    constructor (
      private containers: Array<HTMLElement>,
      public options: Options) {

      this.containers = containers;

      /* set default options */
      this.options = {
        elements: ['div'],
      };

      /* merge the default option objects with the provided one */
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          if (typeof options[key] == 'object') {
            for (var okey in options[key]) {
              if (options[key].hasOwnProperty(okey)) this.options[key][okey] = options[key][okey];
            }
          } else {
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
    private init () {
      for (var container of this.containers) {
        for (var el of (<any>container.querySelectorAll(this.options.elements.join(', ')))) {
          this.gropableElements.push(el);
          el.className += " " + this.classGropable + " ";

          /* mousedown handler */
          var callback = (e) => this.mouseDown(e);
          var c = this.mouseDownHandlers.push(callback);
          this.addEventListener(el, 'mousedown', callback);
        }
      }
    }

    /**
     * Reinitialize the grope element
     * 
     * @return {Grope} - The Grope object instance
     */
    public reinit () {
    }


    /**
     * Mouse down handler
     * TODO
     *
     * @param {MouseEvent} e - The mouse down event object
     * @return {void}
     */
    private mouseDown (e: MouseEvent): void {

      this.gropeElement = this.getElementBehindCursor(e.clientX, e.clientY);
      console.log(typeof this.gropeElement);
      console.log(this.gropeElement instanceof HTMLElement);
      console.log(this.gropeElement);
      this.gropeClone = (<HTMLElement>this.gropeElement.cloneNode(true));

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
      this.mouseMoveHandler = (e) => this.mouseMove(e);
      this.addEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler);

      /* mousemove handler */
      this.mouseUpHandler = (e) => this.mouseUp(e);
      this.addEventListener(document.documentElement, 'mouseup', this.mouseUpHandler);

    }

    /**
     * Mouse up handler
     * TODO
     *
     * @param {MouseEvent} e - The mouse up event object
     * @return {void}
     */
    private mouseUp (e: MouseEvent): void {

      this.removeEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler);
      this.removeEventListener(document.documentElement, 'mouseup', this.mouseUpHandler);

      var re = new RegExp(" " + this.classDisappear + " ");
      this.gropeElement.className = this.gropeElement.className.replace(re,'');
      var re = new RegExp(" " + this.classModeGroping + " ");
      document.body.className = document.body.className.replace(re,'');

      document.body.removeChild(this.gropeClone);
      this.gropeElement = null;
      this.gropeClone = null;
    }

    /**
     * Mouse move handler
     * TODO
     *
     * @param {MouseEvent} e - The mouse move event object
     * @return {void}
     */
    private mouseMove (e: MouseEvent): void {

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
    }

    private copyComputedStyle (from, to) {

      var computedStyle = false;
      computedStyle = from.currentStyle || document.defaultView.getComputedStyle(from, null);
      if (!computedStyle) {return null};

      for (var property of <any>computedStyle) {
        var value = computedStyle[property];
        if (typeof value !== 'undefined'
            && typeof value !== 'object'
            && typeof value !== 'function'
            && value.length > 0
            && value != parseInt(value)) {
          to.style[property] = value;
        }
      }
    }

    private getElementBehindCursor (x: number, y: number) {
      var elementBehindCursor = <HTMLElement>document.elementFromPoint(x, y);

      /* find the next parent which is an inner element */
      var innerRe = new RegExp(" " + this.classGropable + " ");
      while (elementBehindCursor && !elementBehindCursor.className.match(innerRe)) {
        elementBehindCursor = elementBehindCursor.parentElement;
      }
      return elementBehindCursor;
    }

    private getDropzoneBehindCursor (x: number, y: number) {
      return;
    }


    /**
     * Browser independent event registration
     * 
     * @param {any} obj - The HTMLElement to attach the event to
     * @param {string} event - The event name without the leading "on"
     * @param {(e: Event) => void} callback - A callback function to attach to the event
     * @param {boolean} bound - whether to bind the callback to the object instance or not
     * @return {void}
     */     
    private addEventListener (obj: any, event: string, callback: (e: Event) => void, bound = true) {
      var boundCallback = bound ? callback.bind(this): callback;

      if (typeof obj.addEventListener == 'function') {
        if (mapEvents['on' + event] && obj.tagName == "BODY") {
          obj = mapEvents['on' + event];
        }
        obj.addEventListener(event, boundCallback);
      } else if (typeof (<any>obj).attachEvent == 'object' && htmlEvents['on' + event]) { //MSIE: real events (e.g. 'click')
        (<any>obj).attachEvent('on' + event, boundCallback);
      } else if (typeof (<any>obj).attachEvent == 'object' && mapEvents['on' + event]) {
        if (obj.tagName == "BODY") {
          var p = 'on' + event
          /* example: window.onscroll = boundCallback */
          mapEvents[p][p] = boundCallback;
        } else {
          /* TODO: obj.onscroll ?? */
          obj.onscroll = boundCallback
        }
      } else if (typeof (<any>obj).attachEvent == 'object') { //MSIE: custom event workaround
        obj[event] = 1;
        boundCallback = (e) => {
          /* TODO: e is the onpropertychange event not one of the custom event objects */
          if (e.propertyName == event) { callback(e); }
        };
        (<any>obj).attachEvent('onpropertychange', boundCallback);
      } else {
        obj['on' + event] = boundCallback;
      }

      this.customEvents[event] ? null : (this.customEvents[event] = []);
      this.customEvents[event].push([callback, boundCallback]);

    }

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
    private removeEventListener (obj: any, event: string, callback: (e: Event) => void) {

      if (event in this.customEvents) {
        for (let i in this.customEvents[event]) {
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
      } else if (typeof (<any>obj).detachEvent == 'object' && htmlEvents['on' + event]) { //MSIE: real events (e.g. 'click')
        (<any>obj).detachEvent('on' + event, callback);
      } else if (typeof (<any>obj).detachEvent == 'object') { //MSIE: custom event workaround
        (<any>obj).detachEvent('onpropertychange', callback);
      } else {
        obj['on' + event] = null;
      }
    }

    /**
     * Browser independent event trigger function
     * 
     * @param {HTMLElement} obj - The HTMLElement which triggers the event
     * @param {string} eventName - The event name without the leading "on"
     * @return {void}
     */
    private triggerEvent (obj: HTMLElement, eventName: string) {
      var event: Event;

      if (typeof (<any>window).CustomEvent === 'function') {
        event = new CustomEvent(eventName);
      } else if (typeof document.createEvent == 'function') {
        event = document.createEvent("HTMLEvents");
        event.initEvent(eventName, true, true);
      } else if ((<any>document).createEventObject) { // IE < 9
        event = (<any>document).createEventObject();
        (<any>event).eventType = eventName;
      }

      (<any>event).eventName = eventName;
      if (obj.dispatchEvent) {
        obj.dispatchEvent(event);
      } else if (obj[eventName]) { //MSIE: custom events        
        obj[eventName]++;
      } else if ((<any>obj).fireEvent && htmlEvents['on' + eventName]) { //MSIE: only real events
        (<any>obj).fireEvent('on' + (<any>event).eventType, event);
      } else if (obj[eventName]) {
        obj[eventName]();
      } else if (obj['on' + eventName]) {
        obj['on' + eventName]();
      }

    }

    /**
     * Get a css style property value browser independent
     * 
     * @param {HTMLElement} el - The HTMLElement to lookup
     * @param {string} jsProperty - The css property name in javascript in camelCase (e.g. "marginLeft", not "margin-left")
     * @return {string} - the property value
     */
    private getStyle (el: HTMLElement, jsProperty: string) {
        var cssProperty = jsProperty.replace(/([A-Z])/g, "-$1").toLowerCase(); 
        if (typeof window.getComputedStyle == 'function') {
            return window.getComputedStyle(el).getPropertyValue(cssProperty);
        } else {
            return (<any>el).currentStyle[jsProperty];
        }
    }

    /**
     * Register custom event callbacks
     *
     * @param {string} event - The event name
     * @param {(e: Event) => any} callback - A callback function to execute when the event raises
     * @return {Grope} - The Grope object instance
     */
    public on (event: string, callback: (e: Event) => any): Grope {
      return this;
    }

    /**
     * Deregister custom event callbacks
     *
     * @param {string} event - The event name
     * @param {(e: Event) => any} callback - A callback function to execute when the event raises
     * @return {Grope} - The Grope object instance
     */
    public off (event: string, callback: (e: Event) => any): Grope {
      return this;
    }

    /**
     * Revert all DOM manipulations and deregister all event handlers
     * 
     * @return {void}
     */
    public destroy () {
      return;
    }

  }

  /* return an instance of the class */
  return new Grope((<HTMLElement[]>c), options);
}

export = grope;