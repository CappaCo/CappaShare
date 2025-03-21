function getPriority(fileName: string): number {
    console.log(`Getting priority for ${fileName}`);
    if (fileName === "index.html") return 1.0;
    if (fileName === "404.html") return 0.0;
    return 0.5;
}

export async function generateSitemap() {
    console.log("Generating sitemap...");
    const directoryPath = "build";
    const sitemapPath = "build/";
    const website = "https://share.cappabot.com";

    const files = Deno.readDir(directoryPath);
    const urls = [];

    for await (const file of files) {
        if (file.isFile && file.name.endsWith(".html")) {
            const fileName = file.name;
            console.group();
            const priority = getPriority(file.name);
            console.groupEnd();
            const priorityLine = (priority != 0.5)
                ? `
        <priority>${priority}</priority>`
                : "";

            urls.push(`\
    <url>
        <loc>${website}/${
                fileName.replace(".html", "").replace("index", "")
            }</loc>${priorityLine}
    </url>`);
        }
    }

    const sitemapContent =
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    await Deno.writeTextFile(sitemapPath + "sitemap.xml", sitemapContent);
    console.log("Sitemap generated successfully!");
}
