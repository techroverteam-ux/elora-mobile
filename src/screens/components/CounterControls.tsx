import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../data/redux/store';
import { decrement, increment } from '../../data/redux/slices/counterSlice';

const CounterControls = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => dispatch(increment())} style={styles.button}>
        <Text style={styles.buttonText}>Increment</Text>
      </TouchableOpacity>

      <Text style={styles.count}>{count}</Text>

      <TouchableOpacity onPress={() => dispatch(decrement())} style={styles.button}>
        <Text style={styles.buttonText}>Decrement</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CounterControls;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  count: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
