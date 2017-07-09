var AttributesComponent = React.createClass({    
    
    showAttributes: function(payload) {
        $("#loadingImage").hide();
        $("#container").show();      
        var shouldAnimate = payload.shouldAnimate;
        var data = payload.data;
        var attributeComponent = '#' + this.props.componentId;
        $(attributeComponent).find('.attributes-chart-container .attribute-column').empty();

        for (var i = 0; i < data.length; i++) {
            var attrHTML = '<div id="attribute-' + this.props.componentId + i + '" class="attribute-group">' +
                             '<span class="count" style="width:55px">' + data[i].Count + '</span>' +                             
                             '<span class="bar-container">' +                             
                                '<div class="bar" data-width="' + parseInt((data[i].Count / data[0].Count) * 35) + '"></div>' +
                                '<div class="tag" >' + data[i].Attribute + '</div>' +                     
                             '</span>' +                             
                           '</div>';
            
            //if (i < 5)
                $(attributeComponent).find('.attributes-chart-container .column-1').append(attrHTML);
            //else
              //  $(attributeComponent).find('.attributes-chart-container .column-2').append(attrHTML);
            
            var el = $('#attribute-' + this.props.componentId + i).find('.bar');
            if (shouldAnimate)
                animateEl(el);
            else
                el.css({'width': el.data('width') + '%'});                
        }

        function animateEl(el) {
            var animationTimeout = setTimeout(function() {
                el.css({'width': el.data('width') + '%'});
                clearTimeout(animationTimeout);
            }, 10);
        }
    },
    
   componentDidMount: function()
   {     $("#container").hide();
         var context = this;
         finReady.subscribeOnReady(function(){ 
            fin.desktop.InterApplicationBus.subscribe('*', 'activity-attributes', context.showAttributes);
         }); 
   },
    
    render: function()
    {
         var imageStyle = {
           width : "150px", 
           height : "150px",
           margin : "55px auto",
           display: "block"
       };
       
        return(
            <div id={this.props.componentId} className="attributes-container">
                   <img id="loadingImage" src="img\loading_spinner.gif" style={imageStyle}></img>                                  
                    <div id="container" className="attributes-chart-container clearfix">
                        <div className="attribute-column column-1"></div>                        
                    </div>
                </div>
        );
    }   
});