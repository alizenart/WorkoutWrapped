// components/StorySlide.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

interface StorySlideProps {
  title: string;
  value?: string;
  subtext?: string;
  children?: React.ReactNode;
  showShare?: boolean
}

export const StorySlide = ({ title, value, subtext, children }: StorySlideProps) => (
  <View style={styles.container}>
    <Animatable.Text animation="fadeInDown" delay={300} style={styles.title}>
      {title}
    </Animatable.Text>

    {value && (
      <Animatable.Text animation="fadeIn" delay={1000} style={styles.value}>
        {value}
      </Animatable.Text>
    )}

    {subtext && (
      <Animatable.Text animation="fadeInUp" delay={1600} style={styles.subtext}>
        {subtext}
      </Animatable.Text>
    )}

    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtext: {
    fontSize: 18,
    color: '#AAA',
    textAlign: 'center',
    maxWidth: '90%',
  },
});
