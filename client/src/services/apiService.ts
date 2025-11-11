import { Chat, Message, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : null;
};

async function handleResponse<T>(response: Response): Promise<T> {
  // Сначала читаем тело ответа как текст, чтобы избежать ошибки "body stream already read"
  const bodyText = await response.text();

  if (!response.ok) {
    try {
      // Пытаемся парсить текст как JSON, чтобы получить структурированную ошибку
      const errorJson = JSON.parse(bodyText);
      throw new Error(errorJson.error || `API request failed with status ${response.status}`);
    } catch (e) {
      // Если тело ответа - не JSON (например, HTML-страница ошибки от Vercel),
      // выбрасываем сам текст как ошибку.
      throw new Error(bodyText || `API request failed with status ${response.status}`);
    }
  }

  // Если ответ успешный, парсим текст как JSON.
  // Обрабатываем случай с пустым телом ответа (например, для статуса 204 No Content).
  return bodyText ? JSON.parse(bodyText) : null as T;
}

const apiFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    return handleResponse<T>(response);
};


// Auth
export const login = (credentials: Pick<User, 'name'> & { password?: string }): Promise<{ token: string, user: User}> => {
  return apiFetch<{ token: string, user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const register = (userInfo: Pick<User, 'name'> & { password?: string }): Promise<{ token: string, user: User}> => {
  return apiFetch<{ token: string, user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userInfo),
  });
};

// Users
export const searchUsers = (query: string): Promise<User[]> => {
  return apiFetch<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
};


// Chats
export const getChats = (): Promise<Chat[]> => {
  return apiFetch<Chat[]>('/chats');
};

export const createChat = (partnerId: string): Promise<Chat> => {
    return apiFetch<Chat>('/chats', {
        method: 'POST',
        body: JSON.stringify({ partnerId }),
    });
};

// Messages
export const getMessages = (chatId: string): Promise<Message[]> => {
  return apiFetch<Message[]>(`/messages/${chatId}`);
};

export const createMessage = (chatId: string, content: { text?: string; audio?: { dataUrl: string }}): Promise<Message> => {
  return apiFetch<Message>(`/messages`, {
    method: 'POST',
    body: JSON.stringify({ chatId, ...content }),
  });
};