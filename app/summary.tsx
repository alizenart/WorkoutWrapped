import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StorySlide } from "@/components/StorySlide";
import { ShareCard } from "@/components/ShareCard";
import * as FileSystem from "expo-file-system";
import summarizeCSV, { Summary } from "@/components/summarizeCSV";
import { Ionicons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

const { width, height } = Dimensions.get("window");

export default function SummaryStoryScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [slides, setSlides] = useState<JSX.Element[]>([]);
  const router = useRouter();
  const carouselRef = useRef<any>(null);
  const viewShotRef = useRef<any>(null);

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
        <StorySlide
          key="intro"
          title="You crushed it in 2025 💪"
          value={`${summary.totalWorkoutDays} days`}
          subtext={`That’s ${summary.totalMinutes} minutes of dedication.\nConsistency is 🔑`}
        />,
        <StorySlide
          key="volume"
          title="You moved some serious weight… 🏋️"
          subtext={`You lifted a total of ${summary.totalPounds.toFixed(
            0
          )} lbs — that's like moving a T-Rex.\nYour biggest set was ${
            summary.maxSetVolume
          } lbs. Beast mode. 💥`}
        />,
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
        <StorySlide
          key="top-exercises"
          title="Your favorite grind 💥"
          subtext={`Your most frequent exercise was ${
            summary.mostFrequentExercise
          }.\nTop performers:\n${summary.topExercises
            .slice(0, 3)
            .map((ex, i) => `• ${ex.exercise} (${ex.volume.toFixed(0)} lbs)`)
            .join("\n")}`}
        />,
        <StorySlide
          key="time"
          title="Time well spent ⏱️"
          subtext={`Avg workout time: ${summary.averageDuration.toFixed(
            1
          )} min\nLongest streak: ${
            summary.longestStreak
          } days in a row 💪\nYou made your time count.`}
        />,
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
        <StorySlide
          key="badge"
          title="You’ve earned the badge of a beast 🏅"
          richSubtext={
            <>
              <Text style={styles.subtextContainer}>
                Share it. Save it. Show it off.
              </Text>
              <ViewShot
                ref={viewShotRef}
                options={{ format: 'jpg', quality: 0.9 }}
              >
                <ShareCard summary={summary} />
              </ViewShot>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={async () => {
                  const uri = await viewShotRef.current?.capture({
                    format: 'jpg',
                    result: 'data-uri',
                  });

                  if (!uri) return;

                  if (Platform.OS === 'web') {
                    const link = document.createElement('a');
                    link.href = uri;
                    link.download = 'workout-summary.jpg';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                  }
                }}
              >
                <Text style={styles.shareButtonText}>📸 Share This</Text>
              </TouchableOpacity>
            </>
          }
        />,
      ];

      setSlides(slideData);
    }

    loadData();
  }, [uri]);

  if (!slides.length) return null;

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
  subtextContainer: {
    fontSize: 18,
    color: "#AAA",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  shareButton: {
    backgroundColor: "#00FFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: "center",
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
