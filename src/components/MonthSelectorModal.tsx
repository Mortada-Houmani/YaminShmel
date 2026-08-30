import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
          <Text style={styles.title}>Filter by Period</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.75}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* All Photos Option */}
          <TouchableOpacity
            style={[styles.item, selectedMonthId === 'ALL' && styles.itemSelected]}
            onPress={() => handleSelect('ALL')}
            activeOpacity={0.75}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, selectedMonthId === 'ALL' && styles.iconBoxSelected]}>
                <Calendar size={18} color={selectedMonthId === 'ALL' ? '#0F172A' : '#64748B'} />
              </View>
              <View>
                <Text style={styles.itemTitle}>All Photos</Text>
                <Text style={styles.itemSubtitle}>{totalAssetsCount} media items</Text>
              </View>
            </View>
            {selectedMonthId === 'ALL' && <Check size={18} color="#0F172A" strokeWidth={2.5} />}
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>Grouped Timeline</Text>

          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedMonthId === item.id;
              return (
                <TouchableOpacity
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                      <Calendar size={18} color={isSelected ? '#0F172A' : '#64748B'} />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.count} photos</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={18} color="#0F172A" strokeWidth={2.5} />}
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 12,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemSelected: {
    backgroundColor: '#F8FAFC',
    borderColor: '#0F172A',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxSelected: {
    backgroundColor: '#E2E8F0',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
});

