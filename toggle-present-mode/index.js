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

  var bookletName = 'trello-bookmarklets_toggle-present-mode';

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

  var close = function() {
    var presentModeElement = document.getElementById('toggle-present-mode-element');
    
    if (presentModeElement) {
      document.body.removeChild(presentModeElement);
    }
  };

  var navigate = function(back) {
    // var currentCard = $('.list-card[href="' + document.location.pathname + '"]');
    // if (currentCard && currentCard.length > 0) {
    //   currentCard = currentCard[0];
    //   var nextCard = back ? currentCard.previousSibling : currentCard.nextSibling;

    var cards = Array.apply(null, document.querySelectorAll('.list-card:not(.hide)'));
    var currentCardIndex = cards && cards.findIndex(function(el) { return el.href === document.location.href; });
    
    if (currentCardIndex > -1) {
      var nextIndex = back ? currentCardIndex - 1 : currentCardIndex + 1;
 
      if (nextIndex > -1 && nextIndex < cards.length) {
        cards[nextIndex].click();
      } else {
        document.querySelector('.js-close-window').click();
      }

    } else {
      var currentCard = $('.list-card:not(.hide)' + (back ? ':last' : ':first'));
      if (currentCard && currentCard.length > 0) {
        currentCard[0].click();
      }
    }
  }

  var prev = function () {
    return navigate(true);
  }
  var next = function () {
    return navigate(false);
  }

  var start = function() {

    if (localStorage && !localStorage.getItem(bookletName + '_uid')) {
      localStorage.setItem(bookletName + '_uid', getNewUuid())
    }

    var parts = /trello.com/.exec(document.location);

    if(!parts) {
      gaCollect('start', 'toggle-present-mode failed (You\'re not on Trello)', 0);
      alert('You\'re not on Trello.');
      return false;
    }

    gaCollect('start', 'toggle-present-mode success', 1);

    var presentModeElement = document.getElementById('toggle-present-mode-element');
    
    if (presentModeElement) {
      close();
    } else {
      $('.tooltip-container').after(
        '<div id="toggle-present-mode-element" style="position: fixed; display: flex; align-items: center; justify-content: center; z-index: 70; top: 0; left: 0; right: 0; height: 48px; background: linear-gradient(rgba(0,0,0,1), rgba(0,0,0,0));">' +
          '<a class="header-btn header-boards js-close" href="#">' +
            '<span class="header-btn-icon icon-lg icon-close light"></span>' + 
            '<span class="header-btn-text">Present mode </span>' +
          '</a>' +
          '<a class="header-btn js-prev" href="#"><span class="header-btn-icon icon-lg icon-back light"></span></a>' +
          '<a class="header-btn js-next" href="#"><span class="header-btn-icon icon-lg icon-move light"></span></a>' +
        '</div>'
      );
      $('#toggle-present-mode-element .js-close').click(close);
      $('#toggle-present-mode-element .js-prev').click(prev);
      $('#toggle-present-mode-element .js-next').click(next);
    }
  };

  start();

})();
