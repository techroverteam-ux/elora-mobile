import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { UserType } from '../context/AuthContext';

interface TestUserPickerProps {
  users: UserType[];
  onSelectUser: (user: UserType) => void;
}

const TestUserPicker: React.FC<TestUserPickerProps> = ({ users, onSelectUser }) => {
  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Test User Picker: </Text>
      <View style={styles.buttonGrid}>
        {users.map((user, index) => (
          <TouchableOpacity
            key={index}
            style={styles.userButton}
            onPress={() => onSelectUser(user)}
          >
            <Text style={styles.userButtonText}>{`${user.name}`}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TestUserPicker;

const styles = StyleSheet.create({
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userButton: {
    // backgroundColor: COLORS.appCode,
    // paddingVertical: 12,
    paddingHorizontal: 16,
    // borderRadius: 8,
    // margin: 8,
    // minWidth: '40%',
    // alignItems: 'center',
  },
  userButtonText: {
    color: "#000",
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
