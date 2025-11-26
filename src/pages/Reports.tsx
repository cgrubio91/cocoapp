import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { TrendingUp, DollarSign, Users, Package, AlertTriangle } from 'lucide-react';

export function Reports() {
    const harvests = useLiveQuery(() => db.harvests.toArray());
    const sales = useLiveQuery(() => db.sales.toArray());
    const laborLogs = useLiveQuery(() => db.laborLogs.toArray());
    const activities = useLiveQuery(() => db.activities.toArray());
    const inventory = useLiveQuery(() => db.inventory.toArray());
    const lots = useLiveQuery(() => db.lots.toArray());

    // Calculate KPIs
    const totalProduction = harvests?.reduce((acc, h) => acc + h.quantity, 0) || 0;
    const totalRevenue = sales?.reduce((acc, s) => acc + s.totalValue, 0) || 0;
    const totalLaborCost = laborLogs?.reduce((acc, l) => acc + l.cost, 0) || 0;

    // Low stock items
    const lowStockItems = inventory?.filter(item =>
        item.minimumStock && item.quantity < item.minimumStock
    ) || [];

    // Profit margin
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalLaborCost) / totalRevenue * 100).toFixed(1) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Reportes e Indicadores</h2>
                <p className="text-slate-500">Análisis completo de la operación de la finca.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Producción Total</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{totalProduction.toLocaleString()} kg</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <DollarSign className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Ingresos Totales</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">${totalRevenue.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-100 p-3 rounded-xl">
                            <Users className="text-orange-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Costos de Mano de Obra</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">${totalLaborCost.toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-3 rounded-xl">
                            <Package className="text-purple-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Margen de Ganancia</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{profitMargin}%</p>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="text-red-600" size={24} />
                        <h3 className="text-lg font-bold text-red-800">Alertas de Inventario Bajo</h3>
                    </div>
                    <div className="space-y-2">
                        {lowStockItems.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-slate-800">{item.name}</p>
                                    <p className="text-sm text-slate-500">
                                        Stock actual: {item.quantity} {item.unit} | Mínimo: {item.minimumStock} {item.unit}
                                    </p>
                                </div>
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                    ¡Bajo!
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activities Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Actividades Recientes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Fecha</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Lote</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tipo</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Coordenadas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities?.slice(0, 10).map(activity => {
                                const lot = lots?.find(l => l.id === activity.lotId);
                                return (
                                    <tr key={activity.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm text-slate-700">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{lot?.name || 'N/A'}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                {activity.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700">
                                            {activity.coordinates ?
                                                `${activity.coordinates.lat.toFixed(4)}, ${activity.coordinates.lng.toFixed(4)}` :
                                                'Sin coordenadas'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Historial de Ventas</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Fecha</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Comprador</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Cantidad (kg)</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Precio/kg</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales?.slice(0, 10).map(sale => (
                                <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 text-sm text-slate-700">
                                        {new Date(sale.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-slate-700">{sale.buyer}</td>
                                    <td className="py-3 px-4 text-sm text-slate-700">{sale.quantity}</td>
                                    <td className="py-3 px-4 text-sm text-slate-700">${sale.pricePerKg.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-sm font-medium text-slate-800">
                                        ${sale.totalValue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
