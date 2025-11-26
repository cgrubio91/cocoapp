import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { HeatMap } from '../components/HeatMap';

export function PrecisionAg() {
    const [activityFilter, setActivityFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const activities = useLiveQuery(() => db.activities.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());

    // Filter activities
    const filteredActivities = activities?.filter(activity => {
        // Filter by type
        if (activityFilter !== 'all' && activity.type !== activityFilter) {
            return false;
        }

        // Filter by date range
        if (dateRange.start && new Date(activity.date) < new Date(dateRange.start)) {
            return false;
        }
        if (dateRange.end && new Date(activity.date) > new Date(dateRange.end)) {
            return false;
        }

        // Only show activities with coordinates
        return activity.coordinates !== undefined;
    }) || [];

    const stats = {
        total: filteredActivities.length,
        pestControl: filteredActivities.filter(a => a.type === 'pest_control').length,
        fertilization: filteredActivities.filter(a => a.type === 'fertilization').length,
        cultural: filteredActivities.filter(a => a.type === 'pruning' || a.type === 'weeding').length,
    };

    return (
        <div className="space-y-6 h-full">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Agricultura de Precisión</h2>
                <p className="text-slate-500">Visualización geoespacial de actividades de campo.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Total Actividades</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Control de Plagas</p>
                    <p className="text-2xl font-bold text-red-600">{stats.pestControl}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Fertilización</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.fertilization}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Labores Culturales</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.cultural}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-3">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Actividad</label>
                        <select
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                        >
                            <option value="all">Todas</option>
                            <option value="pest_control">Control de Plagas</option>
                            <option value="fertilization">Fertilización</option>
                            <option value="pruning">Poda</option>
                            <option value="weeding">Deshierbe</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-green-600"
                        />
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm" style={{ height: '500px' }}>
                <h3 className="font-bold text-slate-800 mb-3">Mapa de Calor - Actividades de Campo</h3>
                <div className="h-full pb-12">
                    {filteredActivities.length > 0 ? (
                        <HeatMap activities={filteredActivities} />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-slate-50 rounded-xl">
                            <div className="text-center">
                                <p className="text-slate-400 text-lg mb-2">📍 No hay actividades con coordenadas</p>
                                <p className="text-slate-500 text-sm">
                                    Captura ubicaciones en las actividades de campo para visualizarlas aquí
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity List */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-3">Actividades Registradas</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredActivities.map(activity => {
                        const lot = lots?.find(l => l.id === activity.lotId);
                        return (
                            <div key={activity.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-slate-800">
                                        {activity.type === 'pest_control' && '🐛 Control de Plagas'}
                                        {activity.type === 'fertilization' && '🌱 Fertilización'}
                                        {activity.type === 'pruning' && '✂️ Poda'}
                                        {activity.type === 'weeding' && '🌿 Deshierbe'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {lot?.name || 'N/A'} • {new Date(activity.date).toLocaleDateString()}
                                    </p>
                                </div>
                                {activity.coordinates && (
                                    <p className="text-xs text-slate-400 font-mono">
                                        {activity.coordinates.lat.toFixed(4)}, {activity.coordinates.lng.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                    {filteredActivities.length === 0 && (
                        <p className="text-slate-400 text-center py-8">No hay actividades que coincidan con los filtros</p>
                    )}
                </div>
            </div>
        </div>
    );
}
