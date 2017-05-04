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
      gaCollect('start', 'checklist-from-list', 'failed');
      alert('No cards are open.');
      return false;
    }

    addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

    var token = $.cookie('token');

    var idCard = parts[1];
    var idChecklist = null;
    var fromIdBoard = null;
    var fromIdList = null;
    var fromCards = [];

    // member info with all board with lists
    // var batchUrl = '/1/batch/?urls=' +
    // '/1/members/me?boards=open&board_fields=name&board_lists=open' +
    // ',' +
    // '/1/cards/' + idCard + '?fields=idList&checklists=all';
    //
    // $.get(batchUrl)
    // .success(function(json) {
    //
    // });

    // current member info with all board with lists
    $.get('/1/members/me', { boards: 'open', board_fields: 'name', board_lists: 'open' })
    .success(function(jsonMe) {

      // current card info with all checklists
      $.get('/1/cards/' + idCard, { fields: 'idList,idBoard', checklists: 'all' })
      .success(function(jsonCard) {

        var boardsSelector = '<select id="swal-board" class="swal2-input">';
        boardsSelector += '<option value="none">---</option>';
        boardsSelector += '</select>';

        var listsSelector = '<select id="swal-list" class="swal2-input">';
        listsSelector += '<option value="none">---</option>';
        listsSelector += '</select>';

        var checklistsSelector = '<select id="swal-checklist" class="swal2-input">';
        checklistsSelector += '<option value="none">---</option>';
        checklistsSelector += '</select>';

        swal({
          title: 'Fill checklist',
          confirmButtonText: '🚀 Go!',
          html:
            '🗃 Select Board' +
            boardsSelector +
            '🗃 Select List' +
            listsSelector +
            '🗃 Checklist to fill' +
            checklistsSelector,
          preConfirm: function () {
            return new Promise(function (resolve) {
              resolve([
                $('#swal-board').val(),
                $('#swal-list').val(),
                $('#swal-checklist').val()
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

            var currentBoard = jsonMe.boards.find(function(_) { return _.id === jsonCard.idBoard });

            var checklists = jsonCard.checklists;
            checklists.sort(function(a, b) {
                                return a.pos - b.pos;
                              });

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

            defaultOptions = checklists.map(function(_) {
                                return '<option value="' + _.id + '">' + _.name + '</option>';
                              });
            $('#swal-checklist').html(defaultOptions.join());

          }
        }).then(function (result) {

          fromIdBoard = result[0];
          fromIdList = result[1];
          idChecklist = result[2];

          $.get('/1/lists/' + fromIdList, { cards: 'open' })
          .success(function(jsonList) {
            var cards = jsonList.cards;

            for (var i = 0; i < cards.length; i++) {
              var card = cards[i];
              fromCards.push(card);
            }

            console.log("STEP 3: fromCards: " + JSON.stringify(fromCards) );

            createNextItem();

          });

        });

      });

    });

    var createNextItem = function() {
      if(fromCards.length == 0) {
        return false;
      }
      var card = fromCards.shift();

      var name = card.url;

      $.post('/1/checklists/' + idChecklist + '/checkItems', {
        token: token,
        name: name,
        pos: 'bottom'
      })
      .success(function(response){

        console.log("STEP 4: createNextItem: " + name );

        createNextItem();

      });

    };

  };

  start();

})();
