console.log("download.js is yup");

const fileList = document.getElementById("fileList");

// TODO: query string for searching
fetch("/api/search")
    .then(response => response.json())
    .then(renderFiles)
    .catch(error => {
        console.error("Fetch error:", error);
    });

function renderFiles(data) {
    fileList.innerHTML = "";
    console.log("rendering data:", data);

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

        const newElement = document.createElement("a");
        newElement.setAttribute("href", link);

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