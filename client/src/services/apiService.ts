import { Chat, Message, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : null;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let error;
    try {
        error = await response.json();
    } catch (e) {
        error = { message: await response.text() };
    }
    throw new Error(error.error || `API request failed with status ${response.status}`);
  }
  return response.json();
}

const apiFetch = (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
};


// Auth
export const login = (credentials: Pick<User, 'name'> & { password?: string }): Promise<{ token: string, user: User}> => {
  return fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then(res => handleResponse(res));
};

export const register = (userInfo: Pick<User, 'name'> & { password?: string }): Promise<{ token: string, user: User}> => {
  return fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInfo),
  }).then(res => handleResponse(res));
};


// Chats
export const getChats = (): Promise<Chat[]> => {
  return apiFetch('/chats').then(res => handleResponse<Chat[]>(res));
};

// Messages
export const getMessages = (chatId: string): Promise<Message[]> => {
  return apiFetch(`/messages/${chatId}`).then(res => handleResponse<Message[]>(res));
};

export const createMessage = (chatId: string, content: { text?: string; audio?: { dataUrl: string }}): Promise<Message> => {
  return apiFetch(`/messages`, {
    method: 'POST',
    body: JSON.stringify({ chatId, ...content }),
  }).then(res => handleResponse<Message>(res));
};