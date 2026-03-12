import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useTranslation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translate = async (inputText, direction, apiKey, model) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/translate`, {
        input_text: inputText,
        direction,
        api_key: apiKey,
        model,
      });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'An error occurred';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (apiKey) => {
    setError(null);
    const response = await axios.get(`${API_URL}/models`, {
      params: { api_key: apiKey },
    });
    return response.data;
  };

  return { translate, fetchModels, loading, error };
};
