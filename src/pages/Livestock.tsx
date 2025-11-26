import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { AnimalGroupForm } from '../components/forms/AnimalGroupForm';

export function Livestock() {
    const [refreshKey, setRefreshKey] = useState(0);
    const animalGroups = useLiveQuery(() => db.animalGroups.toArray(), [refreshKey]);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    const getAnimalTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            cattle: 'Ganado',
            pigs: 'Porcinos',
            poultry: 'Aves',
            fish: 'Peces',
            other: 'Otro'
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Gestión de Animales</h2>
                <p className="text-slate-500">Registro y seguimiento de explotación animal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimalGroupForm onSuccess={handleSuccess} />

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Grupos de Animales</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {animalGroups?.map(group => (
                            <div key={group.id} className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-slate-800">{getAnimalTypeLabel(group.type)}</p>
                                        {group.breed && <p className="text-sm text-slate-600">{group.breed}</p>}
                                        <p className="text-xs text-slate-500">📍 {group.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-700">{group.quantity}</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${group.status === 'active' ? 'bg-green-100 text-green-700' :
                                                group.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {group.status === 'active' && 'Activo'}
                                            {group.status === 'sold' && 'Vendido'}
                                            {group.status === 'deceased' && 'Fallecido'}
                                        </span>
                                    </div>
                                </div>
                                {group.birthDate && (
                                    <p className="text-xs text-slate-500">
                                        Fecha: {new Date(group.birthDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                        {(!animalGroups || animalGroups.length === 0) && (
                            <p className="text-slate-400 text-center py-8">No hay grupos de animales registrados</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
