import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Inbox } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { radius, INK, alpha } from './tokens';

// ---------------------------------------------------------------------------
// ScreenHeader — title, optional count + subtitle, actions on the right.
// Used at the top of every list screen (Stores, Recce, Installation, Users…).
// ---------------------------------------------------------------------------
export function ScreenHeader({ title, subtitle, count, actions }: { title: string; subtitle?: string; count?: number; actions?: React.ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: c.text }} numberOfLines={1}>{title}</Text>
          {count !== undefined && count > 0 ? (
            <View style={[styles.countPill, { backgroundColor: alpha(c.primary, 0.18) }]}>
              <Text style={{ color: c.text, fontSize: 12, fontWeight: '800' }}>{count}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {actions ? <View style={{ flexDirection: 'row', gap: 8 }}>{actions}</View> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SearchBar — search input + optional filter button with active-count badge.
// ---------------------------------------------------------------------------
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search…',
  onFilterPress,
  activeFilters = 0,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  activeFilters?: number;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const active = activeFilters > 0;
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Search size={18} color={c.textSecondary} />
        <TextInput
          style={{ flex: 1, paddingVertical: 11, paddingHorizontal: 8, color: c.text, fontSize: 15 }}
          placeholder={placeholder}
          placeholderTextColor={c.textTertiary}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value ? (
          <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={16} color={c.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {onFilterPress ? (
        <TouchableOpacity
          onPress={onFilterPress}
          activeOpacity={0.8}
          style={[styles.filterBtn, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}
        >
          <SlidersHorizontal size={18} color={active ? INK : c.text} />
          {active ? (
            <View style={styles.filterBadge}>
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>{activeFilters}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// FilterChips — removable chips summarising the applied filters.
// ---------------------------------------------------------------------------
export function ActiveFilters({ items, onClearAll }: { items: Array<{ key: string; label: string; onRemove: () => void }>; onClearAll?: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  if (!items.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
      {items.map(it => (
        <TouchableOpacity key={it.key} onPress={it.onRemove} style={[styles.activeChip, { backgroundColor: alpha(c.primary, 0.14), borderColor: alpha(c.primary, 0.4) }]}>
          <Text style={{ color: c.text, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>{it.label}</Text>
          <X size={12} color={c.text} />
        </TouchableOpacity>
      ))}
      {onClearAll ? (
        <TouchableOpacity onPress={onClearAll} style={[styles.activeChip, { borderColor: 'transparent' }]}>
          <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '800' }}>Clear all</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// SelectionBar — "3 selected" with bulk actions, shown while items are picked.
// ---------------------------------------------------------------------------
export function SelectionBar({ count, noun = 'item', onClear, children }: { count: number; noun?: string; onClear: () => void; children?: React.ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  if (count <= 0) return null;
  return (
    <View style={[styles.selection, { backgroundColor: c.text }]}>
      <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.selectionClose}>
        <X size={16} color={c.background} />
      </TouchableOpacity>
      <Text style={{ color: c.background, fontSize: 14, fontWeight: '800', flex: 1 }}>
        {count} {noun}{count > 1 ? 's' : ''} selected
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>{children}</View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export function Pagination({ page, totalPages, total, noun = 'items', onPrev, onNext }: { page: number; totalPages: number; total?: number; noun?: string; onPrev: () => void; onNext: () => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  if (totalPages <= 1) return null;
  const btn = (disabled: boolean) => [styles.pageBtn, { backgroundColor: c.surface, borderColor: c.border, opacity: disabled ? 0.4 : 1 }];
  return (
    <View style={styles.pagination}>
      <TouchableOpacity onPress={onPrev} disabled={page <= 1} style={btn(page <= 1)}>
        <ChevronLeft size={18} color={c.text} />
      </TouchableOpacity>
      <View style={{ alignItems: 'center', minWidth: 120 }}>
        <Text style={{ color: c.text, fontWeight: '800', fontSize: 14 }}>Page {page} of {totalPages}</Text>
        {total !== undefined ? <Text style={{ color: c.textSecondary, fontSize: 11, marginTop: 1 }}>{total} {noun}</Text> : null}
      </View>
      <TouchableOpacity onPress={onNext} disabled={page >= totalPages} style={btn(page >= totalPages)}>
        <ChevronRight size={18} color={c.text} />
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------
export function EmptyState({ title, message, icon, action }: { title: string; message?: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: c.surfaceSecondary }]}>{icon || <Inbox size={28} color={c.textTertiary} />}</View>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: '800', textAlign: 'center' }}>{title}</Text>
      {message ? <Text style={{ color: c.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 19 }}>{message}</Text> : null}
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  countPill: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: radius.pill },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, paddingHorizontal: 12, borderWidth: 1 },
  filterBtn: { width: 46, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterBadge: { position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, maxWidth: 220 },
  selection: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.lg, paddingVertical: 8, paddingLeft: 10, paddingRight: 8, marginTop: 12 },
  selectionClose: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 12 },
  pageBtn: { width: 40, height: 40, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
});
