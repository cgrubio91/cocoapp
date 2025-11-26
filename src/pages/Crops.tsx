import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { CropForm } from '../components/forms/CropForm';

export function Crops() {
    const [refreshKey, setRefreshKey] = useState(0);
    const crops = useLiveQuery(() => db.crops.toArray(), [refreshKey]);
    const lots = useLiveQuery(() => db.lots.toArray());

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Gestión de Cultivos</h2>
                <p className="text-slate-500">Registro y seguimiento de cultivos en la finca.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CropForm onSuccess={handleSuccess} />

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Cultivos Activos</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {crops?.map(crop => {
                            const lot = lots?.find(l => l.id === crop.lotId);
                            return (
                                <div key={crop.id} className="p-4 bg-slate-50 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-800">{crop.name}</p>
                                            {crop.variety && <p className="text-sm text-slate-600">{crop.variety}</p>}
                                            <p className="text-xs text-slate-500">Lote: {lot?.name || 'N/A'}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${crop.status === 'planted' ? 'bg-blue-100 text-blue-700' :
                                                crop.status === 'growing' ? 'bg-green-100 text-green-700' :
                                                    crop.status === 'harvested' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                            {crop.status === 'planted' && 'Sembrado'}
                                            {crop.status === 'growing' && 'Creciendo'}
                                            {crop.status === 'harvested' && 'Cosechado'}
                                            {crop.status === 'failed' && 'Fallido'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                        <div>
                                            <p className="font-medium">Siembra:</p>
                                            <p>{new Date(crop.plantingDate).toLocaleDateString()}</p>
                                        </div>
                                        {crop.expectedHarvestDate && (
                                            <div>
                                                <p className="font-medium">Cosecha Esperada:</p>
                                                <p>{new Date(crop.expectedHarvestDate).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {(!crops || crops.length === 0) && (
                            <p className="text-slate-400 text-center py-8">No hay cultivos registrados</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
