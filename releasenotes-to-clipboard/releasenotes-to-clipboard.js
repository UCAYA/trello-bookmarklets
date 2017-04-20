javascript:(function(){
	//var token = $.cookie('token');

	var parts = /\/b\/([^/]+)/.exec(document.location);

	if(!parts) {
		alert('Your not on Trello board.');
		return false;
	}

	if(!window.releasenotesToClipboardIsInit) {
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = "sweetalert2-css";
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.css';
    link.media = 'all';
    head.appendChild(link);

		link = document.createElement('script');
    link.id = "sweetalert2-js";
    link.type = 'text/javascript';
    link.src = 'https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.0/sweetalert2.min.js';
		head.appendChild(link);

		window.releasenotesToClipboardIsInit = true;
	}

	var idBoard = parts[1];
	var sb = [];

	var hasLabelName = function(card, labelName) {

		var hasName = function(label) {
			return label.name.toLowerCase() === labelName;
		};

		var index = card.labels && card.labels.length > 0 ? card.labels.findIndex(hasName) : -1;
		return index > -1;
	};

  var isEnhancement = function(card) {
		return hasLabelName(card, 'enhancement');
	};
	var isBug = function(card) {
		return hasLabelName(card, 'bug');
	};
	var isNew = function(card) {

		return !isBug(card) && !isEnhancement(card);

	};

	console.log('STEP 1: idBoard: ' + idBoard);

	$.get('/1/boards/' + idBoard + '/lists', { cards: 'open', card_fields: 'url,name,labels' })
	.success(function(json){

	  var listName = prompt('List ?', 'Done');
	  var list = json.find(function(_){ return _.name.toLowerCase() === listName.toLowerCase() });

		sb.push('# 📦 ' + new Date().toLocaleString());
		sb.push('\n');
		sb.push('## ' + prompt('Version ?', ''));
		sb.push('\n');

		//find "⭐️ New"
		var cards = list.cards.filter(isNew);

		if(cards && cards.length > 0) {
			console.log('⭐️ New: ' + cards.length);

			sb.push('## ⭐️ New');

			for (var i = 0; i < cards.length; i++) {
				var c = cards[i];

				sb.push('- [$name$]($url$)'.replace('$name$', c.name).replace('$url$', c.url));

			}

			sb.push('\n');
		}

		//find "👍 Updated"
		cards = list.cards.filter(isEnhancement);

		if(cards && cards.length > 0) {
			console.log('👍 Updated: ' + cards.length);

			sb.push('## 👍 Updated');

			for (var i = 0; i < cards.length; i++) {
				var c = cards[i];

				sb.push('- [$name$]($url$)'.replace('$name$', c.name).replace('$url$', c.url));

			}

			sb.push('\n');

		}

		//find "🐛 Fixed"
		cards = list.cards.filter(isBug);

		if(cards && cards.length > 0) {
			console.log('🐛 Fixed: ' + cards.length);

			sb.push('## 🐛 Fixed');

			for (var i = 0; i < cards.length; i++) {
				var c = cards[i];

				sb.push('- [$name$]($url$)'.replace('$name$', c.name).replace('$url$', c.url));

			}

			sb.push('\n');

		}

		//⚠️ Known Issues
		sb.push('## ⚠️ Known Issues');
		sb.push('\n');

		console.log(sb);
		console.log('STEP END: copy to clipboard');
		//console.log(sb.join('\n'))
		//window.copy(sb.join('\n'));
		//window.prompt('Copy your Release Notes', sb.join('\n'));

	  swal({
	    title: 'All done!',
	    html:
	      'Your Release Notes:<textarea>' +
	        sb.join('\n') +
	      '</textarea>',
	    confirmButtonText: 'Lovely!',
	    showCancelButton: false
	  });

	});

})();
