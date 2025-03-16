console.log("Starting build...");

const sourcePath = "source";
const buildPath = "build";
const fileName = "index.html";

const carKeys = {
    "<!-- NAV BAR GOES HERE -->": ["", ""],
};

console.log("Clearing build directory");
await Deno.remove(buildPath, { recursive: true });

console.log("Making build directory");
await Deno.mkdir(buildPath);

const decoder = new TextDecoder("utf-8");
let content = decoder.decode(await Deno.readFile(`./${sourcePath}/${fileName}`));

content = content.replace("Lorem", "Yabadabadoo");

// write new data
const newdata = new TextEncoder().encode(content);
await Deno.writeFile(`./${buildPath}/${fileName}`, newdata);
