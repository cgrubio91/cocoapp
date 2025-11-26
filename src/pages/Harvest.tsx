
import { useState } from 'react';
import { HarvestForm } from '../components/forms/HarvestForm';
import { PostHarvestForm } from '../components/forms/PostHarvestForm';
import { SalesForm } from '../components/forms/SalesForm';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Harvest() {
    const [activeTab, setActiveTab] = useState<'harvest' | 'post-harvest' | 'sales'>('harvest');
    const harvests = useLiveQuery(() => db.harvests.orderBy('date').reverse().limit(10).toArray());
    const postHarvests = useLiveQuery(() => db.postHarvest.orderBy('date').reverse().limit(10).toArray());
    const sales = useLiveQuery(() => db.sales.orderBy('date').reverse().limit(10).toArray());
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());

    const getLotName = (lotId: number) => {
        const lot = lots?.find(l => l.id === lotId);
        const farm = farms?.find(f => f.id === lot?.farmId);
        return `${lot?.name || 'Lote desconocido'} (${farm?.name || 'Finca desconocida'})`;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Cosecha, Post-Cosecha y Ventas</h2>

            <div className="flex space-x-2 md:space-x-4 border-b border-gray-200 overflow-x-auto">
                <button
                    className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'harvest' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('harvest')}
                >
                    Cosecha
                </button>
                <button
                    className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'post-harvest' ? 'text-amber-700 border-b-2 border-amber-700' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('post-harvest')}
                >
                    Post-Cosecha
                </button>
                <button
                    className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'sales' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('sales')}
                >
                    Ventas
                </button>
            </div>

            {activeTab === 'harvest' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <HarvestForm />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimas Cosechas</h3>
                        {!harvests?.length && <p className="text-gray-500">No hay registros.</p>}
                        <ul className="space-y-2">
                            {harvests?.map(h => (
                                <li key={h.id} className="p-3 border rounded-md hover:bg-gray-50">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{h.quantity} kg</span>
                                        <span className="text-sm text-gray-500">{format(new Date(h.date), 'dd MMM', { locale: es })}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">{getLotName(h.lotId)}</div>
                                    {h.quality && <div className="text-xs text-gray-500 italic">{h.quality}</div>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'post-harvest' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <PostHarvestForm />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Procesos Recientes</h3>
                        {!postHarvests?.length && <p className="text-gray-500">No hay registros.</p>}
                        <ul className="space-y-2">
                            {postHarvests?.map(ph => (
                                <li key={ph.id} className="p-3 border rounded-md hover:bg-gray-50">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{ph.processType === 'fermentation' ? 'Fermentación' : ph.processType === 'drying' ? 'Secado' : ph.processType}</span>
                                        <span className="text-sm text-gray-500">{format(new Date(ph.date), 'dd MMM', { locale: es })}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">{ph.weight} kg - {getLotName(ph.lotId)}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <SalesForm />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas Recientes</h3>
                        {!sales?.length && <p className="text-gray-500">No hay registros.</p>}
                        <ul className="space-y-2">
                            {sales?.map(s => (
                                <li key={s.id} className="p-3 border rounded-md hover:bg-gray-50">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-green-700">${s.totalValue.toLocaleString()}</span>
                                        <span className="text-sm text-gray-500">{format(new Date(s.date), 'dd MMM', { locale: es })}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">{s.quantity} kg a ${s.pricePerKg}/kg</div>
                                    <div className="text-xs text-gray-500">Comprador: {s.buyer} ({s.cropType})</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
