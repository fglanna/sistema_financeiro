import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega e valida os dados do usuário autenticado a partir do token
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (err) {
      // Se o token for inválido ou expirado, limpa o armazenamento
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Autenticação por e-mail e senha
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Não foi possível realizar o login. Verifique suas credenciais.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Cadastro de novo usuário
  const register = async ({ name, email, password, initial_balance }) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        initial_balance: initial_balance !== undefined && initial_balance !== '' ? Number(initial_balance) : 0,
      });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Ocorreu um erro ao realizar o cadastro. Tente novamente.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Encerramento de sessão
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Atualização dos dados do perfil
  const updateProfile = async ({ name, initial_balance }) => {
    setError(null);
    try {
      const payload = {};
      if (name !== undefined) payload.name = name;
      if (initial_balance !== undefined && initial_balance !== '') {
        payload.initial_balance = Number(initial_balance);
      }

      const response = await api.put('/users/me', payload);
      const updatedUser = response.data.user || response.data;

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
      }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));

      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Ocorreu um erro ao atualizar os dados do perfil.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Exclusão definitiva de conta (RN10)
  const deleteAccount = async () => {
    setError(null);
    try {
      await api.delete('/users/me');
      logout();
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Ocorreu um erro ao tentar excluir sua conta.';
      setError(message);
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        refreshUser: loadUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
