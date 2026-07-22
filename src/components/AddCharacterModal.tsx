import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Sparkles, Link, AlignLeft, BookOpen, Check, Image as ImageIcon } from 'lucide-react';
import { Character } from '../types';
import { CATEGORIES, AVAILABLE_TAGS } from '../data';

interface AddCharacterModalProps {
  onClose: () => void;
  onAdd: (character: Character) => void;
}

export default function AddCharacterModal({ onClose, onAdd }: AddCharacterModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'Kỳ ảo (Fantasy)');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [shortDescription, setShortDescription] = useState('');
  const [plot, setPlot] = useState('');
  const [chatLink, setChatLink] = useState('');
  const [error, setError] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) {
      setError('Vui lòng nhập tên nhân vật nha! 🐾');
      return;
    }
    if (!shortDescription.trim()) {
      setError('Hãy viết một mô tả ngắn dễ thương cho nhân vật nha! ✨');
      return;
    }
    if (!plot.trim()) {
      setError('Đừng quên chia sẻ cốt truyện/plot để người chơi đọc nha! 📖');
      return;
    }
    if (!chatLink.trim()) {
      setError('Vui lòng gắn link trò chuyện (ví dụ: link Character.ai)! 🔗');
      return;
    }
    if (!chatLink.startsWith('http://') && !chatLink.startsWith('https://')) {
      setError('Đường dẫn trò chuyện phải bắt đầu bằng http:// hoặc https:// nha!');
      return;
    }

    const newChar: Character = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      avatar: '',
      category,
      tags: selectedTags.length > 0 ? selectedTags : ['Cute'],
      shortDescription: shortDescription.trim(),
      plot: plot.trim(),
      chatLink: chatLink.trim(),
      rating: 5.0, // Default perfect score
      reviewCount: 0,
      reviews: [],
      likes: 0,
      createdAt: new Date().toISOString(),
      isCustom: true
    };

    onAdd(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-rose-950/20 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-xl bg-white rounded-[32px] border-8 border-soda-pink-medium/30 overflow-hidden max-h-[90vh] flex flex-col z-10 shadow-2xl"
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white hover:bg-rose-50 text-soda-brown p-2 rounded-full border-2 border-soda-pink-medium/40 active:scale-95 transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form header */}
        <div className="bg-soda-pink/40 p-6 border-b-2 border-soda-pink-medium/30">
          <h3 className="text-xl md:text-2xl font-cute text-soda-brown flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-soda-pink-dark animate-pulse" />
            Đăng Nhân Vật Mới
          </h3>
          <p className="text-xs text-rose-500 mt-1">
            Thêm nhân vật roleplay của bạn vào ngôi nhà chung Soda Kem để người chơi dễ tìm kiếm!
          </p>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 space-y-4">
          
          {error && (
            <div className="text-xs text-rose-500 font-cute bg-rose-50 px-4 py-2.5 rounded-xl border-2 border-rose-100">
              ⚠️ {error}
            </div>
          )}

          {/* Character Name */}
          <div>
            <label className="block text-xs font-cute text-soda-brown mb-1.5">
              Tên nhân vật <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Thỏ Con Tai Dài..."
              className="w-full text-sm bg-white hover:bg-gray-50 focus:bg-white border-2 border-soda-pink-medium/30 focus:border-soda-pink-dark rounded-xl px-4 py-2.5 outline-none transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-cute text-soda-brown mb-1.5">
              Phân loại <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm bg-white border-2 border-soda-pink-medium/30 focus:border-soda-pink-dark rounded-xl px-4 py-2.5 outline-none transition-all text-soda-brown font-medium"
            >
              {CATEGORIES.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>


          {/* Tags Checkbox */}
          <div>
            <label className="block text-xs font-cute text-soda-brown mb-1.5">
              Chọn Thẻ (Đặc điểm tính cách)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-soda-pink-medium/20 rounded-xl">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-soda-pink-medium border-soda-pink-dark text-soda-pink-dark font-semibold'
                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tag}
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Link */}
          <div>
            <label className="block text-xs font-cute text-soda-brown mb-1.5 flex items-center gap-1">
              <Link className="w-3.5 h-3.5 text-soda-pink-dark" />
              Link chat bên ngoài <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={chatLink}
              onChange={(e) => setChatLink(e.target.value)}
              placeholder="https://character.ai/chat/..."
              className="w-full text-sm bg-white hover:bg-gray-50 focus:bg-white border-2 border-soda-pink-medium/30 focus:border-soda-pink-dark rounded-xl px-4 py-2.5 outline-none transition-all"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              (Gắn liên kết dẫn đến trang chat Character.ai, C.ai, Janitor, v.v...)
            </span>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-cute text-soda-brown mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-soda-pink-dark" />
              Mô tả ngắn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Mô tả tóm tắt tính cách trong 1-2 câu ngắn..."
              maxLength={120}
              className="w-full text-sm bg-white hover:bg-gray-50 focus:bg-white border-2 border-soda-pink-medium/30 focus:border-soda-pink-dark rounded-xl px-4 py-2.5 outline-none transition-all"
            />
          </div>

          {/* Backstory / Plot */}
          <div>
            <label className="block text-xs font-cute text-soda-brown mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-soda-pink-dark" />
              Cốt truyện & Hoàn cảnh (Backstory / Plot) <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={plot}
              onChange={(e) => setPlot(e.target.value)}
              placeholder="Nhập chi tiết hoàn cảnh xuất thân, tính cách, thói quen và những bí mật của nhân vật..."
              rows={4}
              className="w-full text-sm bg-white hover:bg-gray-50 focus:bg-white border-2 border-soda-pink-medium/30 focus:border-soda-pink-dark rounded-xl px-4 py-2.5 outline-none resize-none transition-all"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-cute py-2.5 rounded-xl transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 bg-soda-pink-dark hover:bg-rose-400 text-white font-cute py-2.5 rounded-xl transition-all border-b-4 border-rose-600 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Đăng nhân vật
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
