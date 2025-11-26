import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';

const farmSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    area: z.number().min(0.1, 'El área debe ser mayor a 0'),
    location: z.string().optional(),
});

type FarmFormData = z.infer<typeof farmSchema>;

export function FarmForm({ onSuccess }: { onSuccess?: () => void }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FarmFormData>({
        resolver: zodResolver(farmSchema),
    });

    const onSubmit = async (data: FarmFormData) => {
        try {
            await db.farms.add({
                name: data.name,
                area: data.area,
                location: data.location,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Finca creada exitosamente');
        } catch (error) {
            console.error('Error creating farm:', error);
            alert('Error al crear la finca');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Nueva Finca</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Finca</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Área Total (ha)</label>
                <input
                    type="number"
                    step="0.1"
                    {...register('area', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación (Descripción)</label>
                <input
                    {...register('location')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
            >
                Guardar Finca
            </button>
        </form>
    );
}
