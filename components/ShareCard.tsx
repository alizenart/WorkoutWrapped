// components/ShareCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ShareCard = ({ summary }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ Your 2025 Workout Wrapped</Text>
      <Text style={styles.stat}>• Workout Days: {summary.totalWorkoutDays}</Text>
      <Text style={styles.stat}>• Total Minutes: {summary.totalMinutes}</Text>
      <Text style={styles.stat}>• Total Weight Moved: {summary.totalPounds.toFixed(0)} lbs</Text>
      <Text style={styles.stat}>• Max Set Volume: {summary.maxSetVolume} lbs</Text>
      <Text style={styles.stat}>• Longest Streak: {summary.longestStreak} days</Text>
      <Text style={styles.footer}>🔥 Consistency is key 🔑</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 24,
    borderRadius: 20,
    width: 300,
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#00FFFF',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  stat: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 6,
  },
  footer: {
    marginTop: 16,
    color: '#AAA',
    fontStyle: 'italic',
  },
});
