import React from "react";
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Define the types for the route parameters
type AsthmaDetailsRouteParams = {
  climateData: any; // Replace 'any' with the actual type of climateData if known
};

// Define the type for the route prop
type AsthmaDetailsRouteProp = RouteProp<Record<string, AsthmaDetailsRouteParams>, 'AsthmaDetailsScreen'>;

// Define the type for the navigation prop
type AsthmaDetailsNavigationProp = StackNavigationProp<any>; // Replace 'any' with your actual stack navigator params if known

interface AsthmaDetailsProps {
  route: AsthmaDetailsRouteProp;
  navigation: AsthmaDetailsNavigationProp;
}

export default function AsthmaDetailsScreen({ route, navigation }: AsthmaDetailsProps) {
  const { climateData } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Asthma Forecast Details</Text>
      </View>

      {/* Risk Level */}
      <View style={[styles.card, { backgroundColor: "#E6F7E9" }]}>
        <Text style={styles.riskText}>
          {climateData.riskLevel || "Unknown"} Risk
        </Text>
        <Text style={styles.subText}>
          Today’s asthma risk in {climateData.location.city},{" "}
          {climateData.location.country} is {climateData.riskLevel}.
        </Text>
      </View>

      {/* Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contributing Factors</Text>
        <Text style={styles.item}>🌿 AQI: {climateData.AQI || "N/A"}</Text>
        <Text style={styles.item}>🌡 Temperature: {climateData.temperature?.toFixed(1) || "N/A"}°C</Text>
        <Text style={styles.item}>💧 Humidity: {climateData.humidity || "N/A"}%</Text>
        <Text style={styles.item}>🌸 Pollen: {climateData.pollen || "N/A"}</Text>
      </View>

      {/* Health Advice */}
      <View style={[styles.card, { backgroundColor: "#FFF8E1" }]}>
        <Text style={styles.cardTitle}>Health Advice</Text>
        <Text style={styles.item}>✔ Carry your inhaler when outdoors.</Text>
        <Text style={styles.item}>✔ Avoid outdoor activity in the afternoon.</Text>
        <Text style={styles.item}>✔ Keep windows closed to reduce pollen exposure.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FB", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", marginLeft: 8, color: "#333" },
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
  riskText: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
  subText: { fontSize: 14, color: "#555", marginTop: 6 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: "#333" },
  item: { fontSize: 14, color: "#444", marginBottom: 4 },
});
