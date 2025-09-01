// components/DummyComponent.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Button,
  StyleSheet,
} from 'react-native';
import { useGetPostByIdQuery, useGetPostsQuery } from '../../data/redux/services/dummyApi';
import { useTheme } from 'react-native-paper';

const DummyComponent = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { colors } = useTheme();

  // Fetch all posts
  const {
    data: posts,
    error: postsError,
    isLoading: postsLoading,
  } = useGetPostsQuery();

  // Fetch a single post by ID (conditional)
  const {
    data: post,
    error: postError,
    isLoading: postLoading,
  } = useGetPostByIdQuery(selectedId!, {
    skip: selectedId === null,
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.onBackground }]}>All Posts</Text>

      {postsLoading && <ActivityIndicator />}
      {postsError && <Text>Error fetching posts</Text>}

      {(posts && !selectedId) && (
        <FlatList
          data={posts.slice(0, 5)} // limit to 5 for demo
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postItem}>
              <Text style={[styles.postTitle, { color: colors.onBackground }]}>{item.title}</Text>
              <Button
                title="View Details"
                onPress={() => setSelectedId(item.id)}
              />
            </View>
          )}
        />
      )}

      {selectedId && (
        <View style={styles.details}>
          <Text style={[styles.heading, { color: colors.onBackground }]}>Post Details</Text>

          {postLoading && <ActivityIndicator />}
          {postError && <Text>Error fetching post #{selectedId}</Text>}

          {post && (
            <>
              <Text style={[styles.postTitle, { color: colors.onBackground }]}>{post.title}</Text>
              <Text style={{ color: colors.onBackground }}>{post.body}</Text>
              <Button
                title="Back to list"
                onPress={() => setSelectedId(null)}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default DummyComponent;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  postItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  details: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
});
