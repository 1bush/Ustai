// Chat message component for in-app messaging
// Similar implementation to 1bush/Ustai-im GitHub repo

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextAvatar } from 'react-native';

interface ChatMessageProps {
  sender: 'client' | 'ustai';
  message: string;
  timestamp: string;
  onPress?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ sender, message, timestamp, onPress }) => {
  const isClient = sender === 'client';

  return (
    <View style={styles.container}>
      <Text style={styles.avatar}>{sender.charAt(0)}</Text>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
      </View>
      <Text style={styles.time}>{timestamp}</Text>
      {onPress && (
        <TouchableOpacity style={styles.container} onPress={onPress}>
          <Text style={styles.placeholder} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1B4B43',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 12,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    backgroundColor: sender === 'client' ? '#1B4B43' : '#E0DDD5',
    padding: 12,
    borderRadius: 18,
    maxWidth: '75%',
    color: sender === 'client' ? '#fff' : '#1B4B43',
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
  },
  time: {
    marginTop: 4,
    fontSize: 10,
    color: '#666',
    marginHorizontal: 6,
  },
  placeholder: {
    width: 1,
    height: 1,
  },
});