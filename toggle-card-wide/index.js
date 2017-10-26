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

  function gaCollect(action, label, value) {

    var img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.src = 'https://www.google-analytics.com/collect?v=1&t=event&tid=UA-2711526-12&cid=555&ec=trello-bookmarklets' +
              '&ea=' + action + '&el=' + label + '&ev=' + value;
    img.onload = img.onreadystatechange = function() {
                                                    var state = this.readyState;
                                                    state && "loaded" !== state && "complete" !== state || img.parentNode.removeChild(img);
                                                }
    document.body.appendChild(img);
  }

  var start = function() {

    var parts = /\/c\/([^/]+)/.exec(document.location);

    if(!parts) {
      gaCollect('start', 'toggle-card-wide', 'failed');
      alert('No cards are open.');
      return false;
    }

    gaCollect('start', 'toggle-card-wide', 'success');
    var h = document.getElementsByTagName('head');
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
      
      h[0].appendChild(style);
    }
  };

  start();

})();
