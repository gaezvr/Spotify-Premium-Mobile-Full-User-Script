// ==UserScript==
// @name         Spotify Full Premium Mobile Script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       gaezvr
// @match        *://open.spotify.com/*
// @description  Detects and Skips Ads on spotify, Mobile Spotify Premium Web, Download Songs. For Research Purposes Only, I'm not responsible of the Use of the Script
// @copyright    gaezvr
// @license      MIT;
// ==/UserScript==

// Detectar y bloquear anuncios

!async function () {

    async function queryAsync(query) {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                const element = document.querySelector(query);
                if (element) {
                    clearInterval(interval);
                    return resolve(element);
                }
            }, 250);
        });
    }

    function inject({ctx, fn, middleware, transform}) {
        const original = ctx[fn];
        ctx[fn] = function () {
            if (!middleware || middleware.call(this, ...arguments) !== false) {
                const result = original.call(this, ...arguments);
                return transform ? transform.call(this, result, ...arguments) : result;
            }
        };
    }

    const nowPlayingBar = await queryAsync('.now-playing-bar');
    const playButton = await queryAsync('button[title=Play], button[title=Pause]');

    let audio;

    inject({
        ctx: document,
        fn: 'createElement',
        transform(result, type) {

            if (type === 'audio') {
                audio = result;
            }

            return result;
        }
    });

    let playInterval;
    new MutationObserver(() => {
        const link = document.querySelector('.now-playing > a');

        if (link) {

            if (!audio) {
                return console.error('Audio-element not found!');
            }

            if (!playButton) {
                return console.error('Play-button not found!');
            }

            audio.src = '';
            playButton.click();
            if (!playInterval) {
                playInterval = setInterval(() => {
                    if (!document.querySelector('.now-playing > a') && playButton.title === 'Pause') {
                        clearInterval(playInterval);
                        playInterval = null;
                    } else {
                        playButton.click();
                    }
                }, 500);
            }
        }
    }).observe(nowPlayingBar, {
        characterData: true,
        childList: true,
        attributes: true,
        subtree: true
    });

}();

// Descargar Canciones

const style = document.createElement( 'style' );

style.innerText = `

[role='grid'] {
	margin-left: 50px;
}

[data-testid='tracklist-row'] {
	position: relative;
}

[role="presentation"] > * {
	contain: unset;
}

.btn {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	border: 0;
	background-color: #1fdf64;
	background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M17 12v5H3v-5H1v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z"/><path d="M10 15l5-6h-4V1H9v8H5l5 6z"/></svg>');
	background-position: center;
	background-repeat: no-repeat;
	cursor: pointer;
}

.btn:hover {
	transform: scale(1.1);
}

[data-testid='tracklist-row'] .btn {
	position: absolute;
	top: 50%;
	right: 100%;
	margin-top: -20px;
	margin-right: 10px;
}

`;

document.body.appendChild( style );

function animate() {

	const tracks = document.querySelectorAll( '[data-testid="tracklist-row"]' );

	for ( let i = 0; i < tracks.length; i ++ ) {

		const track = tracks[ i ];

		if ( ! track.hasButton ) {

			addButton( track ).onclick = function () {

				const btn = track.querySelector( '[data-testid="more-button"]' );

				btn.click();

				const highlight = document.querySelector( '#context-menu a[href*="highlight"]' ).href.match( /highlight=(.+)/ )[ 1 ];

				document.dispatchEvent( new MouseEvent( 'mousedown' ) );

				const url = 'https://open.' + highlight.replace( ':', '.com/' ).replace( ':', '/' );

				download( url );

			}

		}

	}

	const actionBarRow = document.querySelector( '[data-testid="action-bar-row"]:last-of-type' );

	if ( actionBarRow && ! actionBarRow.hasButton ) {

		addButton( actionBarRow ).onclick = function () {

			download( window.location.href );

		}

	}

}

function download( link ) {

	window.open( 'https://spotify-downloader.com/?link=' + link, '_blank' );

}

function addButton( el ) {

	const button = document.createElement( 'button' );

	button.className = 'btn';

	el.appendChild( button );

	el.hasButton = true;

	return button;

}

setInterval( animate, 1000 );

// Modificacion Pantalla Para La Website De Movil No Se Refresque

(function () {
    'use strict';
    let _scr = {};
    for (const key in window.screen) {
        _scr[key] = window.screen[key];
    }
    Object.setPrototypeOf(_scr, Object.getPrototypeOf(window.screen));

    _scr.width = 1080;
    _scr.height = 1920;

    window.screen = _scr;
})();