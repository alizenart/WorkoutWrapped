// SummaryStoryScreen.tsx
import React, { useEffect, useState, useRef} from 'react';
import {  View, TouchableOpacity, Dimensions, Platform, StyleSheet } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StorySlide } from '@/components/StorySlide';
import * as FileSystem from 'expo-file-system';
import summarizeCSV, { Summary } from '@/components/summarizeCSV';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');


export default function SummaryStoryScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [slides, setSlides] = useState<JSX.Element[]>([]);
  const router = useRouter();
  const carouselRef = useRef<any>(null); 


  useEffect(() => {
    async function loadData() {
      if (!uri) {
        router.back();
        return;
      }

      const csv = Platform.OS === 'web'
        ? await fetch(uri).then((res) => res.text())
        : await FileSystem.readAsStringAsync(uri);

      const summary: Summary = summarizeCSV(csv);

      const slideData = [
        // 1. Opening Hook
        <StorySlide key="intro"
          title="You crushed it in 2025 💪"
          value={`${summary.totalWorkoutDays} days`}
          subtext={`That’s ${summary.totalMinutes} minutes of dedication.\nConsistency is 🔑`}
        />,

        // 2. Volume Block
        <StorySlide key="volume-title" title="You moved some serious weight…" />,
        <StorySlide key="totalPounds" title="Total Weight Moved" value={`${summary.totalPounds.toFixed(0)} lbs`} />,
        <StorySlide key="maxSet" title="Heaviest Set Volume" value={`${summary.maxSetVolume} lbs`} />,

        // 3. Effort & Intensity Block
        <StorySlide key="effort-title" title="How hard did you go?" />,
        <StorySlide key="rpe" title="Avg RPE" value={`${summary.averageRPE.toFixed(1)}`} />,
        <StorySlide key="reps" title="Avg Reps per Set" value={`${summary.averageRepsPerSet.toFixed(1)}`} />,
        <StorySlide key="sets" title="Total Exercises Logged" value={`${summary.totalExercises}`} />,

        // 4. Most Used Block
        <StorySlide key="top-title" title="Your favorite grind 💥" />,
        <StorySlide key="mostUsed" title="Most Frequent Exercise" value={summary.mostFrequentExercise} />,
        ...summary.topExercises.slice(0, 5).map((ex, i) => (
          <StorySlide
            key={`top-${i}`}
            title={`Top #${i + 1}: ${ex.exercise}`}
            subtext={`${ex.volume.toFixed(0)} lbs lifted`}
          />
        )),

        // 5. Time Commitment
        <StorySlide key="time-title" title="Your time investment paid off…" />,
        <StorySlide key="avgDuration" title="Avg Workout Length" value={`${summary.averageDuration.toFixed(1)} min`} />,
        <StorySlide key="streak" title="Longest Streak" value={`${summary.longestStreak} days`} />,

        // 6. Distance (Optional)
        ...(summary.totalDistance > 0
          ? [
              <StorySlide
                key="distance"
                title="You went the extra mile 🏃‍♂️"
                value={`${summary.totalDistance.toFixed(0)} meters`}
              />
            ]
          : []),

        // 7. Outro / Badge
        <StorySlide key="badge"
          title="You’ve earned the badge of a beast 🏅"
          subtext="Share it. Save it. Show it off."
          showShare
        />,
      ];

      setSlides(slideData);
    }

    loadData();
  }, [uri]);

  if (!slides.length) return null;

  const styles = StyleSheet.create({
    arrowLeft: {
      position: 'absolute',
      left: 20,
      top: height / 2 - 24,
      zIndex: 1,
    },
    arrowRight: {
      position: 'absolute',
      right: 20,
      top: height / 2 - 24,
      zIndex: 1,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        ref={carouselRef}
        width={width}
        height={height}
        data={slides}
        scrollAnimationDuration={800}
        mode="vertical-stack"
        modeConfig={{ snapDirection: 'left' }}
        renderItem={({ item }) => item}
      />
      <TouchableOpacity style={styles.arrowLeft} onPress={() => carouselRef.current?.prev()}>
        <Ionicons name="arrow-back-circle" size={48} color="#00FFFF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.arrowRight} onPress={() => carouselRef.current?.next()}>
        <Ionicons name="arrow-forward-circle" size={48} color="#00FFFF" />
      </TouchableOpacity>
    </View>
  );
}
