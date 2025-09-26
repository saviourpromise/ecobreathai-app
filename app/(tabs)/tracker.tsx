import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TrackerScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [wheezing, setWheezing] = useState(0);
  const [cough, setCough] = useState(0);
  const [asthmaAttack, setAsthmaAttack] = useState(false);
  const [quickSymptoms, setQuickSymptoms] = useState([
    "Chest Tightness",
    "Shortness of Breath",
    "Fatigue",
  ]);

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        Alert.alert("Error", "You must be logged in to track symptoms.");
      } else {
        setToken(savedToken);
        fetchLogs(savedToken);
      }
    };
    loadToken();
  }, []);

  const togglePicker = () => setShowPicker(!showPicker);

  const formatDateTime = (d: Date) =>
    `${d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })}, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const fetchLogs = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch("https://climaai.onrender.com/api/symptoms/log", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.data || []);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch logs");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong fetching logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLog = async () => {
    if (!token) {
      Alert.alert("Error", "You must be logged in to save logs");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://climaai.onrender.com/api/symptoms/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptoms: {
            wheezing,
            cough,
            breathlessness: 2,
            chestTightness: 4,
            attack: asthmaAttack,
            triggers: quickSymptoms,
          },
          medication: {
            relieverUsed: false,
            controllerTaken: false,
            otherMedications: [],
          },
          notes: "Logged from app",
          date: date.toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert("Success", "Symptom log saved!");
        fetchLogs(token);
      } else {
        Alert.alert("Error", data.message || "Failed to save log");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E5E9F0" }}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Ionicons name="chevron-back" size={24} color="#0F172A" />
        <Text style={styles.headerTitle}>Log Symptoms</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Date & Time Picker */}
        <Text style={styles.symptomLabel}>Date & Time</Text>
        <Pressable style={styles.inputCard} onPress={togglePicker}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#0F172A"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.inputText}>{formatDateTime(date)}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            style={{ marginBottom: 20 }}
            value={date}
            mode="datetime"
            display="default"
            onChange={(_, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Symptoms */}
        <Text style={styles.symptomLabel}>Symptoms</Text>
        <View style={styles.symptomCard}>
          <Text style={styles.symptomLabel}>Wheezing</Text>
          <View style={styles.sliderRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setWheezing(Math.max(0, wheezing - 1))}
            >
              <Ionicons name="remove" size={18} color="#0F172A" />
            </TouchableOpacity>
            <Slider
              style={{ flex: 1, marginHorizontal: 10 }}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={wheezing}
              onValueChange={setWheezing}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#CBD5E1"
              thumbTintColor="#2563EB"
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setWheezing(Math.min(10, wheezing + 1))}
            >
              <Ionicons name="add" size={18} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.valueText}>{wheezing}</Text>
          </View>
        </View>

        <View style={styles.symptomCard}>
          <Text style={styles.symptomLabel}>Cough</Text>
          <View style={styles.sliderRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setCough(Math.max(0, cough - 1))}
            >
              <Ionicons name="remove" size={18} color="#0F172A" />
            </TouchableOpacity>
            <Slider
              style={{ flex: 1, marginHorizontal: 10 }}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={cough}
              onValueChange={setCough}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#CBD5E1"
              thumbTintColor="#2563EB"
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setCough(Math.min(10, cough + 1))}
            >
              <Ionicons name="add" size={18} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.valueText}>{cough}</Text>
          </View>
        </View>

        {/* Asthma Attack Toggle */}
        <View style={styles.switchRow}>
          <Text style={styles.symptomLabel}>Asthma Attack</Text>
          <Switch
            value={asthmaAttack}
            onValueChange={setAsthmaAttack}
            thumbColor={asthmaAttack ? "#2563EB" : "#CBD5E1"}
            trackColor={{ false: "#E2E8F0", true: "#93C5FD" }}
          />
        </View>

        {/* Quick Add */}
        <Text style={styles.symptomLabel}>Quick Add</Text>
        <View style={styles.quickAddContainer}>
          {quickSymptoms.map((symptom, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{symptom}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addChip}>
            <Ionicons name="add" size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveLog}>
          <Text style={styles.saveButtonText}>
            {loading ? "Saving..." : "Save Log"}
          </Text>
        </TouchableOpacity>

        {/* Logs History */}
        <Text style={[styles.symptomLabel, { marginTop: 20 }]}>History</Text>
        {loading && logs.length === 0 ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.logCard}>
                <Text style={{ fontWeight: "600" }}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
                <Text>Wheezing: {item.symptoms?.wheezing}</Text>
                <Text>Cough: {item.symptoms?.cough}</Text>
                <Text>Attack: {item.symptoms?.attack ? "Yes" : "No"}</Text>
                <Text>Risk: {item.riskLevel}</Text>
              </View>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    height: 100,
    paddingHorizontal: 16,
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E2E8F0",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  container: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: "#F1F5F9",
    flexGrow: 1,
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  inputText: { fontSize: 16, color: "#0F172A" },
  symptomCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  symptomLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 8,
  },
  sliderRow: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#475569",
    marginLeft: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  quickAddContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 30,
  },
  chip: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: { fontSize: 14, color: "#334155" },
  addChip: {
    backgroundColor: "#E2E8F0",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  logCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
});
