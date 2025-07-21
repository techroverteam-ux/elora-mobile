import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../data/redux/store'
import { decrement, increment } from '../data/redux/slices/counterSlice'
import { useTranslation } from 'react-i18next'

const Home = () => {
  const count = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch()
  // const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel="Increment value"
        onPress={() => dispatch(increment())}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Increment</Text>
      </TouchableOpacity>

      <Text style={styles.count}>{count}</Text>

      <TouchableOpacity
        accessibilityLabel="Decrement value"
        onPress={() => dispatch(decrement())}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Decrement</Text>
      </TouchableOpacity>

      {/* <Text>{t('screens.intro.title')} sdffsd</Text> */}
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
})