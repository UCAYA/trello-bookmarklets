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

    var parts = /\/b\/([^/]+)/.exec(document.location);

    if(!parts) {
      gaCollect('start', 'releasenotes', 'failed');
      alert('Your not on Trello board.');
      return false;
    }

    addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

    var token = $.cookie('token');

    var idBoard = parts[1];
    var sb = [];

    var hasLabelName = function(card, labelName) {

      var hasName = function(label) {
        return label.name.toLowerCase() === labelName;
      };

      var index = card.labels && card.labels.length > 0 ? card.labels.findIndex(hasName) : -1;
      return index > -1;
    };

    var isEnhancement = function(card) {
      return hasLabelName(card, 'enhancement');
    };
    var isBug = function(card) {
      return hasLabelName(card, 'bug');
    };
    var isNew = function(card) {

      return !isBug(card) && !isEnhancement(card);

    };

    gaCollect('start', 'releasenotes', 'success');
    console.log('STEP 1: idBoard: ' + idBoard);

    $.get('/1/boards/' + idBoard + '/lists', { cards: 'open', card_fields: 'url,name,labels' })
    .success(function(json){

      var listsSelector = '<select id="swal-list" class="swal2-input">';
      for (var i = 0; i < json.length; i++) {
        var l = json[i];
        var selectedAttr = l.name.toLowerCase() === 'done' ? 'selected="selected"' : '';
        listsSelector += '<option value="' + l.name + '" ' + selectedAttr + '>' + l.name + '</option>';
      }
      listsSelector += '</select>';

      var listsMoveSelector = '<select id="swal-list-move" class="swal2-input">';
      listsMoveSelector += '<option value="none">---</option>';
      for (var i = 0; i < json.length; i++) {
        var l = json[i];
        listsMoveSelector += '<option value="' + l.name + '">' + l.name + '</option>';
      }
      listsMoveSelector += '</select>';

      swal({
        type: 'question',
        title: 'Release Notes',
        confirmButtonText: '🖨 Go!',
        html:
          '🗃 List?' +
          listsSelector +
          '📦 Version?' +
          '<input id="swal-version" class="swal2-input" placeholder="Build number">' +
          '🗃 Move all cards?' +
          listsMoveSelector,
        preConfirm: function () {
          return new Promise(function (resolve) {
            resolve([
              $('#swal-list').val(),
              $('#swal-version').val(),
              $('#swal-list-move').val()
            ])
          })
        },
        onOpen: function () {
          $('#swal-list').focus()
        }
      }).then(function (result) {

        var listName = result[0];
        var versionName = result[1];
        var listMoveName = result[2];
        console.log(listName);
        console.log(versionName);

        var list = json.find(function(_){ return _.name.toLowerCase() === listName.toLowerCase() });
        var listMove = json.find(function(_){ return _.name.toLowerCase() === listMoveName.toLowerCase() });

        if(list && listMove && list.id !== listMove.id) {
          $.post('/1/lists/' + list.id + '/moveAllCards', {
            token: token,
            idBoard: list.idBoard,
            idList: listMove.id
          })
        }

        sb.push('# 📦 ' + new Date().toLocaleString());
        sb.push('\n');
        sb.push('## ' + versionName);
        sb.push('\n');

        //find "⭐️ New"
        var cards = list.cards.filter(isNew);

        if(cards && cards.length > 0) {
          console.log('⭐️ New: ' + cards.length);

          sb.push('## ⭐️ New');

          for (var i = 0; i < cards.length; i++) {
            var c = cards[i];

            sb.push('- [$name$]($url$)'.replace('$name$', c.name).replace('$url$', c.url));

          }

          sb.push('\n');
        }

        //find "👍 Updated"
        cards = list.cards.filter(isEnhancement);

        if(cards && cards.length > 0) {
          console.log('👍 Updated: ' + cards.length);

          sb.push('## 👍 Updated');

          for (var i = 0; i < cards.length; i++) {
            var c = cards[i];

            sb.push('- [$name$]($url$)'.replace('$name$', c.name).replace('$url$', c.url));

          }

          sb.push('\n');

        }

        //find "🐛 Fixed"
        cards = list.cards.filter(isBug);

        if(cards && cards.length > 0) {
          console.log('🐛 Fixed: ' + cards.length);

          sb.push('## 🐛 Fixed');

          for (var i = 0; i < cards.length; i++) {
            var c = cards[i];

            sb.push('- [$name$]($url$)'.replace('$name$', c.name).replace('$url$', c.url));

          }

          sb.push('\n');

        }

        //⚠️ Known Issues
        sb.push('## ⚠️ Known Issues');
        sb.push('- N/A');
        sb.push('\n');

        console.log(sb);
        console.log('STEP END: releasenotes');
        //console.log(sb.join('\n'))
        //window.copy(sb.join('\n'));
        //window.prompt('Copy: ', sb.join('\n'));

        swal({
          type: 'success',
          title: 'Your Release Notes:',
          html:
            '<textarea class="releasenotes" rows="10">' +
              sb.join('\n') +
            '</textarea>',
          confirmButtonText: 'Copy to clipboard, (move) and close',
          showCancelButton: false,
          preConfirm: function () {
            return new Promise(function (resolve) {

              document.querySelector('textarea.releasenotes').select();
              document.execCommand('copy');

              resolve(document.querySelector('textarea.releasenotes').textContent)
            })
          },
        }).then(function (result) {

        });


      }).catch(swal.noop)

    });

  };

  start();

})();
