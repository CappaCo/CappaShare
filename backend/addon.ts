export interface AddonMeta {
    type: string;
    path: string;
    name?: string;
    description?: string;
    version?: string;
}

export interface AddonModule {
    run: (...params: any[]) => Response | Promise<Response>;
    addonType?: string;
    path?: string;
    meta?: AddonMeta;
}

export class Addon {
    fileName: string;
    module?: AddonModule;
    meta?: AddonMeta;

    constructor(fileName: string) {
        this.fileName = fileName;
    }

    async load(): Promise<void> {
        try {
            const addonImport: AddonModule = await import("./addons/" + this.fileName);
            this.checkRequirements(addonImport);
            this.module = addonImport;
            this.meta = addonImport.meta ?? {
                type: addonImport.addonType || "request",
                path: calculatePath(addonImport.path, this.fileName),
            };
        } catch (err) {
            console.error(`Failed to load addon ${this.fileName}:`, err);
        }
    }

    private checkRequirements(addonImport: AddonModule) {
        if (typeof addonImport.run !== "function") {
            throw new Error(`function "run" not found in ${this.fileName}`);
        }
    }

    run(...params: any[]): Response | Promise<Response> | ReadableStream | any {
        if (!this.module) {
            return new Response("Addon not loaded", { status: 500 });
        }
        return this.module.run(...params);
    }
}

function calculatePath(path: string | undefined, fileName: string): string {
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
    if (!path) {
        return `/${fileNameWithoutExtension}`;
    }
    if (path === "*") {
        return `/${fileNameWithoutExtension}/*`;
    }
    if (path.startsWith("/")) {
        return path;
    }
    const array = fileName.split("/").slice(0, -1);
    array.push(path)
    return "/" + array.join("/");
}