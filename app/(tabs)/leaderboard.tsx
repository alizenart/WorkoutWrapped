import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

type LeaderboardEntry = {
  name: string;
  totalWeight: number;
  timestamp: number;
};

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { refresh } = useLocalSearchParams();
  useFocusEffect(
    useCallback(() => {
      const raw = localStorage.getItem("leaderboard");
      if (raw) {
        const parsed: LeaderboardEntry[] = JSON.parse(raw);
        const sorted = parsed.sort((a, b) => b.totalWeight - a.totalWeight);
        setLeaderboard(sorted);
      }
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>

      {leaderboard.length === 0 ? (
        <Text style={styles.emptyText}>No one on the leaderboard yet 👀</Text>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item, index) => item.name + index}
          renderItem={({ item, index }) => (
            <View style={styles.entry}>
              <Text style={styles.rank}>{index + 1}.</Text>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.weight}>
                  Total Weight: {item.totalWeight.toLocaleString()} lbs
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },

  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#0D0D0D",
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#39FF14",
    marginBottom: 20,
    textAlign: "center",
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
  },
  rank: {
    fontSize: 24,
    color: "#FFD700",
    width: 32,
    textAlign: "right",
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  weight: {
    fontSize: 14,
    color: "#AAA",
  },
});
