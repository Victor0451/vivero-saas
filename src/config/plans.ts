export type PlanType = 'semilla' | 'brote' | 'bosque'

export interface PlanConfig {
    maxPlants: number // Infinity for unlimited
    maxUsers: number // Infinity for unlimited
    features: string[]
    displayName: string
}

export const PLANS: Record<PlanType, PlanConfig> = {
    semilla: {
        displayName: 'Semilla',
        maxPlants: 100,
        maxUsers: 1,
        features: ['basic_history', 'web_app']
    },
    brote: {
        displayName: 'Brote',
        maxPlants: 5000,
        maxUsers: 5,
        features: ['advanced_inventory', 'qr_generation', 'support_24_7']
    },
    bosque: {
        displayName: 'Bosque',
        maxPlants: Infinity,
        maxUsers: Infinity,
        features: ['multi_branch', 'sales_module', 'api_access', 'white_labeling']
    }
}

export const DEMO_PLAN_OVERRIDE = 'brote' // Demo account gets Brote features
