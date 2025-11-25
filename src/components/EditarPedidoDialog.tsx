import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Pedido, Material } from '../types';

interface EditarPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido;
  onGuardar: (pedido: Pedido) => void;
}

export function EditarPedidoDialog({ open, onOpenChange, pedido, onGuardar }: EditarPedidoDialogProps) {
  const [formData, setFormData] = useState({
    id: pedido.id,
    centro: pedido.centro,
    material: pedido.material,
    fechaEntrada: pedido.fechaEntrada,
    fechaVencimiento: pedido.fechaVencimiento,
    transporte: pedido.transporte,
    incidencias: pedido.incidencias,
  });

  // Actualizar form cuando cambia el pedido
  useEffect(() => {
    setFormData({
      id: pedido.id,
      centro: pedido.centro,
      material: pedido.material,
      fechaEntrada: pedido.fechaEntrada,
      fechaVencimiento: pedido.fechaVencimiento,
      transporte: pedido.transporte,
      incidencias: pedido.incidencias,
    });
  }, [pedido]);

  const centros = ['Alcobendas', 'Usera', 'Rivas', 'Alcorcón', 'Getafe', 'Leganés'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pedidoActualizado: Pedido = {
      ...pedido,
      id: formData.id,
      centro: formData.centro,
      material: formData.material,
      fechaEntrada: formData.fechaEntrada,
      fechaVencimiento: formData.fechaVencimiento,
      transporte: formData.transporte,
      incidencias: formData.incidencias,
      // Actualizar módulo transporte si cambió el checkbox
      moduloTransporte: {
        ...pedido.moduloTransporte,
        estado: formData.transporte,
      },
    };

    onGuardar(pedidoActualizado);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Pedido</DialogTitle>
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
            <Label htmlFor="fechaEntrada">Fecha de Entrada *</Label>
            <Input
              id="fechaEntrada"
              type="date"
              value={formData.fechaEntrada}
              onChange={(e) => setFormData({ ...formData, fechaEntrada: e.target.value })}
              required
            />
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
            <Label htmlFor="incidencias">Incidencias / Observaciones</Label>
            <Textarea
              id="incidencias"
              value={formData.incidencias}
              onChange={(e) => setFormData({ ...formData, incidencias: e.target.value })}
              placeholder="Comentarios o notas sobre el pedido..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
