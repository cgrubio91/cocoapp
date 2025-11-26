import { useState } from 'react';
import { FarmForm } from '../components/forms/FarmForm';
import { LotForm } from '../components/forms/LotForm';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function Settings() {
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());
    const [activeTab, setActiveTab] = useState<'farms' | 'lots'>('farms');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>

            <div className="flex space-x-4 border-b border-gray-200">
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'farms' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('farms')}
                >
                    Fincas
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'lots' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('lots')}
                >
                    Lotes / Sectores
                </button>
            </div>

            {activeTab === 'farms' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <FarmForm />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fincas Registradas</h3>
                        {!farms?.length && <p className="text-gray-500">No hay fincas registradas.</p>}
                        <ul className="space-y-2">
                            {farms?.map(farm => (
                                <li key={farm.id} className="p-3 border rounded-md hover:bg-gray-50">
                                    <div className="font-medium">{farm.name}</div>
                                    <div className="text-sm text-gray-600">{farm.area} ha - {farm.location}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'lots' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <LotForm />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lotes Registrados</h3>
                        {!lots?.length && <p className="text-gray-500">No hay lotes registrados.</p>}
                        <ul className="space-y-2">
                            {lots?.map(lot => {
                                const farmName = farms?.find(f => f.id === lot.farmId)?.name || 'Desconocida';
                                return (
                                    <li key={lot.id} className="p-3 border rounded-md hover:bg-gray-50">
                                        <div className="font-medium">{lot.name} ({lot.cropType})</div>
                                        <div className="text-sm text-gray-600">{lot.area} ha - Finca: {farmName}</div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
