import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Text, Button, Switch, useTheme } from 'react-native-paper';
import { useIsDarkMode } from '../context/ThemeContext';

type User = {
  email: string;
  password: string;
};

type Props = {
  onSelectUser: (user: User) => void;
  isAutoLoginOn: boolean;
  setIsAutoLoginOn: (value: boolean) => void;
  users?: User[];
};

const defaultUsers: User[] = [
  { email: 'test@admin.com', password: '123456' },
  { email: 'neel@test.com', password: '123456' },
  { email: 'bob@test.com', password: 'bob123' },
];

const AutoLoginCredentials: React.FC<Props> = ({
  onSelectUser,
  isAutoLoginOn,
  setIsAutoLoginOn,
  users = defaultUsers,
}) => {
  const { colors } = useTheme();
  const isDarkMode = useIsDarkMode();

  return (
    <View style={styles.container}>
      {/* Toggle */}
      <View
        style={[
          styles.switchContainer,
          { backgroundColor: isDarkMode ? colors.backdrop : colors.inverseOnSurface },
        ]}
      >
        <Text style={[styles.label, { color: colors.onSurface || '#fff' }]}>
          Auto Login
        </Text>
        <Switch
          value={isAutoLoginOn}
          onValueChange={setIsAutoLoginOn}
          color={colors.primary}
        />
      </View>

      {/* Buttons List */}
      {isAutoLoginOn && (
        <View style={styles.listWrapper}>
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={users}
            keyExtractor={(item, index) => `${item.email}-${index}`}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Button
                mode="outlined"
                style={styles.userButton}
                onPress={() => onSelectUser(item)}
                labelStyle={{ fontSize: 12 }}
              >
                {item.email}
              </Button>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default AutoLoginCredentials;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listWrapper: {
    maxHeight: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  userButton: {
    margin: 4,
    flex: 1,
    borderRadius: 6,
    justifyContent: 'center',
  },
});
