import { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: 'Hola, soy tu asistente agrícola. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: 'Entiendo. Estoy analizando tus datos para darte la mejor recomendación...' }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center gap-2",
                    isOpen && "hidden"
                )}
            >
                <Sparkles size={24} />
                <span className="font-medium hidden md:inline">Asistente IA</span>
            </button>

            {/* Chat Window */}
            <div
                className={cn(
                    "fixed bottom-20 md:bottom-8 right-4 md:right-8 w-[90vw] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 flex flex-col transition-all duration-300 transform origin-bottom-right",
                    !isOpen && "scale-0 opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-t-2xl flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold">AgriBot</h3>
                            <p className="text-xs text-green-100">En línea</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "max-w-[80%] p-3 rounded-2xl text-sm",
                                msg.role === 'user'
                                    ? "bg-blue-600 text-white ml-auto rounded-br-none"
                                    : "bg-white text-slate-700 border border-slate-200 mr-auto rounded-bl-none shadow-sm"
                            )}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe tu consulta..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-green-600 text-white p-2 rounded-xl hover:bg-green-700 transition shadow-sm"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
