console.log("upload.ts loaded");

export const path = "/upload";
const MB = 1000000;

export async function run(req: Request): Promise<Response> {
    console.log("file upload incoming");
    const method = req.method;
    
    if (method != "POST") return new Response("method not allowed", { status: 405 });

    const formData = await req.formData();

    if (!checkFormdata(formData)) return new Response("formData not found", { status: 400 });

    console.log("---------------------------------");
    console.group();

    const title = formData.get("title");
    const description = formData.get("description");
    const file = formData.get("file");

    console.log("Handling file upload");
    console.log("title: " + title);
    console.log("description: " + description);

    if (file instanceof File) {
        console.log("Samuel Morresey");
    } else {
        console.log("File is not filing rn");
        return new Response("bad", { status: 400 });
    }

    if (file.size > 10 * MB) {
        console.log("File too big");
        return new Response("bad", { status: 400 });
    }
    await handleFileUpload(file);
    console.groupEnd();
    console.log("---------------------------------");

    return new Response("<a href=\"/upload\">Back to upload</a><br><p>Hooray!</p>", { headers: { "Content-Type": "text/html" }});
}

async function handleFileUpload(file: File) {
    

    //console.log("type:" + file.type);
    console.log(file);
    const fileFr = new Uint8Array(await file.arrayBuffer());
    await Deno.writeFile(`./backend/uploads/${file.name}`, fileFr);
}

function checkFormdata(formData: FormData) {
    if (!formData) return false;

    

    return true;
}