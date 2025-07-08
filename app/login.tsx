import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as yup from "yup";

type LoginFormData = {
  email: string;
  password: string;
};

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    console.log("Login data submitted:", data);

    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header with Logo and Background Design */}
        <View style={styles.header}>
          <View style={styles.backgroundCircle1} />
          <View style={styles.backgroundCircle2} />
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main Content Container */}
        <View style={styles.contentContainer}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>
              Please sign in to your account
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({
                  field: { onChange, value },
                }: {
                  field: { onChange: (text: string) => void; value: string };
                }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      errors.email && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your email"
                      placeholderTextColor="#A0A0A0"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({
                  field: { onChange, value },
                }: {
                  field: { onChange: (text: string) => void; value: string };
                }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#A0A0A0"
                      secureTextEntry={true}
                      textContentType="password"
                      autoComplete="password"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            <Pressable style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              style={[
                styles.signInButton,
                isSubmitting && styles.signInButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Text style={styles.signInButtonText}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Text>
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <Pressable style={styles.googleButton}>
              <Image
                source={require("@/assets/images/google.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don&apos;t have an account?{" "}
              </Text>
              <Pressable>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    height: 140,
    backgroundColor: "#3b82f6",
    position: "relative",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  backgroundCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  backgroundCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    bottom: -30,
    left: -30,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  logo: {
    width: 140,
    height: 25,
    tintColor: "#ffffff",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  welcomeSection: {
    marginBottom: 40,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  textInput: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "400",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  signInButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0.1,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 16,
    borderRadius: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 16,
    color: "#6b7280",
  },
  signUpLink: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
});
