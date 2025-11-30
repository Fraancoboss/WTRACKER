import { useState } from 'react';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function Login() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const highlights = [
    {
      icon: ShieldCheck,
      title: 'Permisos por módulo',
      description: 'Cada operario sólo gestiona las fases asignadas.',
    },
    {
      icon: Sparkles,
      title: 'Datos en vivo',
      description: 'Incidencias, transporte y estados al instante.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(nombre, password);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-frame motion-safe:animate-[fade-slide_0.35s_ease_forwards]">
        <div className="login-hero">
          <div>
            <p className="login-hero__badge">WTRACKER</p>
            <h1 className="login-hero__title">Control integral de la fabricación</h1>
            <p className="login-hero__text">
              Supervisa pedidos, registra incidencias y comparte información con los equipos de planta y oficina desde un único panel.
            </p>
          </div>

          <div className="login-hero__benefits">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div className="login-benefit" key={item.title}>
                  <div className="login-benefit__icon">
                    <Icon />
                  </div>
                  <div>
                    <p className="login-benefit__title">{item.title}</p>
                    <p className="login-benefit__text">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="login-hero__footer">Fabricación · Cristal · Persianas · Transporte</p>
        </div>

        <div className="login-card panel-card">
          <div className="login-card__header">
            <p className="login-card__eyebrow">Bienvenido</p>
            <h2 className="login-card__title">Inicia sesión para continuar</h2>
            <p className="login-card__subtitle">Introduce tus credenciales asignadas por administración.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="nombre" className="login-label">
                Usuario
              </label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                required
                placeholder="Ej. maria.lopez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                className="login-input"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="login-input"
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <Button type="submit" variant="blue" disabled={loading} className="login-submit">
              {loading ? <Loader2 className="login-submit__spinner" /> : 'Entrar en Wtracker'}
            </Button>

            <p className="login-footer">¿Problemas para entrar? Contacta con sistemas para restaurar tu acceso.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
