import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, ChevronDown, ArrowLeft } from 'lucide-react-native';
import { Image } from 'expo-image';

interface HeaderProps {
  stagedCount: number;
  selectedMonthTitle: string;
  onOpenMonthSelector: () => void;
  onOpenTrashReview: () => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stagedCount,
  selectedMonthTitle,
  onOpenMonthSelector,
  onOpenTrashReview,
  onBack,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Brand or Back to Home Button */}
      {onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.75}>
          <ArrowLeft size={18} color="#0F172A" strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.titleGroup}>
          <Image
            source={require('../../assets/logo-yamin shmel.png')}
            style={styles.brandLogo}
            contentFit="contain"
          />
          <View>
            <Text style={styles.brandTitle}>YaminShmel</Text>
            <Text style={styles.arabicBadge}>يمين شمال</Text>
          </View>
        </View>
      )}

      {/* Month Filter Selector */}
      <TouchableOpacity
        style={styles.monthPill}
        onPress={onOpenMonthSelector}
        activeOpacity={0.75}
      >
        <Text style={styles.monthPillText}>{selectedMonthTitle}</Text>
        <ChevronDown size={13} color="#64748B" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Trash Review Button & Count Badge */}
      <TouchableOpacity
        style={[styles.trashBadgeButton, stagedCount > 0 && styles.trashBadgeButtonActive]}
        onPress={onOpenTrashReview}
        activeOpacity={0.75}
      >
        <Trash2 size={18} color={stagedCount > 0 ? '#DC2626' : '#64748B'} strokeWidth={2} />
        {stagedCount > 0 && (
          <View style={styles.badgeNumberBox}>
            <Text style={styles.badgeNumberText}>{stagedCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 34,
    height: 34,
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 5,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  arabicBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -1,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  trashBadgeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  trashBadgeButtonActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FECACA',
  },
  badgeNumberBox: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#DC2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});

