import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, TextInputProps } from 'react-native';
import { ChevronDown, Check, Search } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { radius, INK, alpha } from './tokens';

// ---------------------------------------------------------------------------
// FormSection — numbered/iconed group of fields inside a form.
// ---------------------------------------------------------------------------
export function FormSection({ title, description, icon, step, right, children }: { title: string; description?: string; icon?: React.ReactNode; step?: number; right?: React.ReactNode; children: React.ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.sectionHeader}>
        {step !== undefined ? (
          <View style={[styles.step, { backgroundColor: c.primary }]}>
            <Text style={{ color: INK, fontSize: 12, fontWeight: '900' }}>{step}</Text>
          </View>
        ) : icon ? (
          <View style={[styles.step, { backgroundColor: alpha(c.primary, 0.16) }]}>{icon}</View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 15, fontWeight: '800' }}>{title}</Text>
          {description ? <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 1 }}>{description}</Text> : null}
        </View>
        {right}
      </View>
      <View style={{ gap: 14 }}>{children}</View>
    </View>
  );
}

/** Lays two (or more) fields side by side. */
export function FieldRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 10 }}>{React.Children.map(children, ch => (ch ? <View style={{ flex: 1 }}>{ch}</View> : null))}</View>;
}

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 6, gap: 4 }}>
      <Text style={{ color: c.text, fontSize: 12, fontWeight: '700' }}>{label}</Text>
      {required ? <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '800' }}>*</Text> : null}
      {hint ? <Text style={{ color: c.textTertiary, fontSize: 11, marginLeft: 'auto' }}>{hint}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// TextField — labelled input with focus ring, error text and optional suffix.
// ---------------------------------------------------------------------------
export function TextField({
  label,
  required,
  hint,
  error,
  suffix,
  multiline,
  style,
  ...input
}: TextInputProps & { label?: string; required?: boolean; hint?: string; error?: string; suffix?: string }) {
  const { theme, darkMode } = useTheme();
  const c = theme.colors;
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#EF4444' : focused ? c.primary : c.border;
  return (
    <View>
      {label ? <FieldLabel label={label} required={required} hint={hint} /> : null}
      <View style={[styles.inputWrap, { borderColor, backgroundColor: darkMode ? c.background : '#FFFFFF' }, focused && { borderWidth: 1.5 }, multiline && { alignItems: 'flex-start' }]}>
        <TextInput
          {...input}
          multiline={multiline}
          placeholderTextColor={input.placeholderTextColor || c.textTertiary}
          onFocus={e => { setFocused(true); input.onFocus?.(e); }}
          onBlur={e => { setFocused(false); input.onBlur?.(e); }}
          style={[
            { flex: 1, color: c.text, fontSize: 15, paddingVertical: 11 },
            multiline && { minHeight: 84, textAlignVertical: 'top' },
            style,
          ]}
        />
        {suffix ? <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '700', marginLeft: 6 }}>{suffix}</Text> : null}
      </View>
      {error ? <Text style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SelectField — tap to expand an inline, optionally searchable option list.
// Inline (not a nested Modal) so it works inside BottomSheet on Android; the
// list uses nestedScrollEnabled + keyboardShouldPersistTaps (see audit Session 7).
// ---------------------------------------------------------------------------
export type SelectOption = { key: string; label: string; sublabel?: string; muted?: boolean };

export function SelectField({
  label,
  required,
  hint,
  placeholder = 'Select',
  valueText,
  selectedKey,
  options,
  onSelect,
  open,
  onToggle,
  searchable,
  emptyText = 'No options',
  disabled,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  valueText?: string;
  selectedKey?: string;
  options: SelectOption[];
  onSelect: (opt: SelectOption) => void;
  open: boolean;
  onToggle: () => void;
  searchable?: boolean;
  emptyText?: string;
  disabled?: boolean;
}) {
  const { theme, darkMode } = useTheme();
  const c = theme.colors;
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const s = q.trim().toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(s) || (o.sublabel || '').toLowerCase().includes(s));
  }, [q, options]);

  return (
    <View>
      {label ? <FieldLabel label={label} required={required} hint={hint} /> : null}
      <TouchableOpacity
        onPress={disabled ? undefined : onToggle}
        activeOpacity={0.8}
        style={[
          styles.inputWrap,
          { borderColor: open ? c.primary : c.border, backgroundColor: darkMode ? c.background : '#FFFFFF', paddingVertical: 12, opacity: disabled ? 0.55 : 1 },
          open && { borderWidth: 1.5 },
        ]}
      >
        <Text style={{ flex: 1, color: valueText ? c.text : c.textTertiary, fontSize: 15 }} numberOfLines={1}>{valueText || placeholder}</Text>
        <ChevronDown size={16} color={c.textSecondary} style={open ? { transform: [{ rotate: '180deg' }] } : undefined} />
      </TouchableOpacity>

      {open ? (
        <View style={[styles.dropdown, { backgroundColor: c.surface, borderColor: c.border }]}>
          {searchable ? (
            <View style={[styles.dropdownSearch, { borderBottomColor: c.border }]}>
              <Search size={14} color={c.textSecondary} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search…"
                placeholderTextColor={c.textTertiary}
                autoCorrect={false}
                autoCapitalize="none"
                style={{ flex: 1, color: c.text, fontSize: 14, paddingVertical: 8, marginLeft: 6 }}
              />
            </View>
          ) : null}
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 220 }}>
            {filtered.length === 0 ? (
              <Text style={{ color: c.textSecondary, fontSize: 13, padding: 14 }}>{emptyText}</Text>
            ) : (
              filtered.map((o, i) => {
                const sel = o.key === selectedKey;
                return (
                  <TouchableOpacity
                    key={o.key || `opt-${i}`}
                    onPress={() => { setQ(''); onSelect(o); }}
                    style={[
                      styles.option,
                      i < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
                      sel && { backgroundColor: alpha(c.primary, 0.1) },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: o.muted ? c.textSecondary : c.text, fontSize: 14, fontWeight: sel ? '800' : '600' }}>{o.label}</Text>
                      {o.sublabel ? <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 1 }}>{o.sublabel}</Text> : null}
                    </View>
                    {sel ? <Check size={16} color={c.text} /> : null}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ToggleCard — a big, tappable on/off option with title + description.
// ---------------------------------------------------------------------------
export function ToggleCard({ value, onToggle, title, description, icon }: { value: boolean; onToggle: () => void; title: string; description?: string; icon?: React.ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={[styles.toggle, { borderColor: value ? c.primary : c.border, backgroundColor: value ? alpha(c.primary, 0.08) : c.surface }]}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontSize: 14, fontWeight: '800' }}>{title}</Text>
        {description ? <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>{description}</Text> : null}
      </View>
      <View style={[styles.switchTrack, { backgroundColor: value ? c.primary : c.border }]}>
        <View style={[styles.switchKnob, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// SegmentedControl — small 2–4 option switch (e.g. ft / in).
// ---------------------------------------------------------------------------
export function SegmentedControl({ label, options, value, onChange }: { label?: string; options: Array<{ key: string; label: string }>; value: string; onChange: (k: string) => void }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View>
      {label ? <FieldLabel label={label} /> : null}
      <View style={[styles.segment, { backgroundColor: c.surfaceSecondary }]}>
        {options.map(o => {
          const active = o.key === value;
          return (
            <TouchableOpacity key={o.key} onPress={() => onChange(o.key)} style={[styles.segmentItem, active && { backgroundColor: c.primary }]}>
              <Text style={{ color: active ? INK : c.textSecondary, fontSize: 13, fontWeight: active ? '900' : '600' }}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: radius.lg + 2, borderWidth: 1, padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  step: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 12 },
  dropdown: { borderWidth: 1, borderRadius: radius.md, marginTop: 6, overflow: 'hidden' },
  dropdownSearch: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: radius.lg, padding: 14 },
  switchTrack: { width: 46, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  switchKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  segment: { flexDirection: 'row', borderRadius: radius.md, padding: 3, height: 46 },
  segmentItem: { flex: 1, borderRadius: radius.md - 3, alignItems: 'center', justifyContent: 'center' },
});
