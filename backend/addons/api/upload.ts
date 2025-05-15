console.log("upload.ts loaded");

export const path = "/upload";

export function run(req: Request): Response {
    const { method, body } = req;
    
    if (method != "POST") return new Response("method not allowed", { status: 405 });

    console.log("body: " + body);

    return new Response(`hooray!`);
}