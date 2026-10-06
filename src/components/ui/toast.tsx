import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// Shared toast look — used by the app-level <Toast/> in MinimizedOriginalApp
// AND by the toast that lives inside every BottomSheet / ConfirmDialog.
//
// Why a toast inside modals: React Native draws a <Modal> in its own native
// window above the app, so the app-level toast is always hidden behind an
// open sheet (zIndex can't fix that). react-native-toast-message uses the most
// recently mounted <Toast/>, so mounting one inside the modal makes
// Toast.show(...) appear on top while the sheet is open, and it falls back to
// the app-level one automatically when the sheet closes.
// ---------------------------------------------------------------------------
const Body = ({ bg, text1, text2 }: { bg: string; text1?: string; text2?: string }) => (
  <View style={[styles.toast, { backgroundColor: bg }]}>
    <Text style={styles.text}>{text1}</Text>
    {text2 ? <Text style={styles.sub}>{text2}</Text> : null}
  </View>
);

export const toastConfig = {
  success: (props: any) => <Body bg="#10B981" text1={props.text1} text2={props.text2} />,
  error: (props: any) => <Body bg="#EF4444" text1={props.text1} text2={props.text2} />,
  info: (props: any) => <Body bg="#3B82F6" text1={props.text1} text2={props.text2} />,
};

/** Drop inside any <Modal> so toasts show above it. */
export function ModalToast() {
  const insets = useSafeAreaInsets();
  // Bottom, to match the app-level toast. The offset keeps it clear of the
  // sheet footer buttons (Cancel / Save) and the home indicator.
  return <Toast config={toastConfig} position="bottom" bottomOffset={insets.bottom + 90} visibilityTime={4000} autoHide />;
}

const styles = StyleSheet.create({
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: { color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  sub: { color: '#FFF', fontSize: 14, marginTop: 4, textAlign: 'center' },
});
