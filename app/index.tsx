import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  // Función para seleccionar imagen de la galería
  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], // Permite seleccionar imágenes o videos
      allowsEditing: false, // Desactiva la edición (crop)
      quality: 1, // Calidad de la imagen (0 a 1)
    });

    // Si el usuario no canceló la selección
    if (!result.canceled) {
      // Obtener la URI de la imagen seleccionada
      const selectedImageUri = result.assets[0].uri;

      // Navegar a la pantalla de resultados, pasando la URI de la imagen
      router.push(`/result?imageUri=${selectedImageUri}`);
    }
  };

  // Función para tomar foto con la cámara
  const handleCameraCapture = async () => {
    // Solicitar permisos para la cámara si no se han otorgado
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      // Usar alert() es aceptable para mensajes simples de permiso
      alert('Necesitas otorgar permisos de cámara para tomar fotos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // Solo permite tomar fotos (imágenes)
      allowsEditing: false, // Desactiva la edición (crop)
      quality: 1, // Calidad de la imagen (0 a 1)
      cameraType: ImagePicker.CameraType.back, // Opcional: especifica la cámara a usar (Front o Back)
    });

    // Si el usuario no canceló la captura
    if (!result.canceled) {
      // Obtener la URI de la foto tomada
      const capturedImageUri = result.assets[0].uri;

      // Navegar a la pantalla de resultados, pasando la URI de la foto
      router.push(`/result?imageUri=${capturedImageUri}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <Button title="Seleccionar Imagen de Galería" onPress={handleImagePicker} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="Tomar Foto con Cámara" onPress={handleCameraCapture} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonWrapper: {
    marginBottom: 20, // Ajusta la separación vertical entre botones
    width: '100%', // Opcional: puedes darle ancho completo
  },
});
