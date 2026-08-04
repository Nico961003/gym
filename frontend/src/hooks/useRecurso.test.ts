import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { useRecurso } from './useRecurso';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useRecurso', () => {
  it('arranca cargando con el valor inicial', () => {
    const cargar = vi.fn(() => new Promise<number[]>(() => {}));
    const { result } = renderHook(() => useRecurso(cargar, []));

    expect(result.current.cargando).toBe(true);
    expect(result.current.datos).toEqual([]);
    expect(result.current.errores).toEqual([]);
  });

  it('guarda los datos y deja de cargar cuando resuelve', async () => {
    const cargar = vi.fn(async () => [1, 2, 3]);
    const { result } = renderHook(() => useRecurso(cargar, [] as number[]));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.datos).toEqual([1, 2, 3]);
  });

  it('recoge los mensajes de un ApiError', async () => {
    const cargar = vi.fn(() =>
      Promise.reject(
        new ApiError(400, 'Inválido', [
          { campo: 'x', mensaje: 'Primer problema' },
          { campo: 'y', mensaje: 'Segundo problema' },
        ])
      )
    );
    const { result } = renderHook(() => useRecurso(cargar, null));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.errores).toEqual([
      'Primer problema',
      'Segundo problema',
    ]);
  });

  it('usa un mensaje genérico para errores que no son ApiError', async () => {
    const cargar = vi.fn(() => Promise.reject(new Error('boom')));
    const { result } = renderHook(() => useRecurso(cargar, null));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.errores).toEqual(['No se pudieron cargar los datos']);
  });

  it('conserva el valor inicial si la carga falla', async () => {
    const cargar = vi.fn(() => Promise.reject(new Error('boom')));
    const { result } = renderHook(() => useRecurso(cargar, ['inicial']));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(result.current.datos).toEqual(['inicial']);
  });

  it('limpia los errores en una carga posterior con éxito', async () => {
    const cargar = vi
      .fn<() => Promise<string[]>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(['ok']);

    const { result } = renderHook(() => useRecurso(cargar, [] as string[]));
    await waitFor(() => expect(result.current.errores).toHaveLength(1));

    act(() => result.current.refrescar());
    await waitFor(() => expect(result.current.datos).toEqual(['ok']));
    expect(result.current.errores).toEqual([]);
  });

  it('refrescar vuelve a llamar al cargador', async () => {
    const cargar = vi.fn(async () => ['a']);
    const { result } = renderHook(() => useRecurso(cargar, [] as string[]));

    await waitFor(() => expect(cargar).toHaveBeenCalledTimes(1));

    act(() => result.current.refrescar());
    await waitFor(() => expect(cargar).toHaveBeenCalledTimes(2));
  });

  it('setErrores permite fijar errores desde fuera', async () => {
    const cargar = vi.fn(async () => ['a']);
    const { result } = renderHook(() => useRecurso(cargar, [] as string[]));

    await waitFor(() => expect(result.current.cargando).toBe(false));
    act(() => result.current.setErrores(['Error al guardar']));

    expect(result.current.errores).toEqual(['Error al guardar']);
  });

  it('no recarga si el cargador mantiene su identidad', async () => {
    const cargar = vi.fn(async () => ['a']);
    const { rerender } = renderHook(() => useRecurso(cargar, [] as string[]));

    await waitFor(() => expect(cargar).toHaveBeenCalledTimes(1));
    rerender();
    rerender();

    expect(cargar).toHaveBeenCalledTimes(1);
  });

  it('ignora la respuesta si el componente ya se desmontó', async () => {
    let resolver: (v: string[]) => void = () => {};
    const cargar = vi.fn(
      () =>
        new Promise<string[]>((res) => {
          resolver = res;
        })
    );

    const { result, unmount } = renderHook(() =>
      useRecurso(cargar, [] as string[])
    );
    unmount();

    // Resolver tras el desmontaje no debe provocar ningún setState.
    await act(async () => {
      resolver(['tarde']);
      await Promise.resolve();
    });

    expect(result.current.datos).toEqual([]);
  });
});
