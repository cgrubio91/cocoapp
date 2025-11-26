import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ProductionChart, SalesChart } from '../components/DashboardCharts';
import { Sprout, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function Home() {
  const harvests = useLiveQuery(() => db.harvests.toArray());
  const sales = useLiveQuery(() => db.sales.toArray());
  const workers = useLiveQuery(() => db.workers.count());
  const farms = useLiveQuery(() => db.farms.count());

  // Calculate KPIs
  const totalHarvest = harvests?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  const totalSales = sales?.reduce((acc, curr) => acc + curr.totalValue, 0) || 0;

  // Mock data for charts (in a real app, aggregate from DB)
  const productionData = [
    { name: 'Ene', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Abr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  const salesData = [
    { name: 'Ene', value: 2400 },
    { name: 'Feb', value: 1398 },
    { name: 'Mar', value: 9800 },
    { name: 'Abr', value: 3908 },
    { name: 'May', value: 4800 },
    { name: 'Jun', value: 3800 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
        <p className="text-slate-500">Resumen general de tu actividad agrícola.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Sprout className="text-green-600" size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" /> +12%
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Cosecha Total</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalHarvest.toLocaleString()} kg</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" /> +8%
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Ventas Totales</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1">${totalSales.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Users className="text-orange-600" size={24} />
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Trabajadores</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1">{workers || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <ArrowDownRight size={14} className="mr-1" /> -2%
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Fincas Activas</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1">{farms || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Producción Mensual</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0 cursor-pointer">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          <ProductionChart data={productionData} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Resumen de Ventas</h3>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Ver reporte</button>
          </div>
          <SalesChart data={salesData} />
        </div>
      </div>
    </div>
  );
}
