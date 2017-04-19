javascript:(function(){
	//var token = $.cookie('token');

	var parts = /\/c\/([^/]+)/.exec(document.location);

	if(!parts) {
		alert('No cards are open.');
		return false;
	}

	var toggleChecklists = function() {
		if(window.toggleChecklistIsCollapse) {
			$('.checklist').removeClass('utp-is-collapse');
			window.toggleChecklistIsCollapse = false;
		}
		else {
			$('.checklist').addClass('utp-is-collapse');
			window.toggleChecklistIsCollapse = true;
		}
	};

	var toggleChecklist = function() {
		var checklist = $(this);
		checklist.toggleClass('utp-is-collapse');
	};

	var isInit = window.toggleChecklistInit;
	var toggleButton = $('#trello-toggle-checklist-button');

	if(!isInit) {
		var style = document.createElement('style');
	  var styleContent = document.createTextNode('.checklist.utp-is-collapse .checklist-items-list { display: none }');
	  style.appendChild(styleContent);
		styleContent = document.createTextNode('.checklist.utp-is-collapse .window-module-title-icon { color: red }');
	  style.appendChild(styleContent);
	  var h = document.getElementsByTagName('head');
	  h[0].appendChild(style);

		$('.checklist-list').before('<a id="trello-toggle-checklist-button" class="quiet" href="#">Toggle checklists</a>');
		toggleButton = $('#trello-toggle-checklist-button');
		toggleButton.click(toggleChecklists);

		$('.checklist').click(toggleChecklist);

		window.toggleChecklistInit = true;
	}

	toggleChecklists();

})();
