var FooterComponent = React.createClass({
    render : function()
    {
        var imageStyle = {
                            marginBottom:"10px",
                            marginRight:"10px"
                         };
        
        return(
            <img src="img/poweredby.png" height="18" width="161" alt="Powered by Infusion" title="Powered by Infusion" style={imageStyle} className="close"/>
        );
    }
}) 