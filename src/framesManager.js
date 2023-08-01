import { CLASSES, ICTR_WRAPPER, WRAPPER_EVENTS } from './constants';

export default class {
    constructor() {
        
        this.frames = document.getElementsByClassName(CLASSES.PLAYER);
        // this.wrapPlayerIframes();
    }

    /** Sends initial data into each player frame and gives it a random embedding id
     * to identify it later .
     * @param {[HTMLIFrameElement]} frames
     */
    sendInitInfo(data) {
        for (let ii = 0; ii < this.frames.length; ii++) {
            const frame = this.frames[ii]; 
            let embeddingId = randomString(10);
            if(frame.id) embeddingId = frame.id;
            else frame.id = embeddingId;
            const info = {
                embeddingId,
                ...data
            };
            this.notify(frame, WRAPPER_EVENTS.INIT, info);
        }
    }

    /** Notifies player app through message events
     * @param {HTMLIFrameElement} playerFrame the iframe that event is targeting
     * @param {String} name  event name
     * @param {Object} data data that is going in the event
     */
    notify(playerFrame, name, data = {}) {
        var eventInfo = JSON.stringify(
            Object.assign({ name, from: ICTR_WRAPPER }, data)
        );
        // var eventInfo = {eventType, from : ICTR_WRAPPER, ...data };
        // console.log('sending from wrapper ... ', eventInfo)
        playerFrame.contentWindow.postMessage(eventInfo, '*');
    }
    /** Wraps all iframes with divs , check `wrapElement` function .
     * @param {[HTMLIFrameElement]} frames
     */
    wrapPlayerIframes() {
        for (var i = 0; i < this.frames.length; i++) {
            var iframe = this.frames[i];
            this.wrapElement(iframe);
        }
    }

    /** Wraps passed dom element with a div that will take's it's
     *  parent width and maintain it's aspect-ratio through top padding hack
     *
     */
    wrapElement(el) {
        var widthAttr = parseInt(el.getAttribute('width'), 10);
        var heightAttr = parseInt(el.getAttribute('height'), 10);
        // var widthAttr = parseInt(el.dataset.width);
        // var heightAttr = parseInt(el.dataset.height);

        // fallback to 16/9 aspect ratio which is most common if not set in project settings
        var width = !isNaN(widthAttr) ? widthAttr : 720;
        var height = !isNaN(heightAttr) ? heightAttr : 405;

        var aspect = height / width;

        el.removeAttribute('width');
        el.removeAttribute('height');

        var wrapper = document.createElement('div');
        el.parentNode.insertBefore(wrapper, el);
        wrapper.className = CLASSES.PLAYER_WRAPPER;
        wrapper.style.paddingTop = aspect * 100 + '%';
        wrapper.appendChild(el);
    }
    /** Returns the iframe for given app id
     * @param {String} embeddingId
     */
    getFrameById(embeddingId) {
        if (!embeddingId || typeof embeddingId != 'string') {
            return console.error('missing app id for ictr-player frame ');
        }
        var frame = document.getElementById(embeddingId);
        if (!frame || frame.tagName != 'IFRAME')
            return console.error(
                `couldn't find the ictr-player frame for the given id`
            );
        return frame;
    }
}

/** returns a random string
 * @param {Number} length length of returned string
 */
function randomString(length) {
    // https://www.thepolyglotdeveloper.com/2015/03/create-a-random-nonce-string-using-javascript/
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
