var DockbarButton = React.createClass({    
    
    referencedWindows: [],
    
    generateUUID: function(){
        /* http://jsfiddle.net/briguy37/2mvfd/ */
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        
    return uuid;
    },  
    
  clickHandler: function() {
     var componentId = this.props.componentId; 
     var hasClosed = false; 
     this.referencedWindows.forEach(function(win) {
            try
            {
                if (win.id === componentId)
                {
                    hasClosed = true;
                    win.fin.close(); 
                    // this.props.onWindowClosed(win.name);
                }                       
            }
            catch(err)
            {
                console.log(err);
            }         
        }, this);        
        
        if (hasClosed)
        {            
            var length = this.referencedWindows.length;
            console.log("closed windows : " + length);
            this.referencedWindows = _.reject(this.referencedWindows, function(a) { return a.id === componentId});
            console.log("remaining windows: " + this.referencedWindows.length)
            this.props.onAllWindowClosed(componentId);            
            return;
        }            
       
       this.showWindows();      
  },
  
  showWindows: function(callback)
  {
     var componentId = this.props.componentId;
     this.windowsCreated = true;
     var windows = this.props.windows;
     var counter = 0;
     windows.forEach(function(window){
         var existingWindow = null;
         if (window.windowName){
                /* window with same name cannot be instantiated twice */
                existingWindow = _.find(this.referencedWindows, function(win) { return win.name === window.windowName});
            }
            
            if (existingWindow == null){
                var windowName = window.windowName ? window.windowName : this.generateUUID();  
                var finWindow = new fin.desktop.Window({
                        name: windowName,
                        url: window.url,
                        autoShow: true,
                        defaultWidth: window.width,
                        defaultHeight: window.height,
                        frame: false,
                        maximizable: false,
                        saveWindowState: false,                    
                        showTaskbarIcon: false,
                        resizable: false,
                        icon: ""});
            
                var context = this;
                finWindow.addEventListener("closed", function(win) {
                    console.log(win.name);
                    context.referencedWindows = _.reject(context.referencedWindows, function(a) { return a.fin.name === win.name });
                    console.log("remaining windows: " + context.referencedWindows.length);
                    context.props.onWindowClosed(win.name, componentId);
                    if (context.referencedWindows.length == 0)
                        context.props.onAllWindowClosed(componentId);      
                });
      
                this.referencedWindows.push({ fin: finWindow, id: componentId, name: windowName });            
                var left = window.left;
                var top = window.top;
      
                this.props.onWindowCreated(finWindow.name, componentId);
                finWindow.show(true, function(a){           
                    finWindow.moveTo(left, top, function () {
                        counter++;
                        if (counter == windows.length && callback)
                            callback(componentId);    
                    }); 
                    
                    /*             
                    var dockingManager = DockingManager.getInstance();
                    dockingManager.register(finWindow); */  
                });         
            }
            else{
                counter++;
                if (counter == windows.length && callback)
                    callback(componentId);
            }                   
     }, this);  
  },  
  
  render: function() { 
   var marginStyle = {marginLeft: "5px", marginRight: "5px", cursor: "pointer", height: "25px", width: "25px" };  
    return (
        <img id={this.props.componentId} style={marginStyle} src={this.props.src} alt={this.props.Text} onClick={this.clickHandler}></img >
        );           
  }
});