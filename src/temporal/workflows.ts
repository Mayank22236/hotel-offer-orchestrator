
import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";

const {
    fetchSupplierAHotels,
    fetchSupplierBHotels,
    compareHotelOffers,
    storeHotelOffers,
    filterHotelOffersByPrice
} = proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minute"
});

export async function hotelOfferWorkflow(
    city: string,
    minPrice?: number,
    maxPrice?: number
) {
    // Fetch both suppliers in parallel
    const [supplierA, supplierB] = await Promise.all([
        fetchSupplierAHotels(city),
        fetchSupplierBHotels(city)
    ]);

    // Compare prices
    const bestOffers = await compareHotelOffers(
        supplierA,
        supplierB
    );

    // Store offers in Redis
    await storeHotelOffers(city, bestOffers);

    // Retrieve offers using price range
    const filteredOffers = await filterHotelOffersByPrice(
        city,
        minPrice,
        maxPrice
    );

    return filteredOffers;
}
