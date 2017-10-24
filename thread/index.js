
const napa = require('napajs');

const zone = napa.zone.create('bigw', { workers: 2 });

zone.broadcast('console.log("Hello"); ');

function hello(s) {
    console.log(`${s} starting`);
    for (let i = 0; i < 100; i++) {
        console.log(`${s} ${i}`);
    }
    console.log(`${s} ending`);
    return 'Hello ' + s;
}

zone.execute(hello, ['T1']).then(result => console.log(result.value));

zone.execute(hello, ['T2']).then(result => console.log(result.value));