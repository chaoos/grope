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
    tossCallback?: (element?: HTMLElement, from?: HTMLElement, to?: HTMLElement) => boolean;
    copy?: boolean,
  }

  /**
   * Grope
   * 
   * @author Roman Gruber <p1020389@yahoo.com>
   * @version 1.0
   */
  class Grope {
    private gropeElement: HTMLElement = null;
    private gropeClone: HTMLElement = null;
    private gropeContainer: HTMLElement = null;
    private originGropeContainer: HTMLElement = null;
    private copyElement: HTMLElement = null;
    private deltaX: number;
    private deltaY: number;
    private mapping: Array<Array<HTMLElement>> = [];
    private originMapping: Array<Array<HTMLElement>> = [];    
    private rectCache: Array<{ object: HTMLElement, rect: ClientRect }> = [];

    /* CSS style classes */
    public classGropable: string = 'gr-gropable';
    public classTossZone: string = 'gr-tosszone';
    public classGroping: string = 'gr-groping';
    public classModeGroping: string = 'gr-mode-groping';
    public classMove: string = 'move';
    public classCopy: string = 'copy';
    public classDisappear: string = 'gr-disappear';

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
        copy: false,
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
      //for (var container of this.containers) {
      for (var i in this.containers) {
        var container = this.containers[i];
        this.addClass(container, this.classTossZone);
        var a = 0;
        this.mapping[i] = [];
        for (var el of (<any>container.querySelectorAll(this.options.elements.join(', ')))) {
          this.addClass(el, this.classGropable);
          this.addClass(el, this.options.copy ? this.classCopy : this.classMove);

          this.mapping[i][a] = el;

          /* mousedown handler */
          var callback = (e) => this.mouseDown(e);
          this.addEventListener(el, 'mousedown', callback);
          a++;
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


    private remap () {
      this.mapping = [];
      this.rectCache = [];
      for (var i in this.containers) {
        this.mapping[i] = [];
        var a = 0;
        for (var el of (<any>this.containers[i].querySelectorAll(this.options.elements.join(', ')))) {
          if (el !== this.gropeClone) {
            this.mapping[i][a] = el;
            a++;
          }
        }
      }
      return this.mapping;
    }

    /**
     * Mouse down handler
     * TODO
     *
     * @param {MouseEvent} e - The mouse down event object
     * @return {void}
     */
    private mouseDown (e: MouseEvent): void {

      this.originMapping = this.remap();
      this.gropeElement = this.getElementBehindCursor(e.clientX, e.clientY);
      this.gropeContainer = this.getContainerByGropeElement(this.gropeElement);
      this.originGropeContainer = this.gropeContainer;

      if (this.gropeContainer != null) {
        if (this.options.copy === true) {
          this.copyElement = this.gropeElement;
          this.gropeElement = (<HTMLElement>this.gropeElement.cloneNode(true));;
          this.gropeContainer.insertBefore(this.gropeElement, this.copyElement);

          var callback = (e) => this.mouseDown(e);
          this.addEventListener(this.gropeElement, 'mousedown', callback);
          this.remap();
        }

        this.gropeClone = (<HTMLElement>this.gropeElement.cloneNode(true));

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
        this.mouseMoveHandler = (e) => this.mouseMove(e);
        this.addEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler);

        /* mouseup handler */
        this.mouseUpHandler = (e) => this.mouseUp(e);
        this.addEventListener(document.documentElement, 'mouseup', this.mouseUpHandler);
      }
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

      this.removeClass(this.gropeElement, this.classDisappear);
      this.removeClass(document.body, this.classModeGroping);
      this.removeClass(document.body, this.classCopy);
      this.removeClass(document.body, this.classMove);      

      this.gropeClone.parentNode.removeChild(this.gropeClone);

      for (var container of this.containers) {
        this.removeClass(container, 'active');
      }

      if (this.options.tossCallback(this.gropeElement, this.originGropeContainer, this.gropeContainer) === false) {
        this.revertChanges();
      }

      this.gropeElement = null;
      this.gropeClone = null;
      this.gropeContainer = null;
      this.copyElement = null;
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

      var container: any;

      var x = e.clientX;
      var y = e.clientY;

      this.gropeClone.style.left = (x - this.deltaX) + 'px';
      this.gropeClone.style.top = (y - this.deltaY) + 'px';

      var found = false;
      for (var i in this.mapping) {
        for (var gropeElement of this.mapping[i]) {
          var coords = this.getRect(gropeElement);

          if (found === false
              && x >= (<any>coords).left
              && x <= (gropeElement.offsetWidth + (<any>coords).left)
              && y >= (<any>coords).top
              && y <= (gropeElement.offsetHeight + (<any>coords).top)) {

            found = true;
            container = this.getContainerByGropeElement(gropeElement);
            this.addClass(container, 'active')

            if (gropeElement != this.gropeElement) {
              var pos = this.gropeElement.compareDocumentPosition(gropeElement)
              if (pos == Node.DOCUMENT_POSITION_PRECEDING) {
                container.insertBefore(this.gropeElement, gropeElement);
                this.gropeContainer = container;
                this.remap();
              } else if (pos == Node.DOCUMENT_POSITION_FOLLOWING) {
                container.insertBefore(this.gropeElement, gropeElement.nextSibling);
                this.gropeContainer = container;
                this.remap();
              }
            }
          }
        }
      }

      if (found === false) {
        for (container of this.containers) {
          var coords = this.getRect(container);

          /* if the element is held over a container element, but not an other grope element,
           * it should be appended to that container */
          if (found === false
              && x >= (<any>coords).left
              && x <= (container.offsetWidth + (<any>coords).left)
              && y >= (<any>coords).top
              && y <= (container.offsetHeight + (<any>coords).top)) {

            found = true;
            this.addClass(container, 'active')
            if (container != this.gropeContainer) {
              container.appendChild(this.gropeElement);
              container.appendChild(this.gropeClone);
              this.gropeContainer = container;
              this.remap();
            }
          } else {
            this.removeClass(container, 'active')
          }
        }
      }
    }

    private revertChanges () {
      //TODO: revert multiple changes
      this.revertCopy();
    }

    private revertMove () {
      for (var i in this.originMapping) {
        for (var a in this.originMapping[i]) {
          if (this.originMapping[i][a] == this.gropeElement) {
            this.getContainerByGropeElement(this.gropeElement).removeChild(this.gropeElement);
            var list = (<any>this.originGropeContainer.querySelectorAll(this.options.elements.join(', ')));
            this.originGropeContainer.insertBefore(this.gropeElement, list[a]);
            return;
          }
        }
      }
    }

    private revertCopy () {
      if (this.copyElement !== null) {
        this.getContainerByGropeElement(this.gropeElement).removeChild(this.gropeElement);
        this.gropeElement = this.copyElement;
        this.copyElement = null;
      }
      this.revertMove();      
    }

    private getRect (el: HTMLElement, live = false) {
      if (live === false) {
        for (var data of this.rectCache) {
          if (data.object == el) {
            return data.rect;
          }
        }
      }
      var rect = el.getBoundingClientRect();
      this.rectCache.push({ object: el, rect: rect});
      return rect;
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

    private addClass (el: HTMLElement, cssClass: string) {
      if (!this.hasClass(el, cssClass)) {
        el.className += " " + cssClass + " ";
      }
    }

    private removeClass (el: HTMLElement, cssClass: string) {
      var re = new RegExp(" " + cssClass + " ", 'g');
      el.className = el.className.replace(re,'');
    }

    private hasClass (el: HTMLElement, cssClass: string) {
      var re = new RegExp(" " + cssClass + " ");
      return el.className.match(re) !== null;
    }

    private getContainerByGropeElement (el: HTMLElement) {
      for (var i in this.mapping) {
        for (var gropeElement of this.mapping[i]) {
          if (gropeElement == el) {
            return this.containers[i];
          }
        }
      }
      return null;
    }

    private getElementBehindCursor (x: number, y: number) {
      var elementBehindCursor = <HTMLElement>document.elementFromPoint(x, y);

      /* find the next parent which is an gropable element */
      while (elementBehindCursor && !this.hasClass(elementBehindCursor, this.classGropable)) {
        elementBehindCursor = elementBehindCursor.parentElement;
      }
      return elementBehindCursor;
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
     * @TODO
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
     * @TODO
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
     * @TODO
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