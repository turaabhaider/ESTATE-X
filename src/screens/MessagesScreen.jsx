import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

export default function MessagesScreen() {
  const { chats, sendMessage } = useApp();
  const [activeChatId, setActiveChatId] = useState(null);
  const [draft, setDraft] = useState('');

  const activeChat = chats.find((c) => c.id === activeChatId);

  const handleSend = () => {
    if (!draft.trim() || !activeChat) return;
    sendMessage(
      activeChat.agentName,
      activeChat.propertyTitle,
      activeChat.avatar,
      draft
    );
    setDraft('');
  };

  if (activeChat) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Chat Thread Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => setActiveChatId(null)}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={21} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Image
              source={{ uri: activeChat.avatar }}
              style={styles.headerAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName}>{activeChat.agentName}</Text>
              <Text style={styles.headerProp} numberOfLines={1}>
                {activeChat.propertyTitle}
              </Text>
            </View>
          </View>

          {/* Messages List */}
          <FlatList
            data={activeChat.messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => {
              const isUser = item.sender === 'user';
              return (
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.agentBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      isUser ? styles.userText : styles.agentText,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      isUser ? { color: '#D1E7DD' } : { color: COLORS.textMuted },
                    ]}
                  >
                    {item.time}
                  </Text>
                </View>
              );
            }}
          />

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Write a message to your advisor..."
              placeholderTextColor={COLORS.textMuted}
              value={draft}
              onChangeText={setDraft}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="send" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.inboxHeader}>
        <Text style={styles.title}>Advisor Concierge</Text>
        <Text style={styles.subtitle}>Direct private office messaging</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.inboxList}
        renderItem={({ item }) => {
          const lastMsg = item.messages[item.messages.length - 1];
          return (
            <TouchableOpacity
              style={styles.threadCard}
              activeOpacity={0.85}
              onPress={() => setActiveChatId(item.id)}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.threadBody}>
                <View style={styles.threadTop}>
                  <Text style={styles.agentName}>{item.agentName}</Text>
                  <Text style={styles.threadTime}>{item.time}</Text>
                </View>
                <Text style={styles.propTag} numberOfLines={1}>
                  {item.propertyTitle}
                </Text>
                <Text style={styles.previewText} numberOfLines={1}>
                  {lastMsg?.text}
                </Text>
              </View>
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inboxHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inboxList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 110,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
  },
  threadBody: {
    flex: 1,
    marginLeft: 12,
  },
  threadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  threadTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  propTag: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  previewText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerProp: {
    fontSize: 12.5,
    color: COLORS.primary,
    fontWeight: '500',
  },
  messagesList: {
    padding: SPACING.lg,
    gap: 12,
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleText: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.white,
  },
  agentText: {
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 10.5,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 10,
    paddingBottom: 95,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    height: 46,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
});