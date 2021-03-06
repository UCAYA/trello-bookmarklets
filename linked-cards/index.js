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

  function searchCardFromBoard (jsonBoard, urlCard, idCard, sb){
	  
    for (var i = 0; i < jsonBoard.length; i++) {
            var c = jsonBoard[i];
            
            var desc = c.desc;
            //Find card url in description
            if( desc.indexOf(urlCard)>-1 || desc.indexOf("/"+ idCard +"/")>-1 ){
              sb.push('<a href="$url$">$name$</a><br/>'.replace('$name$', c.name).replace('$url$', c.url));
            }

            //Find card url in checklists items
            for (var j = 0; j < c.checklists.length; j++) {
              var checkItems = c.checklists[j].checkItems;
              for (var k = 0; k < checkItems.length ; k++) {
                var checkItem = checkItems[k];
                if( checkItem.name.indexOf(urlCard)>-1 || checkItem.name.indexOf("/"+ idCard +"/")>-1 ){
                  sb.push('<a href="$url$" target="_blank">$name$</a><br/>'.replace('$name$', c.name).replace('$url$', c.url));
                }
              }
            }

            //Find card url in attachments 
            //TO DO
        }
  } 

  function searchUrlFromString(data, regExp, allUrls, listIdCards ){
      var urlMatches = data.match(regExp);
      if(urlMatches){
        for (var i = 0; i < urlMatches.length; i++) {
          var infos = urlMatches[i].split('/');
          //var name = infos[infos.length-1];
          if( !allUrls[urlMatches[i]]){
            allUrls[urlMatches[i]] = 1;
            listIdCards.push(infos[infos.length-2]);
          }
        }
      }
  }

  var bookletName = 'trello-bookmarklets_linked-cards';
  
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
      gaCollect('start', 'linked-cards failed (No cards are open.)', 0);
      alert('No cards are open.');
      return false;
    }

    addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

    var idCard = parts[1];
    var sbLinkedCards = [];
    var sbUrlCards = [];
    var sbIdCards = [];
    var sbLinkedQACards = [];
    var allUrls = {};
    var urlRegExp = /https:\/\/trello.com\/c\/[\w.,@?^=%&:\/~+#-]*[\w.,@?^=%&\/~+#-]/g;

    gaCollect('start', 'linked-cards success', 1);
      console.log('STEP 1: idCard: ' + idCard);

$.get('/1/cards/' + idCard, { fields: 'idBoard,name,desc,url,checklists', checklists: 'all' })
.success(function(jsonCard){

	$.get('/1/members/me', { boards: 'open', board_fields: 'name', board_lists: 'open' })
    //$.get('/1/organizations/56d59f14e50d6ef4dcfb8dbd/boards')
    .success(function(jsonMe){
    
    var boardsSelector = '<select id="swal-board" class="swal2-input">';
      for (var i = 0; i < jsonMe.boards.length; i++) {
        var b = jsonMe.boards[i];
        if( b.name.indexOf("QA")>-1){
        //var selectedAttr = l.name.toLowerCase() === 'done' ? 'selected="selected"' : '';
          boardsSelector += '<option value="' + b.id + '" >' + b.name + '</option>';
        }
      }
      boardsSelector += '</select>';
      swal({
        type: 'question',
        title: 'Linked cards',
        confirmButtonText: 'Go!',
        html:
          'QA Board?' + boardsSelector ,
        preConfirm: function () {
          return new Promise(function (resolve) {
            resolve([
              $('#swal-board').val(),
            ])
          })
        },
        onOpen: function () {
          $('#swal-board').focus()
        }
      }).then(function (result){
        
        var idBoardQA = result[0];
        
      $.get('/1/boards/' + idBoardQA + '/cards', { cards: 'open', card_fields: 'url,name,labels,desc,checklists', checklists: 'all' })
      .success(function(jsonBoardQA){

      var urlCard = jsonCard.url;
      var idBoard = jsonCard.idBoard;

      //Find cards url in current  card description
      var descCard = jsonCard.desc;
      searchUrlFromString(descCard, urlRegExp, allUrls, sbIdCards );

      //Find cards url in current card checklists items
      for (var j = 0; j < jsonCard.checklists.length; j++) {
        var checkItems = jsonCard.checklists[j].checkItems;
        for (var k = 0; k < checkItems.length ; k++) {
          searchUrlFromString(checkItems[k].name, urlRegExp, allUrls, sbIdCards );
        }
      }

      console.log('STEP 2: idBoard: ' + idBoard);
      
      
      //Create batch url to get cards name
      var batchCardsUrl = '';
      for (var i = 0; i < sbIdCards.length; i++) {
          if(batchCardsUrl)
            batchCardsUrl+=",";
          batchCardsUrl+= "/cards/"+sbIdCards[i];
      }

	  if(!batchCardsUrl)
		  batchCardsUrl = "/cards/" + idCard;
	  

    $.get('/1/batch?urls=' + batchCardsUrl)
      .success(function(jsonCards){

        for (var i = 0; i < sbIdCards.length; i++) {
          var card = jsonCards[i]["200"];
          sbUrlCards.push('<a href="$url$" >$name$</a><br/>'.replace('$name$', card.name).replace('$url$', card.url));
        }
     
      
    
    $.get('/1/boards/' + idBoard + '/cards', { cards: 'open', card_fields: 'url,name,labels,desc,checklists', checklists: 'all' })
      .success(function(jsonBoard){

        searchCardFromBoard (jsonBoard, urlCard, idCard, sbLinkedCards);
        searchCardFromBoard (jsonBoardQA, urlCard, idCard, sbLinkedQACards);
    
      
      console.log('STEP END: linked-cards');

      var htmlUrlCards = sbUrlCards.length>0 ? '<div style="text-align:left"><p>Referenced cards</p>'+ sbUrlCards.join('\n') +'</div>' : '';
      var htmlLinkedCards = sbLinkedCards.length>0 ? '<div style="text-align:left"><p>Referenced by</p>'+ sbLinkedCards.join('\n') +'</div>' : '';
      var htmlLinkedQACards = sbLinkedQACards.length>0 ? '<div style="text-align:left"><p>QA cards</p>'+ sbLinkedQACards.join('\n') +'</div>' : '';
      
      var htmlContent = htmlUrlCards;

      if( htmlContent && htmlLinkedCards )
        htmlContent += "<br/>" + htmlLinkedCards;
      else if( htmlLinkedCards )
        htmlContent = htmlLinkedCards;

      if( htmlContent && htmlLinkedQACards )
        htmlContent += "<br/>" + htmlLinkedQACards;
      else if( htmlLinkedQACards )
        htmlContent = htmlLinkedQACards;
      

        swal({
          type: 'success',
          title: htmlContent ? 'Your card links' : 'Your card is not linked to any card',
          html:
            htmlContent,
          confirmButtonText: 'OK',
          showCancelButton: false
        }).then(function (result) {

          });
      });

      });

        }).catch(swal.noop)

      });     
    });
  });
  };
  
  start();

})();
