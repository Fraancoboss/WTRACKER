export function generatePedidoId(): string {
  const year = new Date().getFullYear();
  const randomBlock = Math.floor(Math.random() * 900) + 100; // 100-999
  return `PED-${year}-${String(randomBlock).padStart(3, '0')}`;
}
