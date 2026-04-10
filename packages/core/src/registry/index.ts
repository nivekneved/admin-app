import { Service, ServiceConfig, ServiceTypeDefinition } from '../types/service'
import { HotelModule } from './hotel'
import { TourModule } from './tour'

export interface IServiceModule {
    type: string
    getLink(service: Service): string
    calculateLowestPrice(service: Service): number
    calculateBookingTotal(params: {
        service: Service | Partial<Service>
        adults: number
        teens: number
        children: number
        infants: number
        servicePrice: number
        childPrice: number
        selectedMealPrice?: number
    }): number
}

class Registry {
    private modules: Map<string, IServiceModule> = new Map()
    private config: ServiceConfig | null = null

    constructor() {
        // Register legacy static modules as defaults
        this.register(HotelModule)
        this.register(TourModule)
        
        // Register common aliases
        this.register({ ...HotelModule, type: 'stays' })
        this.register({ ...TourModule, type: 'activity' })
        this.register({ ...TourModule, type: 'sea_activity' })
        this.register({ ...TourModule, type: 'land_activity' })
        this.register({ ...TourModule, type: 'cruise' })
        this.register({ ...TourModule, type: 'transfer' })
        this.register({ ...TourModule, type: 'package' })
        this.register({ ...TourModule, type: 'evening-package' })
        this.register({ ...TourModule, type: 'day-package' })
    }

    /**
     * Hydrate the registry with dynamic settings from the Admin App
     */
    public setConfiguration(config: ServiceConfig) {
        this.config = config
        
        // Dynamically register modules from config
        if (config.types) {
            config.types.forEach((typeDef) => {
                this.register(this.createDynamicModule(typeDef))
            })
        }
    }

    public register(module: IServiceModule) {
        this.modules.set(module.type.toLowerCase(), module)
    }

    public get(type: string): IServiceModule {
        const typeLower = type?.toLowerCase() || 'default'
        const module = this.modules.get(typeLower)
        
        if (!module) {
            return this.createDefaultModule(typeLower)
        }
        return module
    }

    private createDynamicModule(def: ServiceTypeDefinition): IServiceModule {
        return {
            type: def.id,
            getLink: (s) => (def.link_pattern || '/services/{id}').replace('{id}', s.id),
            calculateLowestPrice: (s) => Number(s.base_price) || 0,
            calculateBookingTotal: (params) => {
                const { adults, teens, children, infants, servicePrice, childPrice, selectedMealPrice = 0 } = params
                
                // 1. Calculate base pricing using dynamic modifiers
                const adultRate = (def.pax_logic?.adult ?? 1.0) * servicePrice
                const teenRate = (def.pax_logic?.teen ?? 0.8) * (childPrice || servicePrice)
                const childRate = (def.pax_logic?.child ?? 0.5) * (childPrice || 0)
                const infantRate = (def.pax_logic?.infant ?? 0.0) * (childPrice || 0)

                let subtotal = 0

                // Formula dispatcher
                switch (def.formula) {
                    case 'room_based':
                        // Room based usually means one base price covers a set occupancy, 
                        // but for high-density, we'll use a hybrid model.
                        subtotal = servicePrice // Base room price
                        // Add extra pax if logic dictates, but for now we'll stick to simple 
                        break
                    case 'fixed':
                        subtotal = servicePrice
                        break
                    case 'pax_based':
                    default:
                        subtotal = (adults * adultRate) + (teens * teenRate) + (children * childRate) + (infants * infantRate)
                }

                // 2. Add meals
                const totalPax = adults + teens + children + infants
                const mealCost = selectedMealPrice * totalPax
                
                return subtotal + mealCost
            }
        }
    }

    private createDefaultModule(type: string): IServiceModule {
        return {
            type,
            getLink: (s) => `/services/${s.id}`,
            calculateLowestPrice: (s) => Number(s.base_price) || 0,
            calculateBookingTotal: ({ adults, teens, children, infants, servicePrice, childPrice, selectedMealPrice = 0 }) => {
                const totalPax = adults + teens + children + infants
                const adultsPrice = adults * servicePrice
                const teensPrice = teens * (childPrice || servicePrice)
                const childrenPrice = children * (childPrice || 0)
                const mealCostTotal = selectedMealPrice * totalPax
                return adultsPrice + teensPrice + childrenPrice + mealCostTotal
            }
        }
    }
}

export const ServiceRegistry = new Registry()
