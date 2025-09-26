import React, { useState, useEffect, useRef } from "react";
import { OPENAI_API_KEY } from '@env';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type Message = {
  id: string;
  text: string;
  sender: "Ai" | "User";
};

export default function AICoachScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
const YOUR_OPENAI_API_KEY = OPENAI_API_KEY;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! I’m your EcoBreath AI Coach. I’m here to help you understand how climate change impacts your asthma and what you can do about it. How are you feeling today?",
      sender: "Ai",
    },
    {
      id: "2",
      text: "I understand your concern. It’s common for asthma symptoms to worsen with changes in air quality. Let’s explore how climate change might be affecting your breathing and discuss strategies to manage it.",
      sender: "Ai",
    },
  ]);

  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false); // <-- new state

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "User",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${YOUR_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // ✅ fast + cheaper for mobile apps
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful AI coach focused on asthma, climate, and health guidance.",
              },
              ...messages.map((m) => ({
                role: m.sender === "User" ? "user" : "assistant",
                content: m.text,
              })),
              { role: "user", content: input },
            ],
            max_tokens: 300,
          }),
        }
      );

      const data = await response.json();
      console.log("AI response:", data); // 👈 log to debug

      // Safely extract AI response
      const aiText =
        data?.choices?.[0]?.message?.content ??
        "Sorry, I couldn't fetch a response.";

      // Add AI response to chat
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiText,
        sender: "Ai",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error fetching AI response:", err);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Oops! I couldn't fetch a response. Try again.",
        sender: "Ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "User" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.sender === "Ai" && (
        <View style={styles.avatar}>
          <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
        </View>
      )}
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
      {item.sender === "User" && (
        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="#0F172A" />
        <Text style={styles.headerTitle}>AI Coach</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={[styles.messageContainer, styles.aiMessage]}>
          <View style={styles.avatar}>
            <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
          </View>
          <View style={[styles.messageBubble, { backgroundColor: "#e0e0e0" }]}>
            <Text style={styles.messageText}>AI is typing...</Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={tabBarHeight}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              marginBottom: keyboardVisible ? "-29%" : "13%",
            },
          ]}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message EcoBreath AI"
              value={input}
              onChangeText={setInput}
              multiline={true}
              blurOnSubmit={false} // ✅ keeps keyboard open
              returnKeyType="default" // ✅ avoids "send" behavior
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#bed1c0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  avatar: {
    marginHorizontal: 8,
  },
  inputWrapper: {
    padding: 12,
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
