javascript: (function(U, C, A, Y, A_, __) {

  __ = A.getElementById(U);
  __ && __.parentNode.removeChild(__);
  __ = A.createElement('script');
  __.type = 'text/javascript';
  __.async = 1;
  __.id = U;
  __.src = 'https://ucaya.github.io/trello-bookmarklets/' + U + '/index.js';
  A.getElementsByTagName('head')[0].appendChild(__);

})('toggle-checklist', window, document, getSelection ? getSelection().toString() : document.title)
