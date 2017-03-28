# trello-bookmarklets

Bookmarklets for Trello

Just drag link to your bookmarks bar

### Bookmarklets
#### checklist-from-list

Fill checklist in Card from List

[Trello: Fill checklist](javascript:void%20function(){(function(){var%20o=$.cookie(%22token%22),e=/\/c\/([^\/]+)/.exec(document.location);if(!e)return%20alert(%22No%20cards%20are%20open.%22),!1;var%20t=e[1],s=null,c=null,n=null,r=[];$.get(%22/1/cards/%22+t,{fields:%22idList%22,checklists:%22all%22}).success(function(e){for(var%20t=(e.idList,e.checklists),i=0;i%3Ct.length;i++){var%20l=t[i];if(0===l.name.indexOf(%22%23%22)){s=l.id;var%20a=l.name.split(%22%20%22);try{c=a[1],n=a[2]}catch(f){console.log(%22STEP%201:%20No%20checklist%20to%20fill%22)}console.log(%22STEP%201:%20fromBoardId:%20%22+c+%22%20fromListName:%20%22+n);break}}if(!c%26%26!n)return%20alert(%22No%20checklist%20to%20fill.%22),!1;$.get(%22/1/boards/%22+c+%22/lists%22,{}).success(function(o){for(var%20e=o,t=0;t%3Ce.length;t++){var%20s=e[t];if(s.name===n){n=s.id,console.log(%22STEP%202:%20fromListId:%20%22+n);break}}$.get(%22/1/boards/%22+c+%22/cards%22,{}).success(function(o){for(var%20e=o,t=0;t%3Ce.length;t++){var%20s=e[t];s.idList===n%26%26r.push(s)}console.log(%22STEP%203:%20fromCards:%20%22+JSON.stringify(r)),u()})});var%20u=function(){if(0==r.length)return!1;var%20e=r.shift(),t=e.url;$.post(%22/1/checklists/%22+s+%22/checkItems%22,{token:o,name:t,pos:%22bottom%22}).success(function(o){console.log(%22STEP%204:%20createNextItem:%20%22+t),u()})}})})()}();)

How to : Open card, name your Checklist "# {idBoard} {listName}"
![trello-bookmarklets-checklist-from-list-101.gif](assets/trello-bookmarklets-checklist-from-list-101.gif)

#### toggle-checklist

Toggle checklist on Card

[Trello: Toggle checklist](javascript:(function(){$.cookie(%22token%22);if(!/\/c\/([^\/]+)/.exec(document.location))return%20alert(%22No%20cards%20are%20open.%22),!1;var%20e=function(){window.toggleChecklistIsCollapse%3F($(%22.checklist%22).removeClass(%22utp-is-collapse%22),window.toggleChecklistIsCollapse=!1):($(%22.checklist%22).addClass(%22utp-is-collapse%22),window.toggleChecklistIsCollapse=!0)},t=function(){$(this).toggleClass(%22utp-is-collapse%22)},l=window.toggleChecklistInit,c=$(%22%23trello-toggle-checklist-button%22);if(!l){var%20o=document.createElement(%22style%22),i=document.createTextNode(%22.checklist.utp-is-collapse%20.checklist-items-list%20{%20display:%20none%20}%22);o.appendChild(i),i=document.createTextNode(%22.checklist.utp-is-collapse%20.window-module-title-icon%20{%20color:%20red%20}%22),o.appendChild(i);document.getElementsByTagName(%22head%22)[0].appendChild(o),$(%22.checklist-list%22).before('%3Ca%20id=%22trello-toggle-checklist-button%22%20class=%22quiet%22%20href=%22%23%22%3EToggle%20checklists%3C/a%3E'),c=$(%22%23trello-toggle-checklist-button%22),c.click(e),$(%22.checklist%22).click(t),window.toggleChecklistInit=!0}e()})();)

How to : Open card, then you can toggle all checklists or just one when you click on it

### Thanks

Thanks to [@chriszarate](https://github.com/chriszarate) for [https://github.com/chriszarate/bookmarkleter](https://github.com/chriszarate/bookmarkleter)
