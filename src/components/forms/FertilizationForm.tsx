import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const fertilizationSchema = z.object({
    lotId: z.number().min(1, 'Seleccione un lote'),
    inputName: z.string().min(1, 'El nombre del insumo es obligatorio'),
    dose: z.number().min(0.01, 'La dosis debe ser mayor a 0'),
    unit: z.enum(['kg', 'lt', 'gr', 'ml']),
    method: z.string().min(1, 'El método es obligatorio'),
    date: z.string(),
    notes: z.string().optional(),
});

type FertilizationFormData = z.infer<typeof fertilizationSchema>;

export function FertilizationForm({ onSuccess }: { onSuccess?: () => void }) {
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FertilizationFormData>({
        resolver: zodResolver(fertilizationSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            unit: 'kg',
        }
    });

    const filteredLots = lots?.filter(lot => lot.farmId === selectedFarmId);

    const onSubmit = async (data: FertilizationFormData) => {
        try {
            await db.activities.add({
                lotId: data.lotId,
                type: 'fertilization',
                date: new Date(data.date),
                coordinates: coordinates || undefined,
                details: {
                    inputName: data.inputName,
                    dose: data.dose,
                    unit: data.unit,
                    method: data.method,
                    notes: data.notes,
                },
            });
            reset();
            setCoordinates(null);
            if (onSuccess) onSuccess();
            alert('Fertilización registrada exitosamente');
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
            <h3 className="text-lg font-semibold text-gray-800">Registro de Fertilización</h3>

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
                <label className="block text-sm font-medium text-gray-700">Insumo / Fertilizante</label>
                <input
                    {...register('inputName')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    placeholder="Ej: Urea, 10-30-10"
                />
                {errors.inputName && <p className="text-red-500 text-xs mt-1">{errors.inputName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dosis</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('dose', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    />
                    {errors.dose && <p className="text-red-500 text-xs mt-1">{errors.dose.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Unidad</label>
                    <select
                        {...register('unit')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    >
                        <option value="kg">kg</option>
                        <option value="gr">gr</option>
                        <option value="lt">lt</option>
                        <option value="ml">ml</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Método de Aplicación</label>
                <input
                    {...register('method')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    placeholder="Ej: Al suelo, Foliar"
                />
                {errors.method && <p className="text-red-500 text-xs mt-1">{errors.method.message}</p>}
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
                Guardar Fertilización
            </button>
        </form>
    );
}
