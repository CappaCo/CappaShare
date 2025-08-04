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
            newElement.setAttribute("onclick", `openWarning("${link}")`);
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

const modal = new Modal("warningModal");
const modalLink = document.getElementById("warningModalLink");

function openWarning(link) {
    modalLink.setAttribute("href", link);
    modal.open();
}