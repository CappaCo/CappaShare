// TODO: Add comments

console.log("Starting build...");

const sourcePath = "source";
const buildPath = "build";
const templatePath = "templates";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

try {
    console.log("Clearing build directory");
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
    const replaceFile = decoder.decode(await Deno.readFile(`./${templatePath}/${replace}`));

    const lines = file.split("\n");
    let replaceLines = replaceFile.split("\n");

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
        if (index != -1) {
            keepReplacing = true;
            console.debug(`Found ${replaceHere}`);
            lines.splice(index, 1, ...addSpaces(replaceLines, countSpaces(lines[index])));

            console.groupEnd();
            continue;
        }

        // Replace the replaceStart and replaceEnd comment
        const startIndex = lines.findIndex((line) => line.includes(replaceStart));
        const endIndex = lines.findIndex((line) => line.includes(replaceEnd));
        if (startIndex != -1 && endIndex != -1) {
            keepReplacing = true;
            console.debug(`Found ${replaceStart} to ${replaceEnd}`);
            
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
        } else if (!(startIndex != 1 || endIndex != 1)) {
            console.error(`Start ${startIndex} and end ${endIndex}`);
            throw new Error("Start without end or end without start");
        }
        console.groupEnd();
    } while (keepReplacing);

    console.groupEnd();

    file = lines.join("\n");
    return file;
}

async function buildFile(fileName: string) {
    console.group();
    console.log(`Building ${fileName}`);
    let content = decoder.decode(await Deno.readFile(`./${sourcePath}/${fileName}`));

    const fileNames = Deno.readDir(`./${templatePath}`);
    for await (const file of fileNames) {
        if (file.isFile) {
            content = await replaceInFile(content, file.name);
        }
    }
    console.groupEnd();

    // Write new data
    const newdata = encoder.encode(content);
    await Deno.writeFile(`./${buildPath}/${fileName}`, newdata);
}

for await (const file of Deno.readDir(`./${sourcePath}`)) {
    if (file.isFile) {
        // Only build html files
        if (file.name.endsWith(".html")) await buildFile(file.name);
    }
}

// Generate sitemap using genSitemap.ts
import { generateSitemap } from "./genSitemap.ts";

generateSitemap();