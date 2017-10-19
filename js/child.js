/**
 * Created by haseebriaz on 03/02/15.
 */

var parentWindow = window.opener;
var undockButton = null;

var fin = fin || {};

if (fin && fin.desktop) {
    fin.desktop.main(function(){

        fin.desktop.InterApplicationBus.subscribe("*", "translate-symbol-response", d => console.log(d));

        // setInterval(updateDimentions, 100);
       // new Draggable(document.getElementById("dragger")); // pass any element that you want to use as a handle for dragging.
       // parentWindow.registerChild(window); // this registers current window as a dockable window
        undockButton = document.getElementById("undockButton");
        undockButton.addEventListener("click", undock);
        enableUndock(false);

        fin.desktop.InterApplicationBus.subscribe("*", "window-docked", onDock);
        fin.desktop.InterApplicationBus.subscribe("*", "window-undocked", onUnDock);

//        fin.desktop.Window.getCurrent().addEventListener("bounds-changed", function(event) {
//            console.log(event);
//        });

//        fin.desktop.Window.getCurrent().addEventListener("close-requested", function (event) {
//            console.log("The window close-requested");

//            fin.desktop.Window.getCurrent().close(true);
//        });


        //fin.desktop.Window.getCurrent().addEventListener("close-requested", function (event) {
        //    console.log("The window close-requested");
        //});

        //fin.desktop.System.showDeveloperTools(fin.desktop.Application.getCurrent().uuid,
        //    fin.desktop.Window.getCurrent().name);

        function focusInput(name) {
            console.log("focus textInput", name);
            document.getElementById(name).focus();
            fin.desktop.Window.getCurrent().focus();
        }

        fin.desktop.Window.getCurrent().addEventListener("focused", function(event) {
//            focusInput('textInput1');
//            console.log('bringToFront', event);
//            fin.desktop.Window.getCurrent().bringToFront( function()  { fin.desktop.Window.getCurrent().setAsForeground() });
        });

        fin.desktop.Window.getCurrent().addEventListener("shown", function(event) {
//                   fin.desktop.Window.getCurrent().focus(function(){
//                        fin.desktop.Window.getCurrent().blur(function() {
//                            fin.desktop.Window.getCurrent().focus();
//                        });
//                   });                
        });

        // fin.desktop.Window.getCurrent().focus();
//        fin.desktop.Window.getCurrent().show();

        fin.desktop.InterApplicationBus.subscribe("*", "scout-sector-selected",
                function(sector, senderUuid) {
                    console.log('debugger scout');
                });

        var paintButton = document.getElementById("paintButton");
        paintButton.addEventListener("click", function() {
            var app = fin.desktop.Application.getCurrent();
            var parentW = fin.desktop.Window.wrap(app.uuid, app.uuid);
            parentW.minimize();
            parentW.restore();
        });

    });
}

var onDock = function(message){

    if(message.windowName == window.name) enableUndock(true);

}.bind(window);

function updateDimentions(){

    document.getElementById("dimentions").innerHTML = "x: " + window.screenLeft + ", y: " + window.screenTop + ", width: " + window.outerWidth + ", height: "+ window.outerHeight;
}

function onUnDock(message){

    if(message.windowName == this.name){
        enableUndock(false);
    }
}

function undock(){

    fin.desktop.InterApplicationBus.publish("undock-window", {

        windowName: window.name
    });

}

function enableUndock(value){

    console.log("enabling undock buton", value);
    document.getElementById("undockButton").style.display = value? "block": "none";
}

//window.onunload = OnUnLoad;

function OnUnLoad() {
    console.log("onunload");    
}

//window.onbeforeunload = OnBeforeUnLoad;

function OnBeforeUnLoad() {
    console.log("onbeforeunload");    
    return "bye bye";
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded from child window');
});
