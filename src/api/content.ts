import axios from 'axios';

export const updateContentOrder = async (
  courseId: string,
  updates: { id: string; type: 'LESSON' | 'TEST'; order: number }[],
): Promise<{ error: Error | null }> => {
  try {
    const promises = updates.map(({ id, type, order }) => {
      const endpoint =
        type === 'LESSON' ? '/api/lessons/order' : '/api/tests/order';
      return axios.patch(endpoint, {
        id,
        order,
      });
    });

    await Promise.all(promises);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};
