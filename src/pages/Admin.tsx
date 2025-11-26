import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type User, type UserQuotas } from '../lib/db';
import { Users, CheckCircle, XCircle, Edit2, Save } from 'lucide-react';

export function Admin() {
    const users = useLiveQuery(() => db.users.toArray());
    const [editingUser, setEditingUser] = useState<number | null>(null);
    const [editQuotas, setEditQuotas] = useState<UserQuotas | null>(null);

    const handleApprove = async (userId: number) => {
        await db.users.update(userId, { status: 'active' });
    };

    const handleReject = async (userId: number) => {
        await db.users.delete(userId);
    };

    const handleSuspend = async (userId: number) => {
        await db.users.update(userId, { status: 'suspended' });
    };

    const handleActivate = async (userId: number) => {
        await db.users.update(userId, { status: 'active' });
    };

    const startEditQuotas = (user: User) => {
        setEditingUser(user.id!);
        setEditQuotas(user.quotas);
    };

    const saveQuotas = async () => {
        if (editingUser && editQuotas) {
            await db.users.update(editingUser, { quotas: editQuotas });
            setEditingUser(null);
            setEditQuotas(null);
        }
    };

    const pendingUsers = users?.filter(u => u.status === 'pending') || [];
    const activeUsers = users?.filter(u => u.status === 'active' && u.role !== 'superadmin') || [];
    const suspendedUsers = users?.filter(u => u.status === 'suspended') || [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Panel de Administración</h2>
                <p className="text-slate-500">Gestión de usuarios y cuotas del sistema</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-sm text-yellow-700 font-medium">Usuarios Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-800">{pendingUsers.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700 font-medium">Usuarios Activos</p>
                    <p className="text-3xl font-bold text-green-800">{activeUsers.length}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 font-medium">Usuarios Suspendidos</p>
                    <p className="text-3xl font-bold text-red-800">{suspendedUsers.length}</p>
                </div>
            </div>

            {/* Pending Users */}
            {pendingUsers.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Usuarios Pendientes de Aprobación
                    </h3>
                    <div className="space-y-3">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{user.name}</p>
                                        <p className="text-sm text-slate-600">{user.email}</p>
                                        <p className="text-xs text-slate-500">
                                            Registrado: {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(user.id!)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1 text-sm"
                                        >
                                            <CheckCircle size={16} />
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.id!)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-1 text-sm"
                                        >
                                            <XCircle size={16} />
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Users */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Usuarios Activos</h3>
                <div className="space-y-3">
                    {activeUsers.map(user => (
                        <div key={user.id} className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-slate-800">{user.name}</p>
                                    <p className="text-sm text-slate-600">{user.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEditQuotas(user)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm"
                                    >
                                        <Edit2 size={14} />
                                        Editar Cuotas
                                    </button>
                                    <button
                                        onClick={() => handleSuspend(user.id!)}
                                        className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition text-sm"
                                    >
                                        Suspender
                                    </button>
                                </div>
                            </div>

                            {editingUser === user.id && editQuotas ? (
                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-slate-700 mb-3">Editar Cuotas</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                        <div>
                                            <label className="text-xs text-slate-600">Máx. Fincas</label>
                                            <input
                                                type="number"
                                                value={editQuotas.maxFarms}
                                                onChange={(e) => setEditQuotas({ ...editQuotas, maxFarms: parseInt(e.target.value) })}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600">Máx. Lotes</label>
                                            <input
                                                type="number"
                                                value={editQuotas.maxLots}
                                                onChange={(e) => setEditQuotas({ ...editQuotas, maxLots: parseInt(e.target.value) })}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600">Máx. Cultivos</label>
                                            <input
                                                type="number"
                                                value={editQuotas.maxCrops}
                                                onChange={(e) => setEditQuotas({ ...editQuotas, maxCrops: parseInt(e.target.value) })}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600">Máx. Animales</label>
                                            <input
                                                type="number"
                                                value={editQuotas.maxAnimals}
                                                onChange={(e) => setEditQuotas({ ...editQuotas, maxAnimals: parseInt(e.target.value) })}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600">Máx. Trabajadores</label>
                                            <input
                                                type="number"
                                                value={editQuotas.maxWorkers}
                                                onChange={(e) => setEditQuotas({ ...editQuotas, maxWorkers: parseInt(e.target.value) })}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600">Máx. Proveedores</label>
                                            <input
                                                type="number"
                                                value={editQuotas.maxSuppliers}
                                                onChange={(e) => setEditQuotas({ ...editQuotas, maxSuppliers: parseInt(e.target.value) })}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 px-2 py-1 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={saveQuotas}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1 text-sm"
                                        >
                                            <Save size={16} />
                                            Guardar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingUser(null);
                                                setEditQuotas(null);
                                            }}
                                            className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-400 transition text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                    <div className="bg-white p-2 rounded">
                                        <p className="text-slate-500">Fincas</p>
                                        <p className="font-bold text-slate-700">{user.quotas.maxFarms}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                        <p className="text-slate-500">Lotes</p>
                                        <p className="font-bold text-slate-700">{user.quotas.maxLots}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                        <p className="text-slate-500">Cultivos</p>
                                        <p className="font-bold text-slate-700">{user.quotas.maxCrops}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                        <p className="text-slate-500">Animales</p>
                                        <p className="font-bold text-slate-700">{user.quotas.maxAnimals}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                        <p className="text-slate-500">Trabajadores</p>
                                        <p className="font-bold text-slate-700">{user.quotas.maxWorkers}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded">
                                        <p className="text-slate-500">Proveedores</p>
                                        <p className="font-bold text-slate-700">{user.quotas.maxSuppliers}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {activeUsers.length === 0 && (
                        <p className="text-slate-400 text-center py-8">No hay usuarios activos</p>
                    )}
                </div>
            </div>

            {/* Suspended Users */}
            {suspendedUsers.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Usuarios Suspendidos</h3>
                    <div className="space-y-3">
                        {suspendedUsers.map(user => (
                            <div key={user.id} className="p-4 bg-red-50 rounded-xl border border-red-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{user.name}</p>
                                        <p className="text-sm text-slate-600">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleActivate(user.id!)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                                    >
                                        Reactivar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
