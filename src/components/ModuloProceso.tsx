import { useEffect, useState } from 'react';
import { Wrench, Square as WindowIcon, Blinds, Truck } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ModuloDetalle, Modulo, EstadoModulo, Usuario } from '../types';
import { formatDate } from '../lib/formatDate';

interface ModuloProcesoProps {
  tipo: Modulo;
  datos: ModuloDetalle;
  usuario: Usuario;
  onUpdate: (datos: ModuloDetalle) => void;
}

const estadoOpciones: EstadoModulo[] = ['Completado', 'En proceso', 'Pendiente', 'Bloqueado'];

export function ModuloProceso({ tipo, datos, usuario, onUpdate }: ModuloProcesoProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ModuloDetalle>(datos);

  useEffect(() => {
    setFormData(datos);
  }, [datos]);

  const moduloConfig = {
    Fabricación: {
      gradient: 'from-blue-50 to-white',
      icon: Wrench,
      border: 'border-blue-200',
      label: 'Fabricación',
    },
    Cristal: {
      gradient: 'from-emerald-50 to-white',
      icon: WindowIcon,
      border: 'border-emerald-200',
      label: 'Cristal',
    },
    Persianas: {
      gradient: 'from-amber-50 to-white',
      icon: Blinds,
      border: 'border-amber-200',
      label: 'Persianas',
    },
    Transporte: {
      gradient: 'from-rose-50 to-white',
      icon: Truck,
      border: 'border-rose-200',
      label: 'Transporte',
    },
  } as const;

  const config = moduloConfig[tipo];
  const Icon = config.icon;

  const canEdit =
    usuario.rol === 'Admin' ||
    usuario.rol === 'Oficina' ||
    usuario.modulosAsignados.includes(tipo);

  const handleSave = () => {
    onUpdate(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData(datos);
    setEditMode(false);
  };

  return (
    <Card className={`rounded-[28px] border ${config.border} bg-gradient-to-br ${config.gradient} p-6 shadow-[0_25px_55px_-35px_rgba(15,23,42,0.45)]`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">{config.label}</h3>
        </div>
        {canEdit && !editMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(true)}
            className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            Editar
          </Button>
        )}
      </div>

      {editMode ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${tipo}-estado`} className="text-slate-600">
              Estado
            </Label>
            <Select
              value={formData.estado}
              onValueChange={(value: EstadoModulo) =>
                setFormData({ ...formData, estado: value })
              }
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estadoOpciones.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${tipo}-inicio`} className="text-slate-600">
                Fecha de inicio
              </Label>
              <Input
                id={`${tipo}-inicio`}
                type="date"
                value={formData.fechaInicio || ''}
                onChange={(e) =>
                  setFormData({ ...formData, fechaInicio: e.target.value })
                }
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${tipo}-fin`} className="text-slate-600">
                Fecha de fin
              </Label>
              <Input
                id={`${tipo}-fin`}
                type="date"
                value={formData.fechaFin || ''}
                onChange={(e) =>
                  setFormData({ ...formData, fechaFin: e.target.value })
                }
                className="border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${tipo}-operario`} className="text-slate-600">
              Operario
            </Label>
            <Input
              id={`${tipo}-operario`}
              value={formData.operario || ''}
              onChange={(e) =>
                setFormData({ ...formData, operario: e.target.value })
              }
              className="border-slate-200"
              placeholder="Nombre del operario"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${tipo}-observaciones`} className="text-slate-600">
              Observaciones
            </Label>
            <Textarea
              id={`${tipo}-observaciones`}
              value={formData.observaciones || ''}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="border-slate-200"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              Guardar
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="rounded-full border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-slate-500 text-sm mb-1">Estado</p>
            <Badge className="rounded-full bg-slate-900/5 text-slate-700 border border-slate-200">
              {datos.estado}
            </Badge>
          </div>
          {(datos.fechaInicio || datos.fechaFin) && (
            <div className="grid grid-cols-2 gap-3">
              {datos.fechaInicio && (
                <div>
                  <p className="text-slate-500 text-sm mb-1">Inicio</p>
                  <p className="text-slate-900">{formatDate(datos.fechaInicio)}</p>
                </div>
              )}
              {datos.fechaFin && (
                <div>
                  <p className="text-slate-500 text-sm mb-1">Fin</p>
                  <p className="text-slate-900">{formatDate(datos.fechaFin)}</p>
                </div>
              )}
            </div>
          )}
          {datos.operario && (
            <div>
              <p className="text-slate-500 text-sm mb-1">Operario</p>
              <p className="text-slate-900">{datos.operario}</p>
            </div>
          )}
          {datos.observaciones && (
            <div>
              <p className="text-slate-500 text-sm mb-1">Observaciones</p>
              <p className="text-slate-900">{datos.observaciones}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
