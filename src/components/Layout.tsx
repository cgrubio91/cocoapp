import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Sprout, ClipboardList, BarChart3, Settings, Truck, Menu, DollarSign, Wheat, PawPrint, Map } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { AIAssistant } from './AIAssistant';

export function Layout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Sprout, label: 'Campo', path: '/field' },
        { icon: ClipboardList, label: 'Cosecha', path: '/harvest' },
        { icon: Truck, label: 'Logística', path: '/logistics' },
        { icon: DollarSign, label: 'Gastos', path: '/expenses' },
        { icon: Wheat, label: 'Cultivos', path: '/crops' },
        { icon: PawPrint, label: 'Animales', path: '/livestock' },
        { icon: Map, label: 'Precisión', path: '/precision-ag' },
        { icon: BarChart3, label: 'Reportes', path: '/reports' },
        { icon: Settings, label: 'Config', path: '/settings' },
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Sprout className="text-green-700" size={24} />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-800 tracking-tight">AgriManager <span className="text-green-700">Pro</span></h1>
                </div>
                <button className="md:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <Menu size={24} />
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100">
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    location.pathname === item.path
                                        ? "bg-green-50 text-green-700 font-medium shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon size={20} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-slate-100">
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-xs text-blue-600 font-medium mb-1">Plan Pro</p>
                            <p className="text-xs text-blue-400">Vence en 30 días</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-slate-50">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            <AIAssistant />

            {/* Bottom Nav - Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-30 pb-safe">
                {navItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center p-2 rounded-lg transition-colors",
                            location.pathname === item.path
                                ? "text-green-700"
                                : "text-slate-400"
                        )}
                    >
                        <item.icon size={24} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
