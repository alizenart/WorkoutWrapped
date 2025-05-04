import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ThemedView } from '@/components/ThemedView';
import * as DocumentPicker from 'expo-document-picker';

export default function HomeScreen() {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
  
        // 1. Store the file with a unique key
        const fileKey = `csvData:${file.name}`;
        localStorage.setItem(fileKey, fileContent);
        setFileName(file.name);
  
        // 2. Maintain a list of stored filenames (the index)
        const indexKey = 'csvFilesIndex';
        const currentIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
        
        // Only add if it doesn't already exist
        if (!currentIndex.includes(file.name)) {
          const newIndex = [...currentIndex, file.name];
          localStorage.setItem(indexKey, JSON.stringify(newIndex));
        }
  
        // 3. Navigate to summary
        router.push({ pathname: '/summary', params: { filename: file.name } });
      };
      reader.readAsText(file);
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
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
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
