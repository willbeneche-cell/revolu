'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, BarChart2, CreditCard, Plus, ArrowRightLeft, Building2, 
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Home, TrendingUp, 
  Bitcoin, Hexagon, User, Check, Send, Store, Plane, Coffee, ShieldAlert,
  Globe, Percent, Lightbulb, PieChart, Landmark, Layers, FileText, Lock, PlusCircle
} from 'lucide-react';

// --- GENERATEUR IBAN ---
const generateIBAN = () => {
  const rand = (len) => Math.floor(Math.random() * Math.pow(10, len)).toString().padStart(len, '0');
  return `FR76 ${rand(4)} ${rand(4)} ${rand(4)} ${rand(4)} ${rand(4)} ${rand(3)}`;
};

export default function RevoluApp() {
  // --- ETATS GLOBAUX ---
  const [activeTab, setActiveTab] = useState('accueil');
  const [balance, setBalance] = useState(10.00);
  const [iban, setIban] = useState('');
  const [transactions, setTransactions] = useState([
    { id: 1, title: "Argent ajouté via ••9615", date: "Aujourd'hui, 19:23", user: "Maman", amount: 10.00, type: "in", icon: "card" },
    { id: 2, title: "Frais de livraison de la carte", date: "Aujourd'hui, 18:10", user: "Revolu", amount: -7.99, type: "out", icon: "fee" }
  ]);
  const [cryptoPrices, setCryptoPrices] = useState({ bitcoin: { eur: 0 }, ethereum: { eur: 0 } });
  
  // --- ETATS PAGE INVESTIR (INTERACTIFS) ---
  const [popularTab, setPopularTab] = useState('actions'); // 'actions' ou 'etf'
  const [volatilesTab, setVolatilesTab] = useState('hausses'); // 'hausses' ou 'baisses'
  const [tradingModalStock, setTradingModalStock] = useState(null); // Stock sélectionné pour achat
  const [tradeAmount, setTradeAmount] = useState('');

  // --- ETATS POUR APPUI LONG ---
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionAmount, setActionAmount] = useState('');
  const [actionType, setActionType] = useState('add');
  const [selectedIcon, setSelectedIcon] = useState('Store');
  const pressTimer = useRef(null);

  // --- ETATS POUR VIREMENT ---
  const [transferUser, setTransferUser] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Initialisation
  useEffect(() => {
    setIban(generateIBAN());
    fetchCryptoPrices();
  }, []);

  const fetchCryptoPrices = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur');
      const data = await res.json();
      setCryptoPrices(data);
    } catch {
      setCryptoPrices({ bitcoin: { eur: 63421.50 }, ethereum: { eur: 3412.20 } });
    }
  };

  const revPoints = useMemo(() => {
    const totalSpent = transactions
      .filter(t => t.type === 'out')
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    return Math.floor(totalSpent / 10);
  }, [transactions]);

  // --- LOGIQUE APPUI LONG (3 SECONDES) ---
  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      setShowActionModal(true);
    }, 3000);
  };
  const handlePressEnd = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };

  const handleSecretTransaction = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(actionAmount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) return;

    setBalance(prev => actionType === 'add' ? prev + amountNum : prev - amountNum);
    setTransactions([{
      id: Date.now(),
      title: actionType === 'add' ? "Dépôt manuel" : "Retrait manuel",
      date: "A l'instant",
      user: "Moi",
      amount: actionType === 'add' ? amountNum : -amountNum,
      type: actionType === 'add' ? "in" : "out",
      icon: selectedIcon
    }, ...transactions]);
    setShowActionModal(false);
    setActionAmount('');
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > balance) return;

    setBalance(prev => prev - amountNum);
    setTransactions([{
      id: Date.now(),
      title: `Virement à ${transferUser}`,
      date: "A l'instant",
      user: transferUser,
      amount: -amountNum,
      type: "out",
      icon: "User"
    }, ...transactions]);
    setTransferUser('');
    setTransferAmount('');
    setActiveTab('accueil');
  };

  // --- SIMULATION ACHAT ACTION ---
  const handleStockOrder = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(tradeAmount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > balance) {
      alert("Montant non valide ou solde insuffisant");
      return;
    }
    setBalance(prev => prev - amountNum);
    setTransactions([{
      id: Date.now(),
      title: `Achat ${tradingModalStock.ticker}`,
      date: "A l'instant",
      user: "Revolu Courtage",
      amount: -amountNum,
      type: "out",
      icon: "Store"
    }, ...transactions]);
    setTradingModalStock(null);
    setTradeAmount('');
  };

  const getIconComponent = (iconName, className) => {
    switch (iconName) {
      case 'card': return <CreditCard className={className} />;
      case 'fee': return <ShieldAlert className={className} />;
      case 'Store': return <Store className={className} />;
      case 'Plane': return <Plane className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      case 'User': return <User className={className} />;
      default: return <MoreHorizontal className={className} />;
    }
  };

  // ==================== PAGE : ACCUEIL ====================
// ==================== PAGE : ACCUEIL ====================
  const renderAccueil = () => (
    <div className="flex flex-col gap-3 pb-28 text-white px-4 pt-4">
      {/* HEADER & BALANCE */}
      <div className="flex flex-col items-center pt-2">
        <span className="text-gray-300 text-sm font-medium mb-1">Personnel • EUR</span>
        
        {/* LA ZONE INTERACTIVE (3 secondes) */}
        <div 
          className="flex items-start justify-center cursor-pointer select-none touch-none"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          <span className="text-6xl font-extrabold tracking-tight text-white">{balance.toFixed(2).split('.')[0]}</span>
          <span className="text-3xl font-bold text-white mt-2 ml-1">,{balance.toFixed(2).split('.')[1]} €</span>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-white/60 bg-transparent px-4 py-1 rounded-full text-xs font-medium">
          <Building2 size={14} />
          <span>{iban}</span>
        </div>
      </div>

      {/* BOUTON COMPTES ET PORTEFEUILLES */}
      <div className="flex justify-center mt-2 mb-1">
        <button className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm active:scale-95">
          Comptes et Portefeuilles
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex justify-center gap-5 mt-2 mb-2">
        {[
          { icon: <Plus size={22} />, label: "Ajouter de\nl'argent", action: () => alert("Simulation : Ajouter de l'argent") },
          { icon: <ArrowRightLeft size={22} />, label: "Entre mes\ncomptes", action: () => setActiveTab('virements') },
          { icon: <Building2 size={22} />, label: "Informations", action: () => alert("Simulation : Informations du compte") },
          { icon: <MoreHorizontal size={22} />, label: "Plus", action: () => alert("Simulation : Menu Plus") }
        ].map((btn, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2" onClick={btn.action}>
            <button className="h-[60px] w-[60px] rounded-full bg-[#2a2438]/80 text-blue-400 flex items-center justify-center backdrop-blur-md border border-white/5 active:scale-95 transition-transform shadow-lg">
              {btn.icon}
            </button>
            <span className="text-white text-[11px] text-center font-bold leading-tight whitespace-pre-wrap">{btn.label}</span>
          </div>
        ))}
      </div>

      {/* SETUP CARD */}
      <div className="bg-[#2a2438]/90 rounded-3xl p-4 backdrop-blur-xl border border-white/5 shadow-lg mt-2 cursor-pointer active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
              <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="125" strokeDashoffset="25" />
            </svg>
            <span className="text-white text-xs font-bold">4/5</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-[15px] leading-tight">Configurez votre compte</h3>
            <p className="text-gray-400 text-[12px] mt-1 leading-snug">Plus que quelques étapes pour bénéficier du meilleur de Revolut.</p>
          </div>
        </div>
        <button className="w-full mt-4 bg-white text-slate-900 font-bold py-3 rounded-2xl text-sm hover:bg-gray-200 transition-colors">
          Terminer la configuration
        </button>
      </div>

      {/* TRANSACTIONS HISTORY */}
      <div className="bg-[#2a2438]/90 rounded-3xl backdrop-blur-xl border border-white/5 overflow-hidden shadow-lg mt-1">
        {transactions.slice(0, 3).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 active:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white shrink-0 ${tx.type === 'in' ? 'bg-gradient-to-br from-red-800 to-red-950' : 'bg-[#4ae85d] text-slate-900'}`}>
                {getIconComponent(tx.icon, "w-6 h-6")}
              </div>
              <div>
                <h4 className="text-white font-bold text-[15px]">{tx.title}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{tx.date}</p>
                {tx.user !== "Moi" && <p className="text-gray-400 text-xs">{tx.user}</p>}
              </div>
            </div>
            <span className={`font-medium text-[15px] whitespace-nowrap ${tx.type === 'in' ? 'text-[#4ae85d]' : 'text-white'}`}>
              {tx.type === 'in' ? '+' : ''}{tx.amount.toFixed(2).replace('.', ',')} €
            </span>
          </div>
        ))}
        <button className="w-full py-4 text-white text-[13px] font-bold hover:bg-white/5 transition-colors">
          Tout afficher
        </button>
      </div>

      {/* EN SAVOIR PLUS */}
      <div className="bg-[#2a2438]/90 rounded-3xl p-4 backdrop-blur-xl border border-white/5 shadow-lg mt-1">
        <h3 className="font-bold text-sm text-gray-300 mb-4 flex items-center gap-1 cursor-pointer">En savoir plus <ArrowUpRight size={14} className="rotate-45" /></h3>
        <div className="flex flex-col gap-5">
          {/* Item 1 */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <Landmark size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[15px] text-white">Épargne et fonds</h4>
              <p className="text-gray-400 text-xs leading-tight mt-0.5">Gagnez Jusqu'à 2,50 % d'brut grâce à l'épargne ou investissez dans des fonds à faible risque.</p>
            </div>
            <button className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shrink-0">Ouvrir</button>
          </div>
          {/* Item 2 */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[15px] text-white">Compte de courtage</h4>
              <p className="text-gray-400 text-xs leading-tight mt-0.5">Investissez en toute simplicité. Risque de perte en capital.</p>
            </div>
            <button onClick={() => setActiveTab('investir')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shrink-0">Ouvrir</button>
          </div>
          {/* Item 3 */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <Globe size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[15px] text-white">Virement international</h4>
              <p className="text-gray-400 text-xs leading-tight mt-0.5">Rapide, sécurisé et peu coûteux.</p>
            </div>
            <button onClick={() => setActiveTab('virements')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shrink-0">Envoyer</button>
          </div>
        </div>
      </div>

      {/* CARTES */}
      <div className="mt-2">
        <h3 className="font-bold text-sm text-gray-300 mb-3 px-1 flex items-center gap-1 cursor-pointer">Cartes <ArrowUpRight size={14} className="rotate-45" /></h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <div className="min-w-[110px] flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform">
            <div className="h-[70px] bg-gradient-to-b from-gray-400 to-gray-700 rounded-lg p-2 relative shadow-md">
              <span className="absolute bottom-2 right-2 text-[8px] font-black italic text-white opacity-80">VISA</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-[13px] text-white">Éphémère</p>
              <p className="text-[11px] text-gray-400">Générer</p>
            </div>
          </div>
          
          <div className="min-w-[110px] flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform">
            <div className="h-[70px] bg-gradient-to-br from-pink-500 to-purple-800 rounded-lg p-2 relative shadow-md">
              <span className="absolute top-2 right-2 text-xs font-bold text-white">R</span>
              <span className="absolute bottom-2 right-2 text-[8px] font-black italic text-white">VISA</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-[13px] text-white">Originale</p>
              <p className="text-[11px] text-gray-400">••6394</p>
            </div>
          </div>

          <div className="min-w-[110px] flex flex-col gap-2 cursor-pointer active:scale-95 transition-transform">
            <div className="h-[70px] bg-white/10 border border-white/10 rounded-lg flex items-center justify-center shadow-md">
              <Plus size={24} className="text-white/70" />
            </div>
            <div className="text-center">
              <p className="font-bold text-[13px] text-white mt-1">Obtenir une...</p>
            </div>
          </div>
        </div>
      </div>

      {/* PATRIMOINE TOTAL */}
      <div className="bg-[#2a2438]/90 rounded-3xl p-4 backdrop-blur-xl border border-white/5 shadow-lg mt-1">
        <h3 className="font-bold text-sm text-gray-300 mb-1 flex items-center gap-1 cursor-pointer">Patrimoine total <ArrowUpRight size={14} className="rotate-45" /></h3>
        <p className="text-2xl font-bold text-white mb-5">{balance.toFixed(2).replace('.', ',')} €</p>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between cursor-pointer active:opacity-70">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center"><Layers size={20} className="text-white"/></div>
              <span className="font-bold text-[15px] text-white">Espèces</span>
            </div>
            <span className="text-[15px] text-white">{balance.toFixed(2).replace('.', ',')} €</span>
          </div>

          <div className="flex items-center justify-between cursor-pointer active:opacity-70">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#ff6b2b] rounded-full flex items-center justify-center"><Landmark size={18} className="text-white"/></div>
              <div>
                <h4 className="font-bold text-[15px] text-white">Épargne et fonds</h4>
                <p className="text-gray-400 text-xs">Gagnez du rendement sur votre...</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-gray-500 rotate-45" />
          </div>

          <div className="flex items-center justify-between cursor-pointer active:opacity-70">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#c4e514] rounded-full flex items-center justify-center"><Percent size={20} className="text-[#2a2438]"/></div>
              <div>
                <h4 className="font-bold text-[15px] text-white">Prêt</h4>
                <p className="text-gray-400 text-xs">Obtenez un prêt allant jusqu'à 5...</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-gray-500 rotate-45" />
          </div>

          <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setActiveTab('investir')}>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#3b82f6] rounded-full flex items-center justify-center"><TrendingUp size={20} className="text-white"/></div>
              <div>
                <h4 className="font-bold text-[15px] text-white">Investir</h4>
                <p className="text-gray-400 text-xs">Investir dès 1 € seulement</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-gray-500 rotate-45" />
          </div>

          <div className="flex items-center justify-between cursor-pointer active:opacity-70" onClick={() => setActiveTab('cryptos')}>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#a855f7] rounded-full flex items-center justify-center"><Bitcoin size={24} className="text-white"/></div>
              <div>
                <h4 className="font-bold text-[15px] text-white">Cryptos</h4>
                <p className="text-gray-400 text-xs">Investir dès 1 € seulement</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-gray-500 rotate-45" />
          </div>

          <div className="flex items-center justify-between cursor-pointer active:opacity-70">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#0ea5e9] rounded-full flex items-center justify-center"><Building2 size={18} className="text-white"/></div>
              <div>
                <h4 className="font-bold text-[15px] text-white">Lié(s)</h4>
                <p className="text-gray-400 text-xs">Liez des comptes externes.</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-gray-500 rotate-45" />
          </div>
        </div>
      </div>

      {/* DEPENSES DU MOIS */}
      <div className="bg-[#2a2438]/90 rounded-3xl p-5 backdrop-blur-xl border border-white/5 shadow-lg mt-1 cursor-pointer">
        <h3 className="font-bold text-sm text-gray-300 mb-1">Dépenses du mois</h3>
        <div className="flex items-end gap-2 mb-4">
          <p className="text-xl font-bold text-white">7,99 €</p>
          <p className="text-[#ff4747] text-xs font-bold mb-1 flex items-center">▲ 7,99 €</p>
        </div>
        
        {/* Simulation Chart */}
        <div className="relative h-[80px] w-full mt-2">
          <svg viewBox="0 0 100 40" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Ligne pointillée repère 7€ */}
            <line x1="0" y1="10" x2="100" y2="10" stroke="#fcd34d" strokeWidth="0.5" strokeDasharray="1,1" opacity="0.8"/>
            <text x="98" y="8" fill="#9ca3af" fontSize="4" textAnchor="end">7 €</text>
            
            {/* Remplissage sous la courbe */}
            <path d="M 0 35 L 15 35 L 20 10 L 100 10 L 100 40 L 0 40 Z" fill="url(#gradRed)" opacity="0.3"/>
            
            {/* Courbe rouge */}
            <path d="M 0 35 L 15 35 L 20 10 L 100 10" fill="none" stroke="#ff4747" strokeWidth="1.5" strokeLinejoin="round" />
            
            <defs>
              <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4747" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff4747" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          {/* Axe X (Jours) */}
          <div className="absolute -bottom-4 left-0 w-full flex justify-between text-[8px] text-gray-500 font-medium px-1">
            <span>1</span><span>6</span><span>11</span><span>16</span><span>21</span><span>26</span><span>31</span>
          </div>
        </div>
      </div>

      {/* LISTE DE SURVEILLANCE */}
      <div className="bg-[#2a2438]/90 rounded-3xl p-4 backdrop-blur-xl border border-white/5 shadow-lg mt-1">
        <h3 className="font-bold text-sm text-gray-300 mb-4 flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('investir')}>
          Liste de surveillance <ArrowUpRight size={14} className="rotate-45" />
        </h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setActiveTab('investir')}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-950 text-green-400 flex items-center justify-center font-bold text-xs">NVDA</div>
              <div>
                <h4 className="font-bold text-[15px] text-white">NVIDIA</h4>
                <p className="text-gray-400 text-xs">NVDA</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[15px] text-white">196,24 $</p>
              <p className="text-[#4ae85d] text-xs font-medium">▲ 0,72 %</p>
            </div>
          </div>

          <div className="flex items-center justify-between cursor-pointer" onClick={() => setActiveTab('investir')}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#ff4747] text-white flex items-center justify-center font-black text-lg">V</div>
              <div>
                <h4 className="font-bold text-[15px] text-white max-w-[140px] leading-tight">Vanguard S&P 500 Acc UCITS ETF</h4>
                <p className="text-gray-400 text-xs mt-0.5">VUAA</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[15px] text-white">127,34 €</p>
              <p className="text-[#4ae85d] text-xs font-medium">▲ 0,53 %</p>
            </div>
          </div>
        </div>

        <button onClick={() => setActiveTab('investir')} className="w-full mt-4 py-2 text-white text-[13px] font-bold hover:bg-white/5 rounded-xl transition-colors">
          Tout afficher
        </button>
      </div>

      {/* AJOUTER DES WIDGETS */}
      <div className="flex justify-center mt-3 mb-4">
         <button className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-2xl text-[13px] font-bold text-white flex items-center gap-2 active:scale-95 shadow-lg">
           <Plus size={16} /> Ajouter des widgets
         </button>
      </div>
    </div>
  );


  
  // ==================== PAGE EXTRAORDINAIRE : INVESTIR ====================
  const renderInvestir = () => {
    const popularStocks = [
      { ticker: 'NVDA', name: 'NVIDIA', trend: '+0,89 %', up: true, bg: 'bg-green-950 text-green-400' },
      { ticker: 'SPCX', name: 'SPACEX', trend: '-3,72 %', up: false, bg: 'bg-stone-900 text-white font-mono text-[9px]' },
      { ticker: 'AAPL', name: 'Apple', trend: '+1,52 %', up: true, bg: 'bg-white text-black' },
      { ticker: 'TTWO', name: 'Take-Two', trend: '+0,97 %', up: true, bg: 'bg-blue-600 text-white font-black' },
      { ticker: 'NFLX', name: 'Netflix', trend: '-2,18 %', up: false, bg: 'bg-black text-red-600 font-extrabold text-lg' },
      { ticker: 'AMZN', name: 'Amazon', trend: '+1,21 %', up: true, bg: 'bg-neutral-900 text-amber-500 font-bold' }
    ];

    const volatileAssets = volatilesTab === 'hausses' ? [
      { ticker: 'SEER', trend: '+38,27 %', up: true },
      { ticker: 'CRTO', trend: '+22,90 %', up: true },
      { ticker: 'PEW', trend: '+23,83 %', up: true },
      { ticker: 'YDES', trend: '+23,68 %', up: true },
      { ticker: 'WRAP', trend: '+19,86 %', up: true },
      { ticker: 'OFIX', trend: '+16,70 %', up: true }
    ] : [
      { ticker: 'SEER', trend: '-14,50 %', up: false },
      { ticker: 'CRTO', trend: '-11,20 %', up: false },
      { ticker: 'PEW', trend: '-9,85 %', up: false },
      { ticker: 'YDES', trend: '-8,40 %', up: false },
      { ticker: 'WRAP', trend: '-7,90 %', up: false },
      { ticker: 'OFIX', trend: '-6,12 %', up: false }
    ];

    return (
      <div className="flex flex-col gap-6 pb-28 text-white">
        {/* HERO HEADER - image_faafc7.jpg */}
        <div className="flex flex-col items-center text-center px-6 pt-6">
          <h1 className="text-4xl font-bold tracking-tight max-w-xs leading-tight">Développez votre patrimoine</h1>
          <p className="text-gray-400 text-sm mt-3">Investissez dès aujourd'hui, dès 1 €</p>
          <button className="w-full mt-6 bg-white/10 hover:bg-white/15 border border-white/5 py-3.5 rounded-full font-semibold text-sm transition-all active:scale-98">
            Investir
          </button>
        </div>

        {/* COMPONENTE AVANTAGES - image_faafc7.jpg & image_faafca.jpg */}
        <div className="mx-4 bg-slate-900/60 rounded-3xl p-5 border border-white/5 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 shrink-0"><Store size={18}/></div>
            <div>
              <h4 className="font-bold text-sm">Investissez dans les marques que vous aimez</h4>
              <p className="text-gray-400 text-xs mt-1">Choisissez parmi plus de 4 000 actions.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 shrink-0"><Percent size={18}/></div>
            <div>
              <h4 className="font-bold text-sm">Économisez sur les frais de trading</h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">0 % de commission de trading, c'est-à-dire aucuns frais d'exécution d'ordres dans les limites de votre abonnement. <span className="text-blue-400 cursor-pointer">Autres frais</span> tels que des frais de chan...</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 shrink-0"><Lightbulb size={18}/></div>
            <div>
              <h4 className="font-bold text-sm">Investir devient un jeu d'enfant</h4>
              <p className="text-gray-400 text-xs mt-1">Depuis nos cours jusqu'à nos stratégies automatisées, vous pouvez investir à votre rythme avec Revolut.</p>
            </div>
          </div>
        </div>

        {/* LES PREMIERS ACHATS - image_faafca.jpg */}
        <div className="mx-4 bg-slate-900/60 rounded-3xl p-4 border border-white/5">
          <div className="flex justify-between items-center mb-4 cursor-pointer">
            <h3 className="font-bold text-sm text-gray-300">Les premiers achats les plus populaires &gt;</h3>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl mb-6">
            <button onClick={() => setPopularTab('actions')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${popularTab === 'actions' ? 'bg-white/15 text-white' : 'text-gray-400'}`}>Actions</button>
            <button onClick={() => setPopularTab('etf')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${popularTab === 'etf' ? 'bg-white/15 text-white' : 'text-gray-400'}`}>ETF</button>
          </div>

          <div className="grid grid-cols-3 gap-y-6 gap-x-2 text-center">
            {popularStocks.map((stock) => (
              <div 
                key={stock.ticker} 
                onClick={() => setTradingModalStock(stock)}
                className="flex flex-col items-center cursor-pointer active:scale-95 transition-all"
              >
                <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-inner font-black text-sm overflow-hidden ${stock.bg}`}>
                  {stock.ticker === 'AAPL' ? '' : stock.ticker === 'SPCX' ? 'SPACEX' : stock.ticker}
                </div>
                <span className="text-xs font-bold mt-2 text-gray-200">{stock.ticker}</span>
                <span className={`text-[10px] mt-0.5 flex items-center gap-0.5 ${stock.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stock.up ? '▲' : '▼'} {stock.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LISTE DE SURVEILLANCE - image_faafca.jpg */}
        <div className="mx-4 bg-slate-900/60 rounded-3xl p-4 border border-white/5">
          <h3 className="font-bold text-sm text-gray-300 mb-4 cursor-pointer">Liste de surveillance &gt;</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-950 text-green-400 flex items-center justify-center font-bold text-xs">NVDA</div>
                <div>
                  <h4 className="font-bold text-sm">NVIDIA</h4>
                  <p className="text-gray-400 text-xs">NVDA • Développeur de GPU</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">196,55 $</p>
                <p className="text-emerald-400 text-xs">▲ 0,88 %</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm">V</div>
                <div>
                  <h4 className="font-bold text-sm max-w-[180px] truncate">Vanguard S&P 500 Acc UCITS ETF</h4>
                  <p className="text-gray-400 text-xs">VUAA <span className="bg-white/10 px-1 py-0.5 rounded text-[9px]">€</span> Actions de plus grandes...</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">127,34 €</p>
                <p className="text-emerald-400 text-xs">▲ 0,53 %</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUITS - image_faafe6.jpg */}
        <div className="mx-4 bg-slate-900/60 rounded-3xl p-4 border border-white/5">
          <h3 className="font-bold text-sm text-gray-300 mb-4">Produits &gt;</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: <TrendingUp size={20}/>, label: "Actions" },
              { icon: <PieChart size={20}/>, label: "ETF" },
              { icon: <Landmark size={20}/>, label: "Obligations" },
              { icon: <Layers size={20}/>, label: "Robo-Advisor" },
              { icon: <FileText size={20}/>, label: "CFD" }
            ].map((prod, idx) => (
              <div key={idx} className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer active:bg-white/10 transition-all">
                <div className="text-gray-300">{prod.icon}</div>
                <span className="text-[11px] font-bold text-gray-200">{prod.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIFS LES PLUS VOLATILS - image_faafe6.jpg */}
        <div className="mx-4 bg-slate-900/60 rounded-3xl p-4 border border-white/5">
          <h3 className="font-bold text-sm text-gray-300 mb-4">Actifs les plus volatils aujourd'hui &gt;</h3>
          <div className="flex bg-white/5 p-1 rounded-xl mb-4">
            <button onClick={() => setVolatilesTab('hausses')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${volatilesTab === 'hausses' ? 'bg-white/15 text-white' : 'text-gray-400'}`}>Hausses</button>
            <button onClick={() => setVolatilesTab('baisses')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${volatilesTab === 'baisses' ? 'bg-white/15 text-white' : 'text-gray-400'}`}>Baisses</button>
          </div>
          <div className="grid grid-cols-3 gap-y-5 gap-x-2 text-center">
            {volatileAssets.map((asset, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-800 to-slate-900 flex items-center justify-center font-bold text-[10px] text-cyan-200 border border-white/5 shadow-md">
                  {asset.ticker}
                </div>
                <span className="text-xs font-bold mt-1.5 text-gray-300">{asset.ticker}</span>
                <span className={`text-[10px] mt-0.5 ${asset.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {asset.up ? '▲' : '▼'} {asset.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LES PLUS ECHANGEES - image_faafea.jpg */}
        <div className="mx-4 bg-slate-900/60 rounded-3xl p-4 border border-white/5 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-gray-300">Les plus échangées &gt;</h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-600/20 text-amber-500 flex items-center justify-center font-black">▰</div>
              <div>
                <h4 className="font-bold text-sm">XAU:CFD</h4>
                <p className="text-gray-400 text-xs">51 % Achats · 49 % Ventes / Ventes</p>
              </div>
            </div>
            <p className="font-bold text-sm">4 163,45 $</p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">100</div>
              <div>
                <h4 className="font-bold text-sm">NDQ100:CFD</h4>
                <p className="text-gray-400 text-xs">52 % Achats · 48 % Ventes / Ventes</p>
              </div>
            </div>
            <p className="font-bold text-sm">29 748,70 $</p>
          </div>
          <button className="w-full text-center py-2 text-sm font-bold text-gray-300 hover:bg-white/5 rounded-xl transition-all">Tout afficher</button>
        </div>

        {/* ACTUALITES - image_faafea.jpg */}
        <div className="mx-4 bg-slate-900/60 rounded-3xl p-4 border border-white/5 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-gray-300">Actualités &gt;</h3>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-medium">SHD <span className="text-emerald-400">▲ 0,60 %</span> · MFZ <span className="text-emerald-400">▲ 2,13 %</span></p>
              <h4 className="font-bold text-xs mt-1 leading-snug">StreetAccount Summary - Private company transactions for the week ended 04-Jul</h4>
              <p className="text-[10px] text-gray-500 mt-2">aujourd'hui, 16:15 · StreetAccount</p>
            </div>
            <div className="w-20 h-16 bg-slate-800 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-emerald-900 to-slate-900 border border-white/5"></div>
          </div>
          <div className="flex items-start justify-between gap-3 border-t border-white/5 pt-4">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-medium">NVDA <span className="text-emerald-400">▲ 0,88 %</span></p>
              <h4 className="font-bold text-xs mt-1 leading-snug">NVIDIA partnering with AI clouds to deploy large-scale, multi-tenant AI factories, ali...</h4>
              <p className="text-[10px] text-gray-500 mt-2">2 juillet, 08:42 · StreetAccount</p>
            </div>
            <div className="w-20 h-16 bg-slate-800 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-blue-900 to-slate-900 border border-white/5"></div>
          </div>
          <button className="w-full text-center py-2 text-sm font-bold text-gray-300 hover:bg-white/5 rounded-xl transition-all">Tout afficher</button>
        </div>

        {/* OPERATIONS SUR TITRES - image_fab008.jpg */}
        <div className="mx-4 bg-slate-900/60 rounded-3xl p-4 border border-white/5 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-gray-300">Opérations sur titres &gt;</h3>
          <div className="flex items-center gap-4">
            <div className="text-center w-12 shrink-0">
              <p className="text-xl font-bold">26</p>
              <p className="text-[10px] text-gray-400 uppercase">août</p>
            </div>
            <div className="flex-1 bg-slate-800/80 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
              <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center text-[10px] text-green-400 font-bold">NVDA</div>
              <div>
                <h4 className="font-bold text-xs">NVIDIA</h4>
                <p className="text-[11px] text-gray-400">Annonce de résultats</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center w-12 shrink-0">
              <p className="text-xl font-bold">7</p>
              <p className="text-[10px] text-gray-400 uppercase">sept.</p>
            </div>
            <div className="flex-1 bg-slate-800/80 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
              <div className="h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center text-slate-950"><Lock size={14}/></div>
              <div>
                <h4 className="font-bold text-xs">Marché clôturé</h4>
                <p className="text-[11px] text-gray-400">Jour férié</p>
              </div>
            </div>
          </div>
          <button className="w-full text-center py-2 text-sm font-bold text-gray-300 hover:bg-white/5 rounded-xl transition-all">Tout afficher</button>
        </div>

        {/* BOUTON WIDGET & DISCLAIMER LEGALS - image_fab008.jpg */}
        <div className="flex flex-col items-center px-6 mt-2 gap-6">
          <button className="bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5 transition-all">
            <PlusCircle size={14}/> Ajouter des widgets
          </button>
          
          <p className="text-[10px] text-gray-500 text-justify font-medium leading-relaxed mb-8">
            Les services de matières premières sont fournis par Revolut Ltd et ne sont pas réglementés par la Financial Conduct Authority, ou couverts par le Financial Ombudsman Service ou protégés par le Financial Services Compensation Scheme. Afficher les <span className="text-gray-400 underline cursor-pointer">Divulgations des risques sur les matières premières</span>.<br/><br/>
            Les performances passées ne sont pas un indicateur fiable des résultats futurs. Votre retour peut augmenter ou diminuer selon la fluctuation des devises.<br/><br/>
            Les services d'investissement sont fournis par Revolut valeurs mobilières Europe UAB (305799582), qui est autorisé et réglementé par la Banque de Lituanie.<br/><br/>
            <span className="font-bold text-gray-300">Votre capital est à risque</span>. Afficher les <span className="text-gray-400 underline cursor-pointer">divulgations de trading</span>.
          </p>
        </div>
      </div>
    );
  };

  // ==================== PAGES COMPLEMENTAIRES ====================
const renderVirements = () => (
    <div className="flex flex-col h-full text-white">
      {/* HEADER SECTION */}
      <div className="flex flex-col items-center justify-center pt-10 pb-8 px-6 bg-gradient-to-b from-[#5b21b6] to-transparent">
        <h1 className="text-2xl font-bold">Envoyez de l'argent</h1>
        <h1 className="text-2xl font-bold">rapidement</h1>
        <p className="text-gray-300 text-sm text-center mt-3 px-4">
          Dépensez dans plus de 70 devises et plus de 160 pays.
        </p>
      </div>

      {/* BOUTON PRINCIPAL */}
      <div className="px-4 mb-8">
        <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md py-4 rounded-2xl font-bold text-[15px] border border-white/5 transition-all active:scale-98">
          Initier un paiement
        </button>
      </div>

      {/* SECTION CONTACTS */}
      <div className="px-4">
        <h3 className="font-bold text-lg mb-4">1 contact sur Revolut</h3>
        <div className="bg-[#2a2438]/90 p-4 rounded-2xl flex items-center gap-4 border border-white/5 shadow-lg cursor-pointer active:bg-white/5">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg text-white relative">
            S
            <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 bg-white rounded-full flex items-center justify-center text-[10px] text-slate-900 border border-slate-900">R</div>
          </div>
          <div>
            <h4 className="font-bold text-[15px]">Susu</h4>
            <p className="text-gray-400 text-[13px]">+33634417753</p>
          </div>
        </div>
      </div>
    </div>
  );
  const renderCryptos = () => (
    <div className="px-4 pt-8 pb-24 text-white">
      <h2 className="text-2xl font-bold mb-6">Cryptomonnaies</h2>
      <div className="flex flex-col gap-4">
        <div className="bg-slate-800/80 rounded-3xl p-4 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#F7931A] rounded-full flex items-center justify-center text-white"><Bitcoin size={24} /></div>
            <div>
              <h4 className="font-bold">Bitcoin</h4>
              <p className="text-gray-400 text-xs">BTC</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{cryptoPrices.bitcoin?.eur ? cryptoPrices.bitcoin.eur.toLocaleString('fr-FR') : '63 421'} €</p>
            <p className="text-emerald-400 text-xs flex items-center justify-end gap-1"><ArrowUpRight size={12}/> +2.4%</p>
          </div>
        </div>
      </div>
    </div>
  );

const renderRevPoints = () => {
    // Liste des marques pour le mapping avec leurs styles respectifs
    const brands = [
      { name: 'Uber', bg: 'bg-black', text: 'text-white', logo: 'Uber' },
      { name: 'Apple Store Online', bg: 'bg-white', text: 'text-black', logo: '', textClass: 'text-2xl mb-1' },
      { name: 'SHEIN', bg: 'bg-white', text: 'text-black', logo: 'SHEIN' },
      { name: 'AliExpress', bg: 'bg-[#ff4747]', text: 'text-white', logo: 'AliExpress', textClass: 'text-[10px]' },
      { name: 'Lounge by Zalando', bg: 'bg-gradient-to-br from-orange-500 to-purple-600', text: 'text-white', logo: '▶' },
      { name: 'Trip.com', bg: 'bg-[#0f294d]', text: 'text-white', logo: 'Trip.' },
      { name: 'Nike', bg: 'bg-black', text: 'text-white', logo: '✔' },
      { name: 'Trainline', bg: 'bg-[#20d885]', text: 'text-white', logo: '♡' },
      { name: 'eBay', bg: 'bg-white', text: 'text-black', logo: 'eBay', textClass: 'text-[14px]' },
      { name: 'JD Sports', bg: 'bg-black', text: 'text-white', logo: 'JD', textClass: 'text-xl' },
      { name: 'Steam', bg: 'bg-black', text: 'text-white', logo: 'Steam', textClass: 'text-[12px]' },
      { name: 'Tout afficher', bg: 'bg-[#4b435e]', text: 'text-white', logo: '99+', textClass: 'text-lg' }
    ];

    // Simulation de l'interactivité
    const handleFeatureClick = (featureName) => {
      alert(`Action simulée : Navigation vers ${featureName}`);
    };

    return (
      <div className="flex flex-col gap-4 pb-28 text-white px-4 pt-4">
        
        {/* SECTION PRODUITS */}
        <div className="bg-[#2a2438]/90 rounded-[24px] p-5 backdrop-blur-xl border border-white/5 shadow-lg">
          <h3 className="font-bold text-[15px] mb-5 text-gray-200">Produits</h3>
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 text-center">
            <div onClick={() => handleFeatureClick('Miles')} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="h-[60px] w-[60px] rounded-2xl bg-[#3f3652] flex items-center justify-center text-white shadow-sm">
                <Plane size={28} className="transform -rotate-45" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-semibold text-gray-100">Miles</span>
            </div>
            
            <div onClick={() => handleFeatureClick('Séjours')} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="h-[60px] w-[60px] rounded-2xl bg-[#3f3652] flex items-center justify-center text-white shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h14v-8h3l-3-2.7zm-9 8.7H8v-5h2v5zm4 0h-2v-5h2v5z"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-100">Séjours</span>
            </div>
            
            <div onClick={() => handleFeatureClick('eSIM')} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="h-[60px] w-[60px] rounded-2xl bg-[#3f3652] flex items-center justify-center text-white shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="2" x2="8" y2="22"/><line x1="16" y1="2" x2="16" y2="22"/><line x1="4" y1="12" x2="20" y2="12"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-100">eSIM</span>
            </div>
            
            <div onClick={() => handleFeatureClick('Magasins')} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="h-[60px] w-[60px] rounded-2xl bg-[#3f3652] flex items-center justify-center text-white shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-100">Magasins</span>
            </div>
            
            <div onClick={() => handleFeatureClick('Cartes cadeaux')} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="h-[60px] w-[60px] rounded-2xl bg-[#3f3652] flex items-center justify-center text-white shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1h-4v-2h4zM9 4c.55 0 1 .45 1 1v2H6c0-.55.45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-100">Cartes cadeaux</span>
            </div>
            
            <div onClick={() => handleFeatureClick("Salons d'aéroports")} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="h-[60px] w-[60px] rounded-2xl bg-[#3f3652] flex items-center justify-center text-white shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 9h-2V7c0-1.65-1.35-3-3-3h-4v6h-4V4H4c-1.1 0-2 .9-2 2v11h2v3h2v-3h12v3h2v-3h2V11c0-1.1-.9-2-2-2zm-9-3h4v3h-4V6zm-8 1h2v6H4V7z"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-100 leading-tight">Salons<br/>d'aéroports</span>
            </div>
            
            <div onClick={() => handleFeatureClick('Pocket')} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="h-[60px] w-[60px] rounded-2xl bg-[#3f3652] flex items-center justify-center text-white shadow-sm">
                <Hexagon size={28} className="fill-white text-white" />
              </div>
              <span className="text-[11px] font-semibold text-gray-100">Pocket</span>
            </div>
            
            <div onClick={() => handleFeatureClick('Pass coupe-file')} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
              <div className="h-[60px] w-[60px] rounded-2xl bg-[#3f3652] flex items-center justify-center text-white shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 4l-1.41 1.41L16.17 11H2v2h14.17l-5.58 5.59L12 20l8-8z"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-100 leading-tight">Pass<br/>coupe-file</span>
            </div>
          </div>
          <button onClick={() => handleFeatureClick('Afficher plus')} className="w-full mt-6 py-2.5 text-sm font-bold text-white hover:bg-white/5 rounded-xl transition-all">
            Afficher plus
          </button>
        </div>

        {/* SECTION TRANSACTIONS */}
        <div className="bg-[#2a2438]/90 rounded-[24px] p-5 backdrop-blur-xl border border-white/5 flex items-start gap-4 shadow-lg mt-1">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.5 11.5l-1.6-1.3c.2-.7.2-1.4 0-2.1l1.6-1.3c.3-.2.4-.6.2-1l-1.4-2.4c-.2-.4-.6-.5-1-.4l-2 .8c-.6-.4-1.2-.7-1.9-.9l-.3-2.1c-.1-.4-.4-.7-.8-.7h-2.8c-.4 0-.8.3-.8.7l-.3 2.1c-.7.2-1.3.5-1.9.9l-2-.8c-.4-.1-.8 0-1 .4L3.1 5.8c-.2.4-.1.8.2 1l1.6 1.3c-.2.7-.2 1.4 0 2.1l-1.6 1.3c-.3.2-.4.6-.2 1l1.4 2.4c.2.4.6.5 1 .4l2-.8c.6.4 1.2.7 1.9.9l.3 2.1c.1.4.4.7.8.7h2.8c.4 0 .8-.3.8-.7l.3-2.1c.7-.2 1.3-.5 1.9-.9l2 .8c.4.1.8 0 1-.4l1.4-2.4c.3-.5.1-.9-.2-1.1zm-8.5 3c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>
          </div>
          <div className="pt-0.5">
            <h3 className="font-bold text-[14px] text-gray-400 mb-1 leading-none">Transactions</h3>
            <p className="font-bold text-[16px] leading-tight text-white mt-2">Aucune transaction pour le<br/>moment</p>
          </div>
        </div>

        {/* SECTION GRANDES MARQUES */}
        <div className="bg-[#2a2438]/90 rounded-[24px] p-5 backdrop-blur-xl border border-white/5 shadow-lg mt-1">
          <h3 className="font-bold text-[15px] mb-5 text-gray-300">Grandes marques</h3>
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 text-center">
            {brands.map((brand, idx) => (
              <div key={idx} onClick={() => handleFeatureClick(brand.name)} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                <div className="relative">
                  <div className={`h-[68px] w-[68px] rounded-full flex items-center justify-center font-black shadow-md ${brand.bg} ${brand.text} ${brand.textClass || 'text-sm'}`}>
                    {brand.logo}
                  </div>
                  {/* Badge Hexagone RevPoints en bas à droite */}
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#2a2438] rounded-full flex items-center justify-center">
                    <Hexagon size={18} className="fill-purple-500 text-purple-200" />
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-gray-200 leading-tight max-w-[70px] mt-1">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CARTE PROMO SAMSUNG (Générée dynamiquement en CSS pur) */}
        <div onClick={() => handleFeatureClick('Promo Samsung')} className="rounded-[24px] overflow-hidden relative border border-white/5 h-[320px] shadow-lg cursor-pointer active:scale-[0.98] transition-transform mt-2">
          {/* Background simulant l'image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-[#131b2c] to-[#1e293b]" />
          
          {/* Contenu visuel simulé */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 z-10">
             <div className="w-full h-1/2 bg-gradient-to-t from-cyan-900/40 to-transparent absolute bottom-0"></div>
             
             {/* Éléments simulant l'électroménager et la TV */}
             <div className="flex items-end justify-center gap-4 relative z-20 mb-4 opacity-90">
               <div className="w-16 h-32 bg-gradient-to-b from-gray-300 to-gray-500 rounded-sm shadow-2xl border-l border-white/40"></div>
               <div className="w-36 h-24 bg-gradient-to-r from-blue-600 to-blue-800 rounded-sm shadow-2xl border-2 border-gray-800 flex items-center justify-center overflow-hidden">
                 <div className="w-full h-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center text-blue-200/50 text-[10px] font-black">SPORTS</div>
               </div>
             </div>
          </div>
          
          {/* Titre et Logo en haut à gauche */}
          <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
             <div className="h-8 w-8 bg-black rounded-full text-[5px] flex items-center justify-center font-bold text-white tracking-widest">SAMSUNG</div>
             <span className="font-bold text-base text-white shadow-black drop-shadow-md">Samsung</span>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30">
      {/* BACKGROUND GRADIENT DYNAMIQUE EN FONCTION DE L'ONGLET REQUIS */}
      <div className={`max-w-md mx-auto h-screen relative overflow-hidden shadow-2xl flex flex-col transition-all duration-500 ${
        activeTab === 'investir' 
          ? 'bg-gradient-to-b from-[#022c22] via-[#0f172a] to-[#020617]' 
          : 'bg-gradient-to-b from-[#5b21b6] via-[#1e1b4b] to-[#020617]'
      }`}>
        
        {/* TOP FIXED BAR */}
        <div className="px-4 pt-12 pb-4 flex items-center justify-between z-10">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">AL</div>
            <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
          </div>
          
          <div className="flex-1 mx-3">
            <div className="bg-white/10 backdrop-blur-md h-10 rounded-full flex items-center px-4 border border-white/5">
              <Search size={18} className="text-gray-300" />
              <input type="text" placeholder="Rechercher" className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full placeholder-gray-300"/>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/5">
              <BarChart2 size={20} />
            </button>
            <button className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/5">
              {/* ADAPTATION ICON DYNAMIQUE SUIVANT LA MAQUETTE */}
              {activeTab === 'investir' ? <Globe size={20} /> : <CreditCard size={20} />}
            </button>
          </div>
        </div>

        {/* SCROLLABLE SCENE */}
        <div className="flex-1 overflow-y-auto no-scrollbar z-0 relative">
          {activeTab === 'accueil' && renderAccueil()}
          {activeTab === 'investir' && renderInvestir()}
          {activeTab === 'virements' && renderVirements()}
          {activeTab === 'cryptos' && renderCryptos()}
          {activeTab === 'revpoints' && renderRevPoints()}
        </div>

        {/* BOTTOM NAV BAR */}
        <div className="absolute bottom-0 w-full bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 pb-8 pt-3 px-6 z-50">
          <div className="flex justify-between items-center max-w-sm mx-auto">
            {[
              { id: 'accueil', label: 'Accueil', icon: <div className="font-bold text-xl leading-none">R</div> },
              { id: 'investir', label: 'Investir', icon: <TrendingUp size={24} /> },
              { id: 'virements', label: 'Virements', icon: <ArrowRightLeft size={24} /> },
              { id: 'cryptos', label: 'Cryptos', icon: <Bitcoin size={24} /> },
              { id: 'revpoints', label: 'RevPoints', icon: <Hexagon size={24} /> },
            ].map((tab) => (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* INTERACTION TRADING : POPUP ACHAT RAPIDE */}
        {tradingModalStock && (
          <div className="absolute inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl text-white">
              <h3 className="text-xl font-bold mb-1">Acheter {tradingModalStock.name}</h3>
              <p className="text-xs text-gray-400 mb-4">Simulation d'ordre de marché instantané ({tradingModalStock.ticker})</p>
              <form onSubmit={handleStockOrder}>
                <div className="mb-4">
                  <label className="text-xs text-gray-400 block mb-2">Montant à investir (€)</label>
                  <input type="number" required min="1" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} className="w-full bg-slate-950 text-white font-bold text-xl rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-emerald-500" placeholder="0 €"/>
                  <p className="text-[11px] text-gray-500 mt-1">Disponible sur votre solde : {balance.toFixed(2)} €</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setTradingModalStock(null)} className="flex-1 py-3 rounded-full bg-white/5 font-bold hover:bg-white/10">Annuler</button>
                  <button type="submit" className="flex-1 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200">Confirmer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECRET POPUP MODAL (LONG PRESS HOME ACCUEIL) */}
        {showActionModal && (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl text-white">
              <h3 className="text-xl font-bold mb-4">Ajuster le solde principal</h3>
              <div className="flex gap-2 mb-4 bg-slate-900 p-1 rounded-full">
                <button type="button" onClick={() => setActionType('add')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${actionType === 'add' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}>Ajouter</button>
                <button type="button" onClick={() => setActionType('remove')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${actionType === 'remove' ? 'bg-red-500 text-white' : 'text-gray-400'}`}>Retirer</button>
              </div>
              <form onSubmit={handleSecretTransaction}>
                <input type="number" step="0.01" required value={actionAmount} onChange={(e) => setActionAmount(e.target.value)} className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 outline-none border border-white/10 mb-4" placeholder="0.00 €"/>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowActionModal(false)} className="flex-1 py-3 rounded-full bg-slate-700 font-bold">Retour</button>
                  <button type="submit" className="flex-1 py-3 rounded-full bg-white text-black font-bold">Valider</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}