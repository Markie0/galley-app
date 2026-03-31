import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import photoApi from '../api/photoApi';
import { Maximize, HardDrive, Info } from 'lucide-react';

export default function SharedPhotoPage() {
  const { uuid } = useParams();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPhoto = async () => {
      try {
        const data = await photoApi.getPublicPhoto(uuid);
        setPhoto(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchPublicPhoto();
  }, [uuid]);

  if (loading) return <div className="text-center mt-20">Đang tải ảnh chia sẻ...</div>;
  if (!photo) return <div className="text-center mt-20 text-red-500 font-bold">Liên kết không tồn tại.</div>;

  return (
    <div className="min-h-screen bg-gray-900 py-10 flex items-center">
      <div className="max-w-5xl mx-auto px-4 w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-2/3 bg-black flex items-center justify-center">
            <img src={`http://localhost:8000${photo.image_url}`} alt={photo.title} className="max-w-full max-h-[80vh] object-contain" />
          </div>
          <div className="md:w-1/3 p-8">
            <h2 className="text-3xl font-bold text-gray-800">{photo.title}</h2>
            <p className="text-gray-500 mt-4 italic">{photo.description || "Không có mô tả."}</p>
            <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Info size={14} /> Thông số ảnh</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Maximize size={16} /> {photo.width}x{photo.height} px</div>
                <div className="flex items-center gap-2"><HardDrive size={16} /> {(photo.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <p className="mt-10 text-xs text-gray-400 text-center italic">Được chia sẻ qua My Gallery App</p>
          </div>
        </div>
      </div>
    </div>
  );
}