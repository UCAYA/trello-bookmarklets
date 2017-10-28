/*
       _     _      _     _      _     _      _     _      _     _
  (c).-.(c)    (c).-.(c)    (c).-.(c)    (c).-.(c)    (c).-.(c)
   / ._. \      / ._. \      / ._. \      / ._. \      / ._. \
 __\( Y )/__  __\( Y )/__  __\( Y )/__  __\( Y )/__  __\( Y )/__
(_.-/'-'\-._)(_.-/'-'\-._)(_.-/'-'\-._)(_.-/'-'\-._)(_.-/'-'\-._)
   || U ||      || C ||      || A ||      || Y ||      || A ||
 _.' `-' '._  _.' `-' '._  _.' `-' '._  _.' `-' '._  _.' `-' '._
(.-./`-'\.-.)(.-./`-'\.-.)(.-./`-'\.-.)(.-./`-'\.-.)(.-./`-'\.-.)
 `-'     `-'  `-'     `-'  `-'     `-'  `-'     `-'  `-'     `-' */
(function () {

  var bookletName = 'trello-bookmarklets_toggle-card-wide';

  function getNewUuid() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  function gaCollect(action, label, value) {

    var img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.src = 'https://www.google-analytics.com/collect?v=1&t=event&tid=UA-2711526-12' +
              '&ds=trello-bookmarklets' +
              '&dl=' + encodeURIComponent(document.location.href) +
              '&dh=' + encodeURIComponent(document.location.host) +
              '&dp=' + encodeURIComponent(document.location.pathname) +
              '&dt=' + encodeURIComponent(document.title) +
              '&ul=' + (navigator && navigator.languages ? navigator.languages[0] : navigator.language) +
              '&cid=' + (localStorage ? localStorage.getItem(bookletName + '_uid') : getNewUuid()) +
              '&ec=' + bookletName +
              '&ea=' + action + 
              '&el=' + label + 
              '&ev=' + (value ? parseInt(value) : null);
    img.onload = img.onreadystatechange = function() {
                                                    var state = this.readyState;
                                                    state && "loaded" !== state && "complete" !== state || img.parentNode.removeChild(img);
                                                }
    document.body.appendChild(img);
  }

  var start = function() {

    if (localStorage && !localStorage.getItem(bookletName + '_uid')) {
      localStorage.setItem(bookletName + '_uid', getNewUuid())
    }

    var parts = /\/c\/([^/]+)/.exec(document.location);

    if(!parts) {
      gaCollect('start', 'toggle-card-wide failed (No cards are open.)', 0);
      alert('No cards are open.');
      return false;
    }

    gaCollect('start', 'toggle-card-wide success', 1);
    var h = document.getElementsByTagName('head')[0];
    var toggleCardWideStyle = document.getElementById('toggle-card-wide-style');
    if (toggleCardWideStyle) {
      h.removeChild(toggleCardWideStyle);
    }
    else {
      var style = document.createElement('style');
      style.id = 'toggle-card-wide-style';

      var styleContent = document.createTextNode('.window-overlay .window { width: calc(100vw - 40px); }');
      style.appendChild(styleContent);
      styleContent = document.createTextNode('.window-overlay .window .window-main-col { width: calc(100% - 240px); }');
      style.appendChild(styleContent);
      
      h.appendChild(style);
    }
  };

  start();

})();
