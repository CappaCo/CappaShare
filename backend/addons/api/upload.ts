console.log("upload.ts loaded");

export const path = "/upload";
const MB = 1000000;

export async function run(req: Request): Promise<Response> {
    console.log("file upload incoming");
    const method = req.method;
    
    if (method != "POST") return new Response("method not allowed", { status: 405 });

    // TODO: async
    console.log("getting formdata");
    const formData = await req.formData();
    console.log("got formdata");

    if (!checkFormdata(formData)) return new Response("formData not found", { status: 400 });

    console.log("---------------------------------");
    console.group();

    const checkResponse = checkFormdata(formData);
    if (checkResponse != "ok") {
        console.error("File upload failed: " + checkResponse);
        return new Response(checkResponse);
    }

    const data = getFormdata(formData);

    const { title, description, file } = data;

    console.log("File title: " + title);
    console.log("File description: " + description);
    
    await handleFileUpload(file);
    console.groupEnd();
    console.log("---------------------------------");

    return new Response(JSON.stringify({
        message: "hooray"
    }));
}

async function handleFileUpload(file: File) {
    console.log(file);
    const fileFr = new Uint8Array(await file.arrayBuffer());
    await Deno.writeFile(`./backend/uploads/${file.name}`, fileFr);
}

interface fileUploadFormdata {
    title: string;
    description: string;
    file: File;
}

function checkFormdata(formData: FormData): string {
    const entries = formData.entries();
    
    const file = formData.get("file");
    if (file instanceof File) {
        console.log("Samuel Morresey");
    } else {
        return "file was not a file";
    }
    return "ok";
}

function getFormdata(formData: FormData): fileUploadFormdata {
    const file = formData.get("file");

    if (file instanceof File) {
        console.log("Samuel Morresey");
    } else {
        throw new Error("File was not a file, did you check the form data first?")
    }

    return {
        "title": formData.get("title") as string,
        "description": formData.get("description") as string,
        "file": file,
    }
}

function checkFile(file: File): string {
    if (file.size > 10 * MB) {
        return "File too big";
    }

    return "ok";
}