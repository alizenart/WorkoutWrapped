import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  LayoutChangeEvent,
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
import { BarChart } from "react-native-chart-kit";

const { width, height } = Dimensions.get("window");

interface TopExercisesChartProps {
  data: ExerciseVolume[];
}
type LeaderboardEntry = {
  name: string;
  totalWeight: number;
  timestamp: number;
};

type ExerciseVolume = {
  exercise: string;
  volume: number;
};

interface TopExercisesChartProps {
  data: ExerciseVolume[];
}

export function TopExercisesChart({ data }: TopExercisesChartProps) {
  const [chartWidth, setChartWidth] = useState(320); // fallback width
  
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setChartWidth(width - 32); // respect padding
  };

  const formattedData = {
    labels: data.map((e) =>
      e.exercise
    ),
    datasets: [
      {
        data: data.map((e) => e.volume),
      },
    ],
  };

  return (
    <View onLayout={handleLayout} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Volume Moved by Top Exercises</Text>
      <BarChart
        data={formattedData}
        width={chartWidth}
        height={380}
        yAxisLabel=""
        yAxisSuffix=" lbs"
        fromZero
        showValuesOnTopOfBars
        withInnerLines={false}
        verticalLabelRotation={45}
        chartConfig={{
          backgroundGradientFrom: "#121212",
          backgroundGradientTo: "#121212",
          decimalPlaces: 0,
          color: () => `rgba(0, 255, 255, 0.8)`,
          labelColor: () => "#E0E0E0",
          propsForLabels: {
            fontSize: 10,
            fontWeight: "500",
          },
          propsForBackgroundLines: {
            stroke: "#333",
          },
          barRadius: 6,
        }}
        style={{
          marginBottom: 32,
          borderRadius: 12,
          alignSelf: "center",
        }}
      />
    </View>
  );
}


export default function SummaryStoryScreen() {
  const isWeb = Platform.OS === "web";
  const [csv, setCsv] = useState<string | null>(null);
  const { filename } = useLocalSearchParams<{ filename: string }>();


  const [slides, setSlides] = useState<JSX.Element[]>([]);
  const router = useRouter();
  const carouselRef = useRef<any>(null);
  const viewShotRef = useRef<any>(null);

  console.log("in summary")

  useEffect(() => {
    async function loadData() {
      let csvData: string | null = null;
  
      if (isWeb) {
        if (!filename) {
          router.back();
          return;
        }
        csvData = localStorage.getItem(`csvData:${filename}`);
        console.log(`Loaded csvData:${filename}`);
      }
      else {
        const { uri } = useLocalSearchParams<{ uri: string }>();
        if (!uri) {
          router.back();
          return;
        }
        csvData = await FileSystem.readAsStringAsync(uri);
      }
  
      if (!csvData) {
        router.back();
        return;
      }
  
      const summary: Summary = summarizeCSV(csvData);
      console.log("started summarize");

      const leaderboardEntry = {
        name: filename,
        totalWeight: summary.totalPounds,
        timestamp: Date.now(),
      };
      
      const existingData: LeaderboardEntry[] = JSON.parse(localStorage.getItem('leaderboard') || '[]');

      // Avoid duplicates based on name
      const alreadyExists = existingData.some(entry => entry.name === filename);
      if (!alreadyExists) {
        existingData.push(leaderboardEntry);
        localStorage.setItem('leaderboard', JSON.stringify(existingData));
      }

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
          richSubtext={<TopExercisesChart data={summary.topExercises.slice(0, 5)} />}
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
  }, []);

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
  chartContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    textAlign: "center",
    marginBottom: 10,
  },
  
});

  