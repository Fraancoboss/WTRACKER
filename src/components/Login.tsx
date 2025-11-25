import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Usuario } from '../types';
import logoImage from '../assets/logoWTRACKER.jpeg';

interface LoginProps {
  onLogin: (usuario: Usuario) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Usuarios de ejemplo para diferentes roles
  const usuarios: Record<string, { password: string; data: Usuario }> = {
    'admin': {
      password: 'admin123',
      data: {
        id: 'USR-001',
        nombre: 'Administrador',
        rol: 'Admin',
        modulosAsignados: ['Fabricación', 'Cristal', 'Persianas', 'Transporte'],
      },
    },
    'oficina': {
      password: 'oficina123',
      data: {
        id: 'USR-002',
        nombre: 'María López',
        rol: 'Oficina',
        modulosAsignados: [],
      },
    },
    'carlos': {
      password: 'carlos123',
      data: {
        id: 'USR-003',
        nombre: 'Carlos Pérez',
        rol: 'Fabricación',
        modulosAsignados: ['Fabricación'],
      },
    },
    'maria': {
      password: 'maria123',
      data: {
        id: 'USR-004',
        nombre: 'María González',
        rol: 'Cristal',
        modulosAsignados: ['Cristal'],
      },
    },
    'juan': {
      password: 'juan123',
      data: {
        id: 'USR-005',
        nombre: 'Juan Martínez',
        rol: 'Persianas',
        modulosAsignados: ['Persianas'],
      },
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usuarioData = usuarios[username.toLowerCase()];

    if (!usuarioData) {
      setError('Usuario no encontrado');
      return;
    }

    if (usuarioData.password !== password) {
      setError('Contraseña incorrecta');
      return;
    }

    onLogin(usuarioData.data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Logo en esquina superior izquierda */}
      <div className="p-6">
        <img src={logoImage} alt="WTRACKER Logo" className="h-16" />
      </div>

      {/* Formulario centrado */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-200">
          <h1 className="text-center text-gray-800 mb-8">WTRACKER</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-gray-900">
                  Usuario:
                </Label>
                <Input
                  id="usuario"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white border-gray-300"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">
                  Contraseña:
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-gray-300"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#007BFF] hover:bg-[#0056b3] text-white py-6"
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Información de usuarios de prueba */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-3">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><strong>admin</strong> / admin123 (Administrador)</p>
              <p><strong>oficina</strong> / oficina123 (Oficina)</p>
              <p><strong>carlos</strong> / carlos123 (Fabricación)</p>
              <p><strong>maria</strong> / maria123 (Cristal)</p>
              <p><strong>juan</strong> / juan123 (Persianas)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
