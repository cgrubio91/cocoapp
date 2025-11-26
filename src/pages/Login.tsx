import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../lib/auth';
import { LogIn } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/agrogold-logo.png" alt="AgroGold" className="h-20 w-20 mx-auto mb-4 rounded-xl" />
                    <h1 className="text-3xl font-bold">
                        <span className="text-green-700">Agro</span><span className="text-yellow-600">Gold</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Software Integral Agropecuario</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-green-600"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-green-600"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <LogIn size={20} />
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-700 font-medium mb-1">Cuenta de prueba:</p>
                    <p className="text-xs text-blue-600">Email: admin@agrogold.com</p>
                    <p className="text-xs text-blue-600">Contraseña: admin123</p>
                </div>
            </div>
        </div>
    );
}
