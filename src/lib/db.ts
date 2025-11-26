import Dexie, { type Table } from 'dexie';

export interface Farm {
    id?: number;
    userId: number;
    name: string;
    area: number; // in hectares
    location?: string;
    imageUrl?: string; // Farm photo
    createdAt?: Date;
}

export interface Lot {
    id?: number;
    userId: number;
    farmId: number;
    name: string;
    cropType: 'coffee' | 'cacao' | 'other';
    area: number;
}

export interface Activity {
    id?: number;
    userId: number;
    lotId: number;
    type: 'pest_control' | 'fertilization' | 'pruning' | 'weeding' | 'other';
    date: Date;
    details: any;
    photoUrl?: string;
    location?: { lat: number; lng: number };
    coordinates?: { lat: number; lng: number };
}

export interface Harvest {
    id?: number;
    userId: number;
    lotId: number;
    date: Date;
    quantity: number;
    quality?: string;
}

export interface PostHarvest {
    id?: number;
    userId: number;
    lotId: number;
    date: Date;
    processType: 'fermentation' | 'drying' | 'milling' | 'other';
    weight: number;
    notes?: string;
}

export interface Sale {
    id?: number;
    userId: number;
    date: Date;
    buyer: string;
    quantity: number;
    pricePerKg: number;
    totalValue: number;
    cropType: 'coffee' | 'cacao' | 'other';
}

export interface Worker {
    id?: number;
    userId: number;
    name: string;
    role: string;
    defaultWage: number;
}

export interface LaborLog {
    id?: number;
    userId: number;
    workerId: number;
    lotId: number;
    date: Date;
    activity: string;
    cost: number;
    notes?: string;
}

export interface InventoryItem {
    id?: number;
    userId: number;
    name: string;
    type: 'fertilizer' | 'pesticide' | 'tool' | 'fuel' | 'other';
    quantity: number;
    unit: string;
    averageCost: number;
    minimumStock?: number;
}

export interface InventoryTransaction {
    id?: number;
    itemId: number;
    date: Date;
    type: 'in' | 'out';
    quantity: number;
    cost: number; // total cost for 'in', calculated cost for 'out'
    notes?: string;
}

export interface Supplier {
    id?: number;
    userId: number;
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
    category: 'fertilizer' | 'pesticide' | 'equipment' | 'service' | 'other';
}

export interface Expense {
    id?: number;
    userId: number;
    date: Date;
    supplierId?: number;
    category: 'service' | 'rent' | 'equipment' | 'fuel' | 'other';
    description: string;
    amount: number;
    paymentMethod: 'cash' | 'transfer' | 'credit';
}

export interface Crop {
    id?: number;
    userId: number;
    name: string;
    variety?: string;
    plantingDate: Date;
    expectedHarvestDate?: Date;
    lotId: number;
    status: 'planted' | 'growing' | 'harvested' | 'failed';
}

export interface AnimalGroup {
    id?: number;
    userId: number;
    type: 'cattle' | 'pigs' | 'poultry' | 'fish' | 'other';
    breed?: string;
    quantity: number;
    birthDate?: Date;
    location: string;
    status: 'active' | 'sold' | 'deceased';
}

export interface AnimalActivity {
    id?: number;
    groupId: number;
    date: Date;
    activityType: 'feeding' | 'vaccination' | 'treatment' | 'sale' | 'purchase' | 'other';
    details: any;
    cost?: number;
}

export interface UserQuotas {
    maxFarms: number;
    maxLots: number;
    maxCrops: number;
    maxAnimals: number;
    maxWorkers: number;
    maxSuppliers: number;
}

export interface User {
    id?: number;
    email: string;
    passwordHash: string;
    name: string;
    role: 'superadmin' | 'user';
    status: 'pending' | 'active' | 'suspended';
    quotas: UserQuotas;
    createdAt: Date;
}

export class AgriDatabase extends Dexie {
    farms!: Table<Farm>;
    lots!: Table<Lot>;
    activities!: Table<Activity>;
    harvests!: Table<Harvest>;
    postHarvest!: Table<PostHarvest>;
    sales!: Table<Sale>;
    workers!: Table<Worker>;
    laborLogs!: Table<LaborLog>;
    inventory!: Table<InventoryItem>;
    inventoryTransactions!: Table<InventoryTransaction>;
    suppliers!: Table<Supplier>;
    expenses!: Table<Expense>;
    crops!: Table<Crop>;
    animalGroups!: Table<AnimalGroup>;
    animalActivities!: Table<AnimalActivity>;
    users!: Table<User>;

    constructor() {
        super('AgriManagerDB');
        this.version(1).stores({
            farms: '++id, name',
            lots: '++id, farmId, name',
            activities: '++id, lotId, type, date',
            harvests: '++id, lotId, date',
        });

        this.version(2).stores({
            farms: '++id, name',
            lots: '++id, farmId, name',
            activities: '++id, lotId, type, date',
            harvests: '++id, lotId, date',
            postHarvest: '++id, lotId, date, processType',
            sales: '++id, date, buyer'
        });

        this.version(3).stores({
            farms: '++id, name',
            lots: '++id, farmId, name',
            activities: '++id, lotId, type, date',
            harvests: '++id, lotId, date',
            postHarvest: '++id, lotId, date, processType',
            sales: '++id, date, buyer',
            workers: '++id, name',
            laborLogs: '++id, workerId, lotId, date',
            inventory: '++id, name, type',
            inventoryTransactions: '++id, itemId, date'
        });

        // Version 4: Add minimumStock and coordinates support
        this.version(4).stores({
            farms: '++id, name',
            lots: '++id, farmId, name',
            activities: '++id, lotId, type, date',
            harvests: '++id, lotId, date',
            postHarvest: '++id, lotId, date, processType',
            sales: '++id, date, buyer',
            workers: '++id, name',
            laborLogs: '++id, workerId, lotId, date',
            inventory: '++id, name, type',
            inventoryTransactions: '++id, itemId, date'
        });

        // Version 5: Add suppliers, expenses, crops, and livestock
        this.version(5).stores({
            farms: '++id, name',
            lots: '++id, farmId, name',
            activities: '++id, lotId, type, date',
            harvests: '++id, lotId, date',
            postHarvest: '++id, lotId, date, processType',
            sales: '++id, date, buyer',
            workers: '++id, name',
            laborLogs: '++id, workerId, lotId, date',
            inventory: '++id, name, type',
            inventoryTransactions: '++id, itemId, date',
            suppliers: '++id, name, category',
            expenses: '++id, date, supplierId, category',
            crops: '++id, lotId, status, plantingDate',
            animalGroups: '++id, type, status',
            animalActivities: '++id, groupId, date, activityType'
        });

        // Version 6: Add users table for SaaS multi-tenancy
        this.version(6).stores({
            farms: '++id, name',
            lots: '++id, farmId, name',
            activities: '++id, lotId, type, date',
            harvests: '++id, lotId, date',
            postHarvest: '++id, lotId, date, processType',
            sales: '++id, date, buyer',
            workers: '++id, name',
            laborLogs: '++id, workerId, lotId, date',
            inventory: '++id, name, type',
            inventoryTransactions: '++id, itemId, date',
            suppliers: '++id, name, category',
            expenses: '++id, date, supplierId, category',
            crops: '++id, lotId, status, plantingDate',
            animalGroups: '++id, type, status',
            animalActivities: '++id, groupId, date, activityType',
            users: '++id, email, role, status'
        }).upgrade(async (tx) => {
            // Create default superadmin user
            const existingUsers = await tx.table('users').count();
            if (existingUsers === 0) {
                await tx.table('users').add({
                    email: 'admin@agrogold.com',
                    passwordHash: await hashPassword('admin123'), // Change this in production!
                    name: 'Superadministrador',
                    role: 'superadmin',
                    status: 'active',
                    quotas: {
                        maxFarms: 999,
                        maxLots: 999,
                        maxCrops: 999,
                        maxAnimals: 999,
                        maxWorkers: 999,
                        maxSuppliers: 999
                    },
                    createdAt: new Date()
                });
            }
        });
    }
}

// Simple password hashing (for demo - use bcrypt in production!)
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const db = new AgriDatabase();
