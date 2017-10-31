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

  var bookletName = 'trello-bookmarklets_get-contact-from-email';

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
      gaCollect('start', 'get-contact-from-email failed (You\'re not on Trello card)', 0);
      alert('You\'re not on Trello card.');
      return false;
    }

    gaCollect('start', 'get-contact-from-email success', 1);
    
    var inputTitle = $('.card-detail-window .js-card-detail-title-input');
    // var inputDesc = $('.card-detail-window .js-desc-content textarea.field');
    // var aDec = $('.card-detail-window .js-desc-content a.js-edit-desc');
    // a.click();
    // input.val(md);

    var email = /.+@.+\..+/i.exec(inputTitle.val());
    if (email) {
      email = inputTitle.val();

      $.get('https://proxy-sauce.glitch.me/https://clearbit.com/demos/combined?email=' + encodeURIComponent(email))
      .success(function(json){

        var data = JSON.parse(json);

        var desc = '>Email: ' + email + '\n' +
                   'Bio: ' + data.person.bio + '\n' +
                   'Location: ' + data.person.location + '\n' +
                   'Role: ' + data.person.role + ' ' + data.person.seniority + '\n' +
                   'Company: ' + data.company.name + '\n';

        var token = $.cookie('token');
        var idCard = parts[1];
        $.ajax({
          url: '/1/cards/' + idCard, 
          method: 'PUT',
          data: {
            token: token,
            name: data.person.name,
            desc: desc
          }
        })
        .success(function(json){ 
          var card = json;

          if (data.person.avatar) {
            $.post('/1/cards/' + card.id + 'attachments', {
              token: token,
              url: data.person.avatar
            });
          }
        });

      });
    } else {
      alert('The card\'s name is not an email.');
    }

  };

  start();

})();
