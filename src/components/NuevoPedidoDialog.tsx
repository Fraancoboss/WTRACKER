import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Pedido, Material } from '../types';

interface NuevoPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardar: (pedido: Pedido) => void;
}

export function NuevoPedidoDialog({ open, onOpenChange, onGuardar }: NuevoPedidoDialogProps) {
  const [formData, setFormData] = useState({
    id: '',
    centro: '',
    material: 'PVC' as Material,
    fechaVencimiento: '',
    transporte: false,
    observaciones: '',
  });

  const centros = ['Alcobendas', 'Usera', 'Rivas', 'Alcorcón', 'Getafe', 'Leganés'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevoPedido: Pedido = {
      id: formData.id,
      fechaEntrada: new Date().toISOString().split('T')[0],
      centro: formData.centro,
      material: formData.material,
      fechaVencimiento: formData.fechaVencimiento,
      estado: 'No iniciado',
      incidencias: formData.observaciones,
      transporte: formData.transporte,
      moduloFabricacion: {
        estado: 'Pendiente',
        observaciones: '',
        operario: '',
      },
      moduloCristal: {
        estado: 'Pendiente',
        observaciones: '',
        operario: '',
      },
      moduloPersianas: {
        estado: 'Pendiente',
        observaciones: '',
        operario: '',
      },
      moduloTransporte: {
        estado: formData.transporte,
        observaciones: '',
      },
    };

    onGuardar(nuevoPedido);
    
    // Reset form
    setFormData({
      id: '',
      centro: '',
      material: 'PVC',
      fechaVencimiento: '',
      transporte: false,
      observaciones: '',
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Pedido</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID Pedido *</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              placeholder="Ej: PED-2025-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="centro">Centro / Cliente *</Label>
            <Select
              value={formData.centro}
              onValueChange={(value) => setFormData({ ...formData, centro: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un centro" />
              </SelectTrigger>
              <SelectContent>
                {centros.map((centro) => (
                  <SelectItem key={centro} value={centro}>
                    {centro}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="material">Material *</Label>
            <Select
              value={formData.material}
              onValueChange={(value: Material) => setFormData({ ...formData, material: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PVC">PVC</SelectItem>
                <SelectItem value="Aluminio">Aluminio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaVencimiento">Fecha de Vencimiento *</Label>
            <Input
              id="fechaVencimiento"
              type="date"
              value={formData.fechaVencimiento}
              onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="transporte"
              checked={formData.transporte}
              onChange={(e) => setFormData({ ...formData, transporte: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="transporte">¿Requiere transporte?</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones iniciales</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Comentarios o notas sobre el pedido..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Pedido</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
