import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import photoApi from '../api/photoApi';
import albumApi from '../api/albumApi';
import UploadModal from '../components/UploadModal';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Heart, Folder, Image as ImageIcon, Plus, LogOut, Search, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

const PhotoSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
    <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4" />
      <div className="h-3 bg-gray-100 dark:bg-gray-600 animate-pulse rounded w-1/2" />
    </div>
  </div>
);

export default function HomePage() {
  const { logout } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const fetchAlbums = useCallback(async () => {
    setLoadingAlbums(true);
    try {
      const data = await albumApi.getAll();
      setAlbums(data);
    } catch (err) { 
      console.error(err); // Sửa lỗi ESLint
      toast.error("Không thể tải danh sách album"); 
    } finally { 
      setLoadingAlbums(false); 
    }
  }, []);

  const fetchPhotos = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      const data = await photoApi.getAll({ search: searchTerm, album_id: selectedAlbumId });
      setPhotos(data);
    } catch (err) { 
      console.error(err); // Sửa lỗi ESLint
      toast.error("Không thể tải ảnh"); 
    } finally { 
      setLoadingPhotos(false); 
    }
  }, [searchTerm, selectedAlbumId]);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);
  useEffect(() => {
    const delay = setTimeout(() => fetchPhotos(), 500);
    return () => clearTimeout(delay);
  }, [fetchPhotos]);

  const handleCreateAlbum = async () => {
    const name = prompt("Nhập tên Album mới:");
    if (name) {
      try {
        await albumApi.create({ name });
        toast.success("Đã tạo album!");
        fetchAlbums();
      } catch (err) { 
        console.error(err); // Sửa lỗi ESLint
        toast.error("Lỗi tạo album"); 
      }
    }
  };

  const handleToggleFavorite = async (e, photoId) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const updated = await photoApi.toggleFavorite(photoId);
      setPhotos(prev => prev.map(p => p.id === photoId ? updated : p));
    } catch (err) { 
      console.error(err); // Sửa lỗi ESLint
      toast.error("Lỗi thao tác"); 
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2"><ImageIcon /> Gallery</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button onClick={() => setSelectedAlbumId(null)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${!selectedAlbumId ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <ImageIcon size={20} /> Tất cả ảnh
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Albums</div>
          {loadingAlbums ? (
            <div className="px-4 space-y-3 mt-2">
              <div className="h-4 bg-gray-100 dark:bg-gray-700 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 animate-pulse rounded w-full" />
            </div>
          ) : (
            albums.map(album => (
              <button key={album.id} onClick={() => setSelectedAlbumId(album.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${selectedAlbumId === album.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <Folder size={20} /> {album.name}
              </button>
            ))
          )}
          <button onClick={handleCreateAlbum} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-dashed border-blue-100 dark:border-blue-900 mt-2">
            <Plus size={20} /> Tạo Album mới
          </button>
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><LogOut size={20} /> Đăng xuất</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-10 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Tìm kiếm ảnh..." className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white border-none rounded-full focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:ring-2 ring-blue-400 transition-all">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 shadow-lg transition-all">+ Tải ảnh lên</button>
          </div>
        </header>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {selectedAlbumId ? albums.find(a => a.id === selectedAlbumId)?.name : "Tất cả ảnh"}
          </h2>
          {loadingPhotos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <PhotoSkeleton key={i} />)}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Không tìm thấy bức ảnh nào.</div>
          ) : (
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
              <Masonry gutter="20px">
                {photos.map((photo) => (
                  <Link to={`/photo/${photo.id}`} key={photo.id} className="group relative block bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 dark:border-gray-700">
                    <button onClick={(e) => handleToggleFavorite(e, photo.id)} className="absolute top-3 right-3 z-20 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-transform">
                      <Heart size={18} className={photo.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-gray-500"} />
                    </button>
                    <img src={`http://localhost:8000${photo.image_url}`} alt={photo.title} className="w-full block group-hover:scale-105 transition-transform duration-500" />
                    <div className="p-4"><h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{photo.title}</h3></div>
                  </Link>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </div>
      </main>
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUploadSuccess={fetchPhotos} albums={albums} />
    </div>
  );
}