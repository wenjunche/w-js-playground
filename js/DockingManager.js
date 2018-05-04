(function () {
    'use strict';

    function applyOptions(instance, options) {
        if (!options) {
            return;
        }

        // 'range' is the distance between windows at which snapping applies
        if (!isNaN(Number.parseInt(options.range, 10)) && options.range >= 0) {
            instance.range = options.range;
        }

        // 'spacing' is the distance between windows when they become docked
        if (!isNaN(Number.parseInt(options.spacing, 10)) && options.spacing >= 0) {
            instance.spacing = options.spacing;
        }

        // 'undockOffsetX/Y' are offset values - they make the undocked window 'jump' a number of pixels
        if (!isNaN(Number.parseInt(options.undockOffsetX, 10)) && options.undockOffsetX >= 0) {
            instance.undockOffsetX = options.undockOffsetX;
        }
        if (!isNaN(Number.parseInt(options.undockOffsetY, 10)) && options.undockOffsetY >= 0) {
            instance.undockOffsetY = options.undockOffsetY;
        }

        // 'dockableToOthers' is a boolean which applies only to DockingWindow
        if (options.dockableToOthers === true || options.dockableToOthers === false) {
            instance.dockableToOthers = options.dockableToOthers;
        }
    }


    function intersect(rectangle, targetRectangle) {
        // check right edge position of first window is to the left of left edge of second window, and so on ..
        // comparison is <= as (xpos + width) is one pixel to the right of the window
        return !(
            rectangle.x + rectangle.width <= targetRectangle.x ||
            targetRectangle.x + targetRectangle.width <= rectangle.x ||
            rectangle.y + rectangle.height <= targetRectangle.y ||
            targetRectangle.y + targetRectangle.height <= rectangle.y
        );
    }

    function isInView(rectangle, monitors) {
        return monitors.some(monitor => intersect(rectangle, monitor) && rectangle.y >= monitor.y);
    }

    function isGroupInView(rectangles, monitors) {
        return rectangles.some(rectangle => isInView(rectangle, monitors));
    }

    function isPointInVerticalZone(startY, endY, y, height) {
        const bottomEdgePosition = y + height;
        return y >= startY && y <= endY || bottomEdgePosition >= startY && bottomEdgePosition <= endY;
    }

    function isPointInHorizontalZone(startX, endX, x, width) {
        const rightEdgePosition = x + width;
        return x >= startX && x <= endX || rightEdgePosition >= startX && rightEdgePosition <= endX;
    }

    function getSnapDirection(currentWindow, window) {
        const isInVerticalZone = isPointInVerticalZone(window.y, window.y + window.height, currentWindow.y, currentWindow.height);

        if (isInVerticalZone && currentWindow.x > window.x + window.width - currentWindow.currentRange && currentWindow.x < window.x + window.width + currentWindow.currentRange) {
            return 'right';
        }

        if (isInVerticalZone && currentWindow.x + currentWindow.width > window.x - currentWindow.currentRange && currentWindow.x + currentWindow.width < window.x + currentWindow.currentRange) {
            return 'left';
        }

        const isInHorizontalZone = isPointInHorizontalZone(window.x, window.x + window.width, currentWindow.x, currentWindow.width);

        if (isInHorizontalZone && currentWindow.y > window.y + window.height - currentWindow.currentRange && currentWindow.y < window.y + window.height + currentWindow.currentRange) {
            return 'bottom';
        }

        if (isInHorizontalZone && currentWindow.y + currentWindow.height > window.y - currentWindow.currentRange && currentWindow.y + currentWindow.height < window.y + currentWindow.currentRange) {
            return 'top';
        }

        return false;
    }

    function reverseSnapDirection(direction) {
        switch (direction) {
            case 'right':
                return 'left';
            case 'left':
                return 'right';
            case 'top':
                return 'bottom';
            case 'bottom':
                return 'top';
            default:
                return null;
        }
    }

    /* globals fin */
    const {Application, System} = fin.desktop;

    const GroupEventReason = {
        DISBAND: 'disband',
        JOIN: 'join',
        LEAVE: 'leave',
        MERGE: 'merge'
    };

    const GroupEventMemberOf = {
        NOTHING: 'nothing',
        SOURCE: 'source',
        TARGET: 'target'
    };

    function getAppId() {
        return Application.getCurrent().uuid;
    }

    function requestMonitorInfo(handler) {
        System.getMonitorInfo(handler);
    }

    /* globals localStorage */

    class LocalStoragePersistence {
        constructor(idPrefix) {
            this.prefix = idPrefix;
        }

        createRelationship(id1, id2) {
            const partners = this.retrieveRelationshipsFor(id1);
            if (partners.indexOf(id2) !== -1) {
                return;
            }
            partners.push(id2);
            localStorage.setItem(this.getFullStorageKey(id1), JSON.stringify(partners));
        }

        createRelationshipsBetween(id1, id2) {
            this.createRelationship(id1, id2);
            this.createRelationship(id2, id1);
        }

        retrieveRelationshipsFor(id) {
            const storedRelationships = JSON.parse(localStorage.getItem(this.getFullStorageKey(id)));
            return storedRelationships || [];
        }

        removeRelationship(id1, id2) {
            const currentPartners = this.retrieveRelationshipsFor(id1);
            const partnerIndex = currentPartners.indexOf(id2);
            if (partnerIndex === -1) {
                return;
            }

            currentPartners.splice(partnerIndex, 1);

            if (currentPartners.length > 0) {
                localStorage.setItem(this.getFullStorageKey(id1), JSON.stringify(currentPartners));
            } else {
                localStorage.removeItem(this.getFullStorageKey(id1));
            }
        }

        removeAllRelationships(id) {
            // grab existing partner windows before removing all trace of this window's persistence
            const currentPartners = this.retrieveRelationshipsFor(id);
            localStorage.removeItem(this.getFullStorageKey(id));

            // remove all 'reverse' relationships from partners too
            for (let i = 0; i < currentPartners.length; i++) {
                this.removeRelationship(currentPartners[i], id);
            }
        }

        getFullStorageKey(id) {
            return `${this.prefix}.${id}`;
        }
    }

    class DockingGroup {
        constructor() {
            this.children = [];
        }

        add(window) {
            if (window.group === this) {
                return;
            }

            this.children.push(window);
            window.group = this;
        }

        remove(window) {
            const index = this.children.indexOf(window);
            if (index >= 0) {
                this.children.splice(index, 1);
                window.group = null;
            }
        }
    }

    /* globals fin, Promise */

    const DOCKING_MANAGER_NAMESPACE_PREFIX = 'dockingManager.';
    const persistence = new LocalStoragePersistence(DOCKING_MANAGER_NAMESPACE_PREFIX + getAppId());

    const dockingDefaults = {
        // options initended for external configuration
        range: 40,
        undockOffsetX: 0,
        undockOffsetY: 0,
        dockableToOthers: true,
    };

    const openDockableWindows = {};

    function getWindowByName(windowList, windowName) {
        for (let i = 0; i < windowList.length; i++) {
            if (windowList[i].name === windowName) {
                return windowList[i];
            }
        }
        return null;
    }

    async function regroup(allWindowsToRegroup, previousWindow, currentWindow, isNewGroup) {
        // console.warn(`Regroup ${currentWindow.name}`);

        const currentWindowIndex = allWindowsToRegroup.indexOf(currentWindow);
        if (currentWindowIndex === -1) {
            return; // already traversed
        }

        // Important, get orig partnerships, before leave/join group destroys them below
        const partnerWindowNames = persistence.retrieveRelationshipsFor(currentWindow.name);

        // remove this window now from pending list, we should not be visiting it again
        allWindowsToRegroup.splice(currentWindowIndex, 1);

        // if this is a lone window, then leave group
        // do not trigger any additional split-checking, normal checks for off-screen etc.
        if (!previousWindow && partnerWindowNames.length === 0) {
            currentWindow.leaveDockingGroup();
            return;
        }

        if (isNewGroup) {
            await currentWindow.leaveDockingGroup(false);
            if (previousWindow) {
                // join previous partner window in new group
                currentWindow.joinDockingGroup(previousWindow);
            }
        }

        // console.warn(`handlePartners ${currentWindow.name}, ${partnerWindowNames}`);
        for (let i = 0; i < partnerWindowNames.length; i++) {
            const partnerWindow = getWindowByName(allWindowsToRegroup, partnerWindowNames[i]);

            if (partnerWindow) {
                // we actively want to serialise these operations, so parallelizing is _not_ what we want
                // eslint-disable-next-line no-await-in-loop
                await regroup(allWindowsToRegroup, currentWindow, partnerWindow, isNewGroup);
            }
        }
    }

    async function checkForSplitGroup(dockingGroup) {
        if (dockingGroup.children.length < 2) {
            return;
        }

        // console.warn(`checkForSplitGroup ${dockingGroup.children.length}`);

        let existingDockingGroup = dockingGroup;
        const windowsToRegroup = existingDockingGroup.children.concat();

        // loop, until no windows left to (re)group ....

        while (windowsToRegroup.length > 0) {
            const [startWindow] = windowsToRegroup;
            // we actively want to serialise these operations, so parallelizing is _not_ what we want
            // eslint-disable-next-line no-await-in-loop
            await regroup(windowsToRegroup, null, startWindow, !existingDockingGroup);

            if (existingDockingGroup && startWindow.group) {
                existingDockingGroup = null;
            }
        }
    }

// x = 0;
// y = 0;
// width = 0;
// height = 0;

    class DockingWindow {
        constructor(windowOrOptions, dockingOptions, monitorBounds) {
            this.createDelegates();
            this.name = windowOrOptions.name;
            this.monitorBounds = monitorBounds;
            // simple property defaults
            this.opacity = 1;
            this.acceptDockingConnection = true;
            this.minimized = false;
            this.group = null;

            if (windowOrOptions instanceof fin.desktop.Window) {
                this.openfinWindow = windowOrOptions;
            } else {
                this.openfinWindow = new fin.desktop.Window(windowOrOptions);
            }

            // OpenFin Window is definitely created now, but may not be fully initialized
            this.openfinWindow.getInfo(
                () => this.onWindowInitialized(),
                () => this.openfinWindow.addEventListener('initialized', () => this.onWindowInitialized())
            );

            applyOptions(this, Object.assign({}, dockingDefaults, dockingOptions));

            this.currentRange = this.range;
            openDockableWindows[this.name] = this;
        }

        // DockingWindow API - external handlers
        onMove() {
        }

        onMoveComplete() {
        }

        onClose() {
        }

        onFocus() {
        }

        onRestore() {
        }

        onMinimize() {
        }

        onLeaveGroup() {
        }

        setOpacity(value) {
            if (this.opacity === value) {
                return;
            }
            this.opacity = value;
            this.openfinWindow.animate({
                opacity: {
                    opacity: value,
                    duration: 0
                }
            });
        }

        minimize() {
            if (this.minimized) {
                return;
            }
            this.openfinWindow.minimize();
        }

        restore() {
            if (!this.minimized) {
                return;
            }
            this.openfinWindow.restore();
        }

        // bound functions for openfin event handlers
        // (use arrow funcs when possible, and remove this function)
        createDelegates() {
            // this.onMove = this.onMove.bind(this);
            // this.onMoveComplete = this.onMoved.bind(this);
            this.completeInitialization = this.completeInitialization.bind(this);
            this.onBoundsChanging = this.onBoundsChanging.bind(this);
            this.onBoundsChanged = this.onBoundsChanged.bind(this);
            this.onBoundsUpdate = this.onBoundsUpdate.bind(this);
            this.onMoved = this.onMoved.bind(this);
            this.onClosed = this.onClosed.bind(this);
            this.onFocused = this.onFocused.bind(this);
            this.onMinimized = this.onMinimized.bind(this);
            this.onRestored = this.onRestored.bind(this);
            this.onGroupChanged = this.onGroupChanged.bind(this);
        }

        onWindowInitialized() {
            // OpenFin window close triggers a 'hidden' event, so do not tie minimize action to this event
            this.openfinWindow.getBounds(this.completeInitialization);
            this.openfinWindow.disableFrame();
            this.openfinWindow.addEventListener('disabled-frame-bounds-changing', this.onBoundsChanging);
            this.openfinWindow.addEventListener('disabled-frame-bounds-changed', this.onBoundsChanged);
            this.openfinWindow.addEventListener('bounds-changed', this.onBoundsUpdate);
            this.openfinWindow.addEventListener('closed', this.onClosed);
            this.openfinWindow.addEventListener('minimized', this.onMinimized);
            this.openfinWindow.addEventListener('restored', this.onRestored);
            this.openfinWindow.addEventListener('shown', this.onRestored);
            this.openfinWindow.addEventListener('focused', this.onFocused);
            this.openfinWindow.addEventListener('group-changed', this.onGroupChanged);
        }

        completeInitialization(initialWindowBounds) {
            this.onBoundsUpdate(initialWindowBounds);

            const formerDockingPartners = persistence.retrieveRelationshipsFor(this.name);
            for (let i = 0; i < formerDockingPartners.length; i++) {
                const potentialPartnerName = formerDockingPartners[i];
                const potentialPartnerWindow = openDockableWindows[potentialPartnerName];

                /* eslint-disable */
                // TODO: push this stuff out into util class
                if (!potentialPartnerWindow ||
                    !getSnapDirection(this, potentialPartnerWindow) &&
                    !getSnapDirection(potentialPartnerWindow, this)) {
                    /* eslint-enable */
                    // garbage collection, essentially
                    // note, if a former partner has not been opened yet, then re-connecting
                    // that pair of windows will be handled by that window's persisted relationships
                    persistence.removeRelationship(this.name, potentialPartnerName);
                } else {
                    this.joinDockingGroup(potentialPartnerWindow);
                }
            }
        }

        onBoundsUpdate(bounds) {
            this.x = bounds.left;
            this.y = bounds.top;
            this.width = bounds.width;
            this.height = bounds.height;
        }

        onBoundsChanging(bounds) {
            const event = {
                target: this,
                preventDefault: false,
                bounds: {
                    x: bounds.left,
                    y: bounds.top,
                    width: this.width,
                    height: this.height,
                    changedWidth: bounds.width,
                    changedHeight: bounds.height
                }
            };

            this.onMove(event);

            if (event.preventDefault) {
                return;
            }

            if (!this.group) {
                this.setOpacity(0.5);
            }

            this.moveTo(bounds.left, bounds.top, bounds.width, bounds.height);
        }

        moveTo(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width || this.width;
            this.height = height || this.height;

            this.openfinWindow.removeEventListener('disabled-frame-bounds-changing', this.onBoundsChanging);
            this.openfinWindow.setBounds(x, y, this.width, this.height, this.onMoved);
        }

        onBoundsChanged() {
            this.setOpacity(1);
            this.onMoveComplete({target: this});
        }

        onMoved() {
            this.openfinWindow.addEventListener('disabled-frame-bounds-changing', this.onBoundsChanging);
        }

        onClosed() {
            this.onClose({target: this});
        }

        onFocused() {
            this.onFocus(this);
        }

        onMinimized() {
            this.minimized = true;
            this.onMinimize(this);
        }

        onRestored() {
            this.minimized = false;
            this.onRestore(this);
        }

        onGroupChanged(groupEvent) {
            if (groupEvent.reason === GroupEventReason.LEAVE && groupEvent.sourceWindowName === this.name) {
                this.onLeaveGroup(this.name);
            }
        }

        joinDockingGroup(snappedPartnerWindow) {
            if (!this.dockableToOthers || !snappedPartnerWindow.acceptDockingConnection) {
                return;
            }

            if (snappedPartnerWindow.group) {
                if (this.group) {
                    // as we do not currently allow group to group docking, short-circuit out
                    // otherwise we would need to do mergeGroup here
                    // e.g. if we inserted a window between 2 groups to 'join' them
                    return;
                }

                for (let i = 0; i < snappedPartnerWindow.group.children.length; i++) {
                    if (intersect(this, snappedPartnerWindow.group.children[i])) {
                        return;
                    }
                }
            } else {
                if (this.group) {
                    snappedPartnerWindow.joinDockingGroup(this);
                    return;
                }
            }

            // openfin operations: frame and grouping
            // if both ungrouped, this will set up the initial group with both windows as members
            this.openfinWindow.enableFrame();
            snappedPartnerWindow.openfinWindow.enableFrame();
            this.openfinWindow.joinGroup(snappedPartnerWindow.openfinWindow);

            if (!this.group && !snappedPartnerWindow.group) {
                // both ungrouped .. set partner up with new group
                const dockingGroup = new DockingGroup();
                dockingGroup.add(snappedPartnerWindow);
                fin.desktop.InterApplicationBus.publish('window-docked', {windowName: snappedPartnerWindow.name});
            }

            snappedPartnerWindow.group.add(this);
            fin.desktop.InterApplicationBus.publish('window-docked', {windowName: this.name});

            persistence.createRelationshipsBetween(this.name, snappedPartnerWindow.name);
        }

        async leaveDockingGroup(isInitiator) {
            const {group} = this;
            if (!group) {
                return;
            }

            // disconnect from docking group as soon as possible to avoid
            // any interference in leaveGroup handling
            group.remove(this);

            this.openfinWindow.disableFrame();
            // detach window from OpenFin runtime group
            try {
                await new Promise((resolve, reject) => this.openfinWindow.leaveGroup(
                    () => resolve(),
                    (err) => reject(err)
                ));
            } catch (err) {
                // do not need further action here, this is likely due to a close, and window is gone
            }

            fin.desktop.InterApplicationBus.publish('window-undocked', {windowName: this.name});

            if (isInitiator) {
                // if this window initiated the undock procedure, move apart slightly from group
                this.openfinWindow.moveBy(this.undockOffsetX, this.undockOffsetY);
            }
            else if (!isInView(this, this.monitorBounds)) {
                // if indirectly undocked e.g. last window in group
                this.moveTo(0, 0, this.width, this.height);
            }

            if (group.children.length === 1) {
                group.children[0].leaveDockingGroup();
            }

            if (group.children.length > 0 && !isGroupInView(group.children, this.monitorBounds)) {
                group.children[0].moveTo(0, 0);
            }

            persistence.removeAllRelationships(this.name);

            if (isInitiator) {
                checkForSplitGroup(group);
            }
        }
    }

    /* globals Reflect */

    const DockingManager = (function () {
        let instance = null;
        const windows = [];
        const snappedWindows = {};
        const monitors = [];

        function handleMonitorInfo(openfinMonitorInfo) {
            const primaryMonitorBounds = openfinMonitorInfo.primaryMonitor.availableRect;
            monitors.push({
                x: primaryMonitorBounds.left,
                y: primaryMonitorBounds.top,
                width: primaryMonitorBounds.right - primaryMonitorBounds.left,
                height: primaryMonitorBounds.bottom - primaryMonitorBounds.top
            });

            const currentMonitors = openfinMonitorInfo.nonPrimaryMonitors;
            for (let i = 0; i < currentMonitors.length; i++) {
                const nonPrimaryMonitorBounds = currentMonitors[i].availableRect;
                monitors.push({
                    x: nonPrimaryMonitorBounds.left,
                    y: nonPrimaryMonitorBounds.top,
                    width: nonPrimaryMonitorBounds.right - nonPrimaryMonitorBounds.left,
                    height: nonPrimaryMonitorBounds.bottom - nonPrimaryMonitorBounds.top
                });
            }
        }

        function DockingManagerConstructor() {
            this.createDelegates();
            requestMonitorInfo(handleMonitorInfo);
        }

        DockingManagerConstructor.getInstance = function () {
            // Deprecated:
            //     Use app framework or similar to manage single instance and access to DockableManagerConstructor instance
            if (!instance) {
                instance = new DockingManagerConstructor();
            }
            return instance;
        };

        DockingManagerConstructor.getMonitorInfo = function () {
            return monitors;
        };

        DockingManagerConstructor.prototype.range = 40;
        DockingManagerConstructor.prototype.spacing = 5;
        DockingManagerConstructor.prototype.undockOffsetX = 0;
        DockingManagerConstructor.prototype.undockOffsetY = 0;

        DockingManagerConstructor.prototype.init = function (dockingOptions) {
            applyOptions(this, dockingOptions);
        };

        DockingManagerConstructor.prototype.createDelegates = function () {
            this.onWindowMove = this.onWindowMove.bind(this);
            this.onWindowClose = this.onWindowClose.bind(this);
            this.bringWindowOrGroupToFront = this.bringWindowOrGroupToFront.bind(this);
            this.onWindowRestore = this.onWindowRestore.bind(this);
            this.onWindowMinimize = this.onWindowMinimize.bind(this);
            this.dockAllSnappedWindows = this.dockAllSnappedWindows.bind(this);
        };

        DockingManagerConstructor.prototype.undockWindow = function (windowName) {
            for (let i = 0; i < windows.length; i++) {
                if (windows[i].name === windowName) {
                    windows[i].leaveDockingGroup(true);
                }
            }
        };

        DockingManagerConstructor.prototype.undockAll = function () {
            for (let i = 0; i < windows.length; i++) {
                windows[i].leaveDockingGroup();
            }
        };

        DockingManagerConstructor.prototype.register = function (window, dockableToOthers) {
            if (windows.some(registeredWindow => registeredWindow.name === window.name)) {
                return;
            }

            const dockingOptions = {
                range: this.range,
                undockOffsetX: this.undockOffsetX,
                undockOffsetY: this.undockOffsetY,
                dockableToOthers: dockableToOthers !== false
            };
            const dockingWindow = new DockingWindow(window, dockingOptions, monitors);
            dockingWindow.onMove = this.onWindowMove;
            dockingWindow.onMoveComplete = this.dockAllSnappedWindows;
            dockingWindow.onClose = this.onWindowClose;
            dockingWindow.onFocus = this.bringWindowOrGroupToFront;
            dockingWindow.onRestore = this.onWindowRestore;
            dockingWindow.onMinimize = this.onWindowMinimize;
            dockingWindow.onLeaveGroup = this.undockWindow;
            windows.push(dockingWindow);
        };

        DockingManagerConstructor.prototype.unregister = function (window) {
            this.unregisterByName(window.name);
        };

        DockingManagerConstructor.prototype.unregisterByName = function (windowName) {
            for (let i = 0; i < windows.length; i++) {
                if (windows[i].name === windowName) {
                    const [removedDockableWindow] = windows.splice(i, 1);
                    // purge from DockableGroup etc., otherwise it will still influence other DockableWindows
                    removedDockableWindow.leaveDockingGroup(true);
                }
            }
        };

        DockingManagerConstructor.prototype.onWindowClose = function (event) {
            this.unregister(event.target);
        };

        DockingManagerConstructor.prototype.bringWindowOrGroupToFront = function (dockingWindow) {
            const affectedWindows = dockingWindow.group
                ? dockingWindow.group.children
                : [dockingWindow];

            for (let i = 0; i < affectedWindows.length; i++) {
                affectedWindows[i].openfinWindow.bringToFront();
            }
        };

        DockingManagerConstructor.prototype.onWindowRestore = function (dockableWindow) {
            if (!dockableWindow.group) {
                return;
            }

            const windowsInGroup = dockableWindow.group.children;
            for (let i = 0; i < windowsInGroup.length; i++) {
                windowsInGroup[i].restore();
            }
        };

        DockingManagerConstructor.prototype.onWindowMinimize = function (dockableWindow) {
            if (!dockableWindow.group) {
                return;
            }

            const windowsInGroup = dockableWindow.group.children;
            for (let i = 0; i < windowsInGroup.length; i++) {
                windowsInGroup[i].minimize();
            }
        };

        DockingManagerConstructor.prototype.onWindowMove = function (event) {
            const currentWindow = event.target;
            if (currentWindow.group) {
                return;
            }

            // eslint-disable-next-line
            // TODO: refactor mutable event
            event.bounds.currentRange = currentWindow.currentRange;

            const position = {
                x: null,
                y: null
            };

            for (let i = windows.length - 1; i >= 0; i--) {
                const dockableWindow = windows[i];
                let snapDirection = getSnapDirection(event.bounds, dockableWindow);

                if (!snapDirection) {
                    snapDirection = reverseSnapDirection(getSnapDirection(dockableWindow, event.bounds));
                }

                if (snapDirection) {
                    currentWindow.currentRange = currentWindow.range + 10;
                    // eslint-disable-next-line
                    // TODO: keep DOM events to handlers, or preferably contain within DW
                    const pos = this.getSnappedCoordinates(event, dockableWindow, snapDirection);

                    this.bringWindowOrGroupToFront(dockableWindow);

                    if (!position.x) {
                        position.x = pos.x;
                    }

                    if (!position.y) {
                        position.y = pos.y;
                    }

                    this.addToSnapList(currentWindow, dockableWindow);
                } else {
                    currentWindow.currentRange = currentWindow.range;
                    this.removeFromSnapList(currentWindow, dockableWindow);
                }
            }

            if (position.x || position.y) {
                event.preventDefault = true;

                position.x = position.x ? position.x : event.bounds.x;
                position.y = position.y ? position.y : event.bounds.y;
                currentWindow.moveTo(position.x, position.y);

                this.checkIfStillSnapped();
            }
        };

        DockingManagerConstructor.prototype.checkIfStillSnapped = function () {
            Object.values(snappedWindows).forEach((snappedWindowInfo) => {
                if (snappedWindowInfo &&
                    !getSnapDirection(snappedWindowInfo[0], snappedWindowInfo[1]) &&
                    !getSnapDirection(snappedWindowInfo[1], snappedWindowInfo[0])) {
                    // currentWindow[1].setOpacity(1);
                    this.removeFromSnapList(snappedWindowInfo[0], snappedWindowInfo[1]);
                }
            });
        };


        DockingManagerConstructor.prototype.getSnappedCoordinates = function (event, window, position) {
            const currentWindow = event.target;
            switch (position) {
                case 'right':
                    return {
                        x: window.x + window.width + this.spacing,
                        y: this.getVerticalEdgeSnapping(window, event.bounds)
                    };
                case 'left':
                    return {
                        x: window.x - currentWindow.width - this.spacing,
                        y: this.getVerticalEdgeSnapping(window, event.bounds)
                    };
                case 'top':
                    return {
                        x: this.getHorizontalEdgeSnapping(window, event.bounds),
                        y: window.y - currentWindow.height - this.spacing
                    };
                case 'bottom':
                    return {
                        x: this.getHorizontalEdgeSnapping(window, event.bounds),
                        y: window.y + window.height + this.spacing
                    };
                default:
                    return null;
            }
        };

        DockingManagerConstructor.prototype.getVerticalEdgeSnapping = function (window, currentWindow) {
            if (currentWindow.y <= window.y + this.range && currentWindow.y >= window.y - this.range) {
                return window.y;
            }
            if (currentWindow.y + currentWindow.height >= window.y + window.height - this.range &&
                currentWindow.y + currentWindow.height <= window.y + window.height + this.range) {
                return window.y + window.height - currentWindow.height;
            }
            return null;
        };

        DockingManagerConstructor.prototype.getHorizontalEdgeSnapping = function (window, currentWindow) {
            if (currentWindow.x <= window.x + this.range && currentWindow.x >= window.x - this.range) {
                return window.x;
            }
            if (currentWindow.x + currentWindow.width >= window.x + window.width - this.range &&
                currentWindow.x + currentWindow.width <= window.x + window.width + this.range) {
                return window.x + window.width - currentWindow.width;
            }
            return null;
        };

        DockingManagerConstructor.prototype.addToSnapList = function (window1, window2) {
            snappedWindows[window1.name + window2.name] = [
                window1,
                window2
            ];
            window1.setOpacity(0.5);
            window2.setOpacity(0.5);
        };

        DockingManagerConstructor.prototype.removeFromSnapList = function (window1, window2) {
            if (snappedWindows[window1.name + window2.name]) {
                Reflect.deleteProperty(snappedWindows, window1.name + window2.name);
                window2.setOpacity(1);
            }
        };

        DockingManagerConstructor.prototype.dockAllSnappedWindows = function () {
            Object.values(snappedWindows).forEach((snappedWindowInfo) => {
                this.removeFromSnapList(snappedWindowInfo[0], snappedWindowInfo[1]);
                this.addWindowToTheGroup(snappedWindowInfo[0], snappedWindowInfo[1]);
            });
        };

        DockingManagerConstructor.prototype.addWindowToTheGroup = function (snappedWindow, groupedWindow) {
            snappedWindow.setOpacity(1);
            snappedWindow.joinDockingGroup(groupedWindow);
        };

        return DockingManagerConstructor;
    }());

    /* globals fin, localStorage, window, document, screen, console */

    /**
     * Created by haseebriaz on 03/03/15.
     */

    function onGroupChanged(groupEvent) {
        // leaving is simple ... if member of 'nothing', then this window is leaving
        if (groupEvent.memberOf === GroupEventMemberOf.NOTHING) {
            console.log('group-changed event: ' + groupEvent.name + ' left group');
            return;
        }

        // joining is a little more complicated ...
        // if sourceWindowName is the same as name, that is a primary join event
        // but at group setup, the first window is only a 'target' of a join
        // (for the 2 setup events, the target group has just those 2 members)
        if (groupEvent.reason === GroupEventReason.JOIN) {
            if (groupEvent.sourceWindowName === groupEvent.name ||
                groupEvent.targetGroup.length === 2 &&
                groupEvent.targetWindowName  === groupEvent.name) {
                console.log('group-changed event: ' + groupEvent.name + ' joined group');
            }
        }
    }

    function createAndRegister(windowNameSuffix) {
        const windowOptions = {
            name: `child${windowNameSuffix}`,
            url: 'childWindow.html',
            defaultWidth: 200,
            defaultHeight: 150,
            defaultTop: (screen.availHeight - 200) / 2,
            defaultLeft: (screen.availWidth - 150) / 2,
            frame: false,
            autoShow: true
        };

        const openfinWindow = new fin.desktop.Window(
            windowOptions,
            function() {
                DockingManager.getInstance().register(openfinWindow);
            }
        );

        // To test using DockingWindow to create the OpenFin window
        //
        // dockingManager.register(windowOptions);

        openfinWindow.addEventListener('group-changed', onGroupChanged);
    }

    function onOpenFinReady() {
        const dockingManager = new DockingManager();
        // Still works: var dockingManager = DockingManager.getInstance();

        // Apply init() to the DockingManager singleton as below
        // if you want to modify the docking parameters
        //
        // dockingManager.init({
        //     spacing: 0,
        //     range: 10,
        //     undockOffsetX: 15,
        //     undockOffsetY: 15
        // });

        dockingManager.register(fin.desktop.Window.getCurrent(), false);

        let counter = 0;
        document.getElementById('createWindows').onclick = () => { createAndRegister(++counter); };

        // convenience to restore up to 10 docked child windows from previous persistance
        for (let tempCounter = 0; tempCounter < 10; tempCounter++) {
            const DOCKING_MANAGER_NAMESPACE_PREFIX = 'dockingManager.';
            const windowStorageKey = `${DOCKING_MANAGER_NAMESPACE_PREFIX}${fin.desktop.Application.getCurrent().uuid}.child${tempCounter}`;
            if (localStorage.getItem(windowStorageKey)) {
                createAndRegister(tempCounter);
                counter = tempCounter;
            }
        }

        fin.desktop.InterApplicationBus.subscribe('*', 'window-docked', function(message) {
            console.log('window-docked subscription: ' + message.windowName + ' joined group');
        });

        fin.desktop.InterApplicationBus.subscribe('*', 'window-undocked', function(message) {
            console.log('window-undocked subscription: ' + message.windowName + ' left group');
        });

        // bus-based handling for external java application docking

        fin.desktop.InterApplicationBus.subscribe('*', 'register-docking-window', function(message) {
            const { appUuid, name } = message;
            console.log('Registering external window', appUuid, name);
            const javaWindow = fin.desktop.Window.wrap(appUuid, name);
            dockingManager.register(javaWindow);
        });

        fin.desktop.InterApplicationBus.publish('status-update', {status: 'ready'});
    }

    window.addEventListener('DOMContentLoaded', () => fin.desktop.main(onOpenFinReady));

}());
