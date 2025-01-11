/******/ (() => {
  // webpackBootstrap
  var __webpack_exports__ = {};
  /*!**********************************!*\
  !*** ./src/js/content-script.js ***!
  \**********************************/
  chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.extensionId) {
      setTimeout(function () {
        addJSCommons(request.extensionId);
      }, 300);

      sendResponse("{ data: success}");
    } else {
      sendResponse("{ data: nothing}");
    }
  });

  function addJSCommons(extId) {
    addJS("chrome-extension://" + extId + "/assets/jspdf.js");
    addJS("chrome-extension://" + extId + "/assets/inject.js");
  }

  function addJS(path) {
    if (!checkJSFileAdded()) {
      try {
        var script = document.createElement("script");
        script.src = path;
        document.getElementsByTagName("head")[0].appendChild(script);
      } catch (error) {
        debugger;
        console.log("error", error);
      }
    }
  }

  function checkJSFileAdded(path) {
    var jssAdded = document.getElementsByTagName("script");
    for (var i = 0; i < jssAdded.length; i++) {
      if (jssAdded[i].src.includes(path)) {
        return true;
      }
    }
    return false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    addJSCommons(chrome.runtime.id);
  });
  /******/
})();

// console.log("content script loaded");
// // Gửi extension ID từ content script sang injected script
// function sendMessageToInjectedScript() {
//   window.postMessage({ type: "EXTENSION_ID", payload: chrome.runtime.id }, "*");
// }

// document.addEventListener(EVENTS.injectedScriptLoaded, (event) => {
//   sendMessageToInjectedScript();
// });
