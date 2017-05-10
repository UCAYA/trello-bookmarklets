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
    
  
  function fillLine(datasSheet, line, cellA, cellB, cellC, cellD, cellE, cellF, cellG, cellH, cellI, isHeader){
    datasSheet.cell("A" + line).value(cellA);
    datasSheet.cell("B" + line).value(cellB);
    datasSheet.cell("C" + line).value(cellC);
    datasSheet.cell("D" + line).value(cellD);
    datasSheet.cell("E" + line).value(cellE);
    datasSheet.cell("F" + line).value(cellF);
    datasSheet.cell("G" + line).value(cellG);
    datasSheet.cell("H" + line).value(cellH);
    datasSheet.cell("I" + line).value(cellI);
    
    if(isHeader)
      datasSheet.range("A1", "I1").style('fontColor','ffffff').style('fill','a5a5a5');
    
  }
  
  function setCardsCount(){
    var selLists = $('#swal-list').val();
                      var count = 0;
                      if(selLists){
                        for (var i = 0; i < selLists.length; i++) {
                          count += lists[selLists[i]];
                        }
                      }
                      if(count==0)
                        $("#cards-count").html("Select Lists");
                      else
                        $("#cards-count").html(count+" cards selected in " + selLists.length + " lists");
  }
  
  function fillExcelFile(selectedLists, workbook, jsonBoard){
    
    var datasSheet = workbook.sheet("Datas");
    //workbook.sheet(0).cell("A1").value("This was created in the browser!").style("fontColor", "ff0000");                  

    if(!datasSheet)
      datasSheet = workbook.addSheet("Datas");
    
    datasSheet.range("A1", "I1000").clear();

    
    var line = 1;
    fillLine(datasSheet, line, "List", "Title", "Description","Points", "Due","Members", "Labels", "Card #","Card URL", true);

    var members = {};
    for (var i = 0; i < jsonBoard.members.length; i++) {
      var m =  jsonBoard.members[i];
      members[m.id]=m.fullName;
    }
    
    
    for (var i = 0; i < jsonBoard.lists.length; i++) {

        var list = jsonBoard.lists[i];
        if( selectedLists.indexOf(list.id)>-1){
          for (var k = 0; k < jsonBoard.cards.length; k++) {

            var card = jsonBoard.cards[k];
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
            var cardMembers = "";
            for (var j = 0; j < card.idMembers.length; j++) {
                if (cardMembers)
                    cardMembers += ',';
                cardMembers += members[card.idMembers[j]];
            }
            
            line++;
            fillLine(datasSheet, line, list.name , title , card.desc ,points ? points : 0 , card.due ? card.due : "",cardMembers, labels, line - 1,card.url );

        }
      }
    }
    
  }
  
  function getWorkbook(isNewFile, file) {
        if (isNewFile) {
            return XlsxPopulate.fromBlankAsync();
        } else {
            if (!file) return Promise.reject("You must select a file.");
            return XlsxPopulate.fromDataAsync(file);
        }
    }
  
  function generate(type,isNewFile, file, lists, jsonBoard) {
        return getWorkbook(isNewFile, file)
            .then(function (workbook) {
          
                fillExcelFile(lists, workbook, jsonBoard);
                return workbook.outputAsync(type);
            })
    }
  
  function generateBase64(isNewFile, file, fileName, lists, jsonBoard) {
        return generate("base64",isNewFile, file, lists, jsonBoard)
            .then(function (base64) {
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    throw new Error("Navigating to data URI is not supported in IE.");
                } else {
                  var href = "data:" + XlsxPopulate.MIME_TYPE + ";base64," + base64;
                  var link = document.createElement('a');
                  link.download = fileName;
                  link.href = href;
                  link.text = fileName;
                  //link.click();  
                  $("#swal2-content").append(link);
                }
            })
            .catch(function (err) {
                alert(err.message || err);
                throw err;
            });
    }
  
  var lists = {}; 
  var scripts =['https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js',
                'https://gitcdn.xyz/cdn/dtjohnson/xlsx-populate/692280664d3f32feb591392143e63859b9994c96/browser/xlsx-populate.js'];
                    
  
    var start = function () {

        var parts = /\/b\/([^/]+)/.exec(document.location);

        if (!parts) {
            gaCollect('start', 'export-excel-file', 'failed');
            alert('Your not on Trello board.');
            return false;
        }

        addRequireCss('https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css');
          

        var idBoard = parts[1];
        var sb = [];

        gaCollect('start', 'export-excel-file', 'success');
        console.log('STEP 1: idBoard: ' + idBoard);


      $.get('/1/boards/' + idBoard, { cards: 'open', card_fields: 'url,name,labels,desc,due,idList,idMembers', lists : 'open', list_fields : 'name,cards',  membership_member:true, membership_members_fields:'fullName', members :'all' })
        .success(function (jsonBoard) {

        
        
          var listsSelector = '<select id="swal-list" class="swal2-input" multiple style="height:80px">';
          
          for (var i = 0; i < jsonBoard.lists.length; i++) {
              var l = jsonBoard.lists[i];       
              lists[l.id]=0;
              listsSelector  += '<option value="' + l.id + '" selected="selected">' + l.name + '  </option>';
            }
        
        for (var i = 0; i < jsonBoard.cards.length; i++) {
            var c = jsonBoard.cards[i];
            if(!lists[c.idList])
              lists[c.idList]=0;
            lists[c.idList]++;
        }

            listsSelector  += '</select>';
        
            var fileButton = '<input type="file" id="file-input" style="display: inline" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">';
            
            var radioButtonNewFile = '<div class="radio" style="text-align:left"><label style="display:inline;margin-right:4px;font-weight:400;font-size:14px"><input id="radio-local" type="radio" name="source">&nbsp;New file:</label><input disabled="disabled" id="fileName-input" class="form-control" style="display: inline; width: 260px" type="text" value=""></div>';
            var radioButtonSelectFile ='<div class="radio" style="text-align:left"><label style="display:inline;margin-right:4px;"><input type="radio" id="radio-select-file" name="source" checked="ckeched"></label>'+fileButton+'</div>';

            swal({
                title: 'Export cards to excel file',
                confirmButtonText: 'Export',
                cancelButtonText: 'Close',
                showCancelButton: true,
                html:
                  '<br/><span id="cards-count"></span>' + listsSelector + "<br/>" + 'Select Excel file<br/><br/>' + radioButtonSelectFile + radioButtonNewFile,
                preConfirm: function () {
                    return new Promise(function (resolve, reject) {
                        var selectedLists = $('#swal-list').val();
                        var selectedFile = $('#file-input')[0].files[0];
                        var localFile = $("#radio-local")[0];
                        var fileName = $("#fileName-input").val();
                      
                        if(!selectedLists || selectedLists.length == 0)
                          reject('Please select at least one list');
                        else if(!selectedFile && !localFile.checked)
                          reject('Please choose an Excel file');
                        else if (localFile.checked && !fileName)
                          reject('Filename is required');
                        else
                          resolve([
                            selectedLists,
                            selectedFile,
                            localFile.checked,
                            fileName
                        ])
                    })
                },
                onOpen: function () {

                    setCardsCount();
                  $('#swal-list').change(function() {
                    setCardsCount();
                  });
                  
                  $('#radio-select-file').change(function() {
                    if( this.checked){
                      $("#fileName-input").attr("disabled","disabled");
                    }
                  });
                  
                  $('#radio-local').change(function() {
                      if( this.checked){
                        $("#fileName-input").removeAttr("disabled");
                        $("#fileName-input").focus();
                      }
                  });
                  
                  $("input[type='radio']").css({ marginLeft : '4px'});
                  $('#swal-list').focus();
                }
            }).then(function (result) {
              
              var lists = result[0];
              var file = result[1];
              var isNewFile = result[2];
              var fileName = result[3];
              
              if( !isNewFile)
                fileName = new Date().toISOString().slice(0,10).replace(/-/g,"") + "-"+jsonBoard.name+"-Export.xlsx";
              else if(!fileName.endsWith('.xlsx',fileName.length))
                fileName += ".xlsx";
              
              Promise = XlsxPopulate.Promise;
              generateBase64(isNewFile, file, fileName, lists, jsonBoard);
              
              
               swal({
                type : 'success',
                title: 'Export completed',
                confirmButtonText: 'Close',
                html:'<br/>'
              });
                   
            })
            //.catch(swal.noop)



        });
    };

    //start();
  loadScripts(scripts);

})();

