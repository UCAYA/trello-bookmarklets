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
        var script = Array.apply(null, document.querySelectorAll('script')).find(function (_) { return _.src === src });
        if (!script) {
            var head = document.getElementsByTagName('head')[0];
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            script.async = false;
            head.appendChild(script);
        }
    }
  
  function loadScripts(scripts){
        var script = scripts.shift();
        var head = document.getElementsByTagName('head')[0];
        var el = document.createElement( 'script');
        el.src = script;
        el.onload = function(script){
            
            if ( scripts.length ) {
                loadScripts(scripts);
            } else {
              start();               
            }
        };
        head.appendChild(el);
    }
  

    function addRequireCss(url, version) {
        var href = version ? url + '?v=' + version : url;
        var link = Array.apply(null, document.querySelectorAll('script')).find(function (_) { return _.href === href });
        if (!link) {
            var head = document.getElementsByTagName('head')[0];
            link = document.createElement('link');
            link.rel = 'stylesheet';
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
        img.onload = img.onreadystatechange = function () {
            var state = this.readyState;
            state && "loaded" !== state && "complete" !== state || img.parentNode.removeChild(img);
        }
        document.body.appendChild(img);
    }
    
  
  function fillLine(datasSheet, line, cellA, cellB, cellC, cellD, cellE, cellF, cellG, cellH, cellI){
    datasSheet.write({ "cell": "A" + line, "content": cellA });
    datasSheet.write({ "cell": "B" + line, "content": cellB });
    datasSheet.write({ "cell": "C" + line, "content": cellC });
    datasSheet.write({ "cell": "D" + line, "content": cellD });
    datasSheet.write({ "cell": "E" + line, "content": cellE });
    datasSheet.write({ "cell": "F" + line, "content": cellF });
    datasSheet.write({ "cell": "G" + line, "content": cellG });
    datasSheet.write({ "cell": "H" + line, "content": cellH });
    datasSheet.write({ "cell": "I" + line, "content": cellI });
  }
    
  var scripts =['https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js',
                     'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.13/jszip.js',
                     'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.13/xlsx.min.js',
                     'https://ucaya.github.io/trello-bookmarklets/export-excel-file/excelplus-2.5.js'];
  
    var start = function () {

        var parts = /\/b\/([^/]+)/.exec(document.location);

        if (!parts) {
            gaCollect('start', 'export-excel-file', 'failed');
            alert('Your not on Trello board.');
            return false;
        }

        addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');
        
        
      
        /*
        addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');
        addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.13/jszip.js');
        addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.13/xlsx.js');
        addRequireScript('https://lyrical-thing.glitch.me/excelplus-2.5.js');
        */

       

        var idBoard = parts[1];
        var sb = [];

        gaCollect('start', 'export-excel-file', 'success');
        console.log('STEP 1: idBoard: ' + idBoard);

      //$.get('/1/boards/' + idBoard, { cards: 'open', card_fields: 'url,name,labels,desc,due', lists : 'open', list_fields : 'name',  membership_member:true, membership_members_fields:'fullName', members :'all' })
      
      $.get('/1/boards/' + idBoard + '/lists', { cards: 'open', card_fields: 'url,name,labels,desc,due', fields: 'name' })
        .success(function (jsonLists) {

          var listsSelector = '<select id="swal-list" class="swal2-input" multiple style="height:80px">';
          var lists = {}; 
          for (var i = 0; i < jsonLists.length; i++) {
              var l = jsonLists[i];       
              lists[l.id] = l.cards.length;
              listsSelector  += '<option value="' + l.id + '" >' + l.name + '  </option>';
            }

            listsSelector  += '</select>';

            var fileButton = '<input type="button" id="file-object" >';

            swal({
                title: 'Export cards to excel file',
                confirmButtonText: 'Export',
                showCancelButton: true,
                html:
                  '<br/>Select List(s) <span id="cards-count"></span>' + listsSelector + "<br/>" + 'Select Excel file <br/><br/>' + fileButton,
                preConfirm: function () {
                    return new Promise(function (resolve, reject) {
                        var selectedLists = $('#swal-list').val();
                        var selectedFile = $('#file-object').val();
                        if(!selectedLists || selectedLists.length == 0)
                          reject('Please select at least one list');
                        else if(!selectedFile)
                          reject('Please choose an Excel file');
                        else
                          resolve([
                          $('#swal-list').val(),
                          $('#file-object').val(),
                        ])
                    })
                },
                onOpen: function () {

                    $('#swal-list').change(function() {
                      var selLists = $(this).val();
                      var count = 0;
                      if(selLists){
                        for (var i = 0; i < selLists.length; i++) {
                          count += lists[selLists[i]];
                        }
                      }
                      if(count==0)
                        $("#cards-count").html("");
                      else
                        $("#cards-count").html("("+count+" cards)");
                    });
                  
                  
                    $('#file-object').focus();
                    
                    var ep = new ExcelPlus();
                    ep.openLocal({ "flashPath1": "/js/excelplus/2.4/swfobject/", "labelButton": "Select your Excel file" },
                    function () {
                      
                      var selectedLists = $('#swal-list').val();
                      ep.deleteSheet("Datas");
                      var datasSheet = ep.createSheet("Datas");

                      var line = 1;
                      fillLine(datasSheet, line, "List", "Title", "Description","Points", "Due","Members", "Labels", "Card #","Card URL");

                      for (var i = 0; i < jsonLists.length; i++) {

                          var list = jsonLists[i];
                          if( selectedLists.indexOf(list.id)>-1){
                            for (var k = 0; k < list.cards.length; k++) {

                              var card = list.cards[k];
                              var matches = card.name.match(/^(\(\d+,?\d*\))/);
                              var points = "";
                              var title = card.name;
                              if (matches && matches.length > 0) {
                                  points = matches[0].replace("(", "").replace(")", "");
                                  title = card.name.replace(matches[0] + " ", "");
                              }
                              var labels = "";
                              for (var j = 0; j < card.labels.length; j++) {
                                  if (labels)
                                      labels += ',';
                                  labels += card.labels[j].name;
                              }

                              line++;
                              fillLine(datasSheet, line, jsonLists[i].name , title , card.desc ,points ? points : 0 , card.due ? card.due : "","", labels, line - 1,card.url );
                              
                          }
                        }
                      }

                      try {
                        var fileSave = ep.saveAs("devis.xlsx");
                        swal.clickConfirm();
                        
                      } catch (e) {

                      }
                  })
                    
                }
            }).then(function (result) {
              
               swal({
                type : 'success',
                title: 'Export cards to excel file',
                confirmButtonText: 'Close',
                html:'Export completed'
              });
                   
            })
            //.catch(swal.noop)



        });
    };

    //start();
  loadScripts(scripts);

})();

