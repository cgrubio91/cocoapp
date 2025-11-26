import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const lotSchema = z.object({
    farmId: z.number().min(1, 'Seleccione una finca'),
    name: z.string().min(1, 'El nombre es obligatorio'),
    cropType: z.enum(['coffee', 'cacao', 'other']),
    area: z.number().min(0.1, 'El área debe ser mayor a 0'),
});

type LotFormData = z.infer<typeof lotSchema>;

export function LotForm({ onSuccess }: { onSuccess?: () => void }) {
    const farms = useLiveQuery(() => db.farms.toArray());
    const { register, handleSubmit, reset, formState: { errors } } = useForm<LotFormData>({
        resolver: zodResolver(lotSchema),
    });

    const onSubmit = async (data: LotFormData) => {
        try {
            await db.lots.add({
                farmId: data.farmId,
                name: data.name,
                cropType: data.cropType,
                area: data.area,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Lote creado exitosamente');
        } catch (error) {
            console.error('Error creating lot:', error);
            alert('Error al crear el lote');
        }
    };

    if (!farms) return <div>Cargando fincas...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Nuevo Lote / Sector</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Finca</label>
                <select
                    {...register('farmId', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="">Seleccione una finca</option>
                    {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                </select>
                {errors.farmId && <p className="text-red-500 text-xs mt-1">{errors.farmId.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Lote</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Cultivo</label>
                <select
                    {...register('cropType')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="coffee">Café</option>
                    <option value="cacao">Cacao</option>
                    <option value="other">Otro</option>
                </select>
                {errors.cropType && <p className="text-red-500 text-xs mt-1">{errors.cropType.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Área (ha)</label>
                <input
                    type="number"
                    step="0.1"
                    {...register('area', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
            </div>

            <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
            >
                Guardar Lote
            </button>
        </form>
    );
}
