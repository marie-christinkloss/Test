define([
            'splunkjs/mvc/tableview',
            'views/shared/delegates/TableDock',
            'jquery',
            'underscore',
            'views/shared/ReportVisualizer'
        ],
        function (
            TableView,
            TableDock,
            $,
            _,
            ReportVisualizer
        ) {
    var Collection = require('backbone').Collection;
    

    var DockedTableView = TableView.extend({
    
        getVisualizationRendererOptions: function() {
            this.cellRendererCollection = new Collection();
            this.rowExpansionRendererCollection = new Collection();
            return ({
                enableTableDock: true,
                generalTypeOverride: ReportVisualizer.GENERAL_TYPES.STATISTICS,
                sortableFieldsExcluded: this.settings.get('sortableFieldsExcluded'),
                collection: {
                    customCellRenderers: this.cellRendererCollection,
                    customRowExpansionRenderers: this.rowExpansionRendererCollection
                }
            });
        },
        initialize: function() {
            TableView.prototype.initialize.apply(this, arguments);
            
            var lazyView=this.viz.children.viz;
            lazyView.on("loadComplete",function(){
                var tableDock=lazyView.wrappedView.children.tableDock;
                
                tableDock.syncColumnWidths = function() {
                    TableDock.prototype.syncColumnWidths.apply(this, arguments);
                    this.left = this.$el.offset().left;
					this.width = this.$el.width();
                    this.$header.css({left: this.left});
                    this.$header.css({width: this.width});
                }
                
                tableDock.updateHeaders = function() {
                    if(this.$header) {
                        this.$header.remove();
                    }
                    
                    this.$header = $('<div class="header-table-docked" style="display:none"><table></table><div class="disable"></div></div>').css({top: this.options.offset, left:this.left, width: this.width});
                    this.$disable = this.$header.find('> .disable')[this.disabled ? 'show' : 'hide']();
                    this.$headerTable = this.$header.find('> table');
                    this.$headerTable.attr('class', this.$table.attr('class'));
                    this.$table.find('> thead').clone().appendTo(this.$headerTable);
                    this.$header.prependTo(this.el);
                    this.$headerTable.on('click.' + this.eventNS, 'th', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var colIndex = $(e.currentTarget).prevAll().length + 1;
                        this.$table.find('> thead > tr > th:nth-child(' + colIndex + ')').click();
                    }.bind(this));
                    this.$headerTable.on('click.' + this.eventNS, 'th a', function(e) {
                        e.preventDefault();
                    });
                }
                
                tableDock.updateScroll = function() {
                    if(this.$dockedScroll) {
                        this.$dockedScroll.remove();
                    }
                    this.$dockedScroll = $('<div />').addClass('table-scroll-bar-docked').hide().appendTo(this.$el).css('left', this.$el.offset().left).css('right', this.$el.offset().left);
                    this.$dockedScroll.on('scroll.' + this.eventNS, _(this.handleDockedScrollChange).bind(this));
                }
                
                
            })
            
        }
        
    });

    return DockedTableView;
});