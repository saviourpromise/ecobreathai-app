import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Image,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Notification toggles
  const [asthmaAlerts, setAsthmaAlerts] = useState(true);
  const [climateUpdates, setClimateUpdates] = useState(true);
  const [coachUpdates, setCoachUpdates] = useState(true);

  useEffect(() => {
    loadTokenAndProfile();
  }, []);

  const loadTokenAndProfile = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    }
  };

  const fetchProfile = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch("https://climaai.onrender.com/api/user/profile", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      } else {
        Alert.alert("Error", "Failed to load profile");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      setLoading(true);
      const endpoint = isLogin
        ? "https://climaai.onrender.com/api/auth/login"
        : "https://climaai.onrender.com/api/auth/signup";

      const body: any = { email, password };
      if (!isLogin) body.name = name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const authToken = data.data.token; // ← save this
        await AsyncStorage.setItem("token", authToken);
        setToken(authToken);

        // also save user returned here
        setUser(data.data.user);

        Alert.alert(isLogin ? "Login successful" : "Signup successful");

        // fetch fresh profile using token
        fetchProfile(authToken);
      } else {
        Alert.alert("Error", data.message || "Authentication failed");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    // Auth form
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>
          {isLogin ? (
            <>
              <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Text style={{ fontWeight: "700", fontSize: 28 }}>Welcome Back</Text>
                <Text style={{ fontWeight: "600", fontSize: 16, color: "gray" }}>
                  Log into your EcoBreath AI account
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Text style={{ fontWeight: "700", fontSize: 28 }}>Create Your Acount</Text>
                <Text style={{ fontWeight: "600", fontSize: 16, color: "gray" }}>
                  Sign up to get started.
                </Text>
              </View>
            </>
          )}
        </Text>

        {!isLogin && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
          </>
        )}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.linkButtonText}>
            {isLogin ? "Not yet registered? Signup" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Profile / Settings UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
      </View>

      {/* Section: Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Name</Text>
          <Text style={styles.itemValue}>{user.name}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Email</Text>
          <Text style={styles.itemValue}>{user.email}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Role</Text>
          <Text style={styles.itemValue}>{user.role}</Text>
        </View>
      </View>

      {/* Section: Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Language</Text>
          <Text style={styles.itemValue}>{user.preferences?.language || "en"}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Units</Text>
          <Text style={styles.itemValue}>{user.preferences?.units || "metric"}</Text>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Asthma Alerts</Text>
          <Switch
            value={asthmaAlerts}
            onValueChange={setAsthmaAlerts}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Climate Updates</Text>
          <Switch
            value={climateUpdates}
            onValueChange={setClimateUpdates}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>AI Coach Tips</Text>
          <Switch
            value={coachUpdates}
            onValueChange={setCoachUpdates}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 100,
    backgroundColor: "#F1F5F9",
  },
  button: {
    backgroundColor: "#2563EB", // nice blue
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#DC2626", // red-600
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#93C5FD", // lighter blue for disabled
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  linkButtonText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 2,
    fontWeight: "500",
    padding: 2,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
  },
  profileEmail: {
    fontSize: 14,
    color: "#64748B",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 10,
  },
  item: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  itemLabel: {
    fontSize: 16,
    color: "#1E293B",
  },
  itemValue: {
    fontSize: 16,
    color: "#64748B",
  },
  input: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 8,
    fontWeight: "600",
    fontSize: 16,
    backgroundColor: "#fff",
  },
});