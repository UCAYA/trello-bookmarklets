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

  function addRequireScript(url, version) {
    var src = version ? url + '?v=' + version : url;
    var script = Array.apply(null, document.querySelectorAll('script')).find(function(_){ return _.src === src });
    if(!script) {
      var head  = document.getElementsByTagName('head')[0];
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      head.appendChild(script);
    }
  }

  function addRequireCss(url, version) {
    var href = version ? url + '?v=' + version : url;
    var link = Array.apply(null, document.querySelectorAll('script')).find(function(_){ return _.href === href });
    if(!link) {
      var head  = document.getElementsByTagName('head')[0];
      link  = document.createElement('link');
      link.rel  = 'stylesheet';
      link.type = 'text/css';
      link.href = href;
      link.media = 'all';
      head.appendChild(link);
    }
  }

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
      gaCollect('start', 'linked-cards', 'failed');
      alert('No cards are open.');
      return false;
    }

    var boards = /\/b\/([^/]+)/.exec(document.location);
     var idBoard = boards[1];

    addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

    var idCard = parts[1];
    var sb = [];

    gaCollect('start', 'linked-cards', 'success');
    console.log('STEP 1: idCard: ' + idCard);


 $.get('/1/cards/' + idCard, { fields: 'name,desc', checklists: 'all' })
    .success(function(jsonCard){

      var urlCard = jsonCard.url;

    $.get('/1/boards/' + idBoard + '/cards', { cards: 'open', card_fields: 'url,name,labels' })
      .success(function(jsonList){

        for (var i = 0; i < json.length; i++) {
            var c = jsonList[i];
            
            var desc = c.desc;
            if( desc.indexOf(urlCard)>-1){
              sb.push('<a href="$url$" target="_blank">$name$</a><br/>'.replace('$name$', c.name).replace('$url$', c.url));
            }
        }
    });


      console.log(sb);
      console.log('STEP END: linked-cards');
      //console.log(sb.join('\n'))
      //window.copy(sb.join('\n'));
      //window.prompt('Copy: ', sb.join('\n'));

      swal({
        type: 'success',
        title: 'Your card is linked with',
        html:
          '<div class="linked-card">' +
            sb.join('\n') +
          '</div>',
        confirmButtonText: 'OK',
        showCancelButton: false
      }).then(function (result) {

      });

    });

  };

  start();

})();
