import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { radius, INK, statusMeta, alpha, tone } from './tokens';

// ---------------------------------------------------------------------------
// Card — the one container used for list items and grouped content.
// ---------------------------------------------------------------------------
export function Card({
  children,
  style,
  selected,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: selected ? alpha(c.primary, 0.07) : c.surface,
          borderColor: selected ? c.primary : c.border,
        },
        style,
      ]}
    >
      {children}
    </Wrapper>
  );
}

// ---------------------------------------------------------------------------
// StatusBadge — dot + label, colour from the shared status palette.
// ---------------------------------------------------------------------------
export function StatusBadge({ status, label, color, size = 'md' }: { status?: string; label?: string; color?: string; size?: 'sm' | 'md' }) {
  const meta = statusMeta(status);
  const col = color || meta.color;
  return (
    <View style={[styles.badge, { backgroundColor: alpha(col, 0.12) }, size === 'sm' && { paddingHorizontal: 7, paddingVertical: 2 }]}>
      <View style={[styles.badgeDot, { backgroundColor: col }]} />
      <Text style={{ color: col, fontSize: size === 'sm' ? 10 : 11, fontWeight: '700' }} numberOfLines={1}>
        {label || meta.label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Button — variants: primary (brand), solid (any colour), soft, outline, ghost.
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'solid' | 'soft' | 'outline' | 'ghost';

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  color,
  loading,
  disabled,
  size = 'md',
  style,
  flex,
}: {
  label?: string;
  onPress?: () => void;
  icon?: (color: string) => React.ReactNode;
  variant?: ButtonVariant;
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const base = color || c.primary;

  let bg = 'transparent';
  let fg = base;
  let border = 'transparent';
  if (variant === 'primary') { bg = c.primary; fg = INK; }
  if (variant === 'solid') { bg = base; fg = '#FFFFFF'; }
  if (variant === 'soft') { bg = alpha(base, 0.12); fg = base; }
  if (variant === 'outline') { border = c.border; fg = color || c.text; bg = c.surface; }
  if (variant === 'ghost') { fg = color || c.text; }

  const isDisabled = disabled || loading;
  const h = size === 'sm' ? 34 : size === 'lg' ? 52 : 42;
  const fs = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        { height: h, backgroundColor: bg, borderColor: border, paddingHorizontal: label ? (size === 'sm' ? 10 : 14) : 0, width: label ? undefined : h },
        variant === 'outline' && { borderWidth: 1 },
        flex && { flex: 1 },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : icon ? icon(fg) : null}
      {label ? <Text style={{ color: fg, fontSize: fs, fontWeight: '800' }} numberOfLines={1}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Chip — selectable pill for filters / quick choices.
// ---------------------------------------------------------------------------
export function Chip({ label, active, onPress, color, count }: { label: string; active?: boolean; onPress?: () => void; color?: string; count?: number }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        {
          backgroundColor: active ? c.primary : c.surface,
          borderColor: active ? c.primary : c.border,
        },
      ]}
    >
      {color ? <View style={[styles.badgeDot, { backgroundColor: active ? INK : color }]} /> : null}
      <Text style={{ color: active ? INK : c.text, fontSize: 12, fontWeight: active ? '800' : '600' }}>{label}</Text>
      {count !== undefined ? (
        <Text style={{ color: active ? INK : c.textSecondary, fontSize: 11, fontWeight: '700' }}>{count}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------
export function Checkbox({ checked, onPress, size = 22 }: { checked: boolean; onPress?: () => void; size?: number }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        width: size,
        height: size,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: checked ? c.primary : c.textTertiary,
        backgroundColor: checked ? c.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? <Check size={size - 8} color={INK} strokeWidth={3} /> : null}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Avatar — initial in a tinted circle.
// ---------------------------------------------------------------------------
export function Avatar({ name, color, size = 32, filled }: { name?: string; color?: string; size?: number; filled?: boolean }) {
  const { theme } = useTheme();
  const col = color || theme.colors.primary;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: filled ? col : alpha(col, 0.15), alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: filled ? (col === theme.colors.primary ? INK : '#FFF') : col, fontSize: size * 0.42, fontWeight: '900' }}>
        {(name || '?').trim().charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MetaGrid — label/value pairs in a soft strip (Dealer code, Size, Cost…).
// ---------------------------------------------------------------------------
export function MetaGrid({ items }: { items: Array<{ label: string; value: React.ReactNode; color?: string } | false | null | undefined> }) {
  const { theme, darkMode } = useTheme();
  const c = theme.colors;
  const visible = items.filter(Boolean) as Array<{ label: string; value: React.ReactNode; color?: string }>;
  if (!visible.length) return null;
  return (
    <View style={[styles.meta, { backgroundColor: darkMode ? c.background : c.surfaceSecondary }]}>
      {visible.map((it, i) => (
        <View key={it.label} style={[styles.metaItem, i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: c.border }]}>
          <Text style={{ color: c.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' }} numberOfLines={1}>{it.label}</Text>
          <Text style={{ color: it.color || c.text, fontSize: 13, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// AssigneeRow — "Recce · Ramesh Kumar   [Submitted]"
// ---------------------------------------------------------------------------
export function AssigneeRow({ role, name, color = tone.info, icon, status }: { role: string; name: string; color?: string; icon?: React.ReactNode; status?: { label: string; color: string } | null }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.assignee}>
      <Avatar name={name} color={color} size={26} />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text style={{ color: c.textSecondary, fontSize: 12 }}>{role}</Text>
        <Text style={{ color: c.text, fontSize: 13, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>{name}</Text>
      </View>
      {status ? <StatusBadge label={status.label} color={status.color} size="sm" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, padding: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.md },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1 },
  meta: { flexDirection: 'row', borderRadius: radius.md, paddingVertical: 10 },
  metaItem: { flex: 1, paddingHorizontal: 12 },
  assignee: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
});
