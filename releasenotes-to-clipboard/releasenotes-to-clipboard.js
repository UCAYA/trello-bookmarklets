javascript:(function(){
	//var token = $.cookie('token');

	var parts = /\/b\/([^/]+)/.exec(document.location);

	if(!parts) {
		alert('Your not on Trello board.');
		return false;
	}

	var idBoard = parts[1];
	var sb = [];

  var isEnhancement = function(card) {

		var hasEnhancementName = function(label) {
			return label.name.toLowerCase() === 'enhancement';
		};

		var index = card.labels.findIndex(hasEnhancementName);
		return index > -1;
	};

	var isBug = function(card) {

		var hasBugName = function(label) {
			return label.name.toLowerCase() === 'bug';
		};

		var index = card.labels.findIndex(hasBugName);
		return index > -1;
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

		console.log('STEP END: copy to clipboard');
		//console.log(sb.join('\n'))
		//window.copy(sb.join('\n'));
		window.prompt('Copy your Release Notes', sb.join('\n'));

	});

})();
