import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { SupplierForm } from '../components/forms/SupplierForm';
import { ExpenseForm } from '../components/forms/ExpenseForm';

export function Expenses() {
    const [activeTab, setActiveTab] = useState<'suppliers' | 'expenses'>('suppliers');
    const [refreshKey, setRefreshKey] = useState(0);

    const suppliers = useLiveQuery(() => db.suppliers.toArray(), [refreshKey]);
    const expenses = useLiveQuery(() => db.expenses.toArray(), [refreshKey]);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Proveedores y Gastos</h2>
                <p className="text-slate-500">Gestión de proveedores y registro de gastos operativos.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'suppliers'
                            ? 'text-green-700 border-b-2 border-green-700'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Proveedores
                </button>
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'expenses'
                            ? 'text-green-700 border-b-2 border-green-700'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Gastos
                </button>
            </div>

            {/* Content */}
            {activeTab === 'suppliers' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SupplierForm onSuccess={handleSuccess} />

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Lista de Proveedores</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {suppliers?.map(supplier => (
                                <div key={supplier.id} className="p-3 bg-slate-50 rounded-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-slate-800">{supplier.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {supplier.category === 'fertilizer' && 'Fertilizantes'}
                                                {supplier.category === 'pesticide' && 'Pesticidas'}
                                                {supplier.category === 'equipment' && 'Equipos'}
                                                {supplier.category === 'service' && 'Servicios'}
                                                {supplier.category === 'other' && 'Otro'}
                                            </p>
                                            {supplier.phone && <p className="text-xs text-slate-400">📞 {supplier.phone}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!suppliers || suppliers.length === 0) && (
                                <p className="text-slate-400 text-center py-8">No hay proveedores registrados</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ExpenseForm onSuccess={handleSuccess} />

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Gastos Recientes</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {expenses?.slice(0, 20).map(expense => {
                                const supplier = suppliers?.find(s => s.id === expense.supplierId);
                                return (
                                    <div key={expense.id} className="p-3 bg-slate-50 rounded-xl">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">{expense.description}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(expense.date).toLocaleDateString()} • {supplier?.name || 'Sin proveedor'}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {expense.category === 'service' && 'Servicio'}
                                                    {expense.category === 'rent' && 'Arriendo'}
                                                    {expense.category === 'equipment' && 'Equipo'}
                                                    {expense.category === 'fuel' && 'Combustible'}
                                                    {expense.category === 'other' && 'Otro'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800">${expense.amount.toLocaleString()}</p>
                                                <p className="text-xs text-slate-400">
                                                    {expense.paymentMethod === 'cash' && 'Efectivo'}
                                                    {expense.paymentMethod === 'transfer' && 'Transferencia'}
                                                    {expense.paymentMethod === 'credit' && 'Crédito'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!expenses || expenses.length === 0) && (
                                <p className="text-slate-400 text-center py-8">No hay gastos registrados</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
