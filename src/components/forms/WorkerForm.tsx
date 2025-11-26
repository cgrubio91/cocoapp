import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';

const workerSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    role: z.string().min(1, 'El rol es obligatorio'),
    defaultWage: z.number().min(0, 'El salario debe ser mayor o igual a 0'),
});

type WorkerFormData = z.infer<typeof workerSchema>;

export function WorkerForm({ onSuccess }: { onSuccess?: () => void }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkerFormData>({
        resolver: zodResolver(workerSchema),
        defaultValues: {
            role: 'recolector',
            defaultWage: 0,
        }
    });

    const onSubmit = async (data: WorkerFormData) => {
        try {
            await db.workers.add({
                name: data.name,
                role: data.role,
                defaultWage: data.defaultWage,
            });
            reset();
            if (onSuccess) onSuccess();
            alert('Trabajador registrado exitosamente');
        } catch (error) {
            console.error('Error creating worker:', error);
            alert('Error al crear el trabajador');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Nuevo Trabajador</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Rol / Cargo</label>
                <select
                    {...register('role')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                >
                    <option value="recolector">Recolector</option>
                    <option value="mayordomo">Mayordomo / Administrador</option>
                    <option value="general">Operario General</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Salario Base (Día/Jornal)</label>
                <input
                    type="number"
                    step="1000"
                    {...register('defaultWage', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.defaultWage && <p className="text-red-500 text-xs mt-1">{errors.defaultWage.message}</p>}
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
                Guardar Trabajador
            </button>
        </form>
    );
}
