import { IServiceModule } from './index'
import { Service, RoomType } from '../types/service'

export const HotelModule: IServiceModule = {
    type: 'hotel',
    
    getLink(service: Service) {
        return `/hotels/${service.id}`
    },

    calculateLowestPrice(service: Service) {
        const prices: number[] = []
        if (service.base_price && Number(service.base_price) > 0) {
            prices.push(Number(service.base_price))
        }

        if (Array.isArray(service.room_types)) {
            service.room_types.forEach((rt: RoomType) => {
                const rtPrice = rt.price || rt.weekday_price || rt.weekend_price
                if (rtPrice && Number(rtPrice) > 0) prices.push(Number(rtPrice))
                
                if (rt.prices && typeof rt.prices === 'object') {
                    Object.values(rt.prices).forEach((val: any) => {
                        const n = Number(val)
                        if (n > 0) prices.push(n)
                    })
                }
            })
        }

        if (prices.length === 0) return Number(service.base_price) || 0
        return Math.min(...prices)
    },

    calculateBookingTotal({ adults, teens, children, infants, servicePrice, childPrice, selectedMealPrice = 0 }) {
        const totalPax = adults + teens + children + infants
        
        // Strategy: Teens = Adult price for Hotels unless a custom child_age_limit is reached
        const adultsPrice = adults * servicePrice
        const teensPrice = teens * servicePrice // Standard for hotels
        const childrenPrice = children * (childPrice || (servicePrice * 0.5)) // 50% discount if childPrice missing
        const mealCostTotal = selectedMealPrice * totalPax
        
        return adultsPrice + teensPrice + childrenPrice + mealCostTotal
    }
}
