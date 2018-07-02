require([
		"jquery"
		// Add comma-separated libraries and modules manually here, for example:
		// ..."splunkjs/mvc/simplexml/urltokenmodel",
		// "splunkjs/mvc/checkboxview"
	],
	function(
		$
	) {
		$(window).scroll(function() {
            var posTop = $(window).scrollTop();
            var posBottom = $(window).scrollTop() + $(window).height();
            
            var table = $('#saCodeTable div.results-table');
            if (typeof table.offset() !== 'undefined'){
                var posTopTable = table.offset().top;
                if (posTop > posTopTable && posTop < posTopTable + table.height()) {
                    $('#saCodeTable div.results-table thead > tr > th').css({
                        'position': 'relative',
                        'z-index': 11,
                        'top': posTop - posTopTable
                    });
                } else {
                    $('#saCodeTable div.results-table thead > tr > th').css({
                        'position': 'static',
                        'top': 0
                    });
                }
            }
            table = $('#testSteps div.results-table');
            if (typeof table.offset() !== 'undefined'){
                var posTopTable = table.offset().top;
                var posBottomTable = posTopTable + table.height();
                if (posTop > posTopTable && posTop < posBottomTable) {
                    $('#testSteps div.results-table thead > tr > th').css({
                        'position': 'relative',
                        'z-index': 11,
                        'top': posTop - posTopTable
                    });
                } else {
                    $('#testSteps div.results-table thead > tr > th').css({
                        'position': 'static',
                        'top': 0
                    });
                }
            }
        });
	});
