
import express, { Request, Response, NextFunction } from "express";
import { Connection, Client } from "@temporalio/client";

import { hotelOfferWorkflow } from "./temporal/workflows";
import { supplierAHotels } from "./suppliers/supplierA";
import { supplierBHotels } from "./suppliers/supplierB";
import { connectRedis } from "./config/redis";
import "dotenv/config";

const app = express();
const PORT = 3000;

let temporalClient: Client;

// Middleware: Parse JSON
app.use(express.json());

// Middleware: Log incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log("Incoming Request:", req.method, req.url);
    next();
});

// Home API
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Hotel Offer Orchestrator API is running!",
        status: "success"
    });
});

// Debug API
app.get("/test", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Test API working successfully",
        supplierA: supplierAHotels,
        supplierB: supplierBHotels,
        countA: supplierAHotels.length,
        countB: supplierBHotels.length
    });
});

// Supplier A API
app.get("/supplierA/hotels", (req: Request, res: Response) => {
    const city = String(req.query.city || "delhi");

    const hotels = supplierAHotels.filter(
        hotel => hotel.city.toLowerCase() === city.toLowerCase()
    );

    res.status(200).json({
        supplier: "Supplier A",
        count: hotels.length,
        hotels
    });
});

// Supplier B API
app.get("/supplierB/hotels", (req: Request, res: Response) => {
    const city = String(req.query.city || "delhi");

    const hotels = supplierBHotels.filter(
        hotel => hotel.city.toLowerCase() === city.toLowerCase()
    );

    res.status(200).json({
        supplier: "Supplier B",
        count: hotels.length,
        hotels
    });
});

// Main API: Execute Temporal Workflow with Redis price filtering
app.get("/api/hotels", async (req: Request, res: Response) => {
    const city = String(req.query.city || "delhi");

    const minPrice = req.query.minPrice !== undefined
        ? Number(req.query.minPrice)
        : undefined;

    const maxPrice = req.query.maxPrice !== undefined
        ? Number(req.query.maxPrice)
        : undefined;

    // Validate price parameters
    if (
        (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
        (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
    ) {
        return res.status(400).json({
            message: "Invalid price range"
        });
    }

    try {
        console.log("Starting hotel workflow:", {
            city,
            minPrice,
            maxPrice
        });

        const bestHotels = await temporalClient.workflow.execute(
            hotelOfferWorkflow,
            {
                taskQueue: "hotel-offer-task-queue",
                workflowId: `hotel-offer-${city}-${Date.now()}`,
                args: [city, minPrice, maxPrice]
            }
        );

        res.status(200).json(bestHotels);

    } catch (error) {
        console.error("Hotel Workflow Error:", error);

        res.status(500).json({
            message: "Failed to fetch hotel offers"
        });
    }
});

// Handle unknown routes
app.use((req: Request, res: Response) => {
    res.status(404).json({
        message: "API route not found",
        requestedURL: req.url
    });
});

// Global error handler
app.use((
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Server Error:", err.message);

    res.status(500).json({
        message: "Internal Server Error",
        error: err.message
    });
});

// Start server and connect services
async function startServer() {
    try {
        const connection = await Connection.connect({
            address: process.env.TEMPORAL_ADDRESS ||"localhost:7233"
        });

        temporalClient = new Client({ connection });

        console.log("Connected to Temporal Server");

        await connectRedis();

        console.log("Connected to Temporal and Redis");

        app.listen(PORT, () => {
            console.log("--------------------------------");
            console.log("Hotel Offer Orchestrator Started");
            console.log(`Server running at http://localhost:${PORT}`);
            console.log("--------------------------------");
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

startServer();
