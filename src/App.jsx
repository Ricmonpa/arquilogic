import React, { useState } from 'react';
import {
  AlertTriangle,
  Truck,
  Sparkles,
  Package,
  CloudRain,
  MapPin,
  Clock,
  ShieldAlert,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

// --- MOCK DATA ---
const INVENTORY_DATA = [
  { id: "SKU-882", producto: "Chamarra Térmica Invierno", stock: 1250, estado: "Estancado", ubicacion: "Almacén Central" },
  { id: "SKU-109", producto: "Botas de Nieve Pro", stock: 840, estado: "Exceso", ubicacion: "Bodega Norte" }
];

const ALERTS_DATA = [
  { id: 1, time: "14:22", msg: "Lote #4892 (Electrónicos) no detectado en Portal Salida B.", responsable: "Carlos M.", severity: "high" },
  { id: 2, time: "13:45", msg: "Discrepancia de 5 unidades en tarima de Lácteos.", responsable: "Ana G.", severity: "medium" }
];

const LOGISTICS_DATA = [
  { id: "TRK-01", route: "CDMX -> GDL", baseEta: "18:00", currentEta: "19:15", factor: "Lluvia intensa en carretera", delay: "+75 min", status: "En ruta" },
  { id: "TRK-02", route: "MTY -> QRO", baseEta: "10:30", currentEta: "10:35", factor: "Tráfico ligero", delay: "+5 min", status: "Próximo a llegar" }
];

export default function App() {
  const [aiStrategy, setAiStrategy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    setError("");
    setAiStrategy("");

    const apiKey = "";

    const inventoryContext = JSON.stringify(INVENTORY_DATA);
    const prompt = `Actúa como un experto estratega de retail y marketing.
    Tengo el siguiente inventario estancado detectado por mis sensores RFID: ${inventoryContext}.
    Considerando que estamos en mayo (clima cálido), genera una estrategia rápida, creativa y accionable en 3 puntos
    para liquidar o mover este inventario. Sé conciso y usa un tono profesional pero innovador.`;

    try {
      const fetchWithRetry = async (retries = 5, delay = 1000) => {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            }
          );
          if (!response.ok) throw new Error("Error en la API");
          return await response.json();
        } catch (err) {
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
      };

      const result = await fetchWithRetry();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        setAiStrategy(generatedText);
      } else {
        throw new Error("No se pudo generar la estrategia.");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el motor de IA. Por favor, intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <img
            src="/arquilogic-logo.png"
            alt="Arquilogic"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Arquilogic<span className="text-blue-400">OS</span>
            </h1>
            <p className="text-sm text-slate-400">Intelligent Logistics Platform</p>
          </div>
        </div>

        {/* N3 Branding Badge */}
        <div className="flex items-center space-x-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <span className="text-sm font-medium text-slate-300">Powered by</span>
          <img
            src="/logo-n3labs.jpg"
            alt="N3 Labs"
            className="h-7 w-auto object-contain rounded"
          />
        </div>
      </header>

      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PANEL 1: AGENTE DE ANOMALÍAS RFID */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <ShieldAlert className="text-red-400 mr-2" size={20} />
              Agente de Anomalías RFID
            </h2>
            <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full font-medium animate-pulse border border-red-500/20">
              2 Alertas Activas
            </span>
          </div>
          <div className="space-y-4 flex-grow">
            {ALERTS_DATA.map(alert => (
              <div key={alert.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 rounded-full p-1.5 ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{alert.msg}</p>
                      <div className="flex items-center mt-2 text-xs text-slate-400 space-x-3">
                        <span className="flex items-center"><Clock size={12} className="mr-1" /> {alert.time}</span>
                        <span className="flex items-center">
                          <MapPin size={12} className="mr-1" /> Contactando a:{' '}
                          <strong className="text-slate-300 ml-1">{alert.responsable}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md transition-colors">
                    Ver Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: LOGÍSTICA PREDICTIVA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Truck className="text-blue-400 mr-2" size={20} />
              Logística Predictiva
            </h2>
            <span className="text-xs text-slate-400 flex items-center">
              <CheckCircle2 size={12} className="text-green-400 mr-1" /> Actualizado en tiempo real
            </span>
          </div>
          <div className="space-y-4 flex-grow">
            {LOGISTICS_DATA.map(trk => (
              <div key={trk.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-white text-sm">{trk.id}</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-medium">{trk.route}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">ETA Original</p>
                    <p className="font-medium text-slate-300">{trk.baseEta}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">ETA Ajustado (IA)</p>
                    <p className="font-bold text-amber-400">
                      {trk.currentEta}{' '}
                      <span className="text-xs ml-1 font-normal opacity-70">({trk.delay})</span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg">
                  <CloudRain size={14} className="mr-2" />
                  Factor Externo: {trk.factor}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 3: PRONÓSTICO DE DEMANDA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="text-emerald-400 mr-2" size={20} />
              Pronóstico de Demanda (30 días)
            </h2>
          </div>

          <div className="h-48 flex items-stretch space-x-2 md:space-x-4 mt-4">
            {[40, 55, 45, 70, 90, 65, 80].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-slate-800 text-xs px-2 py-1 rounded text-white transition-opacity whitespace-nowrap z-10">
                  Semana {i + 1}: +{height}%
                </div>
                <div
                  className="w-full bg-gradient-to-t from-emerald-600/40 to-emerald-400/80 rounded-t-md transition-all duration-500 hover:opacity-80"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-[10px] text-slate-400 mt-2 shrink-0">S{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            Basado en histórico RFID y tendencias de temporada (Motor Predictivo N3)
          </p>
        </div>

        {/* PANEL 4: ESTRATEGIA DE VENTAS (IA GENERATIVA) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Sparkles className="text-indigo-400 mr-2" size={20} />
              Estrategia de Ventas Inteligente
            </h2>
          </div>

          <p className="text-sm text-slate-400 mb-4 relative z-10">
            Identificamos stock estancado. Usa IA para generar una estrategia de liquidación.
          </p>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-4 relative z-10">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Inventario Estancado Detectado:</h3>
            {INVENTORY_DATA.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0 text-sm">
                <div className="flex items-center">
                  <Package size={14} className="text-slate-400 mr-2" />
                  <span className="text-slate-200">{item.producto}</span>
                </div>
                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 text-xs">{item.stock} u.</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerateStrategy}
            disabled={isGenerating}
            className={`relative z-10 w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center transition-all shadow-lg
              ${isGenerating
                ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'}`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-200 border-t-white mr-2"></div>
                Generando Estrategia N3...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Generar Promoción con IA
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {aiStrategy && !error && (
            <div className="mt-4 p-4 bg-slate-800/80 border border-indigo-500/30 rounded-xl relative z-10 flex-grow overflow-y-auto max-h-48 custom-scrollbar">
              <div className="flex items-center mb-2">
                <div className="bg-indigo-500 p-1 rounded-md mr-2">
                  <Cpu size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold text-indigo-300">Respuesta N3 IA:</span>
              </div>
              <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {aiStrategy}
              </div>
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30,41,59,0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.8); }
      `}} />
    </div>
  );
}
