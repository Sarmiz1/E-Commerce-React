// dash
import { create } from "zustand"

export const useBuyerDashboardStore = create(() => ({
    name: 'Samuel Joseph',
    email: 'samuel@email.com',
    phone: '+234 802 456 7890',
    defaultAddress: {
        line1: '14 Adeola Odeku Street',
        line2: 'Victoria Island, Lagos',
        city: 'Lagos',
        zip: '101241',
        country: 'Nigeria',
    }
}))