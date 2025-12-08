import { ContentField } from '../types/blog';

export interface BlogContentField {
  id: string;
  type: 'header' | 'description' | 'image' | 'video' | 'pdf';
  content: string;
  order: number;
  azureFiles?: string[];
  _id: string;
}

export interface BlogCategory {
  _id: string;
  title: string;
  subtitle?: string;
  description1?: string;
  description2?: string;
  headerImage?: string;
  mainImage?: string;
  contentFields: BlogContentField[];
  layoutType?: string;
}

/**
 * Blog Content Manager - Handles sequence management and content processing
 */
export class BlogContentManager {
  
  /**
   * Sort content fields by order property
   */
  static sortContentFields(fields: BlogContentField[]): BlogContentField[] {
    return [...fields].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
  }

  /**
   * Validate content field structure
   */
  static validateContentField(field: BlogContentField): boolean {
    if (!field.id || !field.type || field.order === undefined) {
      return false;
    }

    const validTypes = ['header', 'description', 'image', 'video', 'pdf'];
    if (!validTypes.includes(field.type)) {
      return false;
    }

    // Media fields should have azureFiles
    if (['image', 'video', 'pdf'].includes(field.type)) {
      return Array.isArray(field.azureFiles) && field.azureFiles.length > 0;
    }

    // Text fields should have content
    if (['header', 'description'].includes(field.type)) {
      return typeof field.content === 'string' && field.content.trim().length > 0;
    }

    return true;
  }

  /**
   * Filter and validate all content fields
   */
  static processContentFields(fields: BlogContentField[]): BlogContentField[] {
    const validFields = fields.filter(field => this.validateContentField(field));
    return this.sortContentFields(validFields);
  }

  /**
   * Group content fields by type for analytics
   */
  static groupContentByType(fields: BlogContentField[]): Record<string, BlogContentField[]> {
    return fields.reduce((groups, field) => {
      const type = field.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(field);
      return groups;
    }, {} as Record<string, BlogContentField[]>);
  }

  /**
   * Calculate reading time estimate
   */
  static calculateReadingTime(category: BlogCategory): number {
    const wordsPerMinute = 200;
    
    // Collect all text content
    const textContent = [
      category.title || '',
      category.subtitle || '',
      category.description1 || '',
      category.description2 || '',
      ...category.contentFields
        .filter(field => ['header', 'description'].includes(field.type))
        .map(field => field.content || '')
    ].join(' ');

    // Count words
    const wordCount = textContent
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;

    // Calculate reading time (minimum 1 minute)
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Get content statistics
   */
  static getContentStats(category: BlogCategory): {
    totalSections: number;
    readingTime: number;
    mediaCount: number;
    textSections: number;
    imageCount: number;
    videoCount: number;
    pdfCount: number;
  } {
    const processedFields = this.processContentFields(category.contentFields);
    const groupedContent = this.groupContentByType(processedFields);

    const imageCount = (groupedContent.image || []).reduce(
      (count, field) => count + (field.azureFiles?.length || 0), 0
    );
    
    const videoCount = (groupedContent.video || []).reduce(
      (count, field) => count + (field.azureFiles?.length || 0), 0
    );
    
    const pdfCount = (groupedContent.pdf || []).reduce(
      (count, field) => count + (field.azureFiles?.length || 0), 0
    );

    return {
      totalSections: processedFields.length,
      readingTime: this.calculateReadingTime(category),
      mediaCount: imageCount + videoCount + pdfCount,
      textSections: (groupedContent.header || []).length + (groupedContent.description || []).length,
      imageCount,
      videoCount,
      pdfCount,
    };
  }

  /**
   * Generate table of contents from headers
   */
  static generateTableOfContents(fields: BlogContentField[]): Array<{
    id: string;
    title: string;
    order: number;
  }> {
    return fields
      .filter(field => field.type === 'header')
      .map(field => ({
        id: field.id,
        title: field.content,
        order: field.order,
      }))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Find next and previous sections for navigation
   */
  static getNavigationSections(
    fields: BlogContentField[], 
    currentFieldId: string
  ): {
    previous: BlogContentField | null;
    next: BlogContentField | null;
  } {
    const sortedFields = this.sortContentFields(fields);
    const currentIndex = sortedFields.findIndex(field => field.id === currentFieldId);
    
    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    return {
      previous: currentIndex > 0 ? sortedFields[currentIndex - 1] : null,
      next: currentIndex < sortedFields.length - 1 ? sortedFields[currentIndex + 1] : null,
    };
  }

  /**
   * Process Azure URLs using the existing Azure assets system
   */
  static processAzureUrls(urls: string[], azureData?: Record<string, any>): string[] {
    if (!azureData) {
      return urls; // Return original URLs if no Azure data available
    }
    
    return urls.map(url => {
      // Find matching processed URL in azureData
      const matchingKey = Object.keys(azureData).find(key => {
        const azureItem = azureData[key];
        return azureItem && azureItem.originalUrl === url;
      });
      
      if (matchingKey && azureData[matchingKey]?.resourceUrl) {
        return azureData[matchingKey].resourceUrl;
      }
      
      return url; // Fallback to original URL
    });
  }

  /**
   * Prepare content field for rendering
   */
  static prepareFieldForRender(field: BlogContentField, azureData?: Record<string, any>): BlogContentField {
    const processedField = { ...field };
    
    // Process Azure URLs for media fields
    if (field.azureFiles && field.azureFiles.length > 0) {
      processedField.azureFiles = this.processAzureUrls(field.azureFiles, azureData);
    }

    // Clean up content for text fields
    if (['header', 'description'].includes(field.type)) {
      processedField.content = field.content?.trim() || '';
    }

    return processedField;
  }

  /**
   * Prepare entire category for rendering
   */
  static prepareCategoryForRender(category: BlogCategory, azureData?: Record<string, any>): BlogCategory {
    const processedCategory = { ...category };
    
    // Process content fields
    processedCategory.contentFields = this.processContentFields(category.contentFields)
      .map(field => this.prepareFieldForRender(field, azureData));

    return processedCategory;
  }

  /**
   * Validate blog category structure
   */
  static validateBlogCategory(category: any): category is BlogCategory {
    if (!category || typeof category !== 'object') {
      return false;
    }

    // Required fields
    if (!category._id || !category.title) {
      return false;
    }

    // Content fields should be an array
    if (!Array.isArray(category.contentFields)) {
      return false;
    }

    // Validate each content field
    return category.contentFields.every((field: any) => 
      this.validateContentField(field)
    );
  }

  /**
   * Create a new content field with proper structure
   */
  static createContentField(
    type: BlogContentField['type'],
    content: string,
    order: number,
    azureFiles?: string[]
  ): Omit<BlogContentField, '_id'> {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      type,
      content: content.trim(),
      order,
      azureFiles: azureFiles || [],
    };
  }

  /**
   * Reorder content fields
   */
  static reorderContentFields(
    fields: BlogContentField[],
    fromIndex: number,
    toIndex: number
  ): BlogContentField[] {
    const reorderedFields = [...fields];
    const [movedField] = reorderedFields.splice(fromIndex, 1);
    reorderedFields.splice(toIndex, 0, movedField);

    // Update order values
    return reorderedFields.map((field, index) => ({
      ...field,
      order: index,
    }));
  }

  /**
   * Search content fields by text
   */
  static searchContentFields(
    fields: BlogContentField[],
    searchTerm: string
  ): BlogContentField[] {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      return fields;
    }

    return fields.filter(field => 
      field.content.toLowerCase().includes(term) ||
      field.id.toLowerCase().includes(term)
    );
  }

  /**
   * Get content field by ID
   */
  static getContentFieldById(
    fields: BlogContentField[],
    fieldId: string
  ): BlogContentField | null {
    return fields.find(field => field.id === fieldId) || null;
  }

  /**
   * Update content field
   */
  static updateContentField(
    fields: BlogContentField[],
    fieldId: string,
    updates: Partial<BlogContentField>
  ): BlogContentField[] {
    return fields.map(field => 
      field.id === fieldId 
        ? { ...field, ...updates }
        : field
    );
  }

  /**
   * Remove content field
   */
  static removeContentField(
    fields: BlogContentField[],
    fieldId: string
  ): BlogContentField[] {
    return fields.filter(field => field.id !== fieldId);
  }
}

export default BlogContentManager;