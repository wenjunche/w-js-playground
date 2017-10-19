"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hadouken_js_adapter_1 = require("hadouken-js-adapter");
hadouken_js_adapter_1.connect({
    uuid: 'my-uuid-123',
    devToolsPort: 9090,
    //    manifestUrl: 'http://localhost:8081/app.json'
    //    installerUI: true,
    runtime: {
        version: '8.56.24.41',
        fallbackVersion: '8.56.24.39',
        verboseLogging: true
    },
    startupApp: {
        name: 'Hello OpenFin',
        uuid: 'OpenFinHelloWorld',
        url: 'http://localhost:8081/index.html',
        applicationIcon: 'http://localhost:8081/openfin.ico',
        showTaskbarIcon: true,
        autoShow: true,
        defaultHeight: 500,
        defaultWidth: 500,
        frame: true
    },
    appAssets: [{
            src: 'https://demoappdirectory.openf.in/desktop/config/apps/OpenFin/HelloOpenFin/procexp.zip',
            alias: 'procexp',
            target: 'procexp.exe',
            version: '1.0.3',
            args: ''
        }
    ],
    //    timeout: 20,
    customItems: [
        { customData: {
                name: 'OpenFin',
                addresss: '25 Broadway'
            }
        }
    ]
}).then(logic).catch(connError);
function logic(fin) {
    fin.System.getVersion().then(function (v) { return console.error('Connected to Hadouken version', v); });
}
function connError(err) {
    console.error('Error connecting', err.message);
}
