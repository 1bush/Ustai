// Chat message component for in-app messaging
// Similar implementation to 1bush/Ustai-im GitHub repo

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NGJYRAT } from '../theme/colors';

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
      <Text style={[styles.avatar, isClient && styles.avatarClient]}>{sender.charAt(0)}</Text>
      <View style={[styles.bubble, isClient ? styles.bubbleClient : styles.bubbleUstai]}>
        <Text style={[styles.text, isClient && styles.textClient]}>{message}</Text>
      </View>
      <Text style={styles.time}>{timestamp}</Text>
      {onPress && (
        <TouchableOpacity
          style={styles.replyBtn}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.replyIcon}>↩</Text>
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
    backgroundColor: NGJYRAT.sfondiKarte,
    color: NGJYRAT.tekstiZbehur,
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 12,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarClient: {
    backgroundColor: NGJYRAT.primare,
    color: '#000000',
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '75%',
  },
  bubbleClient: {
    backgroundColor: NGJYRAT.primare,
  },
  bubbleUstai: {
    backgroundColor: NGJYRAT.sfondiKarte,
    borderWidth: 1,
    borderColor: NGJYRAT.kufiri,
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
    color: NGJYRAT.teksti,
  },
  textClient: {
    color: '#000000',
  },
  time: {
    marginTop: 4,
    fontSize: 10,
    color: NGJYRAT.tekstiShumeZbehur,
    marginHorizontal: 6,
  },
  replyBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  replyIcon: {
    fontSize: 10,
    color: '#fff',
  },
});