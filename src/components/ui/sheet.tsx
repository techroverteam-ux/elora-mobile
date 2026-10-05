import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { radius, alpha } from './tokens';

// ---------------------------------------------------------------------------
// BottomSheet — the shared modal used for forms (Add Store, Add User…),
// filter panels and pickers (Assign user). Header + scrollable body + sticky
// footer, so long forms never push the action buttons off screen.
// ---------------------------------------------------------------------------
export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  scroll = true,
  maxHeight = '92%',
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  maxHeight?: `${number}%` | number;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.backdropWrap}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
          <View style={[styles.sheet, { backgroundColor: c.background, maxHeight }]}>
            <View style={[styles.handle, { backgroundColor: c.border }]} />

            <View style={[styles.header, { borderBottomColor: c.border }]}>
              {icon ? <View style={[styles.headerIcon, { backgroundColor: alpha(c.primary, 0.16) }]}>{icon}</View> : null}
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }} numberOfLines={1}>{title}</Text>
                {subtitle ? <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={2}>{subtitle}</Text> : null}
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.close, { backgroundColor: c.surfaceSecondary }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={18} color={c.text} />
              </TouchableOpacity>
            </View>

            {scroll ? (
              <ScrollView
                style={{ flexShrink: 1 }}
                contentContainerStyle={styles.body}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.body, { flexShrink: 1 }]}>{children}</View>
            )}

            {footer ? (
              <View style={[styles.footer, { borderTopColor: c.border, paddingBottom: 14 + insets.bottom, backgroundColor: c.background }]}>{footer}</View>
            ) : (
              <View style={{ height: insets.bottom + 8 }} />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// ConfirmDialog — centred destructive/confirm prompt.
// ---------------------------------------------------------------------------
export function ConfirmDialog({
  visible,
  title,
  message,
  icon,
  tone = '#EF4444',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  tone?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogWrap}>
        <View style={[styles.dialog, { backgroundColor: c.background }]}>
          {icon ? <View style={[styles.dialogIcon, { backgroundColor: alpha(tone, 0.12) }]}>{icon}</View> : null}
          <Text style={{ fontSize: 19, fontWeight: '900', color: c.text, textAlign: 'center' }}>{title}</Text>
          {message ? <Text style={{ fontSize: 14, color: c.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 8 }}>{message}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
            <TouchableOpacity onPress={onCancel} style={[styles.dialogBtn, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }]}>
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '700' }}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.dialogBtn, { backgroundColor: tone }]}>
              <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800' }}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.55)' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  handle: { width: 42, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  close: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 18, gap: 18 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  dialogWrap: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { borderRadius: radius.xl + 4, padding: 24, width: '100%', maxWidth: 400, alignItems: 'stretch' },
  dialogIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14 },
  dialogBtn: { flex: 1, height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
