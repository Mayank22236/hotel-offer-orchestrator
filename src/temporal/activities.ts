
import { supplierAHotels } from "../suppliers/supplierA";
import { supplierBHotels } from "../suppliers/supplierB";
import { getBestHotelOffers } from "../services/hotelService";
import { redisClient, connectRedis } from "../config/redis";

// Activity 1: Fetch hotels from Supplier A
export async function fetchSupplierAHotels(city: string) {
    return supplierAHotels.filter(
        hotel => hotel.city.toLowerCase() === city.toLowerCase()
    );
}

// Activity 2: Fetch hotels from Supplier B
export async function fetchSupplierBHotels(city: string) {
    return supplierBHotels.filter(
        hotel => hotel.city.toLowerCase() === city.toLowerCase()
    );
}

// Activity 3: Compare prices and return best offers
export async function compareHotelOffers(
    supplierA: Awaited<ReturnType<typeof fetchSupplierAHotels>>,
    supplierB: Awaited<ReturnType<typeof fetchSupplierBHotels>>
) {
    return getBestHotelOffers(supplierA, supplierB);
}

// Activity 4: Store best hotel offers in Redis
export async function storeHotelOffers(
    city: string,
    hotels: Awaited<ReturnType<typeof compareHotelOffers>>
) {
    await connectRedis();

    const redisKey = `hotel-offers:${city.toLowerCase()}`;

    // Clear previous offers for this city
    await redisClient.del(redisKey);

    if (hotels.length > 0) {
        await redisClient.zAdd(
            redisKey,
            hotels.map(hotel => ({
                score: hotel.price,
                value: JSON.stringify(hotel)
            }))
        );
    }

    return {
        message: "Hotel offers stored in Redis",
        count: hotels.length
    };
}

// Activity 5: Filter hotel offers using Redis price range
export async function filterHotelOffersByPrice(
    city: string,
    minPrice?: number,
    maxPrice?: number
) {
    await connectRedis();

    const redisKey = `hotel-offers:${city.toLowerCase()}`;

    const min = minPrice ?? "-inf";
    const max = maxPrice ?? "+inf";

    const results = await redisClient.zRangeByScore(
        redisKey,
        min,
        max
    );

    return results.map(hotel => JSON.parse(hotel));
}
