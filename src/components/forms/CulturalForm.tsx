import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const culturalSchema = z.object({
    lotId: z.number().min(1, 'Seleccione un lote'),
    activityName: z.string().min(1, 'La actividad es obligatoria'),
    method: z.enum(['manual', 'mechanized', 'chemical']),
    date: z.string(),
    notes: z.string().optional(),
});

type CulturalFormData = z.infer<typeof culturalSchema>;

export function CulturalForm({ onSuccess }: { onSuccess?: () => void }) {
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CulturalFormData>({
        resolver: zodResolver(culturalSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            method: 'manual',
        }
    });

    const filteredLots = lots?.filter(lot => lot.farmId === selectedFarmId);

    const onSubmit = async (data: CulturalFormData) => {
        try {
            await db.activities.add({
                lotId: data.lotId,
                type: 'pruning',
                date: new Date(data.date),
                coordinates: coordinates || undefined,
                details: {
                    activityName: data.activityName,
                    method: data.method,
                    notes: data.notes,
                },
            });
            reset();
            setCoordinates(null);
            if (onSuccess) onSuccess();
            alert('Labor registrada exitosamente');
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Error al guardar el registro');
        }
    };

    const captureLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoordinates({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('No se pudo obtener la ubicación');
                    setLoadingLocation(false);
                }
            );
        } else {
            alert('Geolocalización no soportada');
            setLoadingLocation(false);
        }
    };

    if (!farms) return <div>Cargando...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Registro de Labores Culturales</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Finca</label>
                <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                    value={selectedFarmId || ''}
                >
                    <option value="">Seleccione una finca</option>
                    {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Lote / Sector</label>
                <select
                    {...register('lotId', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    disabled={!selectedFarmId}
                >
                    <option value="">Seleccione un lote</option>
                    {filteredLots?.map(lot => (
                        <option key={lot.id} value={lot.id}>{lot.name}</option>
                    ))}
                </select>
                {errors.lotId && <p className="text-red-500 text-xs mt-1">{errors.lotId.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Actividad</label>
                <select
                    {...register('activityName')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="pruning">Poda</option>
                    <option value="weeding">Deshierbe</option>
                    <option value="shade_control">Control de Sombra</option>
                    <option value="harvest_sanitary">Recolección Sanitaria</option>
                    <option value="other">Otra</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Método</label>
                <select
                    {...register('method')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="manual">Manual</option>
                    <option value="mechanized">Mecánico</option>
                    <option value="chemical">Químico</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                    type="date"
                    {...register('date')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea
                    {...register('notes')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    rows={3}
                />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-800 mb-2">📍 Geolocalización</label>
                <button
                    type="button"
                    onClick={captureLocation}
                    disabled={loadingLocation}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loadingLocation ? 'Obteniendo...' : coordinates ? '✓ Ubicación Capturada' : 'Capturar Ubicación'}
                </button>
                {coordinates && (
                    <p className="text-xs text-blue-600 mt-2">
                        Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
                    </p>
                )}
            </div>

            <button
                type="submit"
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition"
            >
                Guardar Labor
            </button>
        </form>
    );
}
