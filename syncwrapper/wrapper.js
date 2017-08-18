
fin.desktop.main(() => {
    fin.desktop.sync = {
        promisedMoveBy: function(wnd, deltaLeft, deltaTop) {
            return new Promise((resolve, reject) => {
                wnd.moveBy(deltaLeft, deltaTop, () => { console.log("moved"); resolve(true) }, (err) => { reject(err); });
            });
        },
        moveByAsync: async function(wnd, deltaLeft, deltaTop) {
            const resp = await fin.desktop.sync.promisedMoveBy(wnd, deltaLeft, deltaTop);
            console.log('back from await', resp);
            return resp;
        },
        moveBy: function(wnd, deltaLeft, deltaTop) {
            const resp = fin.desktop.sync.moveByAsync(wnd, deltaLeft, deltaTop);
            let res;
            resp.then(d => res = d);
            return res;
        },
        getResponseSize: async function(url) {
            const resp = await fetch(url);
            const reader = resp.body.getReader();
            let result = await reader.read();
            let total = 0;
            while (!result.done) {
                const value = result.value;
                total += value.length;
                console.log("received chunk", value);
                result = await reader.read();
            }
            return total;
        }
    }
});
