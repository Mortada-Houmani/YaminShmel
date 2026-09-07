import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Sparkles, Settings, Play } from 'lucide-react-native';
import { Image } from 'expo-image';
import { GridBackground } from '../../../components/GridBackground';

interface PermissionGuardProps {
  onRequestPermission: () => void;
  onOpenSettings?: () => void;
  onLaunchDemoMode?: () => void;
  isRequesting: boolean;
  canAskAgain?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  onRequestPermission,
  onOpenSettings,
  onLaunchDemoMode,
  isRequesting,
  canAskAgain = true,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <GridBackground gridSize={28} gridColor="#E2E8F0" backgroundColor="#FAFAFA" />

      <View style={styles.content}>
        {/* Brand Icon Badge */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Image
              source={require('../../../../assets/logo-yamin shmel.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>
          <View style={styles.badge}>
            <Sparkles size={14} color="#059669" />
          </View>
        </View>

        <Text style={styles.title}>YaminShmel</Text>
        <Text style={styles.arabicSubtitle}>يمين شمال</Text>

        <Text style={styles.description}>
          Rapidly declutter your device photo gallery with tactile left & right gestures.
        </Text>

        {/* 100% Local Privacy Card */}
        <View style={styles.privacyCard}>
          <ShieldCheck size={22} color="#059669" style={styles.shieldIcon} />
          <View style={styles.privacyTextGroup}>
            <Text style={styles.privacyTitle}>100% Local & Safe</Text>
            <Text style={styles.privacySubtitle}>
              Your photos never leave your device. Deleted photos are safely kept in your phone's Trash/Bin for 30 days before permanent deletion.
            </Text>
          </View>
        </View>

        {/* Primary Action Button */}
        {canAskAgain ? (
          <TouchableOpacity
            style={[styles.primaryButton, isRequesting && styles.buttonDisabled]}
            onPress={onRequestPermission}
            activeOpacity={0.85}
            disabled={isRequesting}
          >
            <Text style={styles.primaryButtonText}>
              {isRequesting ? 'Requesting Access...' : 'Grant Photo Access'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, styles.settingsButton]}
            onPress={onOpenSettings || onRequestPermission}
            activeOpacity={0.85}
          >
            <Settings size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Open Device Settings</Text>
          </TouchableOpacity>
        )}

        {/* Demo Mode Action for Expo Go Testing */}
        {onLaunchDemoMode && (
          <TouchableOpacity
            style={styles.demoButton}
            onPress={onLaunchDemoMode}
            activeOpacity={0.8}
          >
            <Play size={16} color="#0F172A" fill="#0F172A" style={{ marginRight: 8 }} />
            <Text style={styles.demoButtonText}>Test in Demo Mode (Sample Photos)</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  logoImage: {
    width: 68,
    height: 68,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  arabicSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 300,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 28,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  shieldIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  privacyTextGroup: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  privacySubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  settingsButton: {
    backgroundColor: '#0F172A',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});


