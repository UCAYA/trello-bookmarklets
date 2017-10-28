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

  var toggleChecklists = function() {
    if(window.toggleChecklistIsCollapse) {
      $('.checklist').removeClass('utp-is-collapse');
      window.toggleChecklistIsCollapse = false;
    }
    else {
      $('.checklist').addClass('utp-is-collapse');
      window.toggleChecklistIsCollapse = true;
    }
  };

  var toggleChecklist = function() {
    var checklist = $(this);
    checklist.toggleClass('utp-is-collapse');
  };

  var bookletName = 'trello-bookmarklets_toggle-checklist';
  
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
              '&ev=' + value;
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
      gaCollect('start', 'toggle-checklist failed (No cards are open.)', 0);
      alert('No cards are open.');
      return false;
    }

    gaCollect('start', 'toggle-checklist success', 1);
    var toggleButton = $('#trello-toggle-checklist-button');

    if(!window.toggleChecklistInit) {
      var style = document.createElement('style');
      var styleContent = document.createTextNode('.checklist.utp-is-collapse .checklist-items-list { display: none }');
      style.appendChild(styleContent);
      styleContent = document.createTextNode('.checklist.utp-is-collapse .window-module-title-icon { color: #7E2256 }');
      style.appendChild(styleContent);
      var h = document.getElementsByTagName('head');
      h[0].appendChild(style);

      $('.checklist-list').before('<a id="trello-toggle-checklist-button" class="quiet" href="#">Toggle checklists</a>');
      toggleButton = $('#trello-toggle-checklist-button');
      toggleButton.click(toggleChecklists);

      $('.checklist').click(toggleChecklist);

      window.toggleChecklistInit = true;
    }

    toggleChecklists();

  };

  start();

})();
