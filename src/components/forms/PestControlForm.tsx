import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { MapPin, Camera, Loader2 } from 'lucide-react';

const pestControlSchema = z.object({
    lotId: z.number().min(1, 'Seleccione un lote'),
    type: z.enum(['pest', 'disease', 'weed']),
    name: z.string().min(1, 'El nombre de la plaga/enfermedad es obligatorio'),
    severity: z.enum(['low', 'medium', 'high']),
    notes: z.string().optional(),
    date: z.string(),
});

type PestControlFormData = z.infer<typeof pestControlSchema>;

export function PestControlForm({ onSuccess }: { onSuccess?: () => void }) {
    const farms = useLiveQuery(() => db.farms.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());

    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PestControlFormData>({
        resolver: zodResolver(pestControlSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
        }
    });

    const filteredLots = lots?.filter(lot => lot.farmId === selectedFarmId);

    const handleGetLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setGettingLocation(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    alert("No se pudo obtener la ubicación.");
                    setGettingLocation(false);
                }
            );
        } else {
            alert("Geolocalización no soportada por este navegador.");
            setGettingLocation(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: PestControlFormData) => {
        try {
            await db.activities.add({
                lotId: data.lotId,
                type: 'pest_control',
                date: new Date(data.date),
                details: {
                    subtype: data.type,
                    name: data.name,
                    severity: data.severity,
                    notes: data.notes,
                },
                location: location || undefined,
                photoUrl: photo || undefined,
            });
            reset();
            setLocation(null);
            setPhoto(null);
            if (onSuccess) onSuccess();
            alert('Registro guardado exitosamente');
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Error al guardar el registro');
        }
    };

    if (!farms) return <div>Cargando...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Registro de Plagas y Enfermedades</h3>

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

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                        {...register('type')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    >
                        <option value="pest">Plaga</option>
                        <option value="disease">Enfermedad</option>
                        <option value="weed">Maleza</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Severidad</label>
                    <select
                        {...register('severity')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                    >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre (Ej: Broca, Roya)</label>
                <input
                    {...register('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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

            <div className="flex space-x-4">
                <div className="flex-1">
                    <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={gettingLocation}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-2 px-4 rounded-md border border-blue-200 hover:bg-blue-100 transition"
                    >
                        {gettingLocation ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
                        <span>{location ? 'Ubicación Guardada' : 'Obtener GPS'}</span>
                    </button>
                    {location && <p className="text-xs text-gray-500 mt-1 text-center">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
                </div>

                <div className="flex-1">
                    <label className="w-full flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 py-2 px-4 rounded-md border border-gray-200 hover:bg-gray-100 transition cursor-pointer">
                        <Camera size={20} />
                        <span>{photo ? 'Foto Guardada' : 'Tomar Foto'}</span>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </label>
                </div>
            </div>

            {photo && (
                <div className="mt-2">
                    <img src={photo} alt="Evidencia" className="h-32 w-full object-cover rounded-md" />
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
            >
                Guardar Registro
            </button>
        </form>
    );
}
