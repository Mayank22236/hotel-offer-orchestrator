
interface Hotel {
    hotelId: string;
    name: string;
    price: number;
    city: string;
    commissionPct: number;
}

interface HotelOffer {
    name: string;
    price: number;
    supplier: string;
    commissionPct: number;
}

export function getBestHotelOffers(
    supplierA: Hotel[],
    supplierB: Hotel[]
): HotelOffer[] {

    const hotelMap = new Map<string, HotelOffer>();

    // First loop: Add Supplier A hotels
    for (const hotel of supplierA) {

        const key = hotel.name.trim().toLowerCase();

        hotelMap.set(key, {
            name: hotel.name,
            price: hotel.price,
            supplier: "Supplier A",
            commissionPct: hotel.commissionPct
        });
    }

    // Second loop: Compare Supplier B hotels
    for (const hotel of supplierB) {

        const key = hotel.name.trim().toLowerCase();

        const existingHotel = hotelMap.get(key);

        if (existingHotel) {

            if (hotel.price < existingHotel.price) {

                hotelMap.set(key, {
                    name: hotel.name,
                    price: hotel.price,
                    supplier: "Supplier B",
                    commissionPct: hotel.commissionPct
                });
            }

        } else {

            hotelMap.set(key, {
                name: hotel.name,
                price: hotel.price,
                supplier: "Supplier B",
                commissionPct: hotel.commissionPct
            });
        }
    }

    return Array.from(hotelMap.values());
}
