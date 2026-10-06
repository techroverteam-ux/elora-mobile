import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ScrollView, StyleSheet, Linking } from 'react-native';
import { X, ZoomIn, Check, Phone, MapPin, Navigation, Ruler, Maximize2, Layers, Hash, IndianRupee, FileText, Calendar, Receipt } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { radius, alpha, tone } from './tokens';
import { Avatar } from './primitives';

// ---------------------------------------------------------------------------
// Building blocks for "detail" screens (Store / Recce / Installation details).
// ---------------------------------------------------------------------------

/** Card section heading: icon + title + optional count / right slot. */
export function SectionTitle({ icon, title, count, right }: { icon?: React.ReactNode; title: string; count?: number; right?: React.ReactNode }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      {icon}
      <Text style={{ color: c.text, fontSize: 15, fontWeight: '900', flex: 1 }}>
        {title}
        {count !== undefined ? <Text style={{ color: c.textSecondary, fontWeight: '700' }}>  {count}</Text> : null}
      </Text>
      {right}
    </View>
  );
}

/** Label on the left, value on the right; hairline between rows. */
export function InfoRow({ icon, label, value, multiline, last }: { icon?: React.ReactNode; label: string; value?: React.ReactNode; multiline?: boolean; last?: boolean }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const empty = value === undefined || value === null || value === '';
  return (
    <View style={{ flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', gap: 10, paddingVertical: 9, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }}>
      {icon}
      <Text style={{ color: c.textSecondary, fontSize: 13, width: 96 }}>{label}</Text>
      <Text style={{ color: empty ? c.textTertiary : c.text, fontSize: 13, fontWeight: '700', flex: 1, textAlign: multiline ? 'left' : 'right' }} numberOfLines={multiline ? 4 : 1}>
        {empty ? '—' : value}
      </Text>
    </View>
  );
}

/** Compact label/value line for small side-by-side cards. */
export function MiniFact({ label, value, color }: { label: string; value?: React.ReactNode; color?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 6 }}>
      <Text style={{ color: c.textSecondary, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: color || c.text, fontSize: 12, fontWeight: '800', flexShrink: 1, textAlign: 'right' }} numberOfLines={1}>{value ?? '—'}</Text>
    </View>
  );
}

/** Row of big numbers (e.g. Boards / Approved / Pending). */
export function StatStrip({ items }: { items: Array<{ label: string; value: React.ReactNode; color?: string }> }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ flexDirection: 'row', borderRadius: radius.md, paddingVertical: 10, marginTop: 14, backgroundColor: c.surfaceSecondary }}>
      {items.map((it) => (
        <View key={it.label} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: it.color || c.text, fontSize: 18, fontWeight: '900' }}>{it.value}</Text>
          <Text style={{ color: c.textSecondary, fontSize: 11, fontWeight: '600' }}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

/** Vertical step list for a workflow (Recce → Installation → Done). */
export function Timeline({ steps }: { steps: Array<{ title: string; subtitle?: string; meta?: string; done?: boolean; active?: boolean }> }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <View>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const color = s.done ? tone.success : s.active ? c.primary : c.border;
        return (
          <View key={s.title} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 22 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: s.done ? tone.success : s.active ? alpha(c.primary, 0.2) : c.surfaceSecondary, borderWidth: s.active ? 2 : 0, borderColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                {s.done ? <Check size={13} color="#FFF" strokeWidth={3} /> : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.active ? c.primary : c.textTertiary }} />}
              </View>
              {!last && <View style={{ width: 2, flex: 1, minHeight: 22, backgroundColor: s.done ? alpha(tone.success, 0.4) : c.border, marginVertical: 2 }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ color: c.text, fontSize: 14, fontWeight: '800', flex: 1 }}>{s.title}</Text>
                {s.meta ? <Text style={{ color: c.textSecondary, fontSize: 11 }}>{s.meta}</Text> : null}
              </View>
              {s.subtitle ? <Text style={{ color: s.done || s.active ? c.textSecondary : c.textTertiary, fontSize: 12, marginTop: 1 }}>{s.subtitle}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Tappable photo tile with optional top-left label and bottom caption. */
export function PhotoTile({
  uri,
  onPress,
  size = 96,
  label,
  caption,
  statusColor,
  style,
}: {
  uri?: string;
  onPress?: () => void;
  size?: number | `${number}%`;
  label?: string;
  caption?: string;
  statusColor?: string;
  style?: any;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={!uri} style={[{ width: size as any, aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden', backgroundColor: '#0F172A' }, style]}>
      {uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#94A3B8', fontSize: 11 }}>No photo</Text>
        </View>
      )}
      {label ? (
        <View style={styles.tileLabel}><Text style={{ color: '#FFF', fontSize: 10, fontWeight: '900' }}>{label}</Text></View>
      ) : null}
      {statusColor ? <View style={[styles.tileDot, { backgroundColor: statusColor }]} /> : null}
      {caption ? (
        <View style={[styles.tileCaption, statusColor ? { backgroundColor: alpha(statusColor, 0.9) } : null]}>
          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800', textAlign: 'center' }} numberOfLines={1}>{caption}</Text>
        </View>
      ) : null}
      {uri && !caption ? <View style={styles.zoom}><ZoomIn size={12} color="#FFF" /></View> : null}
    </TouchableOpacity>
  );
}

/** Horizontal strip of PhotoTiles. */
export function PhotoStrip({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      {children}
    </ScrollView>
  );
}

/** Full-screen image viewer. */
export function ImageViewer({ uri, onClose }: { uri: string | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity onPress={onClose} style={[styles.viewerClose, { top: insets.top + 16 }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>
        {uri ? <Image source={{ uri }} style={{ width: '100%', height: '80%' }} resizeMode="contain" /> : null}
      </View>
    </Modal>
  );
}


// ===========================================================================
// Purpose-built info cards (Store / Recce / Installation details)
// ===========================================================================

function CardShell({ children, style }: { children: React.ReactNode; style?: any }) {
  const { theme } = useTheme();
  return (
    <View style={[{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: radius.xl, padding: 16 }, style]}>
      {children}
    </View>
  );
}

function CardHeader({ icon, tint, title, right }: { icon: React.ReactNode; tint: string; title: string; right?: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: alpha(tint, 0.14), alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900', flex: 1 }}>{title}</Text>
      {right}
    </View>
  );
}

/** 2-column grid of identifier tiles (dealer code, vendor code, client…). */
export function FactGrid({ title = 'Identifiers', items }: { title?: string; items: Array<{ label: string; value?: React.ReactNode; icon?: React.ReactNode }> }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <CardShell>
      <CardHeader icon={<Hash size={17} color={tone.violet} />} tint={tone.violet} title={title} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {items.map((it) => {
          const empty = it.value === undefined || it.value === null || it.value === '';
          return (
            <View key={it.label} style={{ flexBasis: '47%', flexGrow: 1, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 }}>
              <Text style={{ color: c.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' }}>{it.label}</Text>
              <Text style={{ color: empty ? c.textTertiary : c.text, fontSize: 15, fontWeight: '900', marginTop: 3 }} numberOfLines={1} selectable>
                {empty ? '—' : it.value}
              </Text>
            </View>
          );
        })}
      </View>
    </CardShell>
  );
}

/** Contact person with one-tap Call. */
export function ContactCard({ name, mobile }: { name?: string; mobile?: string }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const has = !!(name || mobile);
  return (
    <CardShell>
      <CardHeader icon={<Phone size={17} color={tone.success} />} tint={tone.success} title="Contact" />
      {has ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={name || mobile} size={44} color={tone.success} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 15, fontWeight: '900' }} numberOfLines={1}>{name || 'Store contact'}</Text>
            <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 2 }} selectable>{mobile || 'No mobile number'}</Text>
          </View>
          {mobile ? (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${String(mobile).replace(/\s/g, '')}`)} activeOpacity={0.8} style={[styles.pillBtn, { backgroundColor: tone.success }]}>
              <Phone size={15} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '900' }}>Call</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <Text style={{ color: c.textTertiary, fontSize: 13 }}>No contact person added for this store.</Text>
      )}
    </CardShell>
  );
}

/** Address + area chips + Open in Maps. */
export function LocationCard({ location }: { location?: any }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const loc = location || {};
  const lat = loc.coordinates?.lat ?? loc.coordinates?.latitude ?? loc.latitude;
  const lng = loc.coordinates?.lng ?? loc.coordinates?.longitude ?? loc.longitude;
  const hasCoords = lat !== undefined && lng !== undefined && lat !== null && lng !== null && lat !== '' && lng !== '';
  const query = hasCoords ? `${lat},${lng}` : [loc.address, loc.city, loc.district, loc.state].filter(Boolean).join(', ');
  const areas = [
    { label: 'City', value: loc.city },
    { label: 'District', value: loc.district },
    { label: 'State', value: loc.state },
    { label: 'Zone', value: loc.zone },
  ];
  return (
    <CardShell>
      <CardHeader
        icon={<MapPin size={17} color={tone.danger} />}
        tint={tone.danger}
        title="Location"
        right={query ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`)}
            activeOpacity={0.8}
            style={[styles.pillBtn, { backgroundColor: alpha(tone.info, 0.12) }]}
          >
            <Navigation size={14} color={tone.info} />
            <Text style={{ color: tone.info, fontSize: 12, fontWeight: '900' }}>Maps</Text>
          </TouchableOpacity>
        ) : undefined}
      />
      <Text style={{ color: loc.address ? c.text : c.textTertiary, fontSize: 14, fontWeight: '600', lineHeight: 20 }} selectable>
        {loc.address || 'No address added'}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {areas.map((a) => (
          <View key={a.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.surfaceSecondary, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: c.textSecondary, fontSize: 11, fontWeight: '700' }}>{a.label}</Text>
            <Text style={{ color: a.value ? c.text : c.textTertiary, fontSize: 12, fontWeight: '900' }}>{a.value || '—'}</Text>
          </View>
        ))}
      </View>
      {hasCoords ? (
        <Text style={{ color: c.textTertiary, fontSize: 11, marginTop: 10 }}>GPS {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</Text>
      ) : null}
    </CardShell>
  );
}

/** Board size shown big, with area / qty / type tiles. */
export function SpecsCard({ specs }: { specs?: any }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const sp = specs || {};
  const hasSize = !!(sp.width || sp.height);
  const tiles = [
    { icon: <Maximize2 size={14} color={c.textSecondary} />, label: 'Area', value: sp.boardSize ? `${sp.boardSize} sq.ft` : undefined },
    { icon: <Layers size={14} color={c.textSecondary} />, label: 'Quantity', value: String(sp.qty || 1) },
    { icon: <FileText size={14} color={c.textSecondary} />, label: 'Type', value: sp.type },
  ];
  return (
    <CardShell>
      <CardHeader icon={<Ruler size={17} color={tone.warning} />} tint={tone.warning} title="Board specs" />
      <View style={{ backgroundColor: alpha(tone.warning, 0.08), borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: c.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 }}>BOARD SIZE</Text>
        <Text style={{ color: hasSize ? c.text : c.textTertiary, fontSize: 26, fontWeight: '900', marginTop: 2 }}>
          {hasSize ? `${sp.width || 0} × ${sp.height || 0}` : '—'}
          {hasSize ? <Text style={{ fontSize: 14, color: c.textSecondary, fontWeight: '700' }}>  ft</Text> : null}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {tiles.map((t) => (
          <View key={t.label} style={{ flex: 1, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: 10, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {t.icon}
              <Text style={{ color: c.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 }}>{t.label.toUpperCase()}</Text>
            </View>
            <Text style={{ color: t.value ? c.text : c.textTertiary, fontSize: 14, fontWeight: '900' }} numberOfLines={1}>{t.value || '—'}</Text>
          </View>
        ))}
      </View>
    </CardShell>
  );
}

/** Total cost as the headline, PO / month / invoice below. */
export function CommercialCard({ commercials }: { commercials?: any }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const cm = commercials || {};
  const rows = [
    { icon: <Receipt size={14} color={c.textSecondary} />, label: 'PO number', value: cm.poNumber },
    { icon: <Calendar size={14} color={c.textSecondary} />, label: 'PO month', value: cm.poMonth },
    { icon: <FileText size={14} color={c.textSecondary} />, label: 'Invoice', value: cm.invoiceNumber },
  ];
  return (
    <CardShell>
      <CardHeader icon={<IndianRupee size={17} color={tone.success} />} tint={tone.success} title="Commercial" />
      <View style={{ backgroundColor: alpha(tone.success, 0.1), borderRadius: radius.lg, padding: 14, marginBottom: 6 }}>
        <Text style={{ color: tone.success, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>TOTAL COST</Text>
        <Text style={{ color: c.text, fontSize: 26, fontWeight: '900', marginTop: 2 }}>₹{(cm.totalCost || 0).toLocaleString()}</Text>
      </View>
      {rows.map((r, i) => (
        <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, borderBottomWidth: i < rows.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: c.border }}>
          {r.icon}
          <Text style={{ color: c.textSecondary, fontSize: 13, flex: 1 }}>{r.label}</Text>
          <Text style={{ color: r.value ? c.text : c.textTertiary, fontSize: 13, fontWeight: '800' }} selectable>{r.value || '—'}</Text>
        </View>
      ))}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  pillBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  tileLabel: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(15,23,42,0.75)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  tileDot: { position: 'absolute', top: 7, right: 7, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: '#FFF' },
  tileCaption: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 3, backgroundColor: 'rgba(15,23,42,0.7)' },
  zoom: { position: 'absolute', bottom: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(15,23,42,0.6)', alignItems: 'center', justifyContent: 'center' },
  viewerClose: { position: 'absolute', right: 16, zIndex: 1, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
