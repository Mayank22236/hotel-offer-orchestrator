import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities";
import "dotenv/config";

async function runWorker() {
    // Connect to Temporal Server
    const connection = await NativeConnection.connect({
        address: process.env.TEMPORAL_ADDRESS || "localhost:7233"
    });

    // Create Temporal Worker
    const worker = await Worker.create({
    connection,
    taskQueue: "hotel-offer-task-queue",
    workflowsPath: require.resolve("./workflows"),
    activities
    });

    console.log("Hotel Offer Worker started!");
    console.log("Listening on task queue: hotel-offer-task-queue");

    // Start polling for tasks
    await worker.run();
}

runWorker().catch((error) => {
    console.error("Worker failed:", error);
    process.exit(1);
});
