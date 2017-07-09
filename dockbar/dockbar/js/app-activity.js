$(function () {
       
    var app = {    
       
        init: function () {
            $.support.cors = true;
            $(document).foundation();

            Highcharts.setOptions({
                global : {
                    useUTC : false
                }
            });                                 
        }              
    };
    
    $.support.cors = true;
    app.init();       
});
