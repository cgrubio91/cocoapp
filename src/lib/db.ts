import Dexie, { type Table } from 'dexie';

export interface Farm {
    id?: number;
    name: string;
    area: number; // in hectares
    location?: string; // JSON string of coordinates or description
}

export interface Lot {
    id?: number;
    farmId: number;
    name: string;
    cropType: 'coffee' | 'cacao' | 'other';
    area: number;
}

export interface Activity {
    id?: number;
    lotId: number;
    type: 'pest_control' | 'fertilization' | 'pruning' | 'weeding' | 'other';
    date: Date;
    details: any; // JSON object for specific details
    photoUrl?: string;
    location?: { lat: number; lng: number };
    coordinates?: { lat: number; lng: number }; // For precision agriculture
}

export interface Harvest {
    id?: number;
    lotId: number;
    date: Date;
    quantity: number; // kg or units
    quality?: string; // e.g., 'mature', 'green', 'mixed'
}

export interface PostHarvest {
    id?: number;
    lotId: number;
    date: Date;
    processType: 'fermentation' | 'drying' | 'milling' | 'other';
    weight: number; // kg
    notes?: string;
}

export interface Sale {
    id?: number;
    date: Date;
    buyer: string;
    quantity: number; // kg
    pricePerKg: number;
    totalValue: number;
    cropType: 'coffee' | 'cacao' | 'other';
}

export interface Worker {
    id?: number;
    name: string;
    role: string; // 'recolector', 'mayordomo', 'general'
    defaultWage: number; // daily or per unit
}

export interface LaborLog {
    id?: number;
    workerId: number;
    lotId: number;
    date: Date;
    activity: string;
    cost: number;
    notes?: string;
}

export interface InventoryItem {
    id?: number;
    name: string;
    type: 'fertilizer' | 'pesticide' | 'tool' | 'fuel' | 'other';
    quantity: number;
    unit: string;
    averageCost: number;
    minimumStock?: number; // Alert threshold
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
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
    category: 'fertilizer' | 'pesticide' | 'equipment' | 'service' | 'other';
}

export interface Expense {
    id?: number;
    date: Date;
    supplierId?: number;
    category: 'service' | 'rent' | 'equipment' | 'fuel' | 'other';
    description: string;
    amount: number;
    paymentMethod: 'cash' | 'transfer' | 'credit';
}

export interface Crop {
    id?: number;
    name: string;
    variety?: string;
    plantingDate: Date;
    expectedHarvestDate?: Date;
    lotId: number;
    status: 'planted' | 'growing' | 'harvested' | 'failed';
}

export interface AnimalGroup {
    id?: number;
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
    }
}

export const db = new AgriDatabase();
