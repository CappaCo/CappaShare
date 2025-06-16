console.log("Main is running at " + document.URL);

// evil sam navbar code (modified)
let prevScrollpos = 0;
let offset = 0;
const funny = false;
const nav = document.getElementsByTagName("nav")[0];

function styleTop(num) {
    nav.style.top = num + "px";
}

// Keep code in here to a minimum because it is run often, we don't want the client to lag when scrolling
document.onscroll = function onscroll() {
    const currentScrollPos = globalThis.pageYOffset;

    if (currentScrollPos < 100) {
        offset = 0;
    } else {
        if (funny) {
            offset += currentScrollPos - prevScrollpos;
        } else {
            offset += prevScrollpos - currentScrollPos;
            offset = clamp(offset, -110, 0);
        }
    }
    styleTop(offset);
    prevScrollpos = currentScrollPos;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const evilThings = document.getElementsByClassName("evilDownload");

if (evilThings.length > 0) activateEvil();

function activateEvil() {
    for (const evilThing of evilThings) {
        console.log("Sam is evil: " + evilThing);
        console.log(evilThing);
    };
}
