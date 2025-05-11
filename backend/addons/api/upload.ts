console.log("upload.ts loaded");

export const path = "/upload";

export function run(req: Request): Response {
    console.log(req);
    return new Response(
        `hooray!`,
    );
}