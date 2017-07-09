/**
 * Created by haseebriaz on 24/02/15.
 */
var __extends = function (d, b) {

    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var DockingGroup = (function(){

    function DockingGroup(){

        this.children = [];
    }

    DockingGroup.prototype.children = [];
    DockingGroup.prototype.parent = null;
    DockingGroup.prototype.onAdd = function(){};
    DockingGroup.prototype.onRemove = function(){};

    DockingGroup.prototype.add = function(window){

        if(window.parent == this) return;
        if(window.parent) window.parent.remove(window);

        this.children.push(window);
        window.parent = this;
        window.onAdd();
    };

    DockingGroup.prototype.remove = function(window){

        var index = this.children.indexOf(window);
        if(index >= 0){

            this.children.splice(index, 1);
            window.parent = null;
            window.onRemove();
        }
    };

    DockingGroup.prototype.has = function(window){

        return this.children.indexOf(window) >= 0;
    };

    return DockingGroup;
})();

var DockableWindow = (function(_super){

    function DockableWindow(options, onReady){

        _super.apply(this);
        if(onReady) this.onReady = onReady;
        this.crateDelegates();

        if(options instanceof fin.desktop.Window) {

            this.openfinWindow = options;
            this.onWindowCreated();

        } else {

            this.openfinWindow = new fin.desktop.Window({

                name: options.name,
                url: options.url,
                defaultLeft: options.defaultLeft - 150,
                defaultTop: options.defaultTop - 100,
                defaultWidth: options.defaultWidth,
                defaultHeight: options.defaultHeight,
                frame: options.frame,
                resize: options.resize,
                windowState: options.windowState,
                autoShow: options.autoShow

            }, this.onWindowCreated);
        }

        this.name = options.name;
    }

    __extends(DockableWindow, _super);

    DockableWindow.prototype.name = "";
    DockableWindow.prototype.x = 0;
    DockableWindow.prototype.y = 0;
    DockableWindow.prototype.width = 0;
    DockableWindow.prototype.height = 0;
    DockableWindow.prototype.openfinWindow = null;
    DockableWindow.prototype.isDocked = false;
    DockableWindow.prototype.dockableToOthers = true;
    DockableWindow.prototype.acceptDockingConnection = true;
    DockableWindow.prototype.minimised = false;

    DockableWindow.prototype.onReady = function(){};
    DockableWindow.prototype.onMove = function(){};
    DockableWindow.prototype.onClose = function(){};
    DockableWindow.prototype.onMoveComplete = function(){};
    DockableWindow.prototype.onMinimize = function(){};
    DockableWindow.prototype.onRestore = function(){};

    DockableWindow.prototype.crateDelegates = function(){

        this.onMove = this.onMove.bind(this);
        this.onMoved = this.onMoved.bind(this);
        this.onWindowCreated = this.onWindowCreated.bind(this);
        this.onBounds = this.onBounds.bind(this);
        this.onBoundsChanging  = this.onBoundsChanging.bind(this);
        this.onClosed  = this.onClosed.bind(this);
        this.onMoveComplete  = this.onMoved.bind(this);
        this.onBoundsChanged  = this.onBoundsChanged.bind(this);
        this.onBoundsUpdate  = this.onBoundsUpdate.bind(this);
        this.onMinimized  = this.onMinimized.bind(this);
        this.onRestored  = this.onRestored.bind(this);
    };

    DockableWindow.prototype.onWindowCreated = function(){

        this.openfinWindow.getBounds(this.onBounds);
        this.openfinWindow.disableFrame();
        this.openfinWindow.addEventListener("disabled-frame-bounds-changing", this.onBoundsChanging);
        this.openfinWindow.addEventListener("disabled-frame-bounds-changed", this.onBoundsChanged);
        this.openfinWindow.addEventListener("bounds-changed", this.onBoundsUpdate);
        this.openfinWindow.addEventListener("closed", this.onClosed);
        this.openfinWindow.addEventListener("minimized", this.onMinimized);
        this.openfinWindow.addEventListener("hidden", this.onMinimized);
        this.openfinWindow.addEventListener("restored", this.onRestored);
        this.openfinWindow.addEventListener("shown", this.onRestored);

        this.onReady();
    };

    DockableWindow.prototype.onBounds = function(bounds){

        this.width = bounds.width;
        this.height = bounds.height;
        this.x = bounds.left;
        this.y = bounds.top;
    };

    DockableWindow.prototype.onBoundsUpdate = function(bounds){

        this.x = bounds.left;
        this.y = bounds.top;
        this.width = bounds.width;
        this.height = bounds.height;
    };

    DockableWindow.prototype.onBoundsChanging = function(bounds){

        var event = {target: this, preventDefault: false, bounds: {x: bounds.left, y: bounds.top, width: this.width, height: this.height, changedWidth: bounds.width, changedHeight: bounds.height}};
        this.onMove(event);

        if(event.preventDefault) return;

        if(!this.isDocked)this.setOpaticy(0.5);
        this.moveTo(bounds.left, bounds.top);
    };

    DockableWindow.prototype.onBoundsChanged = function(){

        this.setOpaticy(1);
        this.onMoveComplete({target: this});
    };

    DockableWindow.prototype.onClosed = function(){

        this.onClose({target: this});
        this.unlink();
    };

    DockableWindow.prototype.onMinimized = function(){

        console.log("minized ", this.openfinWindow.name);
        this.minimized = true;
        this.onMinimize();
    };

    DockableWindow.prototype.onRestored = function(){

        console.log("maximized ", this.openfinWindow.name);
        this.minimized = false;
        this.onRestore();
    };

    DockableWindow.prototype.moveTo = function(x, y){

        this.x = x;
        this.y = y;
        this.openfinWindow.removeEventListener("disabled-frame-bounds-changing", this.onBoundsChanging);
        this.openfinWindow.moveTo(x, y, this.onMoved);
    };

    DockableWindow.prototype.onMoved = function(){

        this.openfinWindow.addEventListener("disabled-frame-bounds-changing", this.onBoundsChanging);
    };

    DockableWindow.prototype.joinGroup = function(group){

        if(!this.dockableToOthers || !group.acceptDockingConnection) return;

        if(this.parent) {

            console.log("has got parents", this.parent);
            this.parent.joinGroup(group);
            return;
        }

        group.add(this);
        this.openfinWindow.joinGroup(group.openfinWindow);
        // this._inviteMemebersToTheGroup(this.children, group);
        this.isDocked = true;

        fin.desktop.InterApplicationBus.publish("window-docked", {

            windowName: this.name
        });
    };

    DockableWindow.prototype._inviteMemebersToTheGroup = function(children, group){

        if(children.length > 0){

            var currentChild = null;

            for(var i = 0; i < children.length; i++){

                currentChild = children[i];
                currentChild.openfinWindow.joinGroup(group.openfinWindow);
                console.log('inviteMemebersToTheGroup', currentChild.name)
                this._inviteMemebersToTheGroup(currentChild.children, group);
            }
        }
    };

    DockableWindow.prototype.leaveGroup = function(){

        this.parent.remove(this);
        this.openfinWindow.leaveGroup();
        this._inviteMemebersToTheGroup(this.children, this);
        this.isDocked = false;

        fin.desktop.InterApplicationBus.publish("window-undocked", {

            windowName: this.name
        });
    };

    DockableWindow.prototype.unlink = function(){

        if (this.parent) {
            this.parent.remove(this);
        }

        if(this.children){

            for(var i = 0; i < this.children.length; i++ ){

                this.children[i].leaveGroup();
            }
        }
    };

    DockableWindow.prototype.setOpaticy = function(value){

        if(this.opacity == value) return;
        this.opacity = value;
        this.openfinWindow.animate({
                opacity: {
                    opacity: value,
                    duration:100
                }
            });
    };

    DockableWindow.prototype.minimize = function(){

        if(this.minimised) return;
        this.minimised = true;
        this.openfinWindow.minimize();
    };

    DockableWindow.prototype.restore = function(){

        if(!this.minimised) return;
        this.minimised = false;
        this.openfinWindow.restore();
    };

    return DockableWindow;

})(DockingGroup);


var DockingManager = (function(){

    var instance = null;
    var windows = [];
    var _snappedWindows = {};
    var minimized = false;

    function DockingManager(){

        if(instance) throw new Error("Only one instance of DockingManager is allowed. Use DockingManager.getInstance() to get the instance.");
        instance = this;
        this.createDelegates();
        fin.desktop.InterApplicationBus.subscribe("*", "undock-window", this.onUndock);
        window.document.addEventListener("visibilitychange", this.onVisibilityChanged);
    }

    DockingManager.getInstance = function(){

        return instance? instance: new DockingManager();
    };

    DockingManager.prototype.range = 30;
    DockingManager.prototype.spacing = 5;

    DockingManager.prototype.createDelegates = function(){

        this.onWindowMove = this.onWindowMove.bind(this);
        this.onWindowClose = this.onWindowClose.bind(this);
        this.onWindowRestore = this.onWindowRestore.bind(this);
        this.onWindowMinimize = this.onWindowMinimize.bind(this);
        this.dockAllSnappedWindows = this.dockAllSnappedWindows.bind(this);
        this.onUndock = this.onUndock.bind(this);
        this.onVisibilityChanged = this.onVisibilityChanged.bind(this);
    };

    DockingManager.prototype.onUndock = function(message){

        var name = message.windowName;

        for(var i = 0; i < windows.length; i++){

            if(windows[i].name == name){

                windows[i].leaveGroup();
            }
        }
    };

    DockingManager.prototype.register = function(window, dockableToOthers){

        window = new DockableWindow(window);
        window.dockableToOthers = (dockableToOthers === undefined || dockableToOthers !== false);
        if(windows.indexOf(window) >= 0) return;

        windows.push(window);
        window.onMove = this.onWindowMove;
        window.onMoveComplete = this.dockAllSnappedWindows;
        window.onClose = this.onWindowClose;
        // window.onRestore = this.onWindowRestore;
        // window.onMinimize = this.onWindowMinimize;
    };

    DockingManager.prototype.unregister = function(window){

        var index = windows.indexOf(window);
        if(index >= 0) windows.splice(index, 1);
    };

    DockingManager.prototype.onVisibilityChanged = function(){

        if(document.hidden){

            this.onWindowMinimize();
        } else {

            this.onWindowRestore();
        }

    };

    DockingManager.prototype.onWindowClose = function(event){

        this.unregister(event.target);
    };

    DockingManager.prototype.onWindowRestore = function(event){

        if(!minimized) return;

        minimized = false;
        var currentWindow = null;
        var length = windows.length;

        for(var i = 0; i < length; i++){

            currentWindow = windows[i];
            currentWindow.restore();
        }
    };

    DockingManager.prototype.onWindowMinimize = function(event){

        if(minimized) return;
        minimized = true;

        var currentWindow = null;
        var length = windows.length;

        for(var i = 0; i < length; i++){

            currentWindow = windows[i];
            currentWindow.minimize();
        }
    };

    DockingManager.prototype.onWindowMove = function(event){

        var currentWindow = event.target;

        var dWindow = null;
        var position = {x: null, y: null};

        for(var i = windows.length - 1; i >= 0; i--){

            dWindow = windows[i];

            dWindow.openfinWindow.bringToFront();

            if(currentWindow == dWindow || currentWindow.has(dWindow) || dWindow.has(currentWindow)) continue;

            var snappingPosition = this.isSnapable(event.bounds, dWindow);

            if(!snappingPosition) snappingPosition = this._reverse(this.isSnapable(dWindow, event.bounds));

            if(snappingPosition){

                var pos = this.snapToWindow(event, dWindow, snappingPosition);
                if(!position.x)position.x = pos.x;
                if(!position.y)position.y = pos.y;
                this.addToSnapList(currentWindow, dWindow);

            } else {

                this.removeFromSnapList(currentWindow, dWindow);
            }

        }

        if(position.x || position.y) {

            event.preventDefault = true;

            position.x = position.x ? position.x : event.bounds.x;
            position.y = position.y ? position.y : event.bounds.y;

            currentWindow.moveTo(position.x, position.y);
        }
    };

    DockingManager.prototype.isSnapable = function(currentWidow, window){

        var isInVerticalZone = this._isPointInVerticalZone(window.y, window.y + window.height, currentWidow.y, currentWidow.height);

        if((currentWidow.x > window.x + window.width && currentWidow.x < window.x + window.width + this.range) && isInVerticalZone){

            return "right";

        } else if((currentWidow.x + currentWidow.width > window.x - this.range && currentWidow.x + currentWidow.width < window.x ) && isInVerticalZone){

            return "left";

        } else {

            var isInHorizontalZone = this._isPointInHorizontalZone(window.x, window.x + window.width, currentWidow.x, currentWidow.width);

            if((currentWidow.y > window.y + window.height && currentWidow.y < window.y + window.height + this.range) && isInHorizontalZone){

                return "bottom";

            } else if((currentWidow.y + currentWidow.height > window.y - this.range && currentWidow.y + currentWidow.height < window.y ) && isInHorizontalZone){

                return "top";
            } else {

                return false;
            }
        }
    };

    DockingManager.prototype._isPointInVerticalZone = function(startY, endY, y, height){

        var bottom = y + height;
        return (y > startY && y < endY || bottom > startY && bottom < endY);
    };

    DockingManager.prototype._isPointInHorizontalZone = function(startX, endX, x, width){

        var rightCorner = x + width;
        return (x > startX && x < endX || rightCorner > startX && rightCorner < endX);
    };

    DockingManager.prototype._reverse = function(value){

        if(!value) return null;

        switch (value){

            case "right": return "left";
            case "left": return "right";
            case "top": return "bottom";
            case "bottom": return "top";
            default:  return null;
        }
    };

    DockingManager.prototype.snapToWindow = function(event, window, position){

        var currentWindow = event.target;

        switch(position){

            case "right": return {x: window.x + window.width + this.spacing, y: this._getVerticalEdgeSnapping(window, event.bounds) };
            case "left": return {x: window.x - currentWindow.width - this.spacing, y: this._getVerticalEdgeSnapping(window, event.bounds)};
            case "top":  return {x: this._getHorizontalEdgeSnapping(window, event.bounds), y: window.y - currentWindow.height - this.spacing};
            case "bottom": return {x: this._getHorizontalEdgeSnapping(window, event.bounds), y: window.y + window.height + this.spacing};
        }
    };

    DockingManager.prototype._getVerticalEdgeSnapping = function(window, currentWindow){

        return null;
        if(currentWindow.y <= window.y + this.range) return window.y;

        return null;
        if(currentWindow.y + currentWindow.height >= window.y + window.height - this.range) return window.y + window.height - currentWindow.height;
        return null;
    };

    DockingManager.prototype._getHorizontalEdgeSnapping = function(window, currentWindow){

        return null;

        if(currentWindow.x <= window.x + this.range) return window.screenLeft;
        if(currentWindow.x + currentWindow.width >= window.x + window.width - this.range) return window.x + window.width - currentWindow.width;

        return null;
    };

    DockingManager.prototype.addToSnapList= function (window1, window2){

        _snappedWindows[window1.name + window2.name] = [window1, window2];
    };

    DockingManager.prototype.removeFromSnapList = function (window1, window2){

        if(_snappedWindows[window1.name + window2.name])_snappedWindows[window1.name + window2.name] = null;
    };

    DockingManager.prototype.dockAllSnappedWindows = function(event){

        for(var name in _snappedWindows){

            var currentWindow = _snappedWindows[name];

            if(!currentWindow) continue;
            _snappedWindows[name] = null;

            this._addWindowToTheGroup(currentWindow[0], currentWindow[1]);
        }
    };

    DockingManager.prototype._addWindowToTheGroup = function(window1, windowGroup){

        window1.joinGroup(windowGroup, window1.onDock);
    };

    return DockingManager;

})();