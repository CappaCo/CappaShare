console.log("upload.ts loaded");

export const path = "/upload";

export function run(_req: Request): Response {
    return new Response(
        `hooray!`,
    );
}