import React, { useState } from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Animatable from 'react-native-animatable';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/csv',
    });

    if (!result.canceled) {
      setFileName("hi"); //change later
      // Add parsing logic here
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Animatable.Text
        animation="fadeInDown"
        duration={1200}
        style={styles.title}
      >
        🏋️ Workout Wrapped
      </Animatable.Text>

      <Animatable.Text
        animation="fadeIn"
        delay={600}
        duration={1000}
        style={styles.subtitle}
      >
        Drop your workout CSV and get the stats!
      </Animatable.Text>

      <Animatable.View
        animation="bounceIn"
        delay={1200}
        style={styles.uploadContainer}
      >
        <Pressable
          style={({ pressed }) => [
            styles.uploadBox,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handlePickFile}
        >
          <Text style={styles.uploadText}>
            {fileName ? `📂 ${fileName}` : 'Click to Upload CSV'}
          </Text>
        </Pressable>
      </Animatable.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#39FF14',
    textShadowColor: '#39FF14',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 30,
    textAlign: 'center',
  },
  uploadContainer: {
    width: '100%',
    alignItems: 'center',
  },
  uploadBox: {
    backgroundColor: '#1a1a1a',
    borderColor: '#39FF14',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: '#39FF14',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
