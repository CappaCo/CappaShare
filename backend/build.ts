// TODO: Add comments
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { generateSitemap } from "./genSitemap.ts";

const sourcePath = "source";
const buildPath = "build";
const templatePath = "templates";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

function countSpaces(line: string): string {
    let spaces = "";
    let index = 0;
    while (line.charAt(index++) === " ") {
        spaces += " ";
    }
    return spaces;
}

function addSpaces(lines: string[], spaces: string): string[] {
    return lines.map((replaceLine) => spaces + replaceLine);
}

async function replaceInFile(file: string, replace: string): Promise<string> {
    console.group();
    console.log(`Replacing ${replace}`);

    const lines = file.split("\n");

    const replaceHere = `<!-- ${replace} HERE -->`;
    const replaceStart = `<!-- ${replace} START -->`;
    const replaceEnd = `<!-- ${replace} END -->`;
    const insertHere = `<!-- INSERT HERE -->`;

    let keepReplacing;
    do {
        keepReplacing = false;
        console.group();

        // Replace the replaceHere comment
        const index = lines.findIndex((line) => line.includes(replaceHere));
        const indexFound = index != -1;

        // Replace the replaceStart and replaceEnd comment
        const startIndex = lines.findIndex((line) => line.includes(replaceStart));
        const startFound = startIndex != -1;
        const endIndex = lines.findIndex((line) => line.includes(replaceEnd));
        const endFound = endIndex != -1;

        let replaceLines;
        if (!(indexFound || (startFound && endFound))) {
            console.groupEnd();
            break;
        }

        const replaceFile = decoder.decode(await Deno.readFile(`./${templatePath}/${replace}`));
        replaceLines = replaceFile.split("\n");

        if (indexFound) {
            keepReplacing = true;
            console.log(`Found ${replaceHere}`);
            lines.splice(index, 1, ...addSpaces(replaceLines, countSpaces(lines[index])));

            console.groupEnd();
            continue;
        }

        if (startFound && endFound) {
            keepReplacing = true;
            console.log(`Found ${replaceStart} to ${replaceEnd}`);
            
            const insides = lines.slice(startIndex + 1, endIndex);
            const insidesSpaces = countSpaces(insides[0]);
            const spaces = countSpaces(lines[startIndex]);
            console.log(`Spaces: ${spaces.length}`);
            replaceLines = replaceLines.map((replaceLine) => {
                if (replaceLine.includes(insertHere)) {
                    console.group();
                    console.debug(`Found ${insertHere}`);
                    console.groupEnd();
                    const total = countSpaces(insides[0]).length - spaces.length + countSpaces(replaceLine).length;
                    return addSpaces(insides.map((line) => {return line.slice(insidesSpaces.length)}), " ".repeat(total));
                } else return replaceLine;
            }).flat();
            
            lines.splice(startIndex, endIndex - startIndex + 1, ...addSpaces(replaceLines, spaces));

            console.groupEnd();
            continue;
        } else if (!(startFound || endFound)) {
            console.error(`Start ${startIndex} and end ${endIndex}`);
            throw new Error("Start without end or end without start");
        }
        console.groupEnd();
    } while (keepReplacing);

    console.groupEnd();

    file = lines.join("\n"); 
    return file;
}

export async function buildSingleFile(content: string): Promise<string> {
    const files = Deno.readDir(`./${templatePath}`);
    const fileNames = [];
    for await (const file of files) {
        if (file.isFile) {
            fileNames.push(file.name);
        }
    }
    fileNames.sort();
    for (const fileName of fileNames) {
        content = await replaceInFile(content, fileName);
    }
    return content;
}

async function buildFile(fileName: string) {
    console.group();
    console.log(`Building ${fileName}`);
    let content = decoder.decode(await Deno.readFile(`./${sourcePath}/${fileName}`));

    content = await buildSingleFile(content);
    
    console.groupEnd();

    // Write new data
    const newdata = encoder.encode(content);
    await Deno.writeFile(`./${buildPath}/${fileName}`, newdata);
}

async function buildAllFiles() {
    console.log("Starting build...");

    try {
        console.log("Clearing build directory: " + buildPath);
        await Deno.remove(buildPath, { recursive: true });
    } catch (_e) {
        const e = _e as Error;
        if (e.name == "NotFound") {
            console.log("Build directory already clear");
        }
        else throw e;
    }
    
    console.log("Making build directory");
    await Deno.mkdir(buildPath);

    for await (const file of walk(`./${sourcePath}/`)) {
        console.log("path: " + file.path)
        const realPath = file.path.replaceAll("\\", "/").split("/").slice(1).join("/");
        console.log(realPath);
        if (realPath == "") continue;
        console.log("doing file");
        if (file.isFile) {
            // Only build html files
            console.log(realPath);
            if (checkFileNameForBuild(file.name)) {
                await buildFile(realPath);
            } else {
                await Deno.link(`./${sourcePath}/${realPath}`, `./${buildPath}/${realPath}`);
            }
        } else if (file.isDirectory) {
            await Deno.mkdir(`./${buildPath}/${realPath}`);
        }
    }
    console.log("Build complete!");

    // Generate sitemap using genSitemap.ts
    generateSitemap();
}

export function checkFileNameForBuild(filename: string) {
    const goodEndings = [".html", ".js"];

    return goodEndings.some(ending => filename.endsWith(ending));
}

// Check if we are running through console and build files
if (import.meta.main) buildAllFiles();