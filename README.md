# Hotel Offer Orchestrator

This project helps users find the best hotel prices from multiple suppliers.

It fetches hotel data from Supplier A and Supplier B, compares their prices, removes duplicate hotels, and returns the hotel with the lowest price.

It also uses Temporal to manage the workflow and Redis to store and filter hotel offers.

## Tech Stack

- **Node.js** – Backend runtime
- **TypeScript** – Writing backend code
- **Express.js** – Creating REST APIs
- **Temporal** – Managing workflow execution
- **Redis** – Storing and filtering hotel offers
- **Docker** – Running the application and its services together

## Features

- Fetch hotel data from multiple suppliers.
- Fetch supplier data in parallel.
- Compare hotel prices.
- Remove duplicate hotels.
- Select the lowest price for each hotel.
- Store hotel offers in Redis.
- Filter hotels using minimum and maximum price.
- Manage the complete process using Temporal workflows.
- Run the application using Docker Compose.

## Project Structure

```text
hotel-offer-orchestrator/
│
├── src/
│   ├── activities/
│   │   └── hotelActivities.ts
│   │
│   ├── config/
│   │   └── redis.ts
│   │
│   ├── services/
│   │   └── hotelService.ts
│   │
│   ├── suppliers/
│   │   ├── supplierA.ts
│   │   └── supplierB.ts
│   │
│   ├── temporal/
│   │   ├── activities.ts
│   │   ├── worker.ts
│   │   └── workflows.ts
│   │
│   ├── workflows/
│   │   └── hotelWorkflow.ts
│   │
│   └── app.ts
│
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## How It Works

1. The user sends a request with a city name and optional price range.
2. The API starts a Temporal workflow.
3. The workflow fetches hotel data from both suppliers in parallel.
4. It compares the hotel prices and removes duplicates.
5. It selects the lowest price for each hotel.
6. The offers are stored in Redis.
7. Redis filters the offers according to the requested price range.
8. The API returns the final hotel list.

## API Endpoint

### Get Best Hotel Offers

```http
GET /api/hotels?city=delhi
```

This returns the best available offers for Delhi.

### Filter Hotels by Price

```http
GET /api/hotels?city=delhi&minPrice=5500&maxPrice=6500
```

This returns hotels with prices between ₹5,500 and ₹6,500.

**Query Parameters**

| Parameter | Description | Required |
|---|---|---|
| city | City name | Yes |
| minPrice | Minimum hotel price | No |
| maxPrice | Maximum hotel price | No |

## Sample Response

```json
[
  {
    "name": "Radisson",
    "price": 5900
  },
  {
    "name": "Taj Hotel",
    "price": 6500
  }
]
```

*Note: The supplier data used in this project is mock data.*

## Run the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/hotel-offer-orchestrator.git

cd hotel-offer-orchestrator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
REDIS_URL=redis://localhost:6379
TEMPORAL_ADDRESS=localhost:7233
```

### 4. Start Redis

Make sure Redis is running on your machine.

### 5. Start Temporal Server

Start your local Temporal development server.

### 6. Start the Temporal Worker

```bash
npm run worker
```

### 7. Start the API Server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

## Run Using Docker

You can also run the application using Docker Compose.

Make sure Docker Desktop is running, then execute:

```bash
docker compose up --build
```

This starts:

- API Server
- Temporal Server
- Temporal Worker
- Redis

To stop the containers:

```bash
docker compose down
```

## Test the API

You can test the API using Postman or a browser.

**Without price filter:**

```text
http://localhost:3000/api/hotels?city=delhi
```

**With price filter:**

```text
http://localhost:3000/api/hotels?city=delhi&minPrice=5500&maxPrice=6500
```

## Future Improvements

- Connect real hotel supplier APIs.
- Add more hotel suppliers.
- Add proper error handling and retry mechanisms.
- Add automated API tests.
- Add authentication and user management.

## Author

Developed as a backend project using Node.js, TypeScript, Temporal, Redis and Docker.
