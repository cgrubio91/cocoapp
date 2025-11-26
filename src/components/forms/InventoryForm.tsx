import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';

const itemSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    type: z.enum(['fertilizer', 'pesticide', 'tool', 'fuel', 'other']),
    unit: z.string().min(1, 'La unidad es obligatoria'),
    quantity: z.number().min(0),
    averageCost: z.number().min(0),
    minimumStock: z.number().min(0).optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export function InventoryForm({ onSuccess }: { onSuccess?: () => void }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemFormData>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            quantity: 0,
            averageCost: 0,
        }
    });

    const onSubmit = async (data: ItemFormData) => {
        try {
            await db.inventory.add({
                name: data.name,
                type: data.type,
                unit: data.unit,
                quantity: data.quantity,
                averageCost: data.averageCost,
                minimumStock: data.minimumStock,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Ítem creado exitosamente');
        } catch (error) {
            console.error('Error creating item:', error);
            alert('Error al crear el ítem');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Nuevo Ítem de Inventario</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Ítem</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    placeholder="Ej: Urea, Glifosato, Machete"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                    {...register('type')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="fertilizer">Fertilizante</option>
                    <option value="pesticide">Pesticida / Herbicida</option>
                    <option value="tool">Herramienta</option>
                    <option value="fuel">Combustible</option>
                    <option value="other">Otro</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                <input
                    {...register('unit')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    placeholder="Ej: kg, lt, unidad"
                />
                {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cantidad Inicial</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('quantity', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Costo Promedio (Unitario)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('averageCost', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Stock Mínimo (Alerta)</label>
                <input
                    type="number"
                    step="0.01"
                    {...register('minimumStock', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    placeholder="Cantidad mínima antes de alerta"
                />
                <p className="text-xs text-gray-500 mt-1">Se mostrará una alerta cuando el stock esté por debajo de este valor</p>
            </div>

            <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
            >
                Guardar Ítem
            </button>
        </form>
    );
}
