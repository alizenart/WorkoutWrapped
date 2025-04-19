// utils/summarizeCSV.ts
interface ExerciseVolume {
    exercise: string;
    volume: number;
  }
  
  export interface Summary {
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
  
  export default function summarizeCSV(csv: string): Summary {
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
  
      sessionDurations[dateISO] = cols[idx.Duration];
  
      const exName = cols[idx.Exercise] || 'Unknown';
      exerciseVolumeMap[exName] = (exerciseVolumeMap[exName] || 0) + volume;
      exerciseCountMap[exName] = (exerciseCountMap[exName] || 0) + 1;
  
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyVolume[monthKey] = (monthlyVolume[monthKey] || 0) + volume;
  
      totalDistance += parseFloat(cols[idx.Distance]) || 0;
  
      const rpeVal = parseFloat(cols[idx.RPE]);
      if (!isNaN(rpeVal)) {
        rpeSum += rpeVal;
        rpeCount += 1;
      }
    }
  
    const totalMinutes = Object.values(sessionDurations).reduce(
      (sum, d) => sum + parseDuration(d),
      0
    );
  
    const dayList = Array.from(dateSet).map((d) => new Date(d));
    dayList.sort((a, b) => a.getTime() - b.getTime());
    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;
    dayList.forEach((d) => {
      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        currentStreak = diff === 1 ? currentStreak + 1 : 1;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = d;
    });
  
    const topExercises = Object.entries(exerciseVolumeMap)
      .map(([exercise, volume]) => ({ exercise, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  
    const mostFrequentExercise = Object.entries(exerciseCountMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  
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
  