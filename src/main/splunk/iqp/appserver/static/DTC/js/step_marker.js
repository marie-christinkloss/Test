//# sourceURL=DTC/js/step_marker.js

require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {
    console.debug("Executing step_marker.js");
    var defaultTokenModel = mvc.Components.getInstance('default');
	var submittedTokenModel = mvc.Components.getInstance('submitted');

	function getToken(name) {
		return defaultTokenModel.get(name);
	}

    // Row Coloring Example with custom, client-side range interpretation
    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return _(['mark', 'id', 'source', 'pruefUmfangToken', 'testStepTime']).contains(cell.field);
        },
        render: function($td, cell) {
            var value = parseInt(cell.value);
            if (cell.field === 'mark' && cell.value > 0) {
                $td.addClass('markTestStep');
            }
            $td.addClass('invisible-cell');
            $td.text(value).addClass('numeric');
        }
    });
    mvc.Components.get('testSteps').getVisualization(function(tableView) {
        tableView.on('rendered', function() {
            tableView.$el.find('td.markTestStep').parent().addClass('markTestStep');
        });
        tableView.addCellRenderer(new CustomRangeRenderer());
    });
    mvc.Components.get('highlight').getVisualization(function(tableView) {
        tableView.on('rendered', function() {
            tableView.$el.find('td.markTestStep').parent().addClass('markTestStep');
        });
        tableView.addCellRenderer(new CustomRangeRenderer());
    });
    mvc.Components.get('table_dtcs').getVisualization(function(tableView) {
        tableView.on('rendered', function() {
            tableView.$el.find('td.markTestStep').parent().addClass('markTestStep');
        });
        tableView.addCellRenderer(new CustomRangeRenderer());
    });

});
