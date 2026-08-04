import { useCallback, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import {
  actualizarProducto,
  borrarProducto,
  crearProducto,
  fetchProductos,
} from '../../api/gym';
import type { Producto, ProductoInput } from '../../api/types';
import { useAuth } from '../../auth/useAuth';
import Modal from '../../components/Modal';
import { useRecurso } from '../../hooks/useRecurso';

const vacio = (): ProductoInput => ({
  nombre: '',
  precio: 0,
  stock: 0,
  fechaRegistro: new Date().toISOString().slice(0, 10),
});

function ProductosAdmin() {
  const { token } = useAuth();

  const cargar = useCallback(
    () => (token ? fetchProductos(token) : Promise.resolve([])),
    [token]
  );
  const {
    datos: productos,
    cargando,
    errores,
    setErrores,
    refrescar,
  } = useRecurso<Producto[]>(cargar, []);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoInput>(vacio);
  const [guardando, setGuardando] = useState(false);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(vacio());
    setErrores([]);
    setModalAbierto(true);
  };

  const abrirEdicion = (producto: Producto) => {
    setEditando(producto);
    setForm({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      fechaRegistro: producto.fechaRegistro,
    });
    setErrores([]);
    setModalAbierto(true);
  };

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setGuardando(true);
    setErrores([]);
    try {
      if (editando) {
        await actualizarProducto(token, editando.id, form);
      } else {
        await crearProducto(token, form);
      }
      setModalAbierto(false);
      refrescar();
    } catch (e) {
      setErrores(e instanceof ApiError ? e.messages : ['Error al guardar']);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (producto: Producto) => {
    if (!token) return;
    if (!window.confirm(`¿Borrar «${producto.nombre}»?`)) return;

    try {
      await borrarProducto(token, producto.id);
      refrescar();
    } catch (e) {
      setErrores(e instanceof ApiError ? e.messages : ['Error al borrar']);
    }
  };

  const valorTotal = productos.reduce((s, p) => s + p.precio * p.stock, 0);

  return (
    <div className="rg-panel__card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 fw-bold mb-1">Productos ({productos.length})</h2>
          <p className="small text-body-secondary mb-0">
            Valor del inventario: {valorTotal.toFixed(2)} €
          </p>
        </div>
        <button type="button" className="btn btn-brand" onClick={abrirNuevo}>
          Nuevo producto
        </button>
      </div>

      {errores.length > 0 && !modalAbierto && (
        <div className="alert alert-danger" role="alert">
          {errores.join('. ')}
        </div>
      )}

      {cargando ? (
        <p className="text-body-secondary mb-0">Cargando…</p>
      ) : productos.length === 0 ? (
        <p className="text-body-secondary mb-0">La tienda está vacía.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col" className="text-end">
                  Precio
                </th>
                <th scope="col" className="text-end">
                  Stock
                </th>
                <th scope="col">Fecha de registro</th>
                <th scope="col" className="text-end">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <th scope="row" className="fw-semibold">
                    {producto.nombre}
                  </th>
                  <td className="text-end">{producto.precio.toFixed(2)} €</td>
                  <td className="text-end">
                    <span
                      className={`badge ${
                        producto.stock === 0
                          ? 'text-bg-danger'
                          : producto.stock < 10
                            ? 'text-bg-warning'
                            : 'text-bg-success'
                      }`}
                    >
                      {producto.stock === 0 ? 'Agotado' : producto.stock}
                    </span>
                  </td>
                  <td className="small text-body-secondary">
                    {producto.fechaRegistro}
                  </td>
                  <td className="text-end text-nowrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => abrirEdicion(producto)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => void eliminar(producto)}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        titulo={editando ? 'Editar producto' : 'Nuevo producto'}
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      >
        {errores.length > 0 && (
          <div className="alert alert-danger" role="alert">
            <ul className="mb-0 ps-3">
              {errores.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={guardar} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="prod-nombre" className="form-label">
                Nombre
              </label>
              <input
                id="prod-nombre"
                className="form-control"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="col-sm-6">
              <label htmlFor="prod-precio" className="form-label">
                Precio (€)
              </label>
              <input
                id="prod-precio"
                type="number"
                step="0.01"
                min={0}
                className="form-control"
                value={form.precio}
                onChange={(e) =>
                  setForm({ ...form, precio: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="col-sm-6">
              <label htmlFor="prod-stock" className="form-label">
                Stock
              </label>
              <input
                id="prod-stock"
                type="number"
                step="1"
                min={0}
                className="form-control"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="col-12">
              <label htmlFor="prod-fecha" className="form-label">
                Fecha de registro
              </label>
              <input
                id="prod-fecha"
                type="date"
                className="form-control"
                value={form.fechaRegistro}
                onChange={(e) =>
                  setForm({ ...form, fechaRegistro: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 pt-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-brand" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductosAdmin;
