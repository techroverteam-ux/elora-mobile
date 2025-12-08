import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlogLayoutRenderer } from './BlogLayoutRenderer';
import { wp, hp, normalize } from '../utils/responsive';

interface BlogLayoutTesterProps {
  blogData: any;
  resourceUrls: any;
  onImagePress?: (images: string[], index: number) => void;
  onVideoPress?: () => void;
}

export const BlogLayoutTester: React.FC<BlogLayoutTesterProps> = (props) => {
  const [selectedLayout, setSelectedLayout] = useState('content-only');

  const layouts = [
    { key: 'content-only', label: '📝 Content Only', color: '#2196F3' },
    { key: 'content-with-images', label: '🖼️ With Images', color: '#4CAF50' },
    { key: 'rich-media', label: '🎨 Rich Media', color: '#FF9800' },
    { key: 'interactive', label: '⚡ Interactive', color: '#9C27B0' },
  ];

  const testBlogData = {
    ...props.blogData,
    sectionId: {
      ...props.blogData.sectionId,
      layout: selectedLayout,
      contentType: 'blog'
    }
  };

  return (
    <View style={styles.container}>
      {/* Layout Selector */}
      <View style={styles.selector}>
        <Text style={styles.selectorTitle}>Test Blog Layouts:</Text>
        <View style={styles.buttonRow}>
          {layouts.map((layout) => (
            <TouchableOpacity
              key={layout.key}
              style={[
                styles.layoutButton,
                { 
                  backgroundColor: selectedLayout === layout.key ? layout.color : '#f0f0f0',
                  borderColor: layout.color
                }
              ]}
              onPress={() => setSelectedLayout(layout.key)}
            >
              <Text style={[
                styles.buttonText,
                { color: selectedLayout === layout.key ? '#fff' : layout.color }
              ]}>
                {layout.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Render Selected Layout */}
      <View style={styles.content}>
        <BlogLayoutRenderer
          {...props}
          blogData={testBlogData}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selector: {
    backgroundColor: '#f8f9fa',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectorTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: hp(1),
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  layoutButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: normalize(20),
    borderWidth: 1,
    minWidth: wp(20),
    alignItems: 'center',
  },
  buttonText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

export default BlogLayoutTester;