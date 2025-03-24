console.log("Main is running at " + document.URL);

// evil sam navbar code (modified)
let prevScrollpos = globalThis.pageYOffset;
let offset = 0;
const nav = document.getElementsByTagName("nav")[0];

function styleTop(num) {
    nav.style.top = num + "px";
}

globalThis.onscroll = function() {
    const currentScrollPos = globalThis.pageYOffset;

    if (currentScrollPos < 100) {
        styleTop(0);
    } else {
        offset += prevScrollpos - currentScrollPos;
        offset = clamp(offset, -110, 0);
        styleTop(offset);
    }
    prevScrollpos = currentScrollPos;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);