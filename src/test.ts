
import { CrawlQueue } from "./queue/CrawleQueue";

function memory(): string {
    const mb = process.memoryUsage().rss / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
}

async function main(): Promise<void> {
    console.log("Before:", memory());

    const requests: Promise<void>[] = Array.from(
        { length: 8 },
        (_, i) =>
            fetch("http://localhost:5000/search?q=test")
                .then(async (response: Response) => {
                    await response.text();

                    console.log(
                        `Request ${i + 1}: ${response.status}`
                    );
                })
    );

    await Promise.all(requests);

    console.log(
        "Running:",
        CrawlQueue.pending,
        "Waiting:",
        CrawlQueue.size
    );

    console.log("After:", memory());
}

main().catch((error: unknown) => {
    console.error("Error:", error);
});
