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

// Modal code
class Modal {
    constructor(modalId) {
        this.modalId = modalId;
        this.element = document.getElementById(modalId);
        console.log("making new modal with:", this.element);
        this.closeButton = this.element.querySelector(".closeButton");

        this.element.onclick = (e) => {
            if (e.target == this.element) this.close();
        };

        this.closeButton.onclick = () => {
            this.close();
        };

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.close();
        });
    }

    open() {
        this.element.classList.add("open");
    }

    close() {
        this.element.classList.remove("open");
    }
}