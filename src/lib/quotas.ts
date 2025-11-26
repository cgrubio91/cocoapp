import { db } from './db';
import { getCurrentUser } from './auth';

export async function checkQuota(entity: 'farms' | 'lots' | 'crops' | 'animals' | 'workers' | 'suppliers'): Promise<{ allowed: boolean; message: string; current: number; max: number }> {
    const user = getCurrentUser();

    if (!user) {
        return { allowed: false, message: 'Usuario no autenticado', current: 0, max: 0 };
    }

    // Superadmin has unlimited quotas
    if (user.role === 'superadmin') {
        return { allowed: true, message: 'Sin límite', current: 0, max: 999 };
    }

    let current = 0;
    let max = 0;

    switch (entity) {
        case 'farms':
            current = await db.farms.where('userId').equals(user.id!).count();
            max = user.quotas.maxFarms;
            break;
        case 'lots':
            current = await db.lots.where('userId').equals(user.id!).count();
            max = user.quotas.maxLots;
            break;
        case 'crops':
            current = await db.crops.where('userId').equals(user.id!).count();
            max = user.quotas.maxCrops;
            break;
        case 'animals':
            current = await db.animalGroups.where('userId').equals(user.id!).count();
            max = user.quotas.maxAnimals;
            break;
        case 'workers':
            current = await db.workers.where('userId').equals(user.id!).count();
            max = user.quotas.maxWorkers;
            break;
        case 'suppliers':
            current = await db.suppliers.where('userId').equals(user.id!).count();
            max = user.quotas.maxSuppliers;
            break;
    }

    const allowed = current < max;
    const remaining = max - current;

    if (!allowed) {
        return {
            allowed: false,
            message: `Has alcanzado el límite de ${max} ${entity}. Contacta al administrador para aumentar tu cuota.`,
            current,
            max
        };
    }

    return {
        allowed: true,
        message: `Puedes crear ${remaining} más (${current}/${max})`,
        current,
        max
    };
}

export function getQuotaInfo(entity: 'farms' | 'lots' | 'crops' | 'animals' | 'workers' | 'suppliers'): { current: number; max: number } | null {
    const user = getCurrentUser();

    if (!user) return null;

    if (user.role === 'superadmin') {
        return { current: 0, max: 999 };
    }

    switch (entity) {
        case 'farms':
            return { current: 0, max: user.quotas.maxFarms };
        case 'lots':
            return { current: 0, max: user.quotas.maxLots };
        case 'crops':
            return { current: 0, max: user.quotas.maxCrops };
        case 'animals':
            return { current: 0, max: user.quotas.maxAnimals };
        case 'workers':
            return { current: 0, max: user.quotas.maxWorkers };
        case 'suppliers':
            return { current: 0, max: user.quotas.maxSuppliers };
        default:
            return null;
    }
}
