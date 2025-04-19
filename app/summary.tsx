import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, TouchableWithoutFeedback } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StorySlide } from '@/components/StorySlide';
import * as FileSystem from 'expo-file-system';
import summarizeCSV, { Summary } from '@/components/summarizeCSV';

const { width, height } = Dimensions.get('window');

export default function SummaryStoryScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [slides, setSlides] = useState<JSX.Element[]>([]);
  const router = useRouter();

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

      const blocks = [
        <StorySlide key="intro" title="Your Workout Wrapped" subtext="Here's what you accomplished in 2025 💪" />,
        <StorySlide key="pounds" title="Total Pounds Lifted" value={`${summary.totalPounds.toFixed(0)} lbs`} />,
        <StorySlide key="sets" title="Total Sets" value={`${summary.totalExercises}`} />,
        <StorySlide key="time" title="Total Minutes" value={`${summary.totalMinutes}`} />,
        <StorySlide key="days" title="Workout Days" value={`${summary.totalWorkoutDays}`} />,
        <StorySlide key="max" title="Max Set Volume" value={`${summary.maxSetVolume} lbs`} />,
        <StorySlide key="frequent" title="Most Frequent Exercise" value={summary.mostFrequentExercise} />,
        <StorySlide key="avgDuration" title="Average Workout Length" value={`${summary.averageDuration.toFixed(1)} min`} />,
        <StorySlide key="rpe" title="Average RPE" value={summary.averageRPE.toFixed(1)} />,
        <StorySlide key="reps" title="Average Reps per Set" value={summary.averageRepsPerSet.toFixed(1)} />,
        <StorySlide key="streak" title="Longest Streak" value={`${summary.longestStreak} days`} />,
        ...summary.topExercises.map((ex, i) => (
          <StorySlide
            key={`top-${i}`}
            title={`Top Exercise #${i + 1}`}
            value={ex.exercise}
            subtext={`${ex.volume.toFixed(0)} lbs lifted`}
          />
        )),
        <StorySlide key="outro" title="You did that 🔥" subtext="Share it. Save it. Show it off." />,
      ];

      setSlides(blocks);
    }

    loadData();
  }, [uri]);

  if (!slides.length) return null;

  return (
    <Carousel
      width={width}
      height={height}
      data={slides}
      scrollAnimationDuration={800}
      mode="vertical-stack"
      modeConfig={{ snapDirection: 'left' }}
      renderItem={({ item }) => item}
    />
  );
}
