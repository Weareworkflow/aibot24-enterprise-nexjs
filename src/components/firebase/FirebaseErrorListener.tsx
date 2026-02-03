'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Listener global para errores de Firebase.
 * Muestra una notificación visual cuando hay errores de permisos.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      toast({
        variant: "destructive",
        title: "Error de Base de Datos",
        description: "No tienes permisos para realizar esta acción. Por favor, asegúrate de haber iniciado sesión.",
      });
      
      // En desarrollo, lanzamos el error para ver el contexto JSON de las reglas
      if (process.env.NODE_ENV === 'development') {
        console.error('Firestore Permission Error Context:', error.context);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}