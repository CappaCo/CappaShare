console.log("upload.ts loaded");

export const path = "/upload";

export async function run(req: Request): Promise<Response> {
    console.log("file upload incoming");
    const method = req.method;
    
    if (method != "POST") return new Response("method not allowed", { status: 405 });

    handleFileUpload(await req.formData());

    return new Response("<a href=\"/upload\">Back to upload</a><br><p>Hooray!</p>", { headers: { "Content-Type": "text/html" }});
}

function handleFileUpload(data: FormData) {
    const file = data.get("file");

    console.log("---------------------------------");
    console.log(data);
    console.log("title: " + data.get("title"));
    console.log("description: " + data.get("description"));
    console.log(file);
    console.log("---------------------------------");
}