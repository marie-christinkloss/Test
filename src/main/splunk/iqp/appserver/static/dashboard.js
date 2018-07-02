//# sourceURL=dashboard.js

require([
        "splunkjs/mvc",
        "underscore",
        "jquery",
        "splunk.i18n"
    ],function(
        mvc,
        _,
        $,
        i18n
    ) {
        
        // Create token namespaces
        var defaultTokenModel = mvc.Components.getInstance('default');
        var submittedTokenModel = mvc.Components.getInstance('submitted');

        function setToken(name, value) {
            defaultTokenModel.set(name, value);
            submittedTokenModel.set(name, value);
        }
        
        $.each(defaultTokenModel.attributes, function( key, value ) {
            //console.log(key);
            if (key.match("^i18n_")) {
               setToken(key, i18n._(value));
            }
        });
        
        $('.i18n').each(function( index ) {
            var tmpTrans = i18n._($(this).text());
            $(this).text(tmpTrans);
        });
    }
);