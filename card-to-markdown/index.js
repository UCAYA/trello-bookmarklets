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

  var bookletName = 'trello-bookmarklets_card-to-markdown';
  
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
      gaCollect('start', 'card-to-markdown failed (No cards are open.)', 0);
      alert('No cards are open.');
      return false;
    }

    addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

    var idCard = parts[1];
    var sb = [];

    gaCollect('start', 'card-to-markdown success', 1);
    console.log('STEP 1: idCard: ' + idCard);

    $.get('/1/cards/' + idCard, { fields: 'name,desc', checklists: 'all' })
    .success(function(json){

      sb.push('# ' + json.name);
      sb.push('\n');
      sb.push(json.desc);
      sb.push('\n');

      var checklists = json.checklists;
      checklists.sort(function(a, b) {
                          return a.pos - b.pos;
                        });

      for (var i = 0; i < checklists.length; i++) {
        var checklist = checklists[i];

        sb.push('## ' + checklist.name);

        var checkItems = checklist.checkItems;
        checkItems.sort(function(a, b) {
                            return a.pos - b.pos;
                          });

        for (var j = 0; j < checkItems.length; j++) {
          var checkItem = checkItems[j];

          sb.push('- ' + checkItem.name);

        }

        sb.push('\n');

      }

      console.log(sb);
      console.log('STEP END: card-to-markdown');
      //console.log(sb.join('\n'))
      //window.copy(sb.join('\n'));
      //window.prompt('Copy: ', sb.join('\n'));

      swal({
        type: 'success',
        title: 'Your card in markdown',
        html:
          '<textarea class="card-to-markdown" rows="10">' +
            sb.join('\n') +
          '</textarea>',
        confirmButtonText: 'Copy to clipboard and close',
        showCancelButton: false,
        preConfirm: function () {
          return new Promise(function (resolve) {

            document.querySelector('textarea.card-to-markdown').select();
            document.execCommand('copy');

            resolve(document.querySelector('textarea.card-to-markdown').textContent)
          })
        },
      }).then(function (result) {

      });

    });

  };

  start();

})();
