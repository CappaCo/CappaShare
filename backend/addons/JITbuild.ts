import { buildSingleFile } from "../build.ts";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

async function run(realPath: string, resFileName: string) {
    console.log(`Building ${resFileName} JIT`);
    const file = await Deno.readFile(`./${realPath}` + resFileName);
    let fileString = decoder.decode(file);
    fileString = await buildSingleFile(fileString);
    const encoded = encoder.encode(fileString);
    
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    writer.write(encoded);
    writer.close();
    
    return stream.readable;
}

function check(fileName: string) {
    return fileName.endsWith(".html");
}