// web worker

this.postMessage('Worker starting up');


this.addEventListener('message', e => {
    console.log('Worker got',  e.data);
    this.postMessage({to: e.data.name})
});