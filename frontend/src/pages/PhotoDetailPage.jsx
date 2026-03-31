import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import photoApi from '../api/photoApi';
import albumApi from '../api/albumApi';
import toast from 'react-hot-toast';
import { Heart, Download, ArrowLeft, Edit, Trash2, Info, Maximize, HardDrive, Share2 } from 'lucide-react';

// Hàm hỗ trợ đổi Bytes sang KB/MB
const formatSize = (bytes) => {
  if (!bytes) return "N/A";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

// Component Skeleton cho trạng thái đang tải
const DetailSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-10">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-32 mb-6" />
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border dark:border-gray-700">
      <div className="md:w-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse h-[500px]" />
      <div className="md:w-1/3 p-8 space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-full" />
        <div className="h-20 bg-gray-100 dark:bg-gray-600 animate-pulse rounded w-full" />
        <div className="h-32 bg-gray-50 dark:bg-gray-900/50 animate-pulse rounded w-full" />
        <div className="flex gap-3">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex-1" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex-1" />
        </div>
      </div>
    </div>
  </div>
);

export default function PhotoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', album_id: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [photoRes, albumsRes] = await Promise.all([
          photoApi.getOne(id),
          albumApi.getAll()
        ]);
        setPhoto(photoRes);
        setAlbums(albumsRes);
        setEditData({ 
          title: photoRes.title, 
          description: photoRes.description, 
          album_id: photoRes.album_id 
        });
      } catch (err) {
        console.error(err);
        toast.error("Không tìm thấy ảnh!");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleToggleFavorite = async () => {
    try {
      const updated = await photoApi.toggleFavorite(id);
      setPhoto(updated);
      if (updated.is_favorite) toast.success("Đã thêm vào yêu thích ❤️");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi thao tác!");
    }
  };

  const handleShare = async () => {
    try {
      const data = await photoApi.generateShareLink(id);
      const shareUrl = `${window.location.origin}/s/${data.share_uuid}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Đã copy link chia sẻ! 🔗");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tạo link chia sẻ");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const tid = toast.loading("Đang lưu thay đổi...");
    try {
      const updated = await photoApi.update(id, editData);
      setPhoto(updated);
      setIsEditing(false);
      toast.success("Đã cập nhật thành công!", { id: tid });
    } catch (err) {
      console.error(err);
      toast.error("Lỗi cập nhật!", { id: tid });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn ảnh này?")) {
      const tid = toast.loading("Đang xóa ảnh...");
      try {
        await photoApi.delete(id);
        toast.success("Đã xóa ảnh thành công.", { id: tid });
        navigate('/');
      } catch (err) {
        console.error(err);
        toast.error("Lỗi xóa ảnh!", { id: tid });
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"><DetailSkeleton /></div>;
  if (!photo) return null;

  const fullImageUrl = `http://localhost:8000${photo.image_url}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline">
          <ArrowLeft size={20} className="mr-2" /> Quay lại thư viện
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border dark:border-gray-700">
          {/* KHU VỰC HIỂN THỊ ẢNH */}
          <div className="md:w-2/3 bg-black flex items-center justify-center p-2">
            <img src={fullImageUrl} alt={photo.title} className="max-w-full max-h-[75vh] object-contain" />
          </div>

          {/* KHU VỰC THÔNG TIN */}
          <div className="md:w-1/3 p-8 flex flex-col justify-between">
            <div>
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Tiêu đề</label>
                    <input type="text" className="w-full text-2xl font-bold border-b-2 border-blue-500 dark:bg-gray-700 dark:text-white outline-none py-1" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Album</label>
                    <select 
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 mt-1"
                      value={editData.album_id || ""}
                      onChange={(e) => setEditData({...editData, album_id: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">Không thuộc Album nào</option>
                      {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Mô tả</label>
                    <textarea className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 mt-1" rows="4" value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">Lưu</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 py-2 rounded-lg">Hủy</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white leading-tight">{photo.title}</h2>
                      <button onClick={handleToggleFavorite} className="hover:scale-110 transition-transform">
                        <Heart size={28} className={photo.is_favorite ? "fill-red-500 text-red-500" : "text-gray-300 dark:text-gray-600"} />
                      </button>
                    </div>
                  </div>
                  
                  {/* THÔNG SỐ KỸ THUẬT */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Info size={14} /> Thông số</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2"><Maximize size={16} /> {photo.width}x{photo.height} px</div>
                      <div className="flex items-center gap-2"><HardDrive size={16} /> {formatSize(photo.size)}</div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mt-6 italic whitespace-pre-wrap">{photo.description || "Không có mô tả cho ảnh này."}</p>
                  
                  <div className="flex flex-col gap-2 mt-8">
                    <button onClick={handleShare} className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20">
                      <Share2 size={20} /> Chia sẻ ảnh
                    </button>
                    <a href={fullImageUrl} download={photo.title} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-gray-800 dark:bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-black dark:hover:bg-gray-600 transition-colors">
                      <Download size={20} /> Tải về máy
                    </a>
                  </div>
                </>
              )}
            </div>

            {!isEditing && (
              <div className="mt-10 flex gap-3 border-t dark:border-gray-700 pt-6">
                <button onClick={() => setIsEditing(true)} className="flex-1 flex justify-center items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-3 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  <Edit size={18} /> Sửa
                </button>
                <button onClick={handleDelete} className="flex-1 flex justify-center items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                  <Trash2 size={18} /> Xóa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}