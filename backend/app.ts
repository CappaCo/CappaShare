import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";

import { Addon } from "./addon.ts";
import { checkFileNameForBuild } from "./build.ts";

// TODO: Comment stuff

let addonsEnabled = false; // Don't change this, it will auto detect the addons folder
const addons: Array<Addon> = [];
const websitePath = "./build/";
const sourcePath = "./source/";
const buildJIT = Deno.args[0] == "dev";

if (buildJIT) console.log("Running in dev mode so building is dynamic");

// Function to load all of the addons
async function loadAddons() {
    const dirContents = Deno.readDir("./backend/");
    for await (const dirEntry of dirContents) {
        if (dirEntry.isDirectory && dirEntry.name == "addons") {
            addonsEnabled = true;
            break;
        }
    }

    if (!addonsEnabled) {
        console.error("addons folder not found");
        return;
    }

    const addonsDirectory = "./backend/addons/";
    const addonsFiles = walk(addonsDirectory);
    for await (const addonsFile of addonsFiles) {
        const realPath = addonsFile.path.replaceAll("\\", "/").split("/").slice(2).join("/");
        if (realPath == "") continue;
        if (addonsFile.isFile) {
            const addon = new Addon(realPath);
            await addon.load();
            addons.push(addon);
        }
    }
}

loadAddons();

// This function returns the filepath of a file in the searchPath directory
// It allows html pages to be found without the need to add .html in the URL
async function getTheFile(filePath: string, searchPath: string): Promise<string> {
    //console.log("Getting the file: " + filePath);
    // Get all of the files in the searchPath directory
    const filePaths = [];
    for await (const walkEntry of walk(`./${searchPath}`)) {
        // Only add files to the filePaths array
        if (walkEntry.isFile || walkEntry.isSymlink) {
            filePaths.push(
                // Remove searchPath from the path
                "/" + walkEntry.path.replaceAll("\\", "/").split("/").slice(1).join("/"),
            );
        }
    }

    // The / path returns index.html
    if (filePath == "/" && filePaths.includes("/index.html")) return "/index.html";

    // If we add .html to the requested filePath, is it found in filePaths?
    // If so, return that file with the .html extension
    if (filePaths.includes(filePath + ".html")) return filePath + ".html";

    // If the file is found then return that file
    if (filePaths.includes(filePath)) return filePath;

    // If no files are found, return the 404 page
    return "/404.html";
}

// Handle requests to the website part of CappaShare
async function websiteRequest(req: Request): Promise<Response> {
    const reqURL = new URL(req.url);
    const reqPath = reqURL.pathname;

    const reqFilePath = decodeURIComponent(reqPath);

    // Get the file
    let resFileName;
    let realPath;
    resFileName = await getTheFile(reqFilePath, websitePath);
    if (resFileName == "/404.html") {
        resFileName = await getTheFile(reqFilePath, sourcePath);
        if (resFileName != "/404.html") {
            realPath = sourcePath;
        }
    } else {
        realPath = websitePath;
    }
    //console.log("resFileName: " + resFileName);
    //console.log("realPath:", realPath);

    if (resFileName == "/404.html") console.log(`404: ${reqFilePath}`);

    // If it's the 404 page, the status also needs to be a 404
    const resStatus = resFileName == "/404.html" ? 404 : 200;

    // Get the mime type from the file name
    const contentType = mime.getType(resFileName);
    // If a mime type was found, set the content-type header to that, otherwise the type is text/plain
    const headers = new Headers({
        "content-type": contentType || "text/plain",
    });

    let readable: ReadableStream<Uint8Array<ArrayBuffer>>;

    // Check addons for building the file JIT
    //console.log("Building file JIT: " + buildJIT);
    if (addonsEnabled && buildJIT) {
        for (const addon of addons) {
            if (addon.meta?.type != "build" || !checkFileNameForBuild(resFileName)) continue;
            const result = await addon.run(resFileName);
            if (result instanceof ReadableStream) {
                readable = result;
            } else {
                throw new Error("Build addon didn't return a readable stream!")
            }
            // If readable is set, break out of the loop
            if (readable) break;
        }
    }
    
    readable ??= (await Deno.open(`./${realPath}` + resFileName)).readable;

    // Return the response with the status and the headers
    return new Response(readable, { status: resStatus, headers: headers });
}

function matchPath(addonPath: string, reqPath: string): boolean {
    if (addonPath.endsWith("/*")) {
        const base = addonPath.slice(0, -2);
        return reqPath.startsWith(base);
    }
    return addonPath === reqPath;
}

// Handle all requests to cappabot.com
async function handler(req: Request) {
    const reqMethod = req.method;
    const reqURL = new URL(req.url);
    const reqPath = reqURL.pathname;

    //console.log("Request path: " + reqPath);

    // Check addons for the request
    if (addonsEnabled) {
        for (const addon of addons) {
            // Check if the addon is a request type
            if (addon.meta?.type !== "request") continue;
            if (addon.meta?.path && matchPath(addon.meta.path, reqPath)) {
                console.log("found: " + addon.meta.path);
                return await addon.run(req);
            }
        }
    }

    // If the request method is GET
    if (reqMethod == "GET") {
        // Get parts of the website
        return await websiteRequest(req);
    } else {
        // Otherwise it's a bad request
        return new Response("Yeah idk", { status: 400 });
    }
}

// Serve with deno
Deno.serve(handler);
