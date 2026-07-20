import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Execute code
export const executeCode = async (code: string, language: string = 'python', input: string = '') => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/code/execute`,
      { code, language, input },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Code execution failed');
    }
    throw new Error('Failed to execute code. Please check your connection.');
  }
};

// Validate code syntax
export const validateCode = async (code: string, language: string = 'python') => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/code/validate`,
      { code, language },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Code validation failed');
    }
    throw new Error('Failed to validate code. Please check your connection.');
  }
};
