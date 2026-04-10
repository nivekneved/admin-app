import { IServiceModule } from './index'
import { Service } from '../types/service'

export const TourModule: IServiceModule = {
    type: 'tour',
    
    getLink(service: Service) {
        const type = service.service_type.toLowerCase()
        const base = (type === 'activity' || type === 'sea_activity' || type === 'land_activity') ? '/activities' : '/tours'
        return `${base}/${service.id}`
    },

    calculateLowestPrice(service: Service) {
        return Number(service.base_price) || 0
    },

    calculateBookingTotal({ adults, teens, children, infants, servicePrice, childPrice, selectedMealPrice = 0 }) {
        const totalPax = adults + teens + children + infants
        
        const adultsPrice = adults * servicePrice
        const teensPrice = teens * (childPrice || servicePrice) // Often same as child for simple tours
        const childrenPrice = children * (childPrice || (servicePrice * 0.7))
        const mealCostTotal = selectedMealPrice * totalPax
        
        return adultsPrice + teensPrice + childrenPrice + mealCostTotal
    }
}
