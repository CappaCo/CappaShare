console.log("upload.ts loaded");

export const path = "/upload";

export async function run(req: Request): Promise<Response> {
    console.log("file upload incoming");
    const method = req.method;
    
    if (method != "POST") return new Response("method not allowed", { status: 405 });

    console.log("---------------------------------");
    console.group();
    handleFileUpload(await req.formData());
    console.groupEnd();
    console.log("---------------------------------");

    return new Response("<a href=\"/upload\">Back to upload</a><br><p>Hooray!</p>", { headers: { "Content-Type": "text/html" }});
}

async function handleFileUpload(data: FormData) {
    const title = data.get("title");
    const description = data.get("description");
    const file = data.get("file");

    console.log("Handling file upload");
    console.log("title: " + title);
    console.log("description: " + description);

    if (file instanceof File) {
        console.log("Samuel Morresey");
    } else {
        console.log("File is not filing rn");
        return;
    }

    if (file.size > 100000) {
        console.log("File too big");
        return;
    }

    console.log(file);
    const fileFr = new Uint8Array(await file.arrayBuffer());
    await Deno.writeFile(`./backend/uploads/${file.name}`, fileFr);
}