function getPriority(fileName: string): number {
    if (fileName === "/index.html") return 1.0;
    if (fileName === "404.html") return 0.0;
    return 0.5;
}

export async function generateSitemap() {
    const directoryPath = "build";
    const sitemapPath = "build/";
    const website = "https://share.cappabot.com";

    try {
        const files = Deno.readDir(directoryPath);
        const urls = [];

        for await (const file of files) {
            if (file.isFile && file.name.endsWith(".html")) {
                const priority = getPriority(file.name);
                const priorityLine = (priority != 0.5)
                    ? `
        <priority>${priority}</priority>`
                    : "";

                urls.push(`\
    <url>
        <loc>${website}/${
                    file.name.replace("index.html", "")
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
    } catch (err) {
        console.log("Error generating sitemap: " + err);
    }
}
