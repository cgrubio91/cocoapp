import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const harvestSchema = z.object({
    lotId: z.number().min(1, 'Seleccione un lote'),
    date: z.string(),
    quantity: z.number().min(0.1, 'La cantidad debe ser mayor a 0'),
    quality: z.string().optional(),
});

type HarvestFormData = z.infer<typeof harvestSchema>;

export function HarvestForm({ onSuccess }: { onSuccess?: () => void }) {
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<HarvestFormData>({
        resolver: zodResolver(harvestSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
        }
    });

    const filteredLots = lots?.filter(lot => lot.farmId === selectedFarmId);

    const onSubmit = async (data: HarvestFormData) => {
        try {
            await db.harvests.add({
                lotId: data.lotId,
                date: new Date(data.date),
                quantity: data.quantity,
                quality: data.quality,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Cosecha registrada exitosamente');
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Error al guardar el registro');
        }
    };

    if (!farms) return <div>Cargando...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Registro de Cosecha</h3>

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
                <label className="block text-sm font-medium text-gray-700">Cantidad Recolectada (kg)</label>
                <input
                    type="number"
                    step="0.1"
                    {...register('quantity', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Calidad / Observaciones</label>
                <input
                    {...register('quality')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    placeholder="Ej: Grano maduro, Pintón"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                    type="date"
                    {...register('date')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition"
            >
                Guardar Cosecha
            </button>
        </form>
    );
}
