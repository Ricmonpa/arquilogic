import React, { useState } from 'react';
import {
  AlertTriangle, Truck, Sparkles, Package, CloudRain, MapPin,
  Clock, ShieldAlert, TrendingUp, TrendingDown, CheckCircle2,
  Cpu, Activity, Zap, User, FlaskConical, BarChart3
} from 'lucide-react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const INVENTORY_DATA = [
  { id: "SKU-882", producto: "Chamarra Térmica Invierno", stock: 1250, estado: "Estancado", ubicacion: "Almacén Central" },
  { id: "SKU-109", producto: "Botas de Nieve Pro",        stock: 840,  estado: "Exceso",    ubicacion: "Bodega Norte" },
];

const ALERTS_DATA = [
  { id: 1, time: "14:22", msg: "Lote #4892 (Electrónicos) no detectado en Portal Salida B.", responsable: "Carlos M.", severity: "high" },
  { id: 2, time: "13:45", msg: "Discrepancia de 5 unidades en tarima de Lácteos.",           responsable: "Ana G.",    severity: "medium" },
];

const LOGISTICS_DATA = [
  { id: "TRK-01", route: "CDMX → GDL",  baseEta: "18:00", currentEta: "19:15", factor: "Lluvia intensa en carretera",  delay: "+75 min",  status: "En ruta" },
  { id: "TRK-02", route: "MTY → QRO",   baseEta: "10:30", currentEta: "10:35", factor: "Tráfico ligero",               delay: "+5 min",   status: "Próximo a llegar" },
];

const PHARMA_LOTS = [
  { gtin: "00781234567890", producto: "Amoxicilina 500mg",     lote: "L-2024-0891", diasCaducidad: 24, stock: 320, responsable: "Carlos M.", historial: 3, riesgo: 87, color: "red" },
  { gtin: "00349876543210", producto: "Metformina 850mg",      lote: "L-2024-1102", diasCaducidad: 31, stock: 540, responsable: "Ana G.",    historial: 0, riesgo: 12, color: "green" },
  { gtin: "00562109876540", producto: "Ibuprofeno 400mg",      lote: "L-2024-0774", diasCaducidad: 18, stock: 210, responsable: "Luis R.",   historial: 1, riesgo: 64, color: "yellow" },
];

const DEMAND_GTINS = [
  { gtin: "07501234567890", producto: "SmartTag RFID v2",        categoria: "Electrónicos",  tendencia: "alza",        pct: "+80%", bars: [40, 55, 45, 70, 90, 65, 80] },
  { gtin: "07509876543210", producto: "Chamarra Impermeable",    categoria: "Indumentaria",  tendencia: "baja",        pct: "−38%", bars: [80, 75, 60, 50, 45, 30, 20] },
  { gtin: "07501122334455", producto: "Tablet Industrial IP67",  categoria: "Cómputo",       tendencia: "alza fuerte", pct: "+95%", bars: [30, 35, 55, 60, 75, 80, 90] },
];

// ─── COMPONENTES AUXILIARES ────────────────────────────────────────────────────

/** Mapa SVG de ruta QRO → CDMX con 2 accidentes */
const RouteMap = () => (
  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
    <svg viewBox="0 0 480 170" className="w-full" xmlns="http://www.w3.org/2000/svg">
      {/* Fondo */}
      <rect width="480" height="170" fill="#020617" />

      {/* Textura de terreno */}
      <ellipse cx="120" cy="130" rx="80" ry="25" fill="#0f172a" />
      <ellipse cx="350" cy="140" rx="90" ry="20" fill="#0f172a" />

      {/* Carretera — capa base */}
      <path d="M 50 90 C 130 65, 220 115, 310 85 C 380 65, 420 90, 440 88"
            stroke="#1e293b" strokeWidth="18" fill="none" strokeLinecap="round" />
      {/* Carretera — asfalto */}
      <path d="M 50 90 C 130 65, 220 115, 310 85 C 380 65, 420 90, 440 88"
            stroke="#334155" strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* Centro amarillo punteado */}
      <path d="M 50 90 C 130 65, 220 115, 310 85 C 380 65, 420 90, 440 88"
            stroke="#f59e0b" strokeWidth="1.5" fill="none"
            strokeDasharray="14 10" strokeLinecap="round" />

      {/* ── Accidente 1 · Km 142 ── */}
      <circle cx="185" cy="93" r="16" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" />
      <text x="185" y="99" textAnchor="middle" fill="#ef4444" fontSize="15" fontFamily="serif">⚠</text>
      <text x="185" y="117" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Km 142</text>

      {/* ── Accidente 2 · Km 189 ── */}
      <circle cx="305" cy="88" r="16" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" />
      <text x="305" y="94" textAnchor="middle" fill="#ef4444" fontSize="15" fontFamily="serif">⚠</text>
      <text x="305" y="112" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Km 189</text>

      {/* ── Ciudad origen QRO ── */}
      <circle cx="50" cy="90" r="7" fill="#10b981" />
      <circle cx="50" cy="90" r="12" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1" />
      <text x="50" y="73" textAnchor="middle" fill="#10b981" fontSize="11"
            fontWeight="bold" fontFamily="sans-serif">QRO</text>

      {/* ── Ciudad destino CDMX ── */}
      <circle cx="440" cy="88" r="7" fill="#3b82f6" />
      <circle cx="440" cy="88" r="12" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1" />
      <text x="440" y="71" textAnchor="middle" fill="#3b82f6" fontSize="11"
            fontWeight="bold" fontFamily="sans-serif">CDMX</text>

      {/* Etiqueta autopista */}
      <rect x="193" y="138" width="94" height="16" rx="4" fill="#1e293b" />
      <text x="240" y="150" textAnchor="middle" fill="#64748b" fontSize="9"
            fontFamily="sans-serif">Autopista MEX-57</text>
    </svg>

    {/* Leyenda */}
    <div className="flex items-center justify-center space-x-5 px-4 py-2 text-xs text-slate-400 bg-slate-900/60">
      <span className="flex items-center gap-1"><span className="text-red-400">⚠</span> 2 accidentes activos</span>
      <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> Origen</span>
      <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> Destino</span>
    </div>
  </div>
);

/** Badge de riesgo de color */
const RiskBadge = ({ pct, color }) => {
  const styles = {
    red:    "bg-red-500/20 text-red-400 border-red-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    green:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${styles[color]}`}>
      {pct}%
    </span>
  );
};

/** Botón "Predecir con IA" reutilizable */
const PredictButton = ({ onClick, loading, label = "Predecir con IA" }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all
      ${loading
        ? 'bg-indigo-600/40 text-indigo-300 cursor-not-allowed'
        : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/20'}`}
  >
    {loading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-300 border-t-white" />
        Analizando con IA N3...
      </>
    ) : (
      <>
        <Zap size={15} />
        {label}
      </>
    )}
  </button>
);

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function App() {
  // Panel 1 — RFID
  const [rfidPred,    setRfidPred]    = useState(null);
  const [rfidLoading, setRfidLoading] = useState(false);

  // Panel 2 — Logística
  const [logPred,    setLogPred]    = useState(null);
  const [logLoading, setLogLoading] = useState(false);

  // Panel 3 — Demanda
  const [demandPred,    setDemandPred]    = useState(null);
  const [demandLoading, setDemandLoading] = useState(false);

  // Panel 4 — IA Generativa
  const [aiStrategy,   setAiStrategy]   = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError,      setAiError]      = useState("");

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRfidPredict = () => {
    setRfidLoading(true);
    setRfidPred(null);
    setTimeout(() => { setRfidPred(true); setRfidLoading(false); }, 1800);
  };

  const handleLogPredict = () => {
    setLogLoading(true);
    setLogPred(null);
    setTimeout(() => { setLogPred(true); setLogLoading(false); }, 1600);
  };

  const handleDemandPredict = () => {
    setDemandLoading(true);
    setDemandPred(null);
    setTimeout(() => { setDemandPred(true); setDemandLoading(false); }, 1700);
  };

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    setAiError("");
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
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
          );
          if (!res.ok) throw new Error("API error");
          return await res.json();
        } catch (e) {
          if (retries === 0) throw e;
          await new Promise(r => setTimeout(r, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
      };
      const result = await fetchWithRetry();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setAiStrategy(text);
      else throw new Error("Sin respuesta");
    } catch (e) {
      console.error(e);
      setAiError("No se pudo conectar con el motor de IA. Por favor, intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">

      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <img src="/arquilogic-logo.png" alt="Arquilogic" className="h-12 w-auto object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Arquilogic<span className="text-blue-400">OS</span>
            </h1>
            <p className="text-sm text-slate-400">Intelligent Logistics Platform</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <span className="text-sm font-medium text-slate-300">Powered by</span>
          <img src="/logo-n3labs.jpg" alt="N3 Labs" className="h-7 w-auto object-contain rounded" />
        </div>
      </header>

      {/* ── GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ══════════════════════════════════════════════
            PANEL 1 · AGENTE DE ANOMALÍAS RFID
        ══════════════════════════════════════════════ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="text-red-400" size={20} />
              Agente de Anomalías RFID
            </h2>
            <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full font-medium animate-pulse border border-red-500/20">
              2 Alertas Activas
            </span>
          </div>

          {/* Alertas existentes */}
          <div className="space-y-3">
            {ALERTS_DATA.map(alert => (
              <div key={alert.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 rounded-full p-1.5 shrink-0 ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      <AlertTriangle size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{alert.msg}</p>
                      <div className="flex items-center mt-1.5 text-xs text-slate-400 gap-3">
                        <span className="flex items-center gap-1"><Clock size={11} />{alert.time}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} />Contactando: <strong className="text-slate-300 ml-1">{alert.responsable}</strong></span>
                      </div>
                    </div>
                  </div>
                  <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md transition-colors shrink-0">
                    Ver Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botón predecir */}
          <PredictButton onClick={handleRfidPredict} loading={rfidLoading} />

          {/* Resultado predicción */}
          {rfidPred && (
            <div className="bg-slate-950 border border-red-500/20 rounded-xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical size={14} className="text-red-400" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Predicción N3 IA — Lotes Farmacéuticos</span>
              </div>

              {PHARMA_LOTS.map((lot) => (
                <div key={lot.gtin}
                  className={`p-3 rounded-lg border text-xs space-y-1.5
                    ${lot.color === 'red'    ? 'bg-red-500/10 border-red-500/25'    : ''}
                    ${lot.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/25' : ''}
                    ${lot.color === 'green'  ? 'bg-emerald-500/10 border-emerald-500/25' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{lot.producto}</span>
                    <RiskBadge pct={lot.riesgo} color={lot.color} />
                  </div>
                  <div className="text-slate-400 font-mono">GTIN: {lot.gtin}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
                    <span>Lote: <strong className="text-slate-300">{lot.lote}</strong></span>
                    <span className={`font-semibold ${lot.diasCaducidad <= 24 ? 'text-red-400' : 'text-yellow-400'}`}>
                      ⏰ Caduca en {lot.diasCaducidad} días
                    </span>
                    <span>Stock: <strong className="text-slate-300">{lot.stock} u.</strong></span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
                    <User size={12} className="text-slate-500 shrink-0" />
                    <span className="text-slate-400">Responsable: <strong className="text-slate-300">{lot.responsable}</strong></span>
                    {lot.historial > 0
                      ? <span className="ml-auto text-red-400">⚠ {lot.historial} pérdida{lot.historial > 1 ? 's' : ''} prev.</span>
                      : <span className="ml-auto text-emerald-400">✓ Sin incidencias</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            PANEL 2 · LOGÍSTICA PREDICTIVA
        ══════════════════════════════════════════════ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Truck className="text-blue-400" size={20} />
              Logística Predictiva
            </h2>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-green-400" /> Actualizado en tiempo real
            </span>
          </div>

          {/* Camiones */}
          <div className="space-y-3">
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
                      {trk.currentEta} <span className="text-xs font-normal opacity-70 ml-1">({trk.delay})</span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg">
                  <CloudRain size={13} />
                  Factor Externo: {trk.factor}
                </div>
              </div>
            ))}
          </div>

          {/* Botón predecir */}
          <PredictButton onClick={handleLogPredict} loading={logLoading} />

          {/* Resultado predicción — Mapa + accidentes */}
          {logPred && (
            <div className="space-y-3 animate-fade-in">
              {/* Mapa */}
              <RouteMap />

              {/* Resumen de delay */}
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-xl p-3">
                <div className="bg-red-500/20 p-2 rounded-lg shrink-0">
                  <Activity size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-400">Demora total proyectada: +210 min</p>
                  <p className="text-xs text-slate-400">115% de tiempo adicional sobre ruta base</p>
                </div>
              </div>

              {/* Cards de accidentes */}
              {[
                { km: "Km 142", desc: "Choque múltiple — 3 vehículos", detalle: "2 carriles cerrados. Carril de emergencia habilitado." },
                { km: "Km 189", desc: "Volcadura de tráiler de carga", detalle: "Carril derecho bloqueado. Equipos de limpieza en sitio." },
              ].map((acc, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-start gap-3 text-xs">
                  <span className="text-red-400 text-base leading-none shrink-0">⚠</span>
                  <div>
                    <p className="font-bold text-slate-200">{acc.km} — {acc.desc}</p>
                    <p className="text-slate-400 mt-0.5">{acc.detalle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            PANEL 3 · PRONÓSTICO DE DEMANDA
        ══════════════════════════════════════════════ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={20} />
              Pronóstico de Demanda (30 días)
            </h2>
          </div>

          {/* Gráfica de barras CSS */}
          <div className="h-48 flex items-stretch space-x-2 md:space-x-4">
            {[40, 55, 45, 70, 90, 65, 80].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-slate-800 text-xs px-2 py-1 rounded text-white transition-opacity whitespace-nowrap z-10">
                  Semana {i + 1}: +{height}%
                </div>
                <div
                  className="w-full bg-gradient-to-t from-emerald-600/40 to-emerald-400/80 rounded-t-md transition-all duration-500 hover:opacity-80"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-slate-400 mt-2 shrink-0">S{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center">
            Basado en histórico RFID y tendencias de temporada (Motor Predictivo N3)
          </p>

          {/* Botón predecir */}
          <PredictButton onClick={handleDemandPredict} loading={demandLoading} label="Predecir Demanda por GTIN" />

          {/* Resultado — breakdown por GTIN */}
          {demandPred && (
            <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Análisis por GTIN — Próximas 7 semanas</span>
              </div>

              {DEMAND_GTINS.map((item) => (
                <div key={item.gtin} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.producto}</span>
                    <span className={`font-bold flex items-center gap-1 ${item.tendencia.includes('baja') ? 'text-red-400' : 'text-emerald-400'}`}>
                      {item.tendencia.includes('baja')
                        ? <TrendingDown size={13} />
                        : <TrendingUp size={13} />}
                      {item.pct}
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono">GTIN: {item.gtin}</div>
                  <div className="text-slate-400">Categoría: <span className="text-slate-300">{item.categoria}</span></div>
                  {/* Mini barras */}
                  <div className="h-8 flex items-end gap-0.5 mt-1">
                    {item.bars.map((h, idx) => (
                      <div key={idx}
                        className={`flex-1 rounded-sm ${item.tendencia.includes('baja') ? 'bg-red-500/60' : 'bg-emerald-500/60'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            PANEL 4 · ESTRATEGIA DE VENTAS (IA GENERATIVA)
        ══════════════════════════════════════════════ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
          {/* Glow decorativo */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={20} />
              Estrategia de Ventas Inteligente
            </h2>
          </div>

          <p className="text-sm text-slate-400 relative z-10">
            Identificamos stock estancado. Usa IA para generar una estrategia de liquidación.
          </p>

          {/* Tabla de inventario */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 relative z-10">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Inventario Estancado Detectado:</h3>
            {INVENTORY_DATA.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0 text-sm">
                <div className="flex items-center gap-2">
                  <Package size={13} className="text-slate-400" />
                  <span className="text-slate-200">{item.producto}</span>
                </div>
                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 text-xs">{item.stock} u.</span>
              </div>
            ))}
          </div>

          {/* Botón IA generativa */}
          <button
            onClick={handleGenerateStrategy}
            disabled={isGenerating}
            className={`relative z-10 w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg
              ${isGenerating
                ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'}`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-200 border-t-white" />
                Generando Estrategia N3...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Predecir con IA
              </>
            )}
          </button>

          {aiError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl relative z-10">
              {aiError}
            </div>
          )}

          {aiStrategy && !aiError && (
            <div className="p-4 bg-slate-800/80 border border-indigo-500/30 rounded-xl relative z-10 overflow-y-auto max-h-52 custom-scrollbar">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-indigo-500 p-1 rounded-md">
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

      </div>{/* /grid */}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30,41,59,0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.8); }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.35s ease-out both; }
      `}} />
    </div>
  );
}
