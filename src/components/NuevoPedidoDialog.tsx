import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pedido, Material, EstadoPedido } from '../types';
import { generatePedidoId } from '../lib/generatePedidoId';

interface NuevoPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardar: (pedido: Pedido) => Promise<void> | void;
}

export function NuevoPedidoDialog({ open, onOpenChange, onGuardar }: NuevoPedidoDialogProps) {
  const [formData, setFormData] = useState({
    id: generatePedidoId(),
    centro: '',
    material: 'PVC' as Material,
    fechaVencimiento: '',
    transporte: false,
    observaciones: '',
    estado: 'No iniciado' as EstadoPedido,
  });
  const [saving, setSaving] = useState(false);

  const centros = ['Alcobendas', 'Usera', 'Rivas', 'Alcorcón', 'Getafe', 'Leganés'];
  const estados: EstadoPedido[] = ['No iniciado', 'En curso', 'Detenido', 'Listo'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const moduloBase = {
      estado: 'Pendiente' as const,
      observaciones: '',
      operario: '',
    };

    const nuevoPedido: Pedido = {
      id: formData.id,
      fechaEntrada: new Date().toISOString().split('T')[0],
      centro: formData.centro,
      material: formData.material,
      fechaVencimiento: formData.fechaVencimiento,
      estado: formData.estado,
      incidencias: formData.observaciones,
      transporte: formData.transporte,
      moduloFabricacion: { ...moduloBase },
      moduloCristal: { ...moduloBase },
      moduloPersianas: { ...moduloBase },
      moduloTransporte: formData.transporte ? { ...moduloBase } : undefined,
    };

    try {
      setSaving(true);
      await onGuardar(nuevoPedido);
      setFormData({
        id: generatePedidoId(),
        centro: '',
        material: 'PVC',
        fechaVencimiento: '',
        transporte: false,
        observaciones: '',
        estado: 'No iniciado',
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        id: generatePedidoId(),
      }));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="form-dialog">
        <div className="form-dialog__header">
          <DialogTitle>Nuevo pedido</DialogTitle>
          <p>Registra una orden con todos los datos clave antes de enviarla al taller.</p>
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
              <label htmlFor="estado" className="form-label">Estado inicial *</label>
              <select
                id="estado"
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoPedido })}
              >
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
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
            <label htmlFor="transporte" className="form-checkbox__label">
              ¿Requiere transporte?
            </label>
          </div>

          <div className="form-field">
            <label htmlFor="observaciones" className="form-label">Observaciones iniciales</label>
            <textarea
              id="observaciones"
              className="form-textarea"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Comentarios o notas sobre el pedido..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Pedido'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
