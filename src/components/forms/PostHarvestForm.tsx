import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const postHarvestSchema = z.object({
    lotId: z.number().min(1, 'Seleccione un lote de origen'),
    date: z.string(),
    processType: z.enum(['fermentation', 'drying', 'milling', 'other']),
    weight: z.number().min(0.1, 'El peso debe ser mayor a 0'),
    notes: z.string().optional(),
});

type PostHarvestFormData = z.infer<typeof postHarvestSchema>;

export function PostHarvestForm({ onSuccess }: { onSuccess?: () => void }) {
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PostHarvestFormData>({
        resolver: zodResolver(postHarvestSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            processType: 'fermentation',
        }
    });

    const filteredLots = lots?.filter(lot => lot.farmId === selectedFarmId);

    const onSubmit = async (data: PostHarvestFormData) => {
        try {
            await db.postHarvest.add({
                lotId: data.lotId,
                date: new Date(data.date),
                processType: data.processType,
                weight: data.weight,
                notes: data.notes,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Proceso registrado exitosamente');
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Error al guardar el registro');
        }
    };

    if (!farms) return <div>Cargando...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Registro Post-Cosecha</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Finca de Origen</label>
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
                <label className="block text-sm font-medium text-gray-700">Lote de Origen</label>
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
                <label className="block text-sm font-medium text-gray-700">Tipo de Proceso</label>
                <select
                    {...register('processType')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="fermentation">Fermentación</option>
                    <option value="drying">Secado</option>
                    <option value="milling">Trilla / Beneficio</option>
                    <option value="other">Otro</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Peso Resultante (kg)</label>
                <input
                    type="number"
                    step="0.1"
                    {...register('weight', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
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

            <button
                type="submit"
                className="w-full bg-amber-700 text-white py-2 px-4 rounded-md hover:bg-amber-800 transition"
            >
                Guardar Proceso
            </button>
        </form>
    );
}
