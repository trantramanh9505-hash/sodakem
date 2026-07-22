import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Sparkles, 
  SlidersHorizontal, 
  Filter, 
  Trash2, 
  Check, 
  ArrowUpDown, 
  Heart, 
  Undo2,
  Star,
  MessageCircle,
  BookOpen,
  ArrowRight,
  SkipBack,
  SkipForward,
  Moon,
  Sun,
  Users
} from 'lucide-react';
import { Character, FilterState, Review } from './types';
import { INITIAL_CHARACTERS, CATEGORIES, AVAILABLE_TAGS } from './data';
import CharacterCard from './components/CharacterCard';
import CharacterDetail from './components/CharacterDetail';
import AddCharacterModal from './components/AddCharacterModal';

const headerImage = '/src/assets/images/IMG_1437.jpeg';

const PLAYLIST = [
  {
    title: "Ariana Grande - don’t wanna breakup again",
    url: "https://files.catbox.moe/88ke4b.mp3"
  },
  {
    title: "Ariana Grande - intro (end of the world)",
    url: "https://files.catbox.moe/yqckpw.mp3"
  },
  {
    title: "Ariana Grande - i wish i hated you",
    url: "https://files.catbox.moe/sv0bnz.mp3"
  },
  {
    title: "Ariana Grande - true story",
    url: "https://files.catbox.moe/mtgkqx.mp3"
  },
  {
    title: "Ariana Grande - imperfect for you",
    url: "https://files.catbox.moe/r8wx5k.mp3"
  },
  {
    title: "Ariana Grande - no tears left to cry",
    url: "https://files.catbox.moe/ldyxo9.mp3"
  },
  {
    title: "Ariana Grande - everytime",
    url: "https://files.catbox.moe/l86prj.mp3"
  },
  {
    title: "Ariana Grande - 34+35",
    url: "https://files.catbox.moe/08zwyk.mp3"
  }
];

export default function App() {
  // Opening / Disclaimer screen state (always show on page access so visitor accepts and counts up)
  const [showOpening, setShowOpening] = useState(true);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('sodakem_dark_mode') === 'true';
  });

  // Visitor Count State
  const [visitorCount, setVisitorCount] = useState<number>(473);

  // Fetch visitor count from server
  const fetchVisitorCount = async () => {
    try {
      const res = await fetch('/api/visitor-count');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          setVisitorCount(data.count);
        }
      }
    } catch (err) {
      console.error('Error fetching visitor count:', err);
    }
  };

  // Increment visitor count on server
  const incrementVisitorCount = async () => {
    try {
      const res = await fetch('/api/visitor-count/increment', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          setVisitorCount(data.count);
        }
      }
    } catch (err) {
      console.error('Error incrementing visitor count:', err);
    }
  };

  // Automatic count on page access / session start & periodic server sync
  useEffect(() => {
    fetchVisitorCount();

    const sessionCounted = sessionStorage.getItem('sodakem_session_counted');
    if (!sessionCounted) {
      sessionStorage.setItem('sodakem_session_counted', 'true');
      incrementVisitorCount();
    }

    // Synchronize visitor count live from server every 4 seconds
    const interval = setInterval(() => {
      fetchVisitorCount();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sodakem_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sodakem_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Prevent background scroll when disclaimer is showing
  useEffect(() => {
    if (showOpening) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showOpening]);

  // Characters State (with localStorage persistence)
  const [characters, setCharacters] = useState<Character[]>([]);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Auto-play music when entering page, with fallback for browser autoplay policy
  useEffect(() => {
    const attemptPlay = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Autoplay blocked or waiting for user interaction:", err);
        });
      }
    };

    // Try playing immediately
    attemptPlay();

    // Interaction fallback for browsers blocking unprompted autoplay
    const handleFirstInteraction = () => {
      attemptPlay();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Play audio when currentSongIndex changes, if already playing
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(err => console.error("Song change play error:", err));
    }
  }, [currentSongIndex]);

  // Random Husband State
  const [randomHusband, setRandomHusband] = useState<Character | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Favorites state (list of character IDs)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('sodakem_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved favorites');
      }
    }
    return [];
  });

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('sodakem_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Favorite toggler handler
  const handleToggleFavorite = async (characterId: string) => {
    const isCurrentlyFav = favorites.includes(characterId);
    let updatedFavorites;
    if (isCurrentlyFav) {
      updatedFavorites = favorites.filter(id => id !== characterId);
    } else {
      updatedFavorites = [...favorites, characterId];
    }
    setFavorites(updatedFavorites);

    const delta = isCurrentlyFav ? -1 : 1;
    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, increment: delta })
      });
    } catch (err) {
      console.error('Failed to post likes to server:', err);
    }

    // Update character likes count
    const updatedCharacters = characters.map(char => {
      if (char.id === characterId) {
        const currentLikes = char.likes !== undefined ? char.likes : 0;
        const nextLikes = Math.max(0, currentLikes + delta);
        const updatedChar = {
          ...char,
          likes: nextLikes
        };

        // Update selectedCharacter if it's currently open
        if (selectedCharacter && selectedCharacter.id === characterId) {
          setSelectedCharacter(updatedChar);
        }
        return updatedChar;
      }
      return char;
    });
    saveCharacters(updatedCharacters);
  };

  // Selection and Modal State
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [detailTab, setDetailTab] = useState<'plot' | 'reviews'>('plot');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Audio Playback handler
  const handleToggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log("Audio playback failed or was blocked by browser", err);
        setIsPlaying(true);
      });
    }
  };

  // Random husband generator handler
  const handleRandomHusband = () => {
    if (characters.length === 0) return;
    setIsShuffling(true);
    setRandomHusband(null);
    
    let count = 0;
    const interval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * characters.length);
      setRandomHusband(characters[tempIndex]);
      count++;
      if (count > 8) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * characters.length);
        setRandomHusband(characters[finalIndex]);
        setIsShuffling(false);
      }
    }, 120);
  };

  const handleOpenDetail = (character: Character, tab: 'plot' | 'reviews' = 'plot') => {
    setSelectedCharacter(character);
    setDetailTab(tab);
  };
  
  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'Tất cả',
    tags: [],
    sortBy: 'newest'
  });

  // UI state for toggling advanced tag filter panel on mobile
  const [showTagPanel, setShowTagPanel] = useState(false);

  // Load characters on mount
  useEffect(() => {
    const saved = localStorage.getItem('sodakem_characters');
    let loadedCharacters: Character[] = [];
    if (saved) {
      try {
        loadedCharacters = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved characters');
      }
    }

    // Always merge/update properties from INITIAL_CHARACTERS while strictly preserving user feedback & reviews from localStorage
    const updated = INITIAL_CHARACTERS.map(initialChar => {
      const existing = loadedCharacters.find(c => c.id === initialChar.id);
      
      if (existing) {
        // Merge reviews: preserve user-submitted reviews if present
        const savedReviews = (existing.reviews && existing.reviews.length > 0) 
          ? existing.reviews 
          : (initialChar.reviews || []);
        const reviewCount = savedReviews.length;
        const sumRating = savedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = savedReviews.length > 0 ? Number((sumRating / savedReviews.length).toFixed(1)) : (initialChar.rating || 5.0);

        // Preserve saved likes if present
        const savedLikes = existing.likes !== undefined ? existing.likes : (initialChar.likes || 0);

        return {
          ...initialChar,
          reviews: savedReviews,
          reviewCount: reviewCount,
          rating: avgRating,
          likes: savedLikes
        };
      }
      return {
        ...initialChar,
        likes: initialChar.likes || 0
      };
    });

    // Add any custom characters back
    const customChars = loadedCharacters.filter(c => !INITIAL_CHARACTERS.some(ic => ic.id === c.id)).map(c => ({
      ...c,
      likes: c.likes !== undefined ? c.likes : 0
    }));
    const finalCharacters = [...updated, ...customChars];

    setCharacters(finalCharacters);
    localStorage.setItem('sodakem_characters', JSON.stringify(finalCharacters));
  }, []);

  // Save characters helper
  const saveCharacters = (updated: Character[]) => {
    setCharacters(updated);
    localStorage.setItem('sodakem_characters', JSON.stringify(updated));
  };

  // Add Character Handler
  const handleAddCharacter = (newChar: Character) => {
    const updated = [newChar, ...characters];
    saveCharacters(updated);
  };

  // Delete Custom Character Handler (only allows deleting custom ones)
  const handleDeleteCharacter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Cậu có chắc chắn muốn xóa nhân vật này không? 🥺')) {
      const updated = characters.filter(char => char.id !== id);
      saveCharacters(updated);
      if (selectedCharacter?.id === id) {
        setSelectedCharacter(null);
      }
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'Tất cả',
      tags: [],
      sortBy: 'newest'
    });
  };

  // Toggle tag filter selection
  const handleToggleTag = (tag: string) => {
    setFilters(prev => {
      const isSelected = prev.tags.includes(tag);
      const updatedTags = isSelected 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag];
      return { ...prev, tags: updatedTags };
    });
  };

  // Synchronize reviews & likes with server
  const syncServerData = async () => {
    try {
      const [reviewsRes, likesRes] = await Promise.all([
        fetch('/api/reviews'),
        fetch('/api/likes')
      ]);

      let serverReviews: Record<string, Review[]> = {};
      let serverLikes: Record<string, number> = {};

      if (reviewsRes.ok) {
        serverReviews = await reviewsRes.json();
      }
      if (likesRes.ok) {
        serverLikes = await likesRes.json();
      }

      setCharacters(prevChars => {
        if (prevChars.length === 0) return prevChars;
        const updated = prevChars.map(char => {
          const sReviews = serverReviews[char.id];
          const mergedReviews = sReviews && sReviews.length > 0 ? sReviews : char.reviews;
          const sLikes = serverLikes[char.id];
          const mergedLikes = sLikes !== undefined ? sLikes : (char.likes || 0);

          const sumRating = mergedReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = mergedReviews.length > 0 ? Number((sumRating / mergedReviews.length).toFixed(1)) : (char.rating || 5.0);

          return {
            ...char,
            reviews: mergedReviews,
            reviewCount: mergedReviews.length,
            rating: avgRating,
            likes: mergedLikes
          };
        });

        if (selectedCharacter) {
          const found = updated.find(c => c.id === selectedCharacter.id);
          if (found) setSelectedCharacter(found);
        }

        return updated;
      });
    } catch (e) {
      console.error('Error syncing server data:', e);
    }
  };

  useEffect(() => {
    syncServerData();
    const interval = setInterval(() => {
      syncServerData();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle adding a review
  const handleAddReview = async (characterId: string, reviewerName: string, rating: number, comment: string, customId?: string) => {
    const newReview: Review = {
      id: customId || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      characterId,
      reviewerName,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, review: newReview })
      });
    } catch (err) {
      console.error('Failed to post review to server:', err);
    }

    const updatedCharacters = characters.map(char => {
      if (char.id === characterId) {
        const updatedReviews = [...char.reviews, newReview];
        const sumRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = updatedReviews.length > 0 ? sumRating / updatedReviews.length : 5.0;
        
        const updatedChar = {
          ...char,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          rating: Number(avgRating.toFixed(1))
        };

        // Also update the active selected character to show the new review instantly
        if (selectedCharacter && selectedCharacter.id === characterId) {
          setSelectedCharacter(updatedChar);
        }

        return updatedChar;
      }
      return char;
    });

    saveCharacters(updatedCharacters);
  };

  // Handle editing a review
  const handleEditReview = async (characterId: string, reviewId: string, reviewerName: string, rating: number, comment: string) => {
    try {
      await fetch(`/api/reviews/${characterId}/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerName, rating, comment })
      });
    } catch (err) {
      console.error('Failed to edit review on server:', err);
    }

    const updatedCharacters = characters.map(char => {
      if (char.id === characterId) {
        const updatedReviews = char.reviews.map(r => {
          if (r.id === reviewId) {
            return {
              ...r,
              reviewerName,
              rating,
              comment,
              updatedAt: new Date().toISOString()
            };
          }
          return r;
        });
        const sumRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = updatedReviews.length > 0 ? sumRating / updatedReviews.length : 5.0;

        const updatedChar = {
          ...char,
          reviews: updatedReviews,
          reviewCount: updatedReviews.length,
          rating: Number(avgRating.toFixed(1))
        };

        if (selectedCharacter && selectedCharacter.id === characterId) {
          setSelectedCharacter(updatedChar);
        }

        return updatedChar;
      }
      return char;
    });

    saveCharacters(updatedCharacters);
  };

  // Filter and search logic
  const filteredCharacters = characters.filter(char => {
    // 1. Search term (Search by name, short description, tags or categories)
    const matchesSearch = !filters.search.trim() || 
      char.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      char.shortDescription.toLowerCase().includes(filters.search.toLowerCase()) ||
      char.plot.toLowerCase().includes(filters.search.toLowerCase()) ||
      char.tags.some(t => t.toLowerCase().includes(filters.search.toLowerCase()));

    // 2. Category selection
    const matchesCategory = filters.category === 'Tất cả' || char.category === filters.category;

    // 3. Tags selection (must match ALL selected tags if any tags are chosen)
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.every(selectedTag => char.tags.includes(selectedTag));

    return matchesSearch && matchesCategory && matchesTags;
  }).sort((a, b) => {
    // Sorting logic
    if (filters.sortBy === 'popular') {
      return b.reviewCount - a.reviewCount;
    }
    if (filters.sortBy === 'rating') {
      const likesA = a.likes || 0;
      const likesB = b.likes || 0;
      return likesB - likesA;
    }
    // newest as default
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Spotlight is the first matched character in the list (if any)
  const spotlightCharacter = filteredCharacters.length > 0 ? filteredCharacters[0] : null;
  const remainingCharacters = filteredCharacters.length > 1 ? filteredCharacters.slice(1) : [];

  return (
    <div className="min-h-screen animated-dots-bg text-slate-700 flex flex-col lg:flex-row relative">
      
      {/* Opening / Welcome Disclaimer Screen */}
      <AnimatePresence>
        {showOpening && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 animated-dots-bg z-[100] flex items-center justify-center p-4 overflow-y-auto"
          >
            {/* Soft decorative background elements inside opening overlay */}
            <div className="absolute top-10 left-10 w-44 h-44 bg-soda-pink-medium/40 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-52 h-52 bg-soda-green-medium/40 rounded-full blur-3xl animate-pulse pointer-events-none" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-full max-w-lg bg-white border-8 border-soda-pink/60 rounded-[40px] p-8 md:p-10 shadow-2xl relative flex flex-col items-center text-center bubbly-shadow"
            >
              {/* Cute Soda elements */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🥤</span>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🍓</span>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-logo text-soda-pink-dark mb-4 drop-shadow-sm select-none">
                Welcome to Soda Kem’s Menu
              </h2>

              <div className="w-16 h-1.5 bg-soda-pink-medium rounded-full mb-6" />

              {/* Disclaimer container */}
              <div className="bg-pink-50/50 rounded-3xl p-5 border-2 border-dashed border-pink-100 mb-8 max-w-md">
                <p className="text-xs font-semibold text-rose-500 mb-3 flex items-center justify-center gap-1.5 font-cute tracking-wide uppercase">
                  ⚠️ Cảnh Báo Độ Tuổi / Nội Dung
                </p>
                <p className="text-xs font-cute text-slate-700 leading-relaxed mb-4">
                  Có nhiều nội dung nhạy cảm, cân nhắc trước khi tham gia 🫶🏻
                </p>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                  Kem không chịu trách nhiệm cho bất kì hành vi cố tình tiếp nhận nội dung nhạy cảm khi chưa đủ tuổi
                </p>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.setItem('sodakem_disclaimer_accepted', 'true');
                  setShowOpening(false);
                  incrementVisitorCount();
                  if (audioRef.current && !isPlaying) {
                    audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
                      console.log("Audio playback error:", err);
                    });
                  }
                }}
                className="font-cute text-xs bg-soda-green-dark hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl transition-all border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 cursor-pointer shadow-md flex items-center gap-2 select-none"
              >
                Đồng ý & Tiếp tục 💖
              </motion.button>

              <div className="text-[10px] text-slate-400 mt-4 select-none font-medium">
                Bạn đồng ý rằng bạn đã đủ tuổi hợp pháp để tiếp cận nội dung này.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Pastel Background Bubbles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-soda-pink/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-44 h-44 bg-soda-green/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-soda-pink/40 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT SIDEBAR (Desktop) / TOP CONTROLS (Mobile) */}
      <aside className="w-full lg:w-[320px] xl:w-[360px] caro-green-pastel-bg backdrop-blur-md border-b-4 lg:border-b-0 lg:border-r-4 border-pink-100 p-6 flex flex-col gap-6 lg:sticky lg:top-0 lg:h-screen overflow-y-auto z-20">
        
        {/* Back to Welcome Screen & Visitor Counter Row */}
        <div className="flex items-center justify-between gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOpening(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-soda-pink-dark hover:text-rose-600 text-xs font-cute border border-pink-200 transition-all cursor-pointer select-none shadow-sm"
            title="Quay lại"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </motion.button>

          {/* Symmetrical Visitor Counter */}
          <div className="flex items-center gap-1.5 text-[10px] font-cute text-pink-600 font-bold bg-pink-50/90 dark:bg-black/30 py-1.5 px-3 rounded-full border border-pink-200/60 shadow-sm select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{visitorCount.toLocaleString('vi-VN')} người đã lọ</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col gap-4 bg-white/40 p-4 rounded-2xl border border-pink-100/60 shadow-inner">
          <div 
            onClick={handleResetFilters}
            className="flex items-center gap-2 justify-center select-none cursor-pointer hover:scale-105 transition-transform"
          >
            <div>
              <h1 className="text-2xl font-logo text-soda-pink-dark text-center">Soda Kem</h1>
              <p className="text-[9px] font-cute text-emerald-600 tracking-wider text-center">THÊM CHÚT NGỌT NGÀO ✨</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Music Player Button */}
            <div className={`w-full flex items-center justify-between gap-1 py-2 px-2.5 rounded-xl transition-all shadow-sm border ${
                isPlaying 
                  ? 'bg-rose-100 border-rose-200' 
                  : 'bg-emerald-100 border-emerald-200'
              }`}>
              {/* Previous Song Button */}
              <button
                onClick={() => setCurrentSongIndex(prev => (prev - 1 + PLAYLIST.length) % PLAYLIST.length)}
                className={`p-1.5 rounded-lg transition-all flex-shrink-0 active:scale-90 ${
                  isPlaying ? 'text-rose-600 hover:bg-rose-200/60' : 'text-emerald-600 hover:bg-emerald-200/60'
                }`}
                title="Bài trước"
              >
                <SkipBack size={15} fill="currentColor" className="opacity-80" />
              </button>

              {/* Play / Pause Toggle Button */}
              <button
                onClick={handleToggleMusic}
                title={PLAYLIST[currentSongIndex].title}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-cute hover:opacity-80 transition-opacity min-w-0 px-1 ${
                  isPlaying ? 'text-rose-700 animate-pulse' : 'text-emerald-700'
                }`}
              >
                <div className="flex items-center gap-1 font-bold">
                  <span className="text-sm">{isPlaying ? '🎵' : '🎶'}</span>
                  <span>{isPlaying ? 'Tắt Nhạc' : 'Bật Nhạc'}</span>
                  <span className="text-[10px] font-sans opacity-70 font-normal">
                    ({currentSongIndex + 1}/{PLAYLIST.length})
                  </span>
                </div>
                <span className="text-[9.5px] opacity-85 font-sans truncate max-w-full text-center font-medium">
                  {PLAYLIST[currentSongIndex].title}
                </span>
              </button>

              {/* Next Song Button */}
              <button
                onClick={() => setCurrentSongIndex(prev => (prev + 1) % PLAYLIST.length)}
                className={`p-1.5 rounded-lg transition-all flex-shrink-0 active:scale-90 ${
                  isPlaying ? 'text-rose-600 hover:bg-rose-200/60' : 'text-emerald-600 hover:bg-emerald-200/60'
                }`}
                title="Bài tiếp theo"
              >
                <SkipForward size={15} fill="currentColor" className="opacity-80" />
              </button>
            </div>

            {/* Secret Mailbox Button */}
            <a
              href="https://ngl.link/sodakem66988"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex flex-col items-center justify-center text-center p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100/80 border border-pink-200 transition-all shadow-sm group"
            >
              <span className="text-xs font-cute text-pink-700 flex items-center gap-1 group-hover:scale-102 transition-transform">
                💌 Hòm thư bí mật
              </span>
              <span className="text-[9px] text-pink-500/90 font-medium mt-0.5">
                iu muốn nhắn gửi điều gì tới Kem?
              </span>
            </a>

            {/* Husband Randomizer */}
            <div className="w-full bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-sm text-center">
              <span className="text-[9px] text-amber-700 font-cute">
                iu muốn Kem chọn chồng cho hem? 💖
              </span>
              <button
                onClick={handleRandomHusband}
                disabled={isShuffling}
                className="w-full py-1.5 px-2 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-amber-950 text-[10px] font-cute rounded-lg transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <span>{isShuffling ? '⏳' : '🎲'}</span>
                {isShuffling ? 'Đang quay chọn...' : 'Chọn chồng ngẫu nhiên!'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Block */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-pink-500 uppercase tracking-wider px-1">
            Tìm kiếm nhân vật
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Tìm tên, cốt truyện... 🔍"
              className="w-full bg-white border-2 border-pink-100 rounded-2xl py-2.5 px-4 text-xs focus:outline-none focus:border-emerald-300 shadow-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-pink-500 uppercase tracking-wider px-1">
            Sắp xếp danh sách
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="w-full bg-white border-2 border-pink-100 rounded-2xl py-2 px-3 text-xs focus:outline-none focus:border-pink-300 font-cute text-slate-700 cursor-pointer outline-none shadow-sm"
          >
            <option value="newest">🗓️ Mới cập nhật</option>
            <option value="popular">🔥 Được quan tâm nhất</option>
            <option value="rating">⭐️ Đánh giá cao nhất</option>
          </select>
        </div>

        {/* Tag selection toggle */}
        <div>
          <button
            onClick={() => setShowTagPanel(!showTagPanel)}
            className={`w-full flex items-center justify-between text-xs font-cute px-4 py-2.5 rounded-xl border-2 transition-all ${
              filters.tags.length > 0 || showTagPanel
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                : 'bg-white border-pink-100 text-slate-500 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Lọc theo đặc điểm ({filters.tags.length})
            </span>
            <span className="text-[10px]">{showTagPanel ? '▲' : '▼'}</span>
          </button>

          {/* Expanded Tags */}
          {showTagPanel && (
            <div className="mt-2 p-3 bg-white/80 border border-pink-100 rounded-2xl flex flex-wrap gap-1 max-h-36 overflow-y-auto">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-pink-400 text-white border-pink-500 font-semibold'
                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Reset Filter Button */}
        {(filters.search || filters.category !== 'Tất cả' || filters.tags.length > 0) && (
          <button
            onClick={handleResetFilters}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-500 hover:bg-rose-50 font-cute py-2 rounded-xl border border-dashed border-rose-200 transition-all mt-auto"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Xóa toàn bộ bộ lọc
          </button>
        )}

        {/* Footer info card */}
        <div className="mt-auto p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 hidden lg:block">
          <p className="text-[10px] text-emerald-700 font-medium leading-relaxed italic">
            "Thêm chút ngọt ngào cho những câu chuyện của bạn cùng Soda Kem! 🍧"
          </p>
        </div>

      </aside>

      {/* RIGHT CONTENT WORKSPACE */}
      <section className="flex-1 flex flex-col min-w-0 p-4 md:p-8 lg:h-screen lg:overflow-y-auto">
        
        {/* TOP STATUS ROW */}
        <header className="flex justify-between items-center mb-6">
          <div className="text-[11px] font-cute text-pink-500/80 bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/50">
            {filteredCharacters.length} nhân vật được tìm thấy
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-all text-soda-pink-dark hover:text-rose-600 shadow-sm cursor-pointer"
            title="Chuyển đổi giao diện"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </header>

        {/* CHARACTER GRID (4 columns format) */}
        {filteredCharacters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] border-4 border-dashed border-pink-200 p-12 text-center max-w-md mx-auto my-auto shadow-sm"
          >
            <span className="text-5xl block mb-4">🥺</span>
            <h3 className="text-lg font-cute text-soda-brown mb-2">
              Chưa tìm thấy nhân vật nào mất rồi!
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              Cậu có thể thử đổi từ khóa khác, bớt các thẻ lọc đi, hoặc tự tay viết và đăng lên nhân vật siêu dễ thương của chính mình nha!
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                onClick={handleResetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-cute text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-pink-400 hover:bg-pink-500 text-white font-cute text-xs px-4 py-2.5 rounded-xl transition-all border-b-2 border-pink-600 active:translate-y-0.5"
              >
                Đăng nhân vật mới ngay
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 flex-grow flex flex-col justify-start">
            <div className="space-y-4">
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCharacters.map((char) => {
                    const charIndex = characters.findIndex(c => c.id === char.id);
                    return (
                      <div key={char.id} className="relative group">
                        <CharacterCard
                          character={char}
                          isFavorite={favorites.includes(char.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onSelect={handleOpenDetail}
                          index={charIndex !== -1 ? charIndex : 0}
                        />

                        {/* Custom character deletion option */}
                        {char.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCharacter(char.id, e)}
                            title="Xóa nhân vật này"
                            className="absolute top-12 right-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        )}

        {/* BOTTOM SOCIAL LINKS & WELCOME MESSAGE */}
        <footer className="mt-12 pt-6 border-t-2 border-dashed border-soda-pink-medium/30 flex flex-col items-center justify-center gap-3 pb-4">
          <p className="text-lg font-cute text-soda-brown tracking-wide">
            Chào mừng tới tiệm của Kem ✨
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href="https://www.facebook.com/share/1DStJT9uJ3/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-cute text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span className="text-xs">📘</span> Fanpage
            </a>
            <a
              href="https://discord.gg/xQuhdX73kH"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-cute text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span className="text-xs">💬</span> Discord
            </a>
          </div>
        </footer>

      </section>

      {/* HIDDEN AUDIO TAG */}
      <audio 
        ref={audioRef} 
        src={PLAYLIST[currentSongIndex].url}
        loop={PLAYLIST.length === 1}
        onEnded={() => setCurrentSongIndex(prev => (prev + 1) % PLAYLIST.length)} 
      />

      {/* RANDOM HUSBAND POPUP MODAL */}
      <AnimatePresence>
        {randomHusband && !isShuffling && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-white border-4 border-pink-200 rounded-[32px] p-6 shadow-2xl relative overflow-hidden text-center"
            >
              {/* Confetti Sparkles background */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-amber-400 to-emerald-400" />
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-100 rounded-full blur-2xl pointer-events-none" />
              
              <span className="text-4xl block mb-2 animate-bounce">💖💍</span>
              <h3 className="text-xl font-cute text-pink-600 mb-1">
                Chồng Hôm Nay Của Iu Là...
              </h3>
              <p className="text-[10px] text-slate-400 font-cute mb-4">
                Được định mệnh tiệm Kem gắn kết ✨
              </p>

              <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100 mb-5 relative group">
                <div className="text-xl font-cute text-slate-800 mb-1">
                  {randomHusband.name}
                </div>
                <div className="text-[9px] font-bold text-emerald-600 mb-2 uppercase tracking-wide bg-emerald-50 inline-block px-2.5 py-0.5 rounded-full">
                  {randomHusband.category}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                  "{randomHusband.shortDescription}"
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-3">
                  {randomHusband.tags.map(t => (
                    <span key={t} className="text-[9px] bg-pink-100/70 text-pink-700 px-1.5 py-0.5 rounded-md font-cute">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleOpenDetail(randomHusband);
                    setRandomHusband(null);
                  }}
                  className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-cute rounded-xl transition-all shadow-md bubbly-shadow-sm"
                >
                  Đọc cốt truyện tình yêu ngay ✨
                </button>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={handleRandomHusband}
                    className="py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-cute rounded-xl transition-all shadow"
                  >
                    Chọn lại 🎲
                  </button>
                  <button
                    onClick={() => setRandomHusband(null)}
                    className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-cute rounded-xl transition-all"
                  >
                    Đóng 🌸
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHARACTER DETAILED PREVIEW MODAL */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetail
            character={selectedCharacter}
            isFavorite={favorites.includes(selectedCharacter.id)}
            onToggleFavorite={handleToggleFavorite}
            initialTab={detailTab}
            onClose={() => setSelectedCharacter(null)}
            onAddReview={handleAddReview}
            onEditReview={handleEditReview}
            index={characters.findIndex(c => c.id === selectedCharacter.id)}
          />
        )}
      </AnimatePresence>

      {/* ADD NEW CHARACTER FORM MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddCharacterModal
            onClose={() => setIsAddModalOpen(false)}
            onAdd={(newChar) => {
              handleAddCharacter(newChar);
              setIsAddModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
