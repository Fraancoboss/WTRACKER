import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pedido, Material, EstadoPedido } from '../types';

interface EditarPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: Pedido;
  onGuardar: (pedido: Pedido) => Promise<void>;
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
    estado: pedido.estado,
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
      estado: pedido.estado,
    });
  }, [pedido]);

  const centros = ['Alcobendas', 'Usera', 'Rivas', 'Alcorcón', 'Getafe', 'Leganés'];

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      estado: formData.estado,
      moduloTransporte: formData.transporte
        ? (pedido.moduloTransporte ?? {
            estado: 'Pendiente',
            observaciones: '',
            operario: '',
          })
        : undefined,
    };

    try {
      setSaving(true);
      await onGuardar(pedidoActualizado);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="form-dialog">
        <div className="form-dialog__header">
          <DialogTitle>Editar pedido</DialogTitle>
          <p>Ajusta los datos clave y sincroniza el estado antes de guardar.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="id" className="form-label">ID Pedido *</label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
                placeholder="Ej: PED-2025-001"
              />
            </div>

            <div className="form-field">
              <label htmlFor="centro" className="form-label">Centro / Cliente *</label>
              <select
                id="centro"
                className="form-select"
                value={formData.centro}
                onChange={(e) => setFormData({ ...formData, centro: e.target.value })}
                required
              >
                <option value="" disabled>Selecciona un centro</option>
                {centros.map((centro) => (
                  <option key={centro} value={centro}>
                    {centro}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="material" className="form-label">Material *</label>
              <select
                id="material"
                className="form-select"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value as Material })}
                required
              >
                <option value="PVC">PVC</option>
                <option value="Aluminio">Aluminio</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="estado" className="form-label">Estado *</label>
              <select
                id="estado"
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoPedido })}
              >
                {['No iniciado', 'En curso', 'Detenido', 'Listo'].map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="fechaEntrada" className="form-label">Fecha de entrada *</label>
              <Input
                id="fechaEntrada"
                type="date"
                value={formData.fechaEntrada}
                onChange={(e) => setFormData({ ...formData, fechaEntrada: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="fechaVencimiento" className="form-label">Fecha de vencimiento *</label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="transporte"
              checked={formData.transporte}
              onChange={(e) => setFormData({ ...formData, transporte: e.target.checked })}
            />
            <label htmlFor="transporte" className="form-checkbox__label">¿Requiere transporte?</label>
          </div>

          <div className="form-field">
            <label htmlFor="incidencias" className="form-label">Incidencias / Observaciones</label>
            <textarea
              id="incidencias"
              className="form-textarea"
              value={formData.incidencias}
              onChange={(e) => setFormData({ ...formData, incidencias: e.target.value })}
              placeholder="Comentarios o notas sobre el pedido..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
