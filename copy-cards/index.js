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
      gaCollect('start', 'copy-cards', 'failed');
      alert('Your not on Trello board.');
      return false;
    }

    addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

    var token = $.cookie('token');

    var idBoard = parts[1];
    var toIdBoard = null;
    var toIdList = null;
    var fromCards = [];

    var visibleShortLinkCards = Array.apply(null, document.querySelectorAll('.list-card:not(.hide)')).map(function (_) {
       var m = /\/c\/([^/]+)/.exec(_.href);
       return m[1];
    });

    // current member info with all board with lists
    $.get('/1/members/me', { boards: 'open', board_fields: 'name,shortLink,url', board_lists: 'open' })
    .success(function(jsonMe) {

      // current board info with all cards
      $.get('/1/boards/' + idBoard, { cards: 'open', card_fields: 'name,shortLink' })
      .success(function(jsonBoard) {

        var boardsSelector = '<select id="swal-board" class="swal2-input">';
        boardsSelector += '<option value="none">---</option>';
        boardsSelector += '</select>';

        var listsSelector = '<select id="swal-list" class="swal2-input">';
        listsSelector += '<option value="none">---</option>';
        listsSelector += '</select>';

        swal({
          title: 'Copy visible cards to:',
          confirmButtonText: '🚀 Go!',
          html:
            '🗃 Select Board' +
            boardsSelector +
            '🗃 Select List' +
            listsSelector +
            '<span>⚠️ You\'ll create ' + visibleShortLinkCards.length + ' cards</span>',
          preConfirm: function () {
            return new Promise(function (resolve) {
              resolve([
                $('#swal-board').val(),
                $('#swal-list').val()
              ])
            })
          },
          onOpen: function () {

            $('#swal-board').focus();

            $('#swal-board').on('change', function(e) {

              var val = $(this).val();
              var b = jsonMe.boards.find(function(_) { return _.id === val });
              var options = b.lists.map(function(_) {
                return '<option value="' + _.id + '">' + _.name + '</option>';
              });

              $('#swal-list').html(options.join());

            });

            var currentBoard = jsonMe.boards.find(function(_) { return _.shortLink === idBoard });


            var defaultOptions = jsonMe.boards.map(function(_) {
                                var s = _.id === currentBoard.id ? 'selected="selected"' : '';
                                return '<option value="' + _.id + '"'
                                       + s
                                       + '>' + _.name + '</option>';
                              });
            $('#swal-board').html(defaultOptions.join());

            defaultOptions = currentBoard.lists.map(function(_) {
                                return '<option value="' + _.id + '">' + _.name + '</option>';
                              });
            $('#swal-list').html(defaultOptions.join());

          }
        }).then(function (result) {

          toIdBoard = result[0];
          toIdList = result[1];

          var toBoard = jsonMe.boards.find(function(_) { return _.id === toIdBoard });

          var cards = jsonBoard.cards;

          //filter cards when only cards visible on screen
          for (var i = 0; i < visibleShortLinkCards.length; i++) {
            var cardShortLink = visibleShortLinkCards[i];
            var card = cards.find(function(_) {return _.shortLink === cardShortLink})
            if(card && card != null) {
              fromCards.push(card);
            }
          }

          console.log("STEP 3: fromCards: " + JSON.stringify(fromCards) );

          createNextItem(toBoard);

        });

      });

    });

    var createNextItem = function(board) {
      if(fromCards.length == 0) {

        swal({
          title: 'Job done!',
          type: 'success',
          html:
            'Go to board: ' +
            '<a id="copy-cards-to-board-url" href="'+ board.url +'">'+ board.name +'</a>',
          onOpen: function () {
            $('#copy-cards-to-board-url').on('click', function(e) {

              swal.close();

            });
          },
          timer: 10000
        });

        return false;
      }

      var card = fromCards.shift();

      $.post('/1/cards/', {
        token: token,
        idList: toIdList,
        idCardSource: card.id,
        keepFromSource: 'all'
      })
      .success(function(response){

        console.log("STEP 4: createNextItem: " + card.id );

        createNextItem(board);

      });

    };

  };

  start();

})();
