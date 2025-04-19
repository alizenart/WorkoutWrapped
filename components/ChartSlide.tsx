// components/ChartSlide.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-svg-charts';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

interface ChartSlideProps {
  title: string;
  labels: string[];
  values: number[];
}

export const ChartSlide = ({ title, labels, values }: ChartSlideProps) => {
  return (
    <View style={styles.container}>
      <Animatable.Text animation="fadeInDown" delay={300} style={styles.title}>
        {title}
      </Animatable.Text>

      <View style={styles.chartContainer}>
        <BarChart
          style={{ height: 200, width: '100%' }}
          data={values}
          svg={{ fill: '#00FFFF' }}
          spacingInner={0.3}
          contentInset={{ top: 30, bottom: 10 }}
          gridMin={0}
        />
        <View style={styles.labelsRow}>
          {labels.map((label, idx) => (
            <Text key={idx} style={styles.labelText}>
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#0D0D0D',
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    width: '100%',
  },
  labelText: {
    fontSize: 12,
    color: '#FFF',
  },
});
