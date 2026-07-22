import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, MessageCircle, BookOpen, MessageSquare, Send, Calendar, Trash2 } from 'lucide-react';
import { Character, Review } from '../types';

interface CharacterDetailProps {
  character: Character;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onAddReview: (characterId: string, name: string, rating: number, comment: string) => void;
  onDeleteReview?: (characterId: string, reviewId: string) => void;
  initialTab?: 'plot' | 'reviews';
  onLinkClick?: () => void;
  index?: number;
}

export default function CharacterDetail({ 
  character, 
  isFavorite, 
  onToggleFavorite, 
  onClose, 
  onAddReview, 
  onDeleteReview,
  initialTab = 'plot',
  onLinkClick,
  index
}: CharacterDetailProps) {
  const [activeTab, setActiveTab] = useState<'plot' | 'reviews'>(initialTab);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [formError, setFormError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  // Alternating colors based on index: Even (0, 2, 4...) -> Pink; Odd (1, 3, 5...) -> Green/Blue (Xanh)
  const isGreenThemed = index !== undefined
    ? index % 2 === 1
    : (character.category.includes('Magic') || character.category.includes('Phép thuật') || character.category.includes('Đời thường') || character.category.includes('Slice'));

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim()) {
      setFormError('Vui lòng nhập tên của bạn nè! 🥰');
      return;
    }
    if (!newComment.trim()) {
      setFormError('Vui lòng để lại feedback nha! 💌');
      return;
    }

    onAddReview(character.id, newReviewerName, newRating, newComment);
    setNewReviewerName('');
    setNewRating(5);
    setNewComment('');
    setFormError('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay with blurred glass effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-rose-950/20 backdrop-blur-md"
      />

      {/* Main Detail Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`relative w-full max-w-2xl bg-white rounded-[32px] border-8 ${
          isGreenThemed ? 'border-soda-green-medium/30' : 'border-soda-pink-medium/30'
        } overflow-hidden max-h-[90vh] flex flex-col z-10 shadow-2xl`}
      >
        {/* Header Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white hover:bg-rose-50 text-soda-brown p-2 rounded-full border-2 border-soda-pink-medium/40 active:scale-95 transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content wrapper */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          
          {/* Top Profile Intro Block */}
          <div className="flex flex-col gap-4 items-center justify-center text-center mb-6">
            {/* Profile Info details */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-cute text-soda-brown leading-tight">
                {character.name}
              </h2>

              {/* Tags list */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {character.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                      tag === 'NEW'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold animate-pulse shadow-sm'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {tag === 'NEW' ? tag : `#${tag}`}
                  </span>
                ))}
              </div>

              {/* Overall Favorite Info */}
              <div className="flex items-center justify-center gap-4 mt-4 bg-rose-50/50 border border-rose-100 rounded-2xl px-5 py-2 w-fit mx-auto shadow-sm">
                <button
                  onClick={() => {
                    onToggleFavorite(character.id);
                    spawnHearts();
                  }}
                  className="group/detail-heart flex items-center gap-2 bg-white hover:bg-rose-100 border border-rose-200 hover:border-rose-300 px-4 py-1.5 rounded-full transition-all duration-300 active:scale-95 relative"
                >
                  <Heart
                    className={`w-5 h-5 transition-transform duration-300 group-hover/detail-heart:scale-125 ${
                      isFavorite
                        ? 'fill-rose-500 text-rose-500 scale-110'
                        : 'text-rose-400'
                    }`}
                  />
                  <span className="text-xs font-cute text-rose-700 font-bold flex items-center gap-1">
                    <span>{isFavorite ? 'Đã thích 💖' : 'Nhấn tim yêu thích 🤍'}</span>
                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[11px]">
                      {character.likes || 0}
                    </span>
                  </span>

                  {/* Floating Hearts Container */}
                  <AnimatePresence>
                    {floatingHearts.map((heart) => (
                      <motion.span
                        key={heart.id}
                        initial={{ opacity: 1, y: 0, x: 0, scale: heart.scale }}
                        animate={{
                          opacity: 0,
                          y: -90, // Float upwards
                          x: heart.x, // Drift horizontally
                          scale: heart.scale * 1.3,
                        }}
                        transition={{ duration: heart.duration, ease: 'easeOut' }}
                        onAnimationComplete={() => {
                          setFloatingHearts((prev) => prev.filter((h) => h.id !== heart.id));
                        }}
                        className="absolute text-base pointer-events-none z-50 select-none"
                        style={{
                          left: '45%',
                          bottom: '100%',
                        }}
                      >
                        {heart.emoji}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </button>
                <div className="h-6 w-px bg-rose-200/60" />
                <div className="text-left font-cute">
                  <div className="text-xs font-bold text-rose-700">
                    {character.likes || 0} lượt thích
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {character.reviewCount} lời nhắn từ iu
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action: Chat Outbound Button */}
          <div className="mb-6">
            <a
              href={character.chatLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onLinkClick}
              className={`w-full flex items-center justify-center gap-2 text-base font-cute text-white py-3.5 px-6 rounded-2xl border-b-4 transition-all shadow-md ${
                isGreenThemed
                  ? 'bg-soda-green-dark hover:bg-emerald-500 border-emerald-700 active:translate-y-1 active:border-b-0'
                  : 'bg-soda-pink-dark hover:bg-rose-400 border-rose-600 active:translate-y-1 active:border-b-0'
              }`}
            >
              <MessageCircle className="w-5 h-5 animate-pulse" />
              Chat
            </a>
            <p className="text-[11px] text-center text-gray-400 mt-1.5">
              (Liên kết ngoài dẫn sang nền tảng đối tác)
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b-2 border-gray-100 mb-6 gap-2">
            <button
              onClick={() => setActiveTab('plot')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-cute text-sm transition-all border-b-3 -mb-[3px] rounded-t-xl ${
                activeTab === 'plot'
                  ? 'text-soda-pink-dark border-soda-pink-dark bg-soda-pink/35'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Cốt truyện & Plot
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-cute text-sm transition-all border-b-3 -mb-[3px] rounded-t-xl ${
                activeTab === 'reviews'
                  ? 'text-soda-pink-dark border-soda-pink-dark bg-soda-pink/35'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Lời nhắn từ các iu ({character.reviewCount})
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="min-h-[220px]">
            {activeTab === 'plot' ? (
              <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-soda-pink-medium/40 shadow-inner">
                <h4 className="text-sm font-cute text-soda-brown mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-soda-pink-dark"></span>
                  Bối cảnh & Tính cách
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {character.plot}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Form: Add review */}
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-white rounded-2xl p-4 border-2 border-soda-green-medium/30 shadow-sm"
                >
                  <h4 className="text-sm font-cute text-soda-brown mb-3 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-soda-green-dark"></span>
                    Gửi lời nhắn yêu thích tới {character.name}
                  </h4>

                  {formError && (
                    <p className="text-xs text-rose-500 font-cute mb-3 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                      ⚠️ {formError}
                    </p>
                  )}

                  {submitSuccess && (
                    <div className="text-xs text-emerald-700 font-cute mb-3 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-bounce">
                      <span>✨ Cảm ơn bạn! Feedback của bạn đã được lưu trữ thành công 💖</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Name input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Biệt danh của bạn
                      </label>
                      <input
                        type="text"
                        value={newReviewerName}
                        onChange={(e) => setNewReviewerName(e.target.value)}
                        placeholder="Ví dụ: CáoẨnDanh 🦊"
                        className="w-full text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-gray-100 focus:border-soda-green-medium rounded-xl px-3 py-2 outline-none transition-all"
                      />
                    </div>

                    {/* Heart rating selection */}
                    <div>
                      <label className="block text-xs font-semibold text-rose-500 font-cute mb-1">
                        Mức độ yêu thích
                      </label>
                      <div className="flex items-center gap-1.5 h-[38px]">
                        {[1, 2, 3, 4, 5].map((heartNum) => (
                          <button
                            key={heartNum}
                            type="button"
                            onClick={() => setNewRating(heartNum)}
                            className="p-1 hover:scale-125 active:scale-95 transition-transform"
                          >
                            <Heart
                              className={`w-5 h-5 transition-all ${
                                heartNum <= newRating
                                  ? 'fill-rose-500 text-rose-500 scale-110'
                                  : 'text-rose-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comment box */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Feedback / Cảm nhận
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={`Ví dụ: Feedback của bạn về ${character.name}, cảm nhận khi trò chuyện siêu ngọt ngào...`}
                      rows={3}
                      className="w-full text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white border-2 border-gray-100 focus:border-soda-green-medium rounded-xl px-3 py-2 outline-none resize-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 text-xs font-cute text-white bg-soda-green-dark hover:bg-emerald-500 px-4 py-2 rounded-xl transition-all border-b-2 border-emerald-700 active:translate-y-0.5 active:border-b-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Gửi feedback 💖
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {character.reviews.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200/50">
                      <p className="text-sm text-gray-400">
                        Chưa có feedback nào cho nhân vật này. Bạn hãy gửi feedback đầu tiên nha! ✨
                      </p>
                    </div>
                  ) : (
                    character.reviews
                      .slice()
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-3"
                        >
                          {/* Cute avatar initial */}
                          <div className="w-10 h-10 rounded-full bg-soda-pink-medium/30 border border-soda-pink-medium/60 flex items-center justify-center font-cute text-soda-brown text-base flex-shrink-0">
                            {rev.reviewerName.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                              <h5 className="text-sm font-cute text-soda-brown truncate">
                                {rev.reviewerName}
                              </h5>
                              <div className="flex items-center gap-1">
                                <span className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((heartNum) => (
                                    <Heart
                                      key={heartNum}
                                      className={`w-3.5 h-3.5 ${
                                        heartNum <= rev.rating
                                          ? 'fill-rose-500 text-rose-500'
                                          : 'text-rose-200'
                                      }`}
                                    />
                                  ))}
                                </span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {formatDate(rev.createdAt)}
                                </span>
                                {onDeleteReview && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Bạn có chắc muốn xóa feedback này?')) {
                                        onDeleteReview(character.id, rev.id);
                                      }
                                    }}
                                    title="Xóa feedback này"
                                    className="p-1 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 text-xs leading-relaxed break-words">
                              {rev.comment}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Modal Footer decorative */}
        <div className="bg-soda-pink/20 px-6 py-3 flex justify-end items-center border-t border-soda-pink-medium/25">
          <span className="text-xs text-soda-pink-dark">🌸🍧🍵</span>
        </div>
      </motion.div>
    </div>
  );
}
