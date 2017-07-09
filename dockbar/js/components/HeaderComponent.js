var HeaderComponent = React.createClass({ 
    close : function()
    {
        if(this.props.exit === true)
            fin.desktop.Application.getCurrent().close();
        else
            fin.desktop.Window.getCurrent().close();
    },   
    
    exit : function()
    {
        if (this.props.onClosing)
            this.props.onClosing(this.close);
        else
            this.close();        
    },
    
    componentDidMount : function()
    {        
        $("#undockButton").hide();
        var context = this;
        finReady.subscribeOnReady(function(){
            //fin.desktop.InterApplicationBus.subscribe('*', 'window-docked', context.onDock);
            //fin.desktop.InterApplicationBus.subscribe('*', 'window-undocked', context.onUnDock);
        });        
    },
    
    onDock: function(message)
    {
        if (message.windowName === window.name) {        
             $("#closeButton").hide();
             $("#undockButton").show();
        }
    },
    
    onUnDock: function(message)
    {
        if (message.windowName === window.name) {        
             $("#closeButton").show();
             $("#undockButton").hide();
        }
    },
    
    publishUndock: function()
    {
        fin.desktop.InterApplicationBus.publish('window-undocked-request', { windowName : window.name });
    },
    
    render : function()
    {               
        var undockImageStyle = { marginTop : "5px", marginRight: "5px", height:"20px", width: "20px" };
        var exitImageStyle = { marginTop : "5px", marginRight: "5px", height:"20px", width: "20px" };
        var exitImageSrc = this.props.exitImageSrc ? this.props.exitImageSrc : "img/close.png";
        var imageStyle = { marginLeft : "5px", marginTop : "5px", height : "20px" };
        return(
          <div className="draggable header">
            <img style={imageStyle} src="img/infusion-logo.png"  alt="Powered by Infusion" title="Powered by Infusion"/> 
            <img style={exitImageStyle} onClick={this.exit} id="closeButton" className="non-draggable close" src= {exitImageSrc} alt="close"/>
            <img onClick={this.publishUndock} style={undockImageStyle} id="undockButton" ref="undockButton" className="non-draggable close" height="15" width="15" src="img/undock.png" alt="Undock"/>
            <span className="caption">{this.props.caption}</span>
         </div>   
        );
    }
});