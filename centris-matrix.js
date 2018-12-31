// ==UserScript==
// @name         Centris Matrix
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       beaulac <https://github.com/beaulac>
// @match        https://matrix.centris.ca/Matrix/Public/Portal.aspx*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    var moreMutations = false;
    var mutationObserver = new MutationObserver(function (mutations, observer) {
        moreMutations = true;
    });

    function startObserve() {
        moreMutations = true;
        mutationObserver.observe(document, { childList: true, subtree: true });
        checkEndOfMutations();
    }

    function checkEndOfMutations() {
        if (moreMutations) {
            moreMutations = false;
            setTimeout(checkEndOfMutations, 5);
        } else {
            mutationObserver.disconnect();
            createLinkIfNecessary();
        }
    }

    var originalFn = PortalResultsJs.onDisplaysFullyLoaded;
    PortalResultsJs.onDisplaysFullyLoaded = function patched() {
        startObserve();
        originalFn.apply(PortalResultsJs, arguments);
    };


    var currentId = '';

    function createLink() {
        createCentrisLink(currentId);
    }

    function createLinkIfNecessary() {
        var hasCloseButton = document.querySelector('#_ctl0_m_btnClosePILP');

        if (hasCloseButton && !document.getElementById(currentId)) {
            currentId = buildButtonId();
            createLink();
        }
    }

    function createCentrisLink(id) {
        var centrisURL = buildCentrisURL();

        if (centrisURL) {
            var pagingContainer = document.getElementById('_ctl0_m_divPagingContainer');

            var btnContainer = document.createElement('div');
            btnContainer.classList.add('col-xs-auto');

            var btn = document.createElement('a');
            btn.setAttribute('id', id);
            btn.setAttribute('href', centrisURL);
            btn.setAttribute('target', '_blank');
            btn.classList.add('btn', 'mtx-btn-brand');
            btn.innerText = 'View on Centris';

            btnContainer.appendChild(btn);

            pagingContainer.after(btnContainer);
        }

    }

    function buildCentrisURL() {
        var photoLinkNode = document.querySelector('#wrapperTable > .row:nth-child(2) .formula [href]');

        if (photoLinkNode) {
            var photoURL = photoLinkNode.getAttribute('href');

            // URL is /{LANG}/{properties}/{ID}/photos...
            return photoURL.slice(0, photoURL.lastIndexOf('/'));
        }
    }

    function buildButtonId() {
        return 'linkOut-' + Date.now();
    }

})();
