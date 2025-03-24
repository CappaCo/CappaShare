console.log("Main is running at " + document.URL);

// evil sam navbar code (modified)
let prevScrollpos = globalThis.pageYOffset;
const nav = document.getElementsByTagName("nav")[0];
const hiddenTagName = "hidden";

globalThis.onscroll = function() {
    const currentScrollPos = globalThis.pageYOffset;
    if (prevScrollpos > currentScrollPos || currentScrollPos < 100) {
        nav.classList.remove(hiddenTagName);
    } else {
        nav.classList.add(hiddenTagName);
    }
    prevScrollpos = currentScrollPos;
}