import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const cropSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    variety: z.string().optional(),
    plantingDate: z.string(),
    expectedHarvestDate: z.string().optional(),
    lotId: z.number().min(1, 'Seleccione un lote'),
    status: z.enum(['planted', 'growing', 'harvested', 'failed']),
});

type CropFormData = z.infer<typeof cropSchema>;

export function CropForm({ onSuccess }: { onSuccess?: () => void }) {
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CropFormData>({
        resolver: zodResolver(cropSchema),
        defaultValues: {
            plantingDate: new Date().toISOString().split('T')[0],
            status: 'planted',
        }
    });

    const filteredLots = lots?.filter(lot => lot.farmId === selectedFarmId);

    const onSubmit = async (data: CropFormData) => {
        try {
            await db.crops.add({
                name: data.name,
                variety: data.variety,
                plantingDate: new Date(data.plantingDate),
                expectedHarvestDate: data.expectedHarvestDate ? new Date(data.expectedHarvestDate) : undefined,
                lotId: data.lotId,
                status: data.status,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Cultivo creado exitosamente');
        } catch (error) {
            console.error('Error creating crop:', error);
            alert('Error al crear el cultivo');
        }
    };

    if (!farms) return <div>Cargando...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">Nuevo Cultivo</h3>

            <div>
                <label className="block text-sm font-medium text-slate-700">Nombre del Cultivo *</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    placeholder="Ej: Café Arábigo, Cacao CCN-51"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Variedad</label>
                <input
                    {...register('variety')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    placeholder="Ej: Castillo, Colombia, Caturra"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Finca *</label>
                <select
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
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
                <label className="block text-sm font-medium text-slate-700">Lote *</label>
                <select
                    {...register('lotId', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    disabled={!selectedFarmId}
                >
                    <option value="">Seleccione un lote</option>
                    {filteredLots?.map(lot => (
                        <option key={lot.id} value={lot.id}>{lot.name}</option>
                    ))}
                </select>
                {errors.lotId && <p className="text-red-500 text-xs mt-1">{errors.lotId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Fecha de Siembra *</label>
                    <input
                        type="date"
                        {...register('plantingDate')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Cosecha Esperada</label>
                    <input
                        type="date"
                        {...register('expectedHarvestDate')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Estado *</label>
                <select
                    {...register('status')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                >
                    <option value="planted">Sembrado</option>
                    <option value="growing">En Crecimiento</option>
                    <option value="harvested">Cosechado</option>
                    <option value="failed">Fallido</option>
                </select>
            </div>

            <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition font-medium"
            >
                Crear Cultivo
            </button>
        </form>
    );
}
