import { client } from "./database.ts";

async function removeOldFiles() {
    const deleteQuery = "DELETE FROM files WHERE created_at < (NOW() - INTERVAL 7 DAY);";

    console.log("Deleting old entries");

    const result = await client.query(deleteQuery);

    console.log("Result:", result);
}

async function cleanDatabases() {
    console.log("Cleaning databases...");

    const [databaseEntries, objects] = await Promise.all([
        client.query("SELECT id FROM files;"),
        client.listObjects(),
    ]);
    const databaseIds = new Set(
        databaseEntries.map((entry) => entry.id),
    );
    const objectIds = new Set(objects.map((object) => object.Key));

    //console.log("Database IDs:", databaseIds);
    //console.log("Object IDs:", objectIds);

    const databaseEntriesToDelete = databaseIds.difference(objectIds);
    const objectsToDelete = objectIds.difference(databaseIds);

    console.log("Database entries to delete:", databaseEntriesToDelete);
    console.log("Objects to delete:", objectsToDelete);

    const pinkyPromises = [];

    // Delete database entries
    if (databaseEntriesToDelete.size > 0) {
        const deleteQuery = "DELETE FROM files WHERE id IN (?);";
        const params = [
            Array.from(databaseEntriesToDelete).map((id) => `'${id}'`)
                .join(", "),
        ];

        console.log("Deleting database entries:", params);

        pinkyPromises.push(
            client.query(deleteQuery, params),
        );
    }

    // Delete objects from R2
    if (objectsToDelete.size > 0) {
        Array.from(objectsToDelete).forEach((id) => {
            if (!id) return;
            console.log("Deleting object from R2: " + id);

            pinkyPromises.push(
                client.deleteObject(id),
            );
        });
    }

    await Promise.all(pinkyPromises);
}

if (import.meta.main) {
    await removeOldFiles();
    await cleanDatabases();
    console.log("Databases cleaned successfully.");
}
