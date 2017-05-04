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


  function searchCardFromBoard (jsonBoard, urlCard, sb){
    for (var i = 0; i < jsonBoard.length; i++) {
            var c = jsonBoard[i];
            
            var desc = c.desc;
            //Find card url in description
            if( desc.indexOf(urlCard)>-1){
              sb.push('<a href="$url$">$name$</a><br/>'.replace('$name$', c.name).replace('$url$', c.url));
            }

            //Find card url in checklists items
            for (var j = 0; j < c.checklists.length; j++) {
              var checkItems = c.checklists[j].checkItems;
              for (var k = 0; k < checkItems.length ; k++) {
                var checkItem = checkItems[k];
                if( checkItem.name.indexOf(urlCard)>-1){
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

  var start = function() {

    var parts = /\/b\/([^/]+)/.exec(document.location);

    if(!parts) {
      gaCollect('start', 'excel-export-file', 'failed');
      alert('Your not on Trello board.');
      return false;
    }

    addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.13/jszip.js');
    addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.13/xlsx.js');

    addRequireScript('https://ucaya.github.io/trello-bookmarklets/excel-export-file/excelplus-2.5.js');


    var idBoard = parts[1];
    var nameBoard = parts[2];
    var sb = [];

    gaCollect('start', 'excel-export-file', 'success');
    console.log('STEP 1: idBoard: ' + idBoard);

$.get('/1/boards/' + idBoard + '/cards', { cards: 'open', card_fields: 'url,name,labels,list' })
    .success(function(jsonBoard){

      
      
      var fileSelector = '<input type="button" id="file-object">';
      
      swal({
        type: 'question',
        title: 'Export excel to file',
        confirmButtonText: 'Go!',
        html:
          'Excel file?' + fileSelector ,
        preConfirm: function () {
          return new Promise(function (resolve) {
            resolve([
              $('#file-object').val(),
            ])
          })
        },
        onOpen: function () {
          $('#file-object').focus()
        }
      }).then(function (result){
        
        var idBoardQA = result[0];
        
       var ep=new ExcelPlus();
	
      ep.openLocal({
      "flashPath":"/js/excelplus/2.4/swfobject/",
      "labelButton":"Open an Excel file"
    },function() {

    var datasSheet = ep.createSheet("Datas");

  var line = 1;
  datasSheet.write({ "cell":"A" + line, "content":"List" });
  datasSheet.write({ "cell":"B" + line, "content":"Title" });
  datasSheet.write({ "cell":"C" + line, "content":"Points" });
  datasSheet.write({ "cell":"D" + line, "content":"Due" });
  datasSheet.write({ "cell":"E" + line, "content":"Members" });
  datasSheet.write({ "cell":"F" + line, "content":"Labels" });
  datasSheet.write({ "cell":"G" + line, "content":"Card #" });
  datasSheet.write({ "cell":"H" + line, "content":"Card URL"});
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    line++;
    datasSheet.write({ "cell":"A" + line, "content":"List" });
  datasSheet.write({ "cell":"B" + line, "content":"Title" });
  datasSheet.write({ "cell":"C" + line, "content":"Points" });
  datasSheet.write({ "cell":"D" + line, "content":"Due" });
  datasSheet.write({ "cell":"E" + line, "content":"Members" });
  datasSheet.write({ "cell":"F" + line, "content":"Labels" });
  datasSheet.write({ "cell":"G" + line, "content":"Card #" });
  datasSheet.write({ "cell":"H" + line, "content":"Card URL"});
    
  }

    .write({ "cell":"A1", "content":"A1" })
    .write({ "sheet":"Datas", "cell":"D1", "content":new Date() });
  try {
    ep.saveAs(nameBoard + ".xlsx");
  } catch(e) {
  }

   
  
      
    
    
        
      console.log('STEP END: excel-export-file');
      
        swal({
          type: 'success',
          title: 'Excel export to file',
          text:"Export completed !",
          confirmButtonText: 'OK',
          showCancelButton: false
        }).then(function (result) {

          });
      });

        }).catch(swal.noop)
 });  

  };
  
  start();

})();
