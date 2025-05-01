/*import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";

import { buildSingleFile } from "./build.ts";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

const paths = ["build", "source"];

const devMode = Deno.args[0] == "dev";

if (devMode) paths.splice(0, 1);

// This function returns the filepath of a file in the searchPath directory
// It allows html pages to be found without the need to add .html in the URL
async function getTheFile(filePath: string, searchPath: string): Promise<string> {
    // Get all of the files in the searchPath directory
    const filePaths = [];
    for await (const walkEntry of walk(`./${searchPath}`)) {
        // Only add files to the filePaths array
        if (walkEntry.isFile) {
            filePaths.push(
                // Remove searchPath from the path
                walkEntry.path.replaceAll("\\", "/").replace(searchPath, ""),
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

// API requests are to /api
function apiRequest(req: Request): Response {
    const reqMethod = req.method;
    const reqURL = new URL(req.url);
    let reqPath = reqURL.pathname.replace("/api", "");

    // If it's a status request
    if (reqPath.startsWith("/status")) {
        // Make sure it's a get request
        if (reqMethod == "GET") {
            // Remove status from the URL
            reqPath = reqPath.replace("/status", "");

            // There could be a whole bunch of statuses for each service

            // If there is no status path, say the service is up
            return new Response(
                "gup (This means that the service is up)",
            );
        } else return new Response('Only "GET" to /api/status pls');
    }

    fetch("http://localhost:8001/", { method: reqMethod, body: req.body }).then((yupResponse) => {
        if (yupResponse.status != 404) {
            return yupResponse;
        }
    });

    // Pretty much a 404 for api requests
    return new Response(`API request to ${reqPath} could not be resolved`, {
        status: 404,
    });
}

// Handle requests to the website part of CappaShare
async function websiteRequest(req: Request): Promise<Response> {
    const reqURL = new URL(req.url);
    const reqPath = reqURL.pathname;

    const reqFilePath = decodeURIComponent(reqPath);

    // Get the file
    let resFileName = "404.html"
    let realPath;
    for (const path of paths) {
        resFileName = await getTheFile(reqFilePath, path);
        realPath = path;
        if (resFileName != "/404.html") break;
    }

    if (resFileName == "/404.html") {
        console.log(`404: ${reqFilePath}`);
        realPath = paths[0];
    }

    // If it's the 404 page, the status also needs to be a 404
    const resStatus = resFileName == "/404.html" ? 404 : 200;

    // Get the mime type from the file name
    const contentType = mime.getType(resFileName);
    // If a mime type was found, set the content-type header to that, otherwise the type is text/plain
    const headers = new Headers({
        "content-type": contentType || "text/plain",
    });

    let readable;
    
    // Intercept file if in dev mode and build it JIT style
    if (devMode && resFileName.endsWith(".html")) {
        console.log(`Building ${resFileName} JIT`);
        const file = await Deno.readFile(`./${realPath}` + resFileName);
        let fileString = decoder.decode(file);
        fileString = await buildSingleFile(fileString);
        const encoded = encoder.encode(fileString);
    
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();
        writer.write(encoded);
        writer.close();

        readable = stream.readable;
    } else {
        readable = (await Deno.open(`./${realPath}` + resFileName)).readable;
    }

    // Return the response with the status and the headers
    return new Response(readable, { status: resStatus, headers: headers });
}

// Handle all requests to CappaShare
async function handler(req: Request) {
    const reqMethod = req.method;
    const reqURL = new URL(req.url);
    const reqPath = reqURL.pathname;

    // API requests
    if (reqPath.startsWith("/api")) return apiRequest(req);

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
Deno.serve(handler);*/


import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts";

import { Addon } from "./addon.ts";

// TODO: Comment stuff

let addonsEnabled = false;
const addons: Array<Addon> = [];
const websitePath = "./build/"

async function loadAddons() {
    const dirContents = Deno.readDir("./backend/");
    for await (const dirEntry of dirContents) {
        if (dirEntry.isDirectory && dirEntry.name == "addons") {
            addonsEnabled = true;
            break;
        }
    }

    if (!addonsEnabled) console.log("addons folder not found");

    if (addonsEnabled) {
        const addonsDirectory = "backend/addons/";
        const addonsFiles = walk("./" + addonsDirectory);
        for await (const addonsFile of addonsFiles) {
            console.log(addonsFile.path)
            const realPath = addonsFile.name.replaceAll("\\", "/").split("/").slice(1).join("/");
            if (realPath == "") continue;
            console.log("realPath: " + realPath);
            if (addonsFile.isFile) {
                console.log("making new addon " + "/" + realPath);
                addons.push(new Addon("/" + realPath));
            }
        }
    }
}

loadAddons();

// This function returns the filepath of a file in the searchPath directory
// It allows html pages to be found without the need to add .html in the URL
async function getTheFile(filePath: string, searchPath: string): Promise<string> {
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
    console.log("doing filePath: " + filePath);

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
    let resFileName = "404.html"
    resFileName = await getTheFile(reqFilePath, websitePath);
    console.log("resFileName: " + resFileName);

    if (resFileName == "/404.html") console.log(`404: ${reqFilePath}`);

    // If it's the 404 page, the status also needs to be a 404
    const resStatus = resFileName == "/404.html" ? 404 : 200;

    // Get the mime type from the file name
    const contentType = mime.getType(resFileName);
    // If a mime type was found, set the content-type header to that, otherwise the type is text/plain
    const headers = new Headers({
        "content-type": contentType || "text/plain",
    });

    let readable;
    
    // Intercept file if in dev mode and build it JIT style
    let useAddon;
    for (const addon of addons) {
        if (addon.check(resFileName)) {
            useAddon = addon;
        }
    }
    if (useAddon) {
        try {
            readable = useAddon.run(websitePath, resFileName)
        } catch (e) {
            console.error(e);
        }
    } else {
        readable = (await Deno.open(`./${websitePath}` + resFileName)).readable;
    }
    // Check addons for the request
    if (addonsEnabled) {
        console.log("searching in addons");
        for (const addon of addons) {
            const validPaths = [addon.path, addon.path + "/"];
            if (validPaths.includes(reqPath)) {
                console.log("found: " + addon.path);
                return await addon.run(req);
            }
        }
    }

    // Return the response with the status and the headers
    return new Response(readable, { status: resStatus, headers: headers });
}

// Handle all requests to cappabot.com
async function handler(req: Request) {
    const reqMethod = req.method;
    const reqURL = new URL(req.url);
    const reqPath = reqURL.pathname;

    console.log("reqPath: " + reqPath);

    // Check addons for the request
    console.log("Addons: " + addonsEnabled);
    if (addonsEnabled) {
        console.log("searching in addons");
        for (const addon of addons) {
            const validPaths = [addon.path, addon.path + "/"];
            if (validPaths.includes(reqPath)) {
                console.log("found: " + addon.path);
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
