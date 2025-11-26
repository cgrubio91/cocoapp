import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';

const animalGroupSchema = z.object({
    type: z.enum(['cattle', 'pigs', 'poultry', 'fish', 'other']),
    breed: z.string().optional(),
    quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
    birthDate: z.string().optional(),
    location: z.string().min(1, 'La ubicación es obligatoria'),
    status: z.enum(['active', 'sold', 'deceased']),
});

type AnimalGroupFormData = z.infer<typeof animalGroupSchema>;

export function AnimalGroupForm({ onSuccess }: { onSuccess?: () => void }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AnimalGroupFormData>({
        resolver: zodResolver(animalGroupSchema),
        defaultValues: {
            type: 'cattle',
            status: 'active',
            quantity: 1,
        }
    });

    const onSubmit = async (data: AnimalGroupFormData) => {
        try {
            await db.animalGroups.add({
                type: data.type,
                breed: data.breed,
                quantity: data.quantity,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                location: data.location,
                status: data.status,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Grupo de animales creado exitosamente');
        } catch (error) {
            console.error('Error creating animal group:', error);
            alert('Error al crear el grupo de animales');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">Nuevo Grupo de Animales</h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Tipo de Animal *</label>
                    <select
                        {...register('type')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    >
                        <option value="cattle">Ganado</option>
                        <option value="pigs">Porcinos</option>
                        <option value="poultry">Aves de Corral</option>
                        <option value="fish">Peces</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Cantidad *</label>
                    <input
                        type="number"
                        {...register('quantity', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                        placeholder="1"
                    />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Raza/Variedad</label>
                <input
                    {...register('breed')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    placeholder="Ej: Holstein, Brahman, Tilapia Roja"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Ubicación *</label>
                <input
                    {...register('location')}
                    className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    placeholder="Ej: Potrero 1, Galpón A, Estanque 2"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Fecha de Nacimiento/Compra</label>
                    <input
                        type="date"
                        {...register('birthDate')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Estado *</label>
                    <select
                        {...register('status')}
                        className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                    >
                        <option value="active">Activo</option>
                        <option value="sold">Vendido</option>
                        <option value="deceased">Fallecido</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-xl hover:bg-orange-700 transition font-medium"
            >
                Crear Grupo
            </button>
        </form>
    );
}
