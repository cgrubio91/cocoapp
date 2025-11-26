import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

const expenseSchema = z.object({
    date: z.string(),
    supplierId: z.number().optional(),
    category: z.enum(['service', 'rent', 'equipment', 'fuel', 'other']),
    description: z.string().min(1, 'La descripción es obligatoria'),
    amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
    paymentMethod: z.enum(['cash', 'transfer', 'credit']),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
    const suppliers = useLiveQuery(() => db.suppliers.toArray());

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            category: 'other',
            paymentMethod: 'cash',
        }
    });

    const onSubmit = async (data: ExpenseFormData) => {
        try {
            await db.expenses.add({
                date: new Date(data.date),
                supplierId: data.supplierId,
                category: data.category,
                description: data.description,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Gasto registrado exitosamente');
        } catch (error) {
            console.error('Error creating expense:', error);
            alert('Error al registrar el gasto');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">Nuevo Gasto</h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Fecha *</label>
                    <input
                        type="date"
                        {...register('date')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Categoría *</label>
                    <select
                        {...register('category')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    >
                        <option value="service">Servicio</option>
                        <option value="rent">Arriendo</option>
                        <option value="equipment">Equipo</option>
                        <option value="fuel">Combustible</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Proveedor</label>
                <select
                    {...register('supplierId', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                >
                    <option value="">Sin proveedor</option>
                    {suppliers?.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Descripción *</label>
                <textarea
                    {...register('description')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    rows={3}
                    placeholder="Ej: Pago de arriendo mensual, Compra de motosierra, etc."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Monto *</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('amount', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                        placeholder="0.00"
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Método de Pago *</label>
                    <select
                        {...register('paymentMethod')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    >
                        <option value="cash">Efectivo</option>
                        <option value="transfer">Transferencia</option>
                        <option value="credit">Crédito</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition font-medium"
            >
                Registrar Gasto
            </button>
        </form>
    );
}
