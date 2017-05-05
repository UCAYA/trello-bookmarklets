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
            head.appendChild(script);
        }
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
    
    

    var start = function () {

        var parts = /\/b\/([^/]+)/.exec(document.location);

        if (!parts) {
            gaCollect('start', 'excel-export-file', 'failed');
            alert('Your not on Trello board.');
            return false;
        }

        addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');

        addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js');

        addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.13/jszip.js');
        addRequireScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.9.13/xlsx.js');

        addRequireScript('https://ucaya.github.io/trello-bookmarklets/excel-export-file/excelplus-2.5.js');
        //addRequireScript('https://lyrical-thing.glitch.me/excelplus-2.5.js');

       /* script.onload =
          script.onreadystatechange = function () {
              var state = this.readyState;
              state && "loaded" !== state && "complete" !== state || tafonctionaappeler();
          }
*/

        var idBoard = parts[1];
        var sb = [];

        gaCollect('start', 'excel-export-file', 'success');
        console.log('STEP 1: idBoard: ' + idBoard);


        $.get('/1/boards/' + idBoard + '/lists', { cards: 'open', card_fields: 'url,name,labels,list,members,desc', fields: 'name' })
        .success(function (jsonLists) {

          var listsSelector = '<select id="swal-list" class="swal2-input" multiple style="height:76px">';
          var lists = {}; 
          for (var i = 0; i < jsonLists.length; i++) {
              var l = jsonLists[i];       
              lists[l.id] = l.cards.length;
              listsSelector  += '<option value="' + l.id + '" >' + l.name + '</option>';
            }

            listsSelector  += '</select>';

          
            var fileButton = '<input type="button" id="file-object" >';

            swal({
                type: 'question',
                title: 'Export excel to file',
                confirmButtonText: 'Close',
                html:
                  '<br/>Select List(s) <span id="cards-count"></span>' + listsSelector + "<br/>" + 'Select Excel file <br/><br/>' + fileButton,
                preConfirm: function () {
                    return new Promise(function (resolve) {
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
                      datasSheet.write({ "cell": "A" + line, "content": "List" });
                      datasSheet.write({ "cell": "B" + line, "content": "Title" });
                      datasSheet.write({ "cell": "C" + line, "content": "Description" });
                      datasSheet.write({ "cell": "D" + line, "content": "Points" });
                      datasSheet.write({ "cell": "E" + line, "content": "Due" });
                      datasSheet.write({ "cell": "F" + line, "content": "Members" });
                      datasSheet.write({ "cell": "G" + line, "content": "Labels" });
                      datasSheet.write({ "cell": "H" + line, "content": "Card #" });
                      datasSheet.write({ "cell": "I" + line, "content": "Card URL" });

                      for (var i = 0; i < jsonLists.length; i++) {

                          var list = jsonLists[i];
                          if( selectedLists.indexOf(list.id)>-1){
                            for (var k = 0; k < list.cards.length; k++) {

                              var card = list.cards[k];
                              var matches = card.name.match(/(\(\d+,?\d*\))/);
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
                              datasSheet.write({ "cell": "A" + line, "content": jsonLists[i].name });
                              datasSheet.write({ "cell": "B" + line, "content": title });
                              datasSheet.write({ "cell": "C" + line, "content": card.desc });
                              datasSheet.write({ "cell": "D" + line, "content": points ? points : 0 });
                              datasSheet.write({ "cell": "E" + line, "content": "" });
                              datasSheet.write({ "cell": "F" + line, "content": "" });
                              datasSheet.write({ "cell": "G" + line, "content": labels });
                              datasSheet.write({ "cell": "H" + line, "content": line - 1 });
                              datasSheet.write({ "cell": "I" + line, "content": card.url });
                          }
                          }
                      }

                      try {
                        var fileSave = ep.saveAs("devis.xlsx");
                        $("#swal2-content").html("Export completed ✔️");
                        
                      } catch (e) {

                      }
                  })
                    
                }
            }).then(function (result) {

                   
            })
            //.catch(swal.noop)



        });
    };

    start();

})();

