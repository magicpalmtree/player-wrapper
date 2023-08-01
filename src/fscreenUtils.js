import fscreen from 'fscreen';
import { ICTR_WRAPPER, WRAPPER_EVENTS } from './constants';

export const isFullScreenEnabled =  fscreen.fullscreenEnabled;
// export const isFullScreenEnabled =  false;


export function addFullscreenChangeListener(playerIframe) {
    if(fscreen.onfullscreenchange)return;
    fscreen.onfullscreenchange = (e) => {
        notifyPlayer(playerIframe, WRAPPER_EVENTS.FS_ENABLED, {
            fullScreenEnabled: fscreen.fullscreenElement ? true : false
        });
    };
}

/** Toggles relevant frame into full screen .
 * @param {HTMLElement} playerIframe
 */
export function toggleFullScreen(playerIframe) {
    if (isFullScreenEnabled) {
        if (fscreen.fullscreenElement) {
            fscreen.exitFullscreen();
        } else {
            // lockScreenInLandscape()
            fscreen.requestFullscreen(playerIframe);
            addFullscreenChangeListener(playerIframe);
        }
    }
}

export const notifyPlayer = (playerFrame, name, data = {}) => {
    var eventInfo = JSON.stringify(
        Object.assign({ name, from: ICTR_WRAPPER }, data)
    );
    // var eventInfo = {eventType, from : ICTR_WRAPPER, ...data };
    // console.log('sending from wrapper ... ', eventInfo)
    playerFrame.contentWindow.postMessage(eventInfo, '*');
}

/** Creates and returns the handler with access to the iframe so it can notify it when fullscreen status changes
 * @param {HTMLIFrameElement} playerFrame
 * @returns {function} event handler
 */
// export function createFrameFSHandler(playerFrame) {
//     return function fullScreenChangeHandler(e) {
//         if (fscreen.fullscreenElement == playerFrame) {
//             notifyPlayer(playerFrame, FS_ENABLED, {
//                 fullScreenEnabled: true
//             });
//         } else
//             notifyPlayer(playerFrame, FS_ENABLED, {
//                 fullScreenEnabled: false
//             });
//     };
// }

// function lockScreenInLandscape() {
//     // console.log('orientation thing .....');
//     if (!('orientation' in screen)) {
//         // console.log('orientation thing is not supported');
//         return;
//     }
//     // Let's force landscape mode only if device is in portrait mode and can be held in one hand.
//     if (
//         matchMedia('(orientation: portrait) and (max-device-width: 768px)')
//             .matches
//     ) {
//         // console.log('it is supported triggering now');
//         screen.orientation.lock('landscape');
//     }
// }
