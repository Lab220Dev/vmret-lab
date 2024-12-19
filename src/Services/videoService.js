import axios from '@/axios.js';

const videoService = {
  async uploadVideo(file, dmId, customName, onProgress) {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('dmId', dmId);
    formData.append('customName', customName);

    try {
      const response = await axios.post('/video/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload de vídeo:', error.message);
      throw error;
    }
  },
};

export default videoService;
