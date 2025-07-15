import { buildSingleFile } from "../build.ts";

export const addonType = "build";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

export async function run(fileName: string): Promise<ReadableStream> {
    console.log(`Building ${fileName} JIT`);
    const file = await Deno.readFile("./source" + fileName);
    let fileString = decoder.decode(file);
    fileString = await buildSingleFile(fileString);
    const encoded = encoder.encode(fileString);
    
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    writer.write(encoded);
    writer.close();

    return stream.readable;
}
