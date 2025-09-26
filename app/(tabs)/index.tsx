import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

type ClimateData = {
  location: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
  AQI: number;
  temperature: number;
  humidity: number;
  pollen: number;
  riskLevel: string;
  raw: {
    weather: {
      coord: { lon: number; lat: number };
      weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
      }[];
      base: string;
      main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
        sea_level: number;
        grnd_level: number;
      };
      visibility: number;
      wind: { speed: number; deg: number; gust: number };
      clouds: { all: number };
      dt: number;
      sys: { country: string; sunrise: number; sunset: number };
      timezone: number;
      id: number;
      name: string;
      cod: number;
    };
    aqi: any; // you can further type if needed
    pollen: { estimated: boolean; value: number };
  };
  _id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchClimate = async () => {
      try {
        const res = await fetch(
          "https://climaai.onrender.com/api/climate/current"
        );
        const data = await res.json();
        setClimateData(data);
      } catch (error) {
        console.error("Error fetching climate data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClimate();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 8, color: "#333" }}>
          Loading climate data...
        </Text>
      </View>
    );
  }

  if (!climateData) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "red" }}>Failed to load climate data</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
    >
      {/* Header */}
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>EcoBreath AI</Text>
          <Ionicons name="settings-outline" size={22} color="#333" />
        </View>

        {/* Risk Status */}
        <View style={styles.riskCard}>
          <Text style={styles.riskTitle}>
            {climateData.riskLevel || "Unknown"}
          </Text>
          <Text style={styles.riskSubtitle}>
            {`Today's asthma risk in ${climateData.location.city}, ${climateData.location.country} is ${climateData.riskLevel}.`}
          </Text>
        </View>

        {/* Current Conditions */}
        <Text style={styles.sectionTitle}>Current Conditions</Text>
        <View style={styles.conditionsGrid}>
          <View style={styles.conditionCard}>
            <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
            <Text style={styles.conditionValue}>
              {climateData.AQI ? `Good (${climateData.AQI})` : "N/A"}
            </Text>
            <Text style={styles.conditionLabel}>AQI</Text>
          </View>
          <View style={styles.conditionCard}>
            <Ionicons name="thermometer-outline" size={24} color="#FF5722" />
            <Text style={styles.conditionValue}>
              {climateData.temperature
                ? `${climateData.temperature.toFixed(1)}°C`
                : "N/A"}
            </Text>
            <Text style={styles.conditionLabel}>Temperature</Text>
          </View>
          <View style={styles.conditionCard}>
            <Ionicons name="water-outline" size={24} color="#2196F3" />
            <Text style={styles.conditionValue}>
              {climateData.humidity ? `${climateData.humidity}%` : "N/A"}
            </Text>
            <Text style={styles.conditionLabel}>Humidity</Text>
          </View>
          <View style={styles.conditionCard}>
            <Ionicons name="flower-outline" size={24} color="#9C27B0" />
            <Text style={styles.conditionValue}>
              {climateData.pollen ? `Low (${climateData.pollen})` : "N/A"}
            </Text>
            <Text style={styles.conditionLabel}>Pollen</Text>
          </View>
        </View>

        {/* Asthma Forecast */}
        <LinearGradient
          colors={["#475948", "#bed1c0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            {
              paddingHorizontal: 20,
              paddingTop: 80,
              paddingBottom: 20,
              borderRadius: 12,
              marginBottom: 20,
            },
            styles.forecastCard,
          ]}
        >
          <Text style={styles.forecastTitle}>Asthma Forecast</Text>
          <TouchableOpacity
            style={styles.forecastLinkContainer}
            onPress={() => setShowDetails(true)} // <-- show details
          >
            <Text style={styles.forecastLink}>View Details</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Detailed Forecast (toggle) */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            <View style={[styles.card, { backgroundColor: "#E6F7E9" }]}>
              <Text style={styles.detailsTitle}>
                Risk Level: {climateData.riskLevel}
              </Text>
              <Text style={styles.detailsText}>
                Today’s asthma risk in {climateData.location.city},{" "}
                {climateData.location.country} is {climateData.riskLevel}.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.detailsTitle}>Contributing Factors</Text>
              <Text style={styles.detailsText}>🌿 AQI: {climateData.AQI}</Text>
              <Text style={styles.detailsText}>
                🌡 Temperature: {climateData.temperature.toFixed(1)}°C
              </Text>
              <Text style={styles.detailsText}>
                💧 Humidity: {climateData.humidity}%
              </Text>
              <Text style={styles.detailsText}>
                🌸 Pollen: {climateData.pollen}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: "#FFF8E1" }]}>
              <Text style={styles.detailsTitle}>Health Advice</Text>
              <Text style={styles.detailsText}>
                ✔ Carry your inhaler when outdoors.
              </Text>
              <Text style={styles.detailsText}>
                ✔ Avoid outdoor activity in the afternoon.
              </Text>
              <Text style={styles.detailsText}>
                ✔ Keep windows closed to reduce pollen exposure.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetails(false)}
            >
              <Text style={styles.closeButtonText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ask AI Coach */}
        <TouchableOpacity style={styles.aiCoachButton} onPress={() => router.push('/aicoach')}>
          <View
            style={{ flexDirection: "column", gap: 10, alignItems: "center" }}
          >
            <Text style={styles.aiCoachText}>Ask the AI Coach</Text>
            <Text style={styles.aiCoachSecondText}>
              Get personalized advice.
            </Text>
          </View>
          <Image
            source={require("@/assets/images/blueBot.png")}
            style={{ width: 45, height: 45, borderRadius: 30 }}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appTitle: { fontSize: 24, fontWeight: "700", color: "#333" },
  riskCard: {
    backgroundColor: "#E6F7E9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  riskTitle: { fontSize: 20, fontWeight: "700", color: "#2E7D32" },
  riskSubtitle: { fontSize: 16, color: "#4CAF50", marginTop: 4 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  conditionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  conditionCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  conditionValue: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  conditionLabel: { fontSize: 12, color: "#777", marginTop: 2 },
  forecastCard: { borderRadius: 12 },
  forecastTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  forecastLinkContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 40,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  forecastLink: { color: "#fff", fontSize: 16, fontWeight: "600" },
  aiCoachButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  aiCoachText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  aiCoachSecondText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FB",
  },
  detailsContainer: { marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  detailsText: { fontSize: 14, color: "#555", marginBottom: 4 },
  closeButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});