define(function(require){
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var DashboardElement = require('splunkjs/mvc/simplexml/element/base');
    var DockedTableView = require('./DockedTableView');
    var console = require('util/console');
    var Mapper = require('splunkjs/mvc/simplexml/mapper');
    var SplunkUtil = require('splunk.util');
    var Drilldown = require('splunkjs/mvc/drilldown');

    var DockedTableMapper = Mapper.extend({
        tagName: 'dtable',
        map: function(report, result, options) {
            result.options.wrap = String(SplunkUtil.normalizeBoolean(report.get('display.statistics2.wrap', options)));
            result.options.rowNumbers = String(SplunkUtil.normalizeBoolean(report.get('display.statistics2.rowNumbers', options)));
            result.options.dataOverlayMode = report.get('display.statistics2.overlay', options);
            result.options.drilldown = Drilldown.getNormalizedDrilldownType(
                report.get('display.statistics2.drilldown', options),
                { validValues: ['cell','row','none'], 'default': 'row', aliasMap: { all: 'cell', off: 'none' } });
            result.options.count = report.get('display.prefs.statistics2.count', options);

            result.options.labelField = null;
            result.options.valueField = null;

            var fields = report.get('display.statistics2.fields', options);
            result.tags.fields = _.isArray(fields) ?
                    (_.isEmpty(fields) ? null : JSON.stringify(fields)) :
                    (fields === '[]' ? null : fields);

        }
    });
    Mapper.register('statistics2', DockedTableMapper);

    var DockedTableVisualization = DockedTableView.extend({
        panelClassName: 'dtable',
        prefix: 'display.statistics2.',
        reportDefaults: {
            'display.general.type': 'statistics2',
            'display.prefs.statistics2.count' : 10,
            'display.statistics2.drilldown': 'cell'
        },
        getResultsLinkOptions: function(options) {
            return {};
        }
    });
    DashboardElement.registerVisualization('statistics2', DockedTableVisualization);

    var DockedTableElement = DashboardElement.extend({
        initialVisualization: 'statistics2'
    });
    
    return DockedTableElement;
});