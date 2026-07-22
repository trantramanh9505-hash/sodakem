import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (character: Character, tab: 'plot' | 'reviews') => void;
  index?: number;
}

export default function CharacterCard({ character, isFavorite, onToggleFavorite, onSelect, index }: CharacterCardProps) {
  // Alternating colors based on index: Even (0, 2, 4...) -> Pink; Odd (1, 3, 5...) -> Green/Blue (Xanh)
  const isGreenThemed = index !== undefined
    ? index % 2 === 1
    : (character.category.includes('Magic') || character.category.includes('Phép thuật') || character.category.includes('Đời thường') || character.category.includes('Slice'));

  const [floatingHearts, setFloatingHearts] = useState<{
    id: number;
    emoji: string;
    x: number;
    scale: number;
    duration: number;
  }[]>([]);

  const spawnHearts = () => {
    const emojis = ['❤️', '💖', '💝', '💕', '💗', '💓', '🌸'];
    const newHearts = Array.from({ length: 6 }).map((_, i) => ({
      id: Math.random() + Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: (Math.random() - 0.5) * 60, // Drift horizontally
      scale: 0.6 + Math.random() * 0.7,
      duration: 1.0 + Math.random() * 1.0,
    }));
    setFloatingHearts(prev => [...prev, ...newHearts]);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6 }}
      onClick={() => onSelect(character, 'plot')}
      className={`relative bg-white rounded-[32px] border-4 ${
        isGreenThemed ? 'border-soda-green-medium/40 shadow-sm hover:shadow-md' : 'border-soda-pink-medium/40 shadow-sm hover:shadow-md'
      } p-5 flex flex-col h-full overflow-hidden cursor-pointer group transition-all`}
    >
      {/* Name and Rating */}
      <div className="text-center mb-3 mt-4">
        <h3 className="text-xl font-cute text-soda-brown leading-tight group-hover:text-soda-pink-dark transition-colors">
          {character.name}
        </h3>
        
        {/* Favorite section */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(character.id);
              spawnHearts();
            }}
            className="group/heart flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full transition-all duration-300 shadow-sm border border-rose-100 relative"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform duration-300 group-hover/heart:scale-125 ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500 scale-110 animate-pulse'
                  : 'text-rose-400'
              }`}
            />
            <span className="text-[10px] font-cute text-rose-600 font-bold">
              {character.likes || 0}
            </span>

            {/* Floating Hearts Container */}
            <AnimatePresence>
              {floatingHearts.map((heart) => (
                <motion.span
                  key={heart.id}
                  initial={{ opacity: 1, y: 0, x: 0, scale: heart.scale }}
                  animate={{
                    opacity: 0,
                    y: -80, // Float upwards
                    x: heart.x, // Drift horizontally
                    scale: heart.scale * 1.3,
                  }}
                  transition={{ duration: heart.duration, ease: 'easeOut' }}
                  onAnimationComplete={() => {
                    setFloatingHearts((prev) => prev.filter((h) => h.id !== heart.id));
                  }}
                  className="absolute text-sm pointer-events-none z-50 select-none"
                  style={{
                    left: '40%',
                    bottom: '100%',
                  }}
                >
                  {heart.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </button>
          <span className="text-gray-400 text-[10px] font-cute">
            ({character.reviewCount} lời nhắn)
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 justify-center mb-3">
        {character.tags.map((tag) => (
          <span
            key={tag}
            className={`text-[9px] font-medium px-2 py-0.5 rounded-md ${
              tag === 'NEW'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold animate-pulse shadow-sm'
                : 'bg-amber-50 text-amber-700 border border-amber-200/50'
            }`}
          >
            {tag === 'NEW' ? tag : `#${tag}`}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs text-center line-clamp-3 mb-5 flex-grow">
        {character.shortDescription}
      </p>

      {/* Footer Buttons */}
      <div className="flex flex-col gap-2 mt-auto relative z-10">
        <a
          href={character.chatLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-1.5 text-[11px] font-cute text-white px-3 py-2.5 rounded-2xl border-b-3 transition-all ${
            isGreenThemed
              ? 'bg-soda-green-dark hover:bg-emerald-500 border-emerald-700 active:translate-y-0.5 active:border-b-0 shadow-sm'
              : 'bg-soda-pink-dark hover:bg-rose-400 border-rose-600 active:translate-y-0.5 active:border-b-0 shadow-sm'
          }`}
          onClick={(e) => {
            // Prevent triggering card select click when clicking outbound link
            e.stopPropagation();
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat
        </a>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(character, 'plot');
            }}
            className="flex items-center justify-center gap-1 text-[10px] font-cute bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-200/40 active:translate-y-0.5 py-2 rounded-2xl transition-all shadow-sm"
          >
            Cốt truyện
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(character, 'reviews');
            }}
            className="flex items-center justify-center gap-1 text-[10px] font-cute bg-pink-50 hover:bg-pink-100 text-pink-700 border-2 border-pink-200/40 active:translate-y-0.5 py-2 rounded-2xl transition-all shadow-sm"
          >
            Bình luận
          </button>
        </div>
      </div>
    </motion.div>
  );
}
