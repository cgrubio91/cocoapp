import { useState } from 'react';
import { WorkerForm } from '../components/forms/WorkerForm';
import { LaborForm } from '../components/forms/LaborForm';
import { InventoryForm } from '../components/forms/InventoryForm';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Logistics() {
    const [activeTab, setActiveTab] = useState<'labor' | 'inventory' | 'workers'>('labor');
    const workers = useLiveQuery(() => db.workers.toArray());
    const laborLogs = useLiveQuery(() => db.laborLogs.orderBy('date').reverse().limit(10).toArray());
    const inventory = useLiveQuery(() => db.inventory.toArray());

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Logística y Costos</h2>

            <div className="flex space-x-2 md:space-x-4 border-b border-gray-200 overflow-x-auto">
                <button
                    className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'labor' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('labor')}
                >
                    Jornales
                </button>
                <button
                    className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'inventory' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    Inventario
                </button>
                <button
                    className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'workers' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('workers')}
                >
                    Trabajadores
                </button>
            </div>

            {activeTab === 'labor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <LaborForm />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Jornales Recientes</h3>
                        {!laborLogs?.length && <p className="text-gray-500">No hay registros.</p>}
                        <ul className="space-y-2">
                            {laborLogs?.map(log => {
                                const workerName = workers?.find(w => w.id === log.workerId)?.name || 'Desconocido';
                                return (
                                    <li key={log.id} className="p-3 border rounded-md hover:bg-gray-50">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{workerName}</span>
                                            <span className="text-sm text-gray-500">{format(new Date(log.date), 'dd MMM', { locale: es })}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">{log.activity}</div>
                                        <div className="text-xs text-gray-500 font-semibold">Costo: ${log.cost.toLocaleString()}</div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InventoryForm />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventario Actual</h3>
                        {!inventory?.length && <p className="text-gray-500">Inventario vacío.</p>}
                        <ul className="space-y-2">
                            {inventory?.map(item => (
                                <li key={item.id} className="p-3 border rounded-md hover:bg-gray-50">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-sm font-bold text-purple-700">{item.quantity} {item.unit}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize">{item.type} - Costo Prom: ${item.averageCost.toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'workers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <WorkerForm />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal</h3>
                        {!workers?.length && <p className="text-gray-500">No hay trabajadores registrados.</p>}
                        <ul className="space-y-2">
                            {workers?.map(worker => (
                                <li key={worker.id} className="p-3 border rounded-md hover:bg-gray-50">
                                    <div className="font-medium">{worker.name}</div>
                                    <div className="text-sm text-gray-600 capitalize">{worker.role}</div>
                                    <div className="text-xs text-gray-500">Salario Base: ${worker.defaultWage.toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
