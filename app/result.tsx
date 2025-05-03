import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NativeModules } from 'react-native'; // Importa NativeModules

// Obtén tu módulo nativo por el nombre que definiste en Kotlin (MLKitTextRecognizer)
const { MLKitTextRecognizer } = NativeModules;

export default function ResultScreen() { // Cambié el nombre de la función a ResultScreen para claridad
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string | undefined; // Obtiene imageUri de los parámetros

  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processImageWithOCR = async () => {
      if (!imageUri) {
        setError("No se proporcionó URI de imagen.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setRecognizedText(null); // Limpia resultados anteriores

      try {
        // **¡LA LLAMADA CORRECTA AL MÓDULO NATIVO!**
        // Llama al método que expusiste en Kotlin: recognizeTextFromImage
        const text = await MLKitTextRecognizer.recognizeTextFromImage(imageUri);
        setRecognizedText(text);
      } catch (e: any) { // Captura el error que pueda venir del módulo nativo
        console.error("Error reconociendo texto:", e);
        setError(e.message || "Ocurrió un error durante el reconocimiento de texto.");
      } finally {
        setIsLoading(false);
      }
    };

    if (imageUri) {
      processImageWithOCR(); // Ejecuta la lógica de OCR cuando tengas la imagen
    } else {
       setIsLoading(false); // Si no hay imagen, no hay nada que procesar
    }

  }, [imageUri]); // Este efecto se ejecutará cuando cambie imageUri

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {imageUri ? (
        <>
          <Text style={styles.title}>Imagen para OCR</Text>
          {/* Muestra la imagen seleccionada */}
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />

          <Text style={styles.title}>Texto reconocido:</Text>
          {isLoading ? (
            // Muestra un indicador de carga mientras se procesa
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            // Muestra errores si los hay
            <Text style={styles.errorText}>Error: {error}</Text>
          ) : recognizedText !== null ? (
            // Muestra el texto reconocido
            <Text style={styles.recognizedText}>{recognizedText}</Text>
          ) : (
             // Estado inicial o si no se encontró texto (y no hay error/carga)
             <Text>Procesando texto...</Text>
          )}
        </>
      ) : (
          // Mensaje si se llega a esta página sin una URI de imagen
          <Text style={styles.errorText}>No se ha seleccionado una imagen.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Permite que el contenido crezca en ScrollView
    justifyContent: 'flex-start', // Alinea el contenido desde arriba
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  image: {
    width: '100%', // Ancho adaptable
    height: 300, // Altura fija (puedes ajustarla)
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#eee', // Fondo para ver el área si la imagen no carga
  },
  recognizedText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'left',
    width: '100%', // Ocupa todo el ancho disponible
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
  },
});