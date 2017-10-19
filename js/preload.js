
window.mypreload = true;

console.log(`Hello from my preload script ${location.href} `);


window.addEventListener("DOMContentLoaded", function() {
    console.log(`DOMContentLoaded from my preload script ${location.href} `);
});