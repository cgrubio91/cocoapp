import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';

const salesSchema = z.object({
    date: z.string(),
    buyer: z.string().min(1, 'El comprador es obligatorio'),
    cropType: z.enum(['coffee', 'cacao', 'other']),
    quantity: z.number().min(0.1, 'La cantidad debe ser mayor a 0'),
    pricePerKg: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
});

type SalesFormData = z.infer<typeof salesSchema>;

export function SalesForm({ onSuccess }: { onSuccess?: () => void }) {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SalesFormData>({
        resolver: zodResolver(salesSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            cropType: 'coffee',
        }
    });

    const quantity = watch('quantity');
    const pricePerKg = watch('pricePerKg');
    const totalValue = (quantity || 0) * (pricePerKg || 0);

    const onSubmit = async (data: SalesFormData) => {
        try {
            await db.sales.add({
                date: new Date(data.date),
                buyer: data.buyer,
                cropType: data.cropType,
                quantity: data.quantity,
                pricePerKg: data.pricePerKg,
                totalValue: data.quantity * data.pricePerKg,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Venta registrada exitosamente');
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Error al guardar el registro');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Registro de Ventas</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Comprador</label>
                <input
                    {...register('buyer')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    placeholder="Ej: Cooperativa, Intermediario"
                />
                {errors.buyer && <p className="text-red-500 text-xs mt-1">{errors.buyer.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                <select
                    {...register('cropType')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="coffee">Café</option>
                    <option value="cacao">Cacao</option>
                    <option value="other">Otro</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cantidad (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('quantity', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Precio / kg</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('pricePerKg', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    />
                    {errors.pricePerKg && <p className="text-red-500 text-xs mt-1">{errors.pricePerKg.message}</p>}
                </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">Total Estimado:</p>
                <p className="text-xl font-bold text-green-700">
                    ${totalValue.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                </p>
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
                className="w-full bg-green-800 text-white py-2 px-4 rounded-md hover:bg-green-900 transition"
            >
                Registrar Venta
            </button>
        </form>
    );
}
