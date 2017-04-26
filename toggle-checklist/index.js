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

  var start = function() {

    var parts = /\/c\/([^/]+)/.exec(document.location);

    if(!parts) {
      gaCollect('start', 'toggle-checklist', 'failed');
      alert('No cards are open.');
      return false;
    }

    gaCollect('start', 'toggle-checklist', 'success');
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
