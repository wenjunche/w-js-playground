
window.mypreload = true;
var _preload = 12345;
console.log('setting _preload', _preload);

console.log(`Hello from my preload script again18 ${location.href} `);
if(location.href === 'https://openfin.co/') {
    console.log('trying to stopNavigation()')
    fin.window.getCurrentSync().stopNavigation();
}

window.addEventListener("DOMContentLoaded", function() {
    console.log(`DOMContentLoaded from my preload script ${location.href} `);
});

fin.desktop.main(() => {
    console.log(`preload script callback to desktop.main `);
    fin.desktop.InterApplicationBus.publish('preload_script', 'from preload');
});

function delay() {
    return new Promise(resovle => setTimeout(resovle, 300));
}

async function delayLog(item) {
    await delay();
    console.log(item);
}

async function processArr(array) {
    array.forEach(async (item) => {
        await delayLog(item);
    });
    console.log('done for forEach');
    for (const item of array) {
        await delayLog(item);
    }
    console.log('done for for of');
}

async function processArr2(array) {
    const promises = array.map(delayLog);
    await Promise.all(promises);
    console.log('done promise.all');
}

async function processArr3(array) {
    await array.reduce((p, e, i) => p.then(async () => {
        await delayLog(e);
    }), Promise.resolve());
    console.log('done processArr3');
}
//processArr3([1,2,3]);
//console.log('done');

var myProperty = Symbol('myProperty');

class class1 {
    constructor() {
        this[myProperty] = 'hello';
    }
}
let ccc = new class1();

class Rectangle{
    constructor(height, width) {
        this.name = 'Rectangle';
        this.height = height;
        this.width = width;

        this.logNbSides();
    }
    logNbSides() {
        console.log('I have 4 sides');
        return 'I have 4 sides';
    }
}
class Square extends Rectangle {
    constructor(length) {
        super(length, length);
        console.log(`length ${this.width}`);
    }
    logNbSides() {
        console.log(super.logNbSides() + ' which are all equal');
        return super.logNbSides() + ' which are all equal';
    }
}

// Deep clone
function structuralClone1(obj) {
    const oldState = history.state;
    history.replaceState(obj, document.title);
    const copy = history.state;
    history.replaceState(oldState, document.title);
    return copy;
}
function structuralClone2(obj) {
    return new Notification('', {data: obj, silent: true}).data;
}

function visibilityChangedDecorator(payload, args) {
    const [, visible, closing] = args;
    console.log(visible, closing);
}

async function getM() {
    console.log('getMonitorInfo')
    var m = await fin.System.getMonitorInfo()
    console.log(m)
}

getM()
