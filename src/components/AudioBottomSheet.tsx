import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import AudioPlayer from './AudioPlayer';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Text } from 'react-native-paper';

const AudioBottomSheet = ({ sheetRef }: { sheetRef: React.RefObject<BottomSheetMethods | null> }) => {
  const snapPoints = React.useMemo(() => ['25%', '50%', '75%', '100%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      ref={sheetRef}
      style={{ borderWidth: 1, borderColor: 'black', borderRadius: 10, backgroundColor: "red" }}
      index={-1} // <- Start hidden
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={handleSheetChanges}
    >
      <BottomSheetView style={styles.contentContainer}>
        <AudioPlayer />
      </BottomSheetView>
    </BottomSheet>
  );
};

export default AudioBottomSheet;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    backgroundColor: 'lightyellow',
  },
});
