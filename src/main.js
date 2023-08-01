import { CLASSES, WRAPPER_EVENTS, ICTR_PLAYER, PLAYER_EVENTS } from './constants';
import FramesManager from './framesManager';
import {
    isFullScreenEnabled,
    // createFrameFSHandler,
    toggleFullScreen,
    notifyPlayer
} from './fscreenUtils';
import './style.css'

(function() {
    function run() {
        console.log('Interactive Player Loaded');
        // Make sure to only run this wrapper code once in case of multiple
        // embeddings in same page
        
        if (window.__ictr_wrpr_check__) return;
        window.__ictr_wrpr_check__ = true;

        var projects = document.querySelectorAll('[data-hash]');
        if (projects.length > 0) { 
            projects.forEach((node) => {
                if(node.querySelector("iframe"))
                    return;

                const iframe = document.createElement('iframe');
                const isPreview = node.getAttribute("data-context") == "preview" ? true : false;
                
                if(isPreview) {
                    const apiUrl = node.getAttribute('api-url');
                    const analyticsUrl = node.getAttribute('analytics-url');
                    const projectId = node.getAttribute('project-id');
                    const previewNodeId = node.getAttribute('preview-node-id') ? node.getAttribute('preview-node-id') : false;
                    iframe.src=`${import.meta.env.VITE_PLAYER_URL}/?context=preview&projectId=${projectId}&apiUrl=${apiUrl}&analyticsUrl=${analyticsUrl}&appEnv=${import.meta.env.VITE_APP_ENV}&previewNodeId=${previewNodeId}`;
                } else {
                    const hash = node.getAttribute('data-hash');
                    iframe.src=`${import.meta.env.VITE_PLAYER_URL}/?hash=${hash}&apiUrl=${import.meta.env.VITE_API_URL}&analyticsUrl=${import.meta.env.VITE_ANALYTICS_URL}&appEnv=${import.meta.env.VITE_APP_ENV}`;
                }
                //iframe.src = "https://p-fast.b-cdn.net/player/staging/37/index.html"
                // iframe.src="http://bs-local.com/pdq/?apiUrl=http://bs-local.com:8000&context=preview&projectid=24668&analyticsUrl=http://bs-local.com:8080";
                //iframe.contentWindow.playerData = window['pdqplyr-6087b1f399f4f'];
                iframe.width = '100%';
                iframe.height = '100%';
                iframe.frameBorder = "none"
                iframe.classList.add(CLASSES.PLAYER);

                const thumbnail = node.getElementsByClassName('iv-player_embed')[0];
                thumbnail.prepend(iframe);
                thumbnail.lastElementChild.style.transition = "opacity 0.5s ease 0s";
                thumbnail.lastElementChild.style.opacity = 1;
            });
        }

        // // expose this function , use case here being manually calling this in cases
        // // where dom is being manually injected like in the editing mode from interactr app
        window.__ictr_run_wrapper = run;

        const framesManager = new FramesManager();

        var dynamicParams = getDynamicTextParameters();
        // Events comming from inside the player iframes
        console.log('addEventListener handleIncomingPlayerMsg');
        window.addEventListener('message', handleIncomingPlayerMsg);

        //TODO clean this up from app side as well
        function handleIncomingPlayerMsg(e) {
            console.log('handleIncomingPlayerMsg')
            // make sure event is from our player(s) and not some other iframe
            // all events from player app should have a "from" property
            if (typeof e.data === 'object' && e.data.from === ICTR_PLAYER) {
                console.log('received event from app iframe .......', e.data)

                var { eventType, embeddingId } = e.data;

                // fired when player app mounts and is ready 🚀
                if (eventType === PLAYER_EVENTS.READY) {
                    framesManager.sendInitInfo({
                        dynamicParams,
                        // fullScreenSupported
                    });
                }
                // only present after initial connection between window and app frame
                if (embeddingId) {
                    var frame = framesManager.getFrameById(embeddingId);
                    if (frame) {
                        // player app toggled FS
                        if (eventType === PLAYER_EVENTS.TOGGLE_FS) {
                            if (isFullScreenEnabled) toggleFullScreen(frame);
                            else toggleFSOverlay(frame);
                        }
                        // listens to actuall FS changes and notifies player to change controls and relevant updates
                        // fscreen.onfullscreenchange = createFrameFSHandler(
                            //     frame
                            // );
                            
                        if(eventType === PLAYER_EVENTS.LOADED) {
                            // const styles = window.getComputedStyle(frame.nextElementSibling);
                            // if(styles.transition != "opacity 0.5s ease 0s") {
                            //     frame.nextElementSibling.style.transition = "opacity 0.5s ease 0s";
                            // }
                            frame.nextElementSibling.style.opacity = 0;
                            frame.nextElementSibling.addEventListener( 
                                'webkitTransitionEnd', 
                                function( event ) { 
                                    frame.nextElementSibling.style.zIndex = -1;
                                }, false );
                        }
                    }
                }
            }
        }
        /** @param {HTMLIFrameElement} frame */

        const styles = {
            position: 'fixed',
            top: 0,
            left:0,
            width: '100%',
            height : '100%',
            zIndex: '99999999'
        };

        function toggleFSOverlay(frame) {
            const fsOverlay = 'fullscreen-overlay'
            const classList = frame.classList;
            if (classList.contains(fsOverlay)) {
                frame.classList.remove(fsOverlay);
                frame.style.position = '';
                frame.style.top = '';
                frame.style.left = '';
                frame.style.width = '';
                frame.style.height = '';
                frame.style.zIndex = '';
            } else {
                frame.classList.add(fsOverlay);
                Object.assign(frame.style, styles);
            }
            notifyPlayer(frame, WRAPPER_EVENTS.FS_ENABLED, {
                fullScreenEnabled: classList.contains(fsOverlay) ? true : false
            });
        }

        /** returns all the parameters in a searchquery in a normal object
         * ⚡️ requires `URLSEARCHParams` pollyfill cause a bunch of browsers don't support it yet
         * @returns {object} the dynamicParams object
         */
        function getDynamicTextParameters() {
            var searchQuery = document.location.search;
            var dynamicParams = {};
            if (typeof searchQuery == 'string') {
                var urlParamsObj = new URLSearchParams(searchQuery);
                for (var entry of urlParamsObj.entries()) {
                    dynamicParams[entry[0]] = entry[1];
                }
            }
            return dynamicParams;
        }
    }
    if (document.readyState === 'loading') {
        // Loading hasn't finished yet
        document.addEventListener('DOMContentLoaded', run);

    } else {
        // `DOMContentLoaded` has already fired
        run();
    }

})();
