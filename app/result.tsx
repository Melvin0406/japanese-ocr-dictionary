import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NativeModules } from 'react-native';
import { Modal, TouchableOpacity } from 'react-native';

const { MLKitTextRecognizer } = NativeModules;

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string | undefined; // Obtiene imageUri de los parámetros

  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tokens, setTokens] = useState<string[]>([]);

  const segmentJapaneseText = async (text: string): Promise<string[]> => {
    try {
      const response = await fetch(`https://api.aoikujira.com/kigoapi/api/ma?format=json&sentence=${encodeURIComponent(text)}`);
      const data = await response.json();
      return data.map((item: any) => item[0]); // item[0] es la superficie (palabra)
    } catch (error) {
      console.error('Error segmentando texto japonés:', error);
      return text.split(''); // Fallback: carácter por carácter
    }
  };
  
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
        const text = await MLKitTextRecognizer.recognizeTextFromImage(imageUri);
        setRecognizedText(text);
        
        const tokens = await segmentJapaneseText(text);
        setTokens(tokens);
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

  const fetchDefinition = async (word: string) => {
  try {
    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
    const data = await response.json();
    if (data.data.length > 0) {
      const first = data.data[0];
      setDefinition(first.senses[0].english_definitions.join(', '));
    } else {
      setDefinition("No se encontró definición.");
    }
  } catch (error) {
    setDefinition("Error al buscar definición.");
  } finally {
    setIsModalVisible(true);
  }
};


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
            <View style={styles.textWrapper}>
              {tokens.map((word, index) => (
                <Text
                  key={index}
                  style={styles.word}
                  onPress={() => {
                    setSelectedWord(word);
                    fetchDefinition(word);
                  }}
                >
                  {word}{' '}
                </Text>
              ))}
            </View>
          ) : (
             // Estado inicial o si no se encontró texto (y no hay error/carga)
             <Text>Procesando texto...</Text>
          )}
        </>
      ) : (
          // Mensaje si se llega a esta página sin una URI de imagen
          <Text style={styles.errorText}>No se ha seleccionado una imagen.</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedWord}</Text>
            <Text>{definition}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  textWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    width: '100%',
  },
  word: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalClose: {
    marginTop: 15,
    color: 'blue',
  },
});