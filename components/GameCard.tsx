
import React from 'react';
import { GameCard as IGameCard, CardElement } from '../types';
import { Icons } from '../constants';

interface CardProps {
  card: IGameCard;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  isAI?: boolean;
}

const getElementColor = (el: CardElement) => {
  switch (el) {
    case 'Plasma': return 'border-yellow-400 text-yellow-400';
    case 'Void': return 'border-purple-500 text-purple-400';
    case 'Quantum': return 'border-sky-400 text-sky-400';
    case 'Core': return 'border-rose-500 text-rose-400';
    default: return 'border-slate-400 text-slate-400';
  }
};

const GameCard: React.FC<CardProps> = ({ card, onClick, disabled, selected, isAI }) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative w-52 h-80 rounded-2xl overflow-hidden transition-all duration-500 
        ${selected ? 'scale-105 -translate-y-4 ring-2 ring-sky-400 z-10' : 'hover:-translate-y-2 hover:scale-105'}
        ${disabled && !selected ? 'opacity-40 grayscale pointer-events-none' : ''}
        glass border-2 ${getElementColor(card.element)} group
      `}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={card.image} alt={card.name} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between text-left">
        <div>
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{card.rarity}</span>
            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border border-current`}>
              {card.element}
            </span>
          </div>
          <h3 className="font-heading font-bold text-xl leading-tight mb-2 group-hover:text-white transition-colors">{card.name}</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{card.description}</p>
        </div>

        <div className="space-y-2">
          <StatBar icon={<Icons.Swords />} label="POW" value={card.power} color="rose" />
          <StatBar icon={<Icons.Brain />} label="INT" value={card.intelligence} color="sky" />
          <StatBar icon={<Icons.Zap />} label="AGI" value={card.agility} color="amber" />
        </div>
      </div>
    </button>
  );
};

const StatBar = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
  <div className="flex items-center gap-2 group/stat">
    <div className={`text-${color}-400 opacity-70 group-hover/stat:opacity-100 transition-opacity`}>{icon}</div>
    <div className="flex-1">
      <div className="flex justify-between text-[9px] font-bold mb-0.5 opacity-60">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color}-500/80 rounded-full transition-all duration-1000`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  </div>
);

export default GameCard;
