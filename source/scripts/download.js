console.log("download.js is yup");

const fileList = document.getElementById("fileList");

const queryString = globalThis.location.search;
console.log("queryString: " + queryString);

fetchFiles(queryString);

function fetchFiles(query = "") {
    console.log("Fetching files...");
    fetch("/api/search" + query)
        .then(handleResponse)
        .then(renderFiles)
        .catch(error => {
            console.error("Fetch error:", error);
        });
}

function handleResponse(response) {
    if (!response.ok) {
        alert("Network response was not ok: " + response.statusText);
        throw new Error("Network response was not ok: " + response.statusText);
    }

    return response.json();
}

function renderFiles(data) {
    if (!data || data.length == 0) {
        console.log("No files found");
        fileList.innerHTML = "<p>No files found.</p>";
        return;
    }

    fileList.innerHTML = "";

    for (const fileData of data) {
        const id = fileData.id;
        const title = fileData.title;
        const description = fileData.description || "No description";
        const filename = fileData.filename;
        const tags = JSON.parse(fileData.tags);
        const verified = fileData.verified === 1 || false;

        const unbuiltHtml = `
<!-- fileDisplay.html HERE -->
        `.trim();

        const link = `/files/${filename}-${id}`;

        const newElement = document.createElement("button");
        if (verified) {
            newElement.setAttribute("onclick", `window.location = "${link}";`);
        } else {
            newElement.setAttribute("onclick", `openModal("${link}")`);
        }

        const html = unbuiltHtml
            .replaceAll("{{id}}", id)
            .replaceAll("{{title}}", DOMPurify.sanitize(title))
            .replaceAll("{{description}}", DOMPurify.sanitize(description))
            .replaceAll("{{filename}}", DOMPurify.sanitize(filename))
            .replaceAll("{{tags}}", DOMPurify.sanitize(tags.join(", ")))
            .replaceAll("{{verified}}", verified ? "Verified" : "Not Verified");

        newElement.innerHTML = html;
        fileList.appendChild(newElement);
    }
}

const modal = document.getElementById("warningModal");
const modalLink = document.getElementById("warningModalLink");

modal.onclick = function (e) {
    if (e.target == modal) {
        closeModal();
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
})

function openModal(link) {
    modal.classList.add("open");
    modalLink.setAttribute("href", link);
}

function closeModal() {
    modal.classList.remove("open");
}