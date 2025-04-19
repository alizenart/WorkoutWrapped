// SummaryStoryScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StorySlide } from "@/components/StorySlide";
import * as FileSystem from "expo-file-system";
import summarizeCSV, { Summary } from "@/components/summarizeCSV";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

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

      const csv =
        Platform.OS === "web"
          ? await fetch(uri).then((res) => res.text())
          : await FileSystem.readAsStringAsync(uri);

      const summary: Summary = summarizeCSV(csv);

      const slideData = [
        // 1. Opening Hook
        <StorySlide
          key="intro"
          title="You crushed it in 2025 💪"
          value={`${summary.totalWorkoutDays} days`}
          subtext={`That’s ${summary.totalMinutes} minutes of dedication.\nConsistency is 🔑`}
        />,

        // 2. Volume Block
        <StorySlide
          key="volume"
          title="You moved some serious weight… 🏋️"
          subtext={`You lifted a total of ${summary.totalPounds.toFixed(
            0
          )} lbs — that's like moving a T-Rex.\nYour biggest set was ${
            summary.maxSetVolume
          } lbs. Beast mode. 💥`}
        />,

        // 3. Effort & Intensity Block
        <StorySlide
          key="effort"
          title="How hard did you go? 🧠🔥"
          subtext={`You averaged an RPE of ${summary.averageRPE.toFixed(
            1
          )}.\nEach set had about ${summary.averageRepsPerSet.toFixed(
            1
          )} reps.\nAnd you cranked out ${
            summary.totalExercises
          } total exercises.\nYou didn’t just lift — you pushed limits.`}
        />,

        // 4. Most Used Block
        <StorySlide
          key="top-exercises"
          title="Your favorite grind 💥"
          subtext={`Your most frequent exercise was **${
            summary.mostFrequentExercise
          }**.\nTop performers:\n${summary.topExercises
            .slice(0, 3)
            .map((ex, i) => `• ${ex.exercise} (${ex.volume.toFixed(0)} lbs)`)
            .join("\n")}`}
        />,

        // 5. Time Commitment
        <StorySlide
          key="time"
          title="Time well spent ⏱️"
          subtext={`Avg workout time: ${summary.averageDuration.toFixed(
            1
          )} min\nLongest streak: ${
            summary.longestStreak
          } days in a row 💪\nYou made your time count.`}
        />,

        // 6. Distance (if applicable)
        ...(summary.totalDistance > 0
          ? [
              <StorySlide
                key="distance"
                title="You went the extra mile 🏃‍♂️"
                subtext={`You covered ${summary.totalDistance.toFixed(
                  0
                )} meters.\nThat’s some serious distance — no treadmill teleporting here.`}
              />,
            ]
          : []),

        // 7. Outro
        <StorySlide
          key="badge"
          title="You’ve earned the badge of a beast 🏅"
          subtext="Show it off. Brag a little. You earned every drop of sweat.\nWant to see more graphs or share your story?"
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
      position: "absolute",
      left: 20,
      top: height / 2 - 24,
      zIndex: 1,
    },
    arrowRight: {
      position: "absolute",
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
        modeConfig={{ snapDirection: "left" }}
        renderItem={({ item }) => item}
      />
      <TouchableOpacity
        style={styles.arrowLeft}
        onPress={() => carouselRef.current?.prev()}
      >
        <Ionicons name="arrow-back-circle" size={48} color="#00FFFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.arrowRight}
        onPress={() => carouselRef.current?.next()}
      >
        <Ionicons name="arrow-forward-circle" size={48} color="#00FFFF" />
      </TouchableOpacity>
    </View>
  );
}
