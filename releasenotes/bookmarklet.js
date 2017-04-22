javascript: (function(win, name, desc) {

  var ubID = 'ub-releasenotes';
  var ubUrl = 'https://ucaya.github.io/trello-bookmarklets/releasenotes/index.js';

  var script = document.getElementById(ubID);
  if (script) {
      script.parentNode.removeChild(script);
  }

  var head  = document.getElementsByTagName('head')[0];
  script = document.createElement('script');
  script.type = 'text/javascript';
  script.id = ubID;
  script.src = ubUrl;
  script.onload = script.onreadystatechange = function() {
                                                  var state = this.readyState;
                                                  state && "loaded" !== state && "complete" !== state || win.ucayaBookmarklets.releaseNotesInit();
                                              }
  head.appendChild(script);

})(window, document.title, getSelection ? getSelection().toString() : '')
