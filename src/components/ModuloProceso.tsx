import { useState } from 'react';
import { Wrench, Square as WindowIcon, Blinds, Truck } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ModuloDetalle, ModuloTransporteDetalle, Modulo, EstadoModulo, Usuario } from '../types';

interface ModuloProcesoProps {
  tipo: Modulo | 'Transporte';
  datos: ModuloDetalle | ModuloTransporteDetalle;
  usuario: Usuario;
  onUpdate: (datos: ModuloDetalle | ModuloTransporteDetalle) => void;
}

export function ModuloProceso({ tipo, datos, usuario, onUpdate }: ModuloProcesoProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(datos);

  const moduloConfig = {
    'Fabricación': { color: 'bg-blue-500', icon: Wrench, label: '🧱 Fabricación' },
    'Cristal': { color: 'bg-green-500', icon: WindowIcon, label: '🪟 Cristal' },
    'Persianas': { color: 'bg-orange-500', icon: Blinds, label: '🌀 Persianas' },
    'Transporte': { color: 'bg-red-500', icon: Truck, label: '🚚 Transporte' },
  };

  const config = moduloConfig[tipo];
  const Icon = config.icon;

  const canEdit = usuario.rol === 'Admin' || usuario.rol === 'Oficina' || usuario.modulosAsignados.includes(tipo as Modulo);

  const handleSave = () => {
    onUpdate(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData(datos);
    setEditMode(false);
  };

  const isTransporte = tipo === 'Transporte';
  const datosModulo = datos as ModuloDetalle;
  const datosTransporte = datos as ModuloTransporteDetalle;
  const formDataModulo = formData as ModuloDetalle;
  const formDataTransporte = formData as ModuloTransporteDetalle;

  return (
    <Card className={`${config.color} text-white p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8" />
          <h3 className="text-white">{config.label}</h3>
        </div>
        {canEdit && !editMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(true)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Editar
          </Button>
        )}
      </div>

      {editMode ? (
        <div className="space-y-4">
          {isTransporte ? (
            <>
              <div className="space-y-2">
                <Label htmlFor={`${tipo}-estado`} className="text-white">Estado</Label>
                <Select
                  value={formDataTransporte.estado ? 'si' : 'no'}
                  onValueChange={(value) => 
                    setFormData({ ...formDataTransporte, estado: value === 'si' })
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">Sí</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${tipo}-observaciones`} className="text-white">Observaciones</Label>
                <Textarea
                  id={`${tipo}-observaciones`}
                  value={formDataTransporte.observaciones}
                  onChange={(e) => 
                    setFormData({ ...formDataTransporte, observaciones: e.target.value })
                  }
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor={`${tipo}-estado`} className="text-white">Estado</Label>
                <Select
                  value={formDataModulo.estado}
                  onValueChange={(value: EstadoModulo) => 
                    setFormData({ ...formDataModulo, estado: value })
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`${tipo}-fechaInicio`} className="text-white">Fecha Inicio</Label>
                  <Input
                    id={`${tipo}-fechaInicio`}
                    type="date"
                    value={formDataModulo.fechaInicio || ''}
                    onChange={(e) => 
                      setFormData({ ...formDataModulo, fechaInicio: e.target.value })
                    }
                    className="bg-white/10 border-white/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${tipo}-fechaFin`} className="text-white">Fecha Fin</Label>
                  <Input
                    id={`${tipo}-fechaFin`}
                    type="date"
                    value={formDataModulo.fechaFin || ''}
                    onChange={(e) => 
                      setFormData({ ...formDataModulo, fechaFin: e.target.value })
                    }
                    className="bg-white/10 border-white/30 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${tipo}-operario`} className="text-white">Operario</Label>
                <Input
                  id={`${tipo}-operario`}
                  value={formDataModulo.operario}
                  onChange={(e) => 
                    setFormData({ ...formDataModulo, operario: e.target.value })
                  }
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  placeholder="Nombre del operario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${tipo}-observaciones`} className="text-white">Observaciones</Label>
                <Textarea
                  id={`${tipo}-observaciones`}
                  value={formDataModulo.observaciones}
                  onChange={(e) => 
                    setFormData({ ...formDataModulo, observaciones: e.target.value })
                  }
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Guardar
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {isTransporte ? (
            <>
              <div>
                <p className="text-white/80 text-sm mb-1">Estado</p>
                <Badge className="bg-white/20 text-white border-white/30">
                  {datosTransporte.estado ? 'Sí' : 'No'}
                </Badge>
              </div>
              {datosTransporte.observaciones && (
                <div>
                  <p className="text-white/80 text-sm mb-1">Observaciones</p>
                  <p className="text-white">{datosTransporte.observaciones}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <p className="text-white/80 text-sm mb-1">Estado</p>
                <Badge className="bg-white/20 text-white border-white/30">
                  {datosModulo.estado}
                </Badge>
              </div>
              {(datosModulo.fechaInicio || datosModulo.fechaFin) && (
                <div className="grid grid-cols-2 gap-3">
                  {datosModulo.fechaInicio && (
                    <div>
                      <p className="text-white/80 text-sm mb-1">Inicio</p>
                      <p className="text-white">{datosModulo.fechaInicio}</p>
                    </div>
                  )}
                  {datosModulo.fechaFin && (
                    <div>
                      <p className="text-white/80 text-sm mb-1">Fin</p>
                      <p className="text-white">{datosModulo.fechaFin}</p>
                    </div>
                  )}
                </div>
              )}
              {datosModulo.operario && (
                <div>
                  <p className="text-white/80 text-sm mb-1">Operario</p>
                  <p className="text-white">{datosModulo.operario}</p>
                </div>
              )}
              {datosModulo.observaciones && (
                <div>
                  <p className="text-white/80 text-sm mb-1">Observaciones</p>
                  <p className="text-white">{datosModulo.observaciones}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
