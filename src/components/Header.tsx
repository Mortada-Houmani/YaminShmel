import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, ChevronDown, Sparkles } from 'lucide-react-native';

interface HeaderProps {
  stagedCount: number;
  selectedMonthTitle: string;
  onOpenMonthSelector: () => void;
  onOpenTrashReview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stagedCount,
  selectedMonthTitle,
  onOpenMonthSelector,
  onOpenTrashReview,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Brand & Arabic Title */}
      <View style={styles.titleGroup}>
        <Text style={styles.brandTitle}>YaminShmel</Text>
        <Text style={styles.arabicBadge}>يمين شمال</Text>
      </View>

      {/* Month Filter Selector */}
      <TouchableOpacity
        style={styles.monthPill}
        onPress={onOpenMonthSelector}
        activeOpacity={0.8}
      >
        <Text style={styles.monthPillText}>{selectedMonthTitle}</Text>
        <ChevronDown size={14} color="#818CF8" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Trash Review Button & Count Badge */}
      <TouchableOpacity
        style={styles.trashBadgeButton}
        onPress={onOpenTrashReview}
        activeOpacity={0.85}
      >
        <Trash2 size={20} color={stagedCount > 0 ? '#EF4444' : '#94A3B8'} />
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0F172A',
  },
  titleGroup: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  arabicBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#818CF8',
    marginTop: -2,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  monthPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C7D2FE',
  },
  trashBadgeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.6)',
    position: 'relative',
  },
  badgeNumberBox: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  badgeNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
