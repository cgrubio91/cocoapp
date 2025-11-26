import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';

const supplierSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    contact: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    category: z.enum(['fertilizer', 'pesticide', 'equipment', 'service', 'other']),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export function SupplierForm({ onSuccess }: { onSuccess?: () => void }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            category: 'other',
        }
    });

    const onSubmit = async (data: SupplierFormData) => {
        try {
            await db.suppliers.add({
                name: data.name,
                contact: data.contact,
                phone: data.phone,
                email: data.email || undefined,
                category: data.category,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Proveedor creado exitosamente');
        } catch (error) {
            console.error('Error creating supplier:', error);
            alert('Error al crear el proveedor');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">Nuevo Proveedor</h3>

            <div>
                <label className="block text-sm font-medium text-slate-700">Nombre del Proveedor *</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    placeholder="Ej: Agroquímicos del Valle"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Categoría *</label>
                <select
                    {...register('category')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                >
                    <option value="fertilizer">Fertilizantes</option>
                    <option value="pesticide">Pesticidas/Herbicidas</option>
                    <option value="equipment">Equipos</option>
                    <option value="service">Servicios</option>
                    <option value="other">Otro</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Contacto</label>
                    <input
                        {...register('contact')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                        placeholder="Nombre del contacto"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                    <input
                        {...register('phone')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                        placeholder="+57 300 123 4567"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                    type="email"
                    {...register('email')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    placeholder="proveedor@ejemplo.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition font-medium"
            >
                Guardar Proveedor
            </button>
        </form>
    );
}
