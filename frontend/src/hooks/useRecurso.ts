import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/client';

interface Recurso<T> {
  datos: T;
  cargando: boolean;
  errores: string[];
  setErrores: (errores: string[]) => void;
  /** Vuelve a pedir los datos (tras crear, editar o borrar). */
  refrescar: () => void;
}

/**
 * Carga un recurso de la API y expone su estado.
 *
 * Los `setState` viven en los callbacks de la promesa, no en el cuerpo del
 * efecto: así no se encadenan renders y la carga se puede cancelar si el
 * componente se desmonta antes de que responda el servidor.
 *
 * `cargar` debe venir memoizado con `useCallback`, o el efecto se repetirá en
 * cada render.
 */
export function useRecurso<T>(cargar: () => Promise<T>, inicial: T): Recurso<T> {
  const [datos, setDatos] = useState<T>(inicial);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState<string[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;

    cargar()
      .then((resultado) => {
        if (cancelado) return;
        setDatos(resultado);
        setErrores([]);
      })
      .catch((error: unknown) => {
        if (cancelado) return;
        setErrores(
          error instanceof ApiError
            ? error.messages
            : ['No se pudieron cargar los datos']
        );
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cargar, version]);

  const refrescar = useCallback(() => setVersion((v) => v + 1), []);

  return { datos, cargando, errores, setErrores, refrescar };
}
