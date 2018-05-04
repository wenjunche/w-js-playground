const target = [];

function append() {
    let payload = target.length.toString();
    let rep = 1204*1024 / payload.length; // 1K strings, 2-byte encoding
    let build = [];
    for (let i = 0; i < rep; i++) {
        build.push(payload)
    }
    const str = build.join("");
    target.push(str);
    console.log(payload, rep, str.length, performance.memory.jsHeapSizeLimit, performance.memory.totalJSHeapSize, performance.memory.usedJSHeapSize);

    setTimeout(append, 1);
}

// 2181038080
// 243269632
