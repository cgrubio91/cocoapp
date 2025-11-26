import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const laborSchema = z.object({
    workerId: z.number().min(1, 'Seleccione un trabajador'),
    lotId: z.number().min(1, 'Seleccione un lote'),
    date: z.string(),
    activity: z.string().min(1, 'La actividad es obligatoria'),
    cost: z.number().min(0, 'El costo debe ser mayor o igual a 0'),
    notes: z.string().optional(),
});

type LaborFormData = z.infer<typeof laborSchema>;

export function LaborForm({ onSuccess }: { onSuccess?: () => void }) {
    const workers = useLiveQuery(() => db.workers.toArray());
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<LaborFormData>({
        resolver: zodResolver(laborSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
        }
    });



    // Auto-fill cost when worker is selected
    const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setValue('workerId', id);
        const worker = workers?.find(w => w.id === id);
        if (worker) {
            setValue('cost', worker.defaultWage);
        }
    };

    const filteredLots = lots?.filter(lot => lot.farmId === selectedFarmId);

    const onSubmit = async (data: LaborFormData) => {
        try {
            await db.laborLogs.add({
                workerId: data.workerId,
                lotId: data.lotId,
                date: new Date(data.date),
                activity: data.activity,
                cost: data.cost,
                notes: data.notes,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Jornal registrado exitosamente');
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Error al guardar el registro');
        }
    };

    if (!workers || !farms) return <div>Cargando...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Registro de Jornales</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Trabajador</label>
                <select
                    {...register('workerId', { valueAsNumber: true })}
                    onChange={handleWorkerChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="">Seleccione un trabajador</option>
                    {workers.map(worker => (
                        <option key={worker.id} value={worker.id}>{worker.name} ({worker.role})</option>
                    ))}
                </select>
                {errors.workerId && <p className="text-red-500 text-xs mt-1">{errors.workerId.message}</p>}
            </div>

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
                <input
                    {...register('activity')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    placeholder="Ej: Poda, Recolección, Deshierbe"
                />
                {errors.activity && <p className="text-red-500 text-xs mt-1">{errors.activity.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Costo Total (Jornal)</label>
                <input
                    type="number"
                    step="1000"
                    {...register('cost', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>}
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
                Guardar Jornal
            </button>
        </form>
    );
}
