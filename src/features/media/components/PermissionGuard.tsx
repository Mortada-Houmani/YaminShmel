import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { ShieldCheck, Image as ImageIcon, Sparkles } from 'lucide-react-native';

interface PermissionGuardProps {
  onRequestPermission: () => void;
  isRequesting: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  onRequestPermission,
  isRequesting,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <ImageIcon size={48} color="#6366F1" />
          </View>
          <View style={styles.badge}>
            <Sparkles size={16} color="#10B981" />
          </View>
        </View>

        <Text style={styles.title}>Welcome to YaminShmel</Text>
        <Text style={styles.arabicSubtitle}>يمين شمال</Text>

        <Text style={styles.description}>
          Rapidly declutter your device photo gallery with simple left & right gestures.
        </Text>

        <View style={styles.privacyCard}>
          <ShieldCheck size={24} color="#10B981" style={styles.shieldIcon} />
          <View style={styles.privacyTextGroup}>
            <Text style={styles.privacyTitle}>100% Local & Private</Text>
            <Text style={styles.privacySubtitle}>
              Your photos never leave your device. Zero servers, zero uploads, zero tracking.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isRequesting && styles.buttonDisabled]}
          onPress={onRequestPermission}
          activeOpacity={0.85}
          disabled={isRequesting}
        >
          <Text style={styles.buttonText}>
            {isRequesting ? 'Requesting Access...' : 'Grant Photo Access'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  arabicSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#818CF8',
    marginTop: 4,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 320,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
    marginBottom: 36,
    width: '100%',
  },
  shieldIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  privacyTextGroup: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  privacySubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
