console.log("Main is running");
// evil sam navbar code
/* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
let prevScrollpos = window.pageYOffset;
const nav = document.getElementsByTagName("nav")[0];
const hiddenTagName = "hidden";
window.onscroll = function() {
    const currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        nav.classList.remove(hiddenTagName);
    } else {
        nav.classList.add(hiddenTagName);
    }
    prevScrollpos = currentScrollPos;
}