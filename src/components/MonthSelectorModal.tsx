import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { MonthGroup } from '../types/media';
import { X, Calendar, Check } from 'lucide-react-native';

interface MonthSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  groups: MonthGroup[];
  selectedMonthId: string | 'ALL';
  onSelectMonth: (id: string | 'ALL') => void;
  totalAssetsCount: number;
}

export const MonthSelectorModal: React.FC<MonthSelectorModalProps> = ({
  visible,
  onClose,
  groups,
  selectedMonthId,
  onSelectMonth,
  totalAssetsCount,
}) => {
  const handleSelect = (id: string | 'ALL') => {
    onSelectMonth(id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Cleanup Batch</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* All Photos Option */}
          <TouchableOpacity
            style={[styles.item, selectedMonthId === 'ALL' && styles.itemSelected]}
            onPress={() => handleSelect('ALL')}
            activeOpacity={0.8}
          >
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Calendar size={18} color="#818CF8" />
              </View>
              <View>
                <Text style={styles.itemTitle}>All Photos</Text>
                <Text style={styles.itemSubtitle}>{totalAssetsCount} media items</Text>
              </View>
            </View>
            {selectedMonthId === 'ALL' && <Check size={20} color="#6366F1" />}
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>Grouped by Month</Text>

          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedMonthId === item.id;
              return (
                <TouchableOpacity
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.iconBox}>
                      <Calendar size={18} color="#94A3B8" />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.count} photos</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={20} color="#6366F1" />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  itemSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366F1',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});
