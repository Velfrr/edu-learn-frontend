import axios from 'axios';

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string,
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);
    formData.append('bucket', bucket);

    const response = await axios.post('/api/files/upload', formData);
    return { url: response.data.url, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
};

export const deleteFile = async (
  path: string,
  bucket: string,
): Promise<{ error: Error | null }> => {
  try {
    const response = await axios.delete('/api/files/delete', {
      data: { path, bucket },
    });

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};
