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

  var start = function() {

    var parts = /\/c\/([^/]+)/.exec(document.location);

    if(!parts) {
      gaCollect('start', 'checklist-from-list', 'failed');
      alert('No cards are open.');
      return false;
    }

    var token = $.cookie('token');

    var idCard = parts[1];
    var idChecklist = null;
    var fromBoardId = null;
    var fromList = null;
    var fromCards = [];

  	$.get('/1/cards/' + idCard, { fields: 'idList', checklists: 'all' })
  	.success(function(json){
  		var idList = json.idList;
  		var checklists = json.checklists;

      for (var i = 0; i < checklists.length; i++) {
        var checklist = checklists[i];

        if(checklist.name.indexOf('#') === 0) {
          idChecklist = checklist.id;
          var froms = checklist.name.split(' ');

          try {
            fromBoardId = froms[1];
            fromList = froms[2];
          }
          catch(e) {
            console.log("STEP 1: No checklist to fill");
          }
          gaCollect('start', 'checklist-from-list', 'success');
          console.log("STEP 1: fromBoardId: " + fromBoardId + " fromListName: " + fromList );
          break;
        }
      }

      if(!fromBoardId && !fromList) {
        alert('No checklist to fill.');
    		return false;
      }

      $.get('/1/boards/' + fromBoardId + '/lists', { })
      .success(function(json){
        var lists = json;

        for (var i = 0; i < lists.length; i++) {
          var list = lists[i];

          if(list.name === fromList) {

            fromList = list.id
            console.log("STEP 2: fromListId: " + fromList );
            break;
          }
        }

        $.get('/1/boards/' + fromBoardId + '/cards', { })
        .success(function(json){
          var cards = json;

          for (var i = 0; i < cards.length; i++) {
            var card = cards[i];

            if(card.idList === fromList) {

              fromCards.push(card);

            }
          }

          console.log("STEP 3: fromCards: " + JSON.stringify(fromCards) );

          createNextItem();

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

  	});

  };

  start();

})();
