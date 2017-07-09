var DockbarMenu = React.createClass({   
  activityDockBarKey: "activityDockbarButton",
  slaDockBarKey: "slaDockbarButton",
  isActivityShown: false,
  isSlaShown: false,
  buttonStatus: { 
                    activityDockbarButton:  false,
                    slaDockbarButton: false
                },
  
  windows: { },  
  
  initWindows: function()
  {
     this.windows = {     
                activityDockbarButton:  [
                                { dockingParent:"activity", dockingPosition:"right", height : "218", width: "550", top:"480", left:"970", windowName: "new-instruments-activity", url: "activity-newInstruments.html"},
                                { dockingParent:"new-instruments-activity", dockingPosition:"bottom", height : "311", width: "550", top:"150", left:"970", windowName: "attributes-activity", url: "activity-attributesActivity.html"},
                                { dockingParent:"new-instruments-activity", dockingPosition:"right", height : "402", width: "235", top:"150", left:"720", windowName: "hourly-daily-activity", url: "activity-hourlyDailyTotalsComponent.html"},        
                                { dockingParent:"", dockingPosition:"", height : "530", width: "675", top:"150",  left:"30", windowName: "activity", url: "activity-main.html" }                        
                          ],
                          
                slaDockbarButton: [
                        { dockingParent:"sla", dockingPosition:"right", height:"247", width:"955", top:"150", left:"720", windowName: "sla-quality", url:"sla-quality.html" },
                        { dockingParent:"sla-quality", dockingPosition:"bottom", height:"238", width:"955", top:"420", left:"720", windowName: "sla-outbound-files", url:"sla-outbound-files.html" },             
                        { dockingParent:"sla-outbound-files", dockingPosition:"bottom", height:"278", width:"675", top:"680", left:"720", windowName: "sla-total", url:"sla-total.html" },
                        { dockingParent:"", dockingPosition:"", height:"574", width:"650", top:"150", left:"50", windowName: "sla", url:"sla-main.html" }
                     ]};  
  },
                                             
  startPlaying: function(){
        $("#startSpan").hide();
        $("#pauseSpan").show();
//        fin.desktop.InterApplicationBus.publish('play-activity', { play : true });
  },  
  
  stopPlaying: function(){
      $("#startSpan").show();
      $("#pauseSpan").hide();
  //    fin.desktop.InterApplicationBus.publish('play-activity', { play : false });
  },
  
  onWindowCreated: function(windowName, componentId){      
      console.log("window created : " + windowName);
      this.buttonStatus[componentId] = true;
      
      this.clearDashboardDate();
      if (windowName === 'activity') {
          $("#" + this.activityDockBarKey).attr("src", "img/activity.png");
          if (this.buttonStatus[this.slaDockBarKey]){
            this.refs[this.slaDockBarKey].clickHandler();
            this.hideUndockAndPause();
          }
          this.isActivityShown = true;
          $("#activitySpan").removeClass("unselected");
          $("#slaSpan").addClass("unselected");
      }
      else if (windowName === 'sla') {
          $("#" + this.slaDockBarKey).attr("src", "img/sla.png");          
          if (this.buttonStatus[this.activityDockBarKey]){ 
            this.refs[this.activityDockBarKey].clickHandler();
            this.hideUndockAndPause();
          }
          this.isSlaShown = true;
          $("#activitySpan").addClass("unselected");
          $("#slaSpan").removeClass("unselected");
      }
      
      $("#startSpan").show();      
      $("#dockAllSpan").show();
  },
  
  hideUndockAndPause: function(){
      $("#pauseSpan").hide();
      $("#undockAllSpan").hide();
  },
  
  onWindowClosed: function(windowName, componentId){
      console.log("window closed : " + windowName); 
      if (windowName === 'activity') {
            $("#" + this.activityDockBarKey).attr("src", "img/activity_inactive.png");
            this.isActivityShown = false;
            $("#activitySpan").addClass("unselected");
      }
      else if (windowName === 'sla') {
            $("#" + this.slaDockBarKey).attr("src", "img/sla_inactive.png");
            this.isSlaShown = false;
            $("#slaSpan").addClass("unselected");
      }
      if (!this.isActivityShown && !this.isSlaShown)
      {
          $("#pauseSpan").hide(); 
          $("#startSpan").hide();
      }     
  },
  
  onAllWindowClosed: function(componentId)
  {
      this.buttonStatus[componentId] = false;
      var values= _.values(this.buttonStatus);
      var anyWindowsOpen = _.find(values, function(a) { return a });
      if (!anyWindowsOpen)
      {
          $("#dockAllSpan").hide();
          $("#undockAllSpan").hide();
          this.clearDashboardDate();         
      }
  },
  
  dockAllWindows: function()
  {
      var keys = _.keys(this.buttonStatus);
      keys.forEach(function(key) {
        var value = this.buttonStatus[key];
        if (value === true)
            this.refs[key].showWindows(this.addWindowsinGroup);    
      }, this);      
  },
  
  addWindowsinGroup: function(componentId)
  {
      var context = this;
      var windowsToJoin = this.windows[componentId];    
      var application = fin.desktop.Application.getCurrent();  
          
      application.getChildWindows(function(childWindows){          
          context.joinWindows(_.rest(windowsToJoin), _.first(windowsToJoin), childWindows);                    
           $("#dockAllSpan").hide();
           $("#undockAllSpan").show();                       
      });
  },  
  
  joinWindows : function(remainingWindows, window, childWindows){
      if (remainingWindows.length == 0)
        return;
        
      var targetWindow = _.find(childWindows, function(child) { return child.name === window.dockingParent });
      if (targetWindow == null)
      {          
          this.joinWindows(_.rest(remainingWindows), _.first(remainingWindows), childWindows);
          return; 
      }

      var windowToDock = _.find(childWindows, function(child) { return child.name == window.windowName });
      if (windowToDock == null)
      {         
          this.joinWindows(_.rest(remainingWindows), _.first(remainingWindows), childWindows);  
          return;
      }                    
              
      var windowToDockNativeWindow = windowToDock.getNativeWindow();
      var x = windowToDockNativeWindow.screenX;
      var y = windowToDockNativeWindow.screenY;
      var targetNativeWindow = targetWindow.getNativeWindow();
      var position = window.dockingPosition;
      if (position === "right"){
            x = targetNativeWindow.screenX + targetNativeWindow.innerWidth;
            y = targetNativeWindow.screenY;
      }
      else if (position === "left"){
            x = targetNativeWindow.screenX - targetNativeWindow.innerWidth;
            y = targetNativeWindow.screenY;
      }
      else if (position === "top"){
            x = targetNativeWindow.screenX;
            y = targetNativeWindow.screenY - targetNativeWindow.innerHeight;    
      }
      else if (position === "bottom"){          
            x = targetNativeWindow.screenX;
            y = targetNativeWindow.screenY + targetNativeWindow.innerHeight;                
      }
      
      console.log("X: " + x + " target windowName" + targetWindow.name + " current Window " + windowToDock.name);
      var context = this;       
      windowToDock.animate({position:{ left : x, top : y, duration : 350 } }, {}, function() {
        windowToDock.joinGroup(targetWindow, function(){
            fin.desktop.InterApplicationBus.publish("window-docked", { windowName: windowToDock.name });
            fin.desktop.InterApplicationBus.publish("window-docked", { windowName: targetWindow.name });  
            console.log("window docked: 1: " + windowToDock.name + " and 2: " + targetWindow.name);                        
            context.joinWindows(_.rest(remainingWindows), _.first(remainingWindows), childWindows);              
        });    
      });      
  },
  
  undockAllWindows : function()
  {
      var application = fin.desktop.Application.getCurrent();
      var context = this;
      application.getChildWindows(function(childWindows){
          var i = 0;
          childWindows.forEach(function(window) {
              var x = i * 10;
              var y = i * 10;    
              i++;          
              context.undockAndMove(window, x, y);             
          }, this);
          
          $("#undockAllSpan").hide();
          $("#dockAllSpan").show();          
      });
  },
  
  undockAndMove: function(window, x, y)
  {
       window.leaveGroup(function(){              
                  var nativeWindow = window.getNativeWindow();
                  window.animate({position:{ left : nativeWindow.screenX + x, top : nativeWindow.screenY + y, duration : 350 } });    
              });
              
     fin.desktop.InterApplicationBus.publish("window-undocked", { windowName: window.name });
  },
  
  componentDidMount: function(){
        $("#pauseSpan").hide(); 
        $("#startSpan").hide();
        $("#dockAllSpan").hide();
        $("#undockAllSpan").hide();
        var context = this;
         finReady.subscribeOnReady(function(){
//                fin.desktop.InterApplicationBus.subscribe("*", "window-undocked-request", function(payload, uuid){
//                    var window = fin.desktop.Window.wrap(uuid, payload.windowName);
//                    if (window){
//                        $("#dockAllSpan").show(); 
//                        context.undockAndMove(window, 10, 10);
//                    }
//                });                           
         });
       finReady.subscribeOnReady(function(){      
//            fin.desktop.InterApplicationBus.subscribe('*', 'activity-hourly-daily', context.setDashboardDate);
       });
       finReady.subscribeOnReady(function(){      
//            fin.desktop.InterApplicationBus.subscribe('*', 'sla-quality-point', context.setDashboardDate);
       });  
  },
  
  setDashboardDate: function(payload) {
    var dateLong = payload.date;
    var date = new Date(dateLong);
    var options = {
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "2-digit", minute: "2-digit"
    };
    
    $("#dateSpan").text(date.toLocaleDateString("en-us", options));
  },
  
  clearDashboardDate: function()
  { 
     $("#dateSpan").text("");
  },

  render: function() {      
    var marginStyle = { marginTop : "10px",  marginLeft: "10px", marginBottom: "10px" };    
    var imageStyle = { width:"25px", height:"25px", cursor:"pointer", marginLeft: "5px", marginRight: "5px" };

    this.initWindows();
         
    return <div style={marginStyle}>
                <span data-tooltip="Activity" id="activitySpan"><DockbarButton ref={this.activityDockBarKey} componentId={this.activityDockBarKey} Text="Activity" windows={this.windows[this.activityDockBarKey]} src="img/activity_inactive.png" onWindowCreated={this.onWindowCreated} onWindowClosed={this.onWindowClosed} onAllWindowClosed={this.onAllWindowClosed} /></span>
                <span data-tooltip="SLA" id="slaSpan"><DockbarButton ref={this.slaDockBarKey} componentId={this.slaDockBarKey} Text="SLA" windows={this.windows[this.slaDockBarKey]} src="img/sla_inactive.png" onWindowCreated={this.onWindowCreated} onWindowClosed={this.onWindowClosed} onAllWindowClosed={this.onAllWindowClosed}/></span>
                <span data-tooltip="Dock All" id="dockAllSpan"><img id="dockAllButton" src="img\dockall.png" style={imageStyle} onClick={this.dockAllWindows}/></span>
                <span data-tooltip="Undock All" id="undockAllSpan"><img id="undockall" src="img\undockall.png" style={imageStyle} onClick={this.undockAllWindows}/></span>
                <span data-tooltip="Start" id="startSpan"><img id="startButton" src="img\play.png" style={imageStyle} onClick={this.startPlaying} /></span>
                <span data-tooltip="Pause" id="pauseSpan"><img id="pauseButton" src="img\pause.png" style={imageStyle} onClick={this.stopPlaying} /></span>
                <span id="dateSpan"></span>                           
        </div>;
  }
});