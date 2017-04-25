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

  var start = function() {

    var parts = /\/c\/([^/]+)/.exec(document.location);

    if(!parts) {
      alert('No cards are open.');
      return false;
    }

    addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

    var idCard = parts[1];
    var sb = [];

    console.log('STEP 1: idCard: ' + idCard);

    $.get('/1/cards/' + idCard, { fields: 'name,desc', checklists: 'all' })
    .success(function(json){

      sb.push('# ' + json.name);
      sb.push('\n');
      sb.push(json.desc);
      sb.push('\n');

      for (var i = 0; i < json.checklists.length; i++) {
        var checklist = json.checklists[i];

        sb.push('## ' + checklist.name);

        for (var j = 0; j < checklist.checkItems.length; j++) {
          var checkItem = checklist.checkItems[j];

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
