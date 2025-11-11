import { Chat, Message } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }
  return response.json();
}

export const getChats = (): Promise<Chat[]> => {
  return fetch(`${API_BASE_URL}/chats`).then(res => handleResponse<Chat[]>(res));
};

export const getMessages = (chatId: string): Promise<Message[]> => {
  return fetch(`${API_BASE_URL}/messages/${chatId}`).then(res => handleResponse<Message[]>(res));
};

export const createMessage = (chatId: string, senderId: string, content: { text?: string; audio?: { dataUrl: string }}): Promise<Message> => {
  return fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chatId, senderId, ...content }),
  }).then(res => handleResponse<Message>(res));
};
