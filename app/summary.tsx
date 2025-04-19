import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { ThemedView } from '@/components/ThemedView';

interface ExerciseVolume {
  exercise: string;
  volume: number;
}

interface Summary {
  totalPounds: number;
  totalExercises: number;
  totalMinutes: number;
  totalWorkoutDays: number;
  averageDuration: number;
  maxSetVolume: number;
  topExercises: ExerciseVolume[];
  longestStreak: number;
  monthlyVolume: Record<string, number>;
  averageRepsPerSet: number;
  mostFrequentExercise: string;
  totalDistance: number;
  averageRPE: number;
}

function parseDuration(str: string): number {
  let hours = 0;
  let minutes = 0;
  const hMatch = str.match(/(\d+)h/);
  if (hMatch) hours = parseInt(hMatch[1], 10);
  const mMatch = str.match(/(\d+)m/);
  if (mMatch) minutes = parseInt(mMatch[1], 10);
  return hours * 60 + minutes;
}

async function readCSV(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return await response.text();
  } else {
    return await FileSystem.readAsStringAsync(uri);
  }
}

function summarizeCSV(csv: string): Summary {
  const lines = csv.trim().split('\n');
  const header = lines[0].split(',');
  const idx = {
    Date: header.indexOf('Date'),
    Weight: header.indexOf('Weight'),
    Reps: header.indexOf('Reps'),
    Duration: header.indexOf('Duration'),
    Exercise: header.indexOf('Exercise Name'),
    Distance: header.indexOf('Distance'),
    RPE: header.indexOf('RPE'),
  };

  let totalPounds = 0;
  let totalExercises = 0;
  let totalReps = 0;
  let totalDistance = 0;
  let rpeSum = 0;
  let rpeCount = 0;
  let maxSetVolume = 0;

  const dateSet = new Set<string>();
  const sessionDurations: Record<string, string> = {};
  const exerciseVolumeMap: Record<string, number> = {};
  const exerciseCountMap: Record<string, number> = {};
  const monthlyVolume: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const dateISO = cols[idx.Date];
    const date = new Date(dateISO);
    if (date.getFullYear() !== 2025) continue;

    dateSet.add(dateISO.split('T')[0]);
    const weight = parseFloat(cols[idx.Weight]) || 0;
    const reps = parseInt(cols[idx.Reps], 10) || 0;
    const volume = weight * reps;
    totalPounds += volume;
    totalExercises += 1;
    totalReps += reps;
    maxSetVolume = Math.max(maxSetVolume, volume);

    // Track per-session duration
    sessionDurations[dateISO] = cols[idx.Duration];

    // Exercise volume and count
    const exName = cols[idx.Exercise] || 'Unknown';
    exerciseVolumeMap[exName] = (exerciseVolumeMap[exName] || 0) + volume;
    exerciseCountMap[exName] = (exerciseCountMap[exName] || 0) + 1;

    // Monthly volume
    const monthKey = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}`;
    monthlyVolume[monthKey] = (monthlyVolume[monthKey] || 0) + volume;

    // Distance
    totalDistance += parseFloat(cols[idx.Distance]) || 0;

    // RPE
    const rpeVal = parseFloat(cols[idx.RPE]);
    if (!isNaN(rpeVal)) {
      rpeSum += rpeVal;
      rpeCount += 1;
    }
  }

  // Compute total minutes
  const totalMinutes = Object.values(sessionDurations).reduce(
    (sum, d) => sum + parseDuration(d),
    0
  );

  // Workout streak calculation
  const dayList = Array.from(dateSet).map((d) => new Date(d));
  dayList.sort((a, b) => a.getTime() - b.getTime());
  let longestStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;
  dayList.forEach((d) => {
    if (prevDate) {
      const diff = (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) currentStreak += 1;
      else currentStreak = 1;
    } else {
      currentStreak = 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    prevDate = d;
  });

  // Top 5 exercises by volume
  const topExercises = Object.entries(exerciseVolumeMap)
    .map(([exercise, volume]) => ({ exercise, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  // Most frequent exercise
  const mostFrequentExercise = Object.entries(exerciseCountMap)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Average calculations
  const totalWorkoutDays = dateSet.size;
  const averageDuration = totalWorkoutDays > 0 ? totalMinutes / totalWorkoutDays : 0;
  const averageRepsPerSet = totalExercises > 0 ? totalReps / totalExercises : 0;
  const averageRPE = rpeCount > 0 ? rpeSum / rpeCount : 0;

  return {
    totalPounds,
    totalExercises,
    totalMinutes,
    totalWorkoutDays,
    averageDuration,
    maxSetVolume,
    topExercises,
    longestStreak,
    monthlyVolume,
    averageRepsPerSet,
    mostFrequentExercise,
    totalDistance,
    averageRPE,
  };
}

export default function SummaryScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [summary, setSummary] = useState<Summary | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!uri) {
      router.back();
      return;
    }
    readCSV(uri)
      .then((csv) => setSummary(summarizeCSV(csv)))
      .catch((err) => console.error(err));
  }, [uri]);

  if (!summary) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FFFF" />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Your Workout Wrapped 2025</Text>
        <Text style={styles.item}>Total Pounds Lifted: {summary.totalPounds.toFixed(0)}</Text>
        <Text style={styles.item}>Total Exercises (sets): {summary.totalExercises}</Text>
        <Text style={styles.item}>Total Minutes: {summary.totalMinutes}</Text>
        <Text style={styles.item}>Workout Days: {summary.totalWorkoutDays}</Text>
        <Text style={styles.item}>Avg Duration (min): {summary.averageDuration.toFixed(1)}</Text>
        <Text style={styles.item}>Max Single-Set Volume: {summary.maxSetVolume}</Text>
        <Text style={styles.item}>Most Frequent Exercise: {summary.mostFrequentExercise}</Text>
        <Text style={styles.item}>Avg Reps per Set: {summary.averageRepsPerSet.toFixed(1)}</Text>
        <Text style={styles.item}>Total Distance: {summary.totalDistance.toFixed(1)}</Text>
        <Text style={styles.item}>Avg RPE: {summary.averageRPE.toFixed(1)}</Text>
        <Text style={styles.item}>Longest Streak: {summary.longestStreak} days</Text>
        <Text style={styles.subheader}>Top 5 Exercises by Volume</Text>
        {summary.topExercises.map((ex, i) => (
          <Text key={i} style={styles.item}>
            {ex.exercise}: {ex.volume.toFixed(0)}
          </Text>
        ))}
        <Text style={styles.subheader}>Monthly Volume</Text>
        {Object.entries(summary.monthlyVolume).map(([month, vol]) => (
          <Text key={month} style={styles.item}>
            {month}: {vol.toFixed(0)}
          </Text>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scroll: {
    padding: 20,
    alignItems: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: 20,
  },
  subheader: {
    fontSize: 24,
    fontWeight: '600',
    color: '#00FFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    fontSize: 18,
    color: '#FFFFFF',
    marginVertical: 4,
  },
});
