import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import photoApi from '../api/photoApi';
import toast from 'react-hot-toast';
import { X, UploadCloud } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess, albums }) {
  const [uploadData, setUploadData] = useState({ title: '', description: '', file: null, album_id: '' });
  const [loading, setLoading] = useState(false);

  // Xử lý kéo thả file
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadData((prev) => ({ ...prev, file: acceptedFiles[0] }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] }, 
    maxFiles: 1 
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return toast.error("Vui lòng chọn hoặc kéo thả 1 bức ảnh!");

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('file', uploadData.file);
    if (uploadData.album_id) {
      formData.append('album_id', uploadData.album_id);
    }

    const tid = toast.loading('Đang tải ảnh lên hệ thống...');
    setLoading(true);

    try {
      await photoApi.upload(formData);
      toast.success('Tải ảnh lên thành công! 🎉', { id: tid });
      setUploadData({ title: '', description: '', file: null, album_id: '' });
      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Upload thất bại! Vui lòng thử lại.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border dark:border-gray-700 relative transform transition-all">
        {/* Nút đóng nhanh */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 dark:text-white">Tải ảnh mới</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tiêu đề</label>
            <input
              type="text" required placeholder="Ví dụ: Chuyến đi Đà Lạt..."
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
              onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Chọn Album</label>
            <select 
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-all"
              value={uploadData.album_id}
              onChange={(e) => setUploadData({...uploadData, album_id: e.target.value})}
            >
              <option value="">Không thuộc Album nào</option>
              {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* KHU VỰC KÉO THẢ */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Hình ảnh</label>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <UploadCloud size={40} className="text-gray-400" />
                {uploadData.file ? (
                  <p className="text-green-600 dark:text-green-400 font-bold truncate w-full px-4">
                    {uploadData.file.name}
                  </p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Kéo thả ảnh vào đây hoặc click để chọn</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-all">
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-lg shadow-blue-900/20"
            >
              {loading ? 'Đang xử lý...' : 'Tải lên ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}