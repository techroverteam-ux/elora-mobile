/**
 * Blog System Type Definitions
 * Comprehensive type system for the enhanced blog renderer
 */

export interface ContentField {
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
  contentFields: ContentField[];
  layoutType?: BlogLayoutType;
  sectionId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  isPublished?: boolean;
  tags?: string[];
  category?: string;
  readingTime?: number;
  viewCount?: number;
  likeCount?: number;
}

export type BlogLayoutType = 
  | 'content-only'
  | 'with-images'
  | 'rich-media'
  | 'interactive'
  | 'enhanced-blog';

export interface BlogContentStats {
  totalSections: number;
  readingTime: number;
  mediaCount: number;
  textSections: number;
  imageCount: number;
  videoCount: number;
  pdfCount: number;
  wordCount: number;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  order: number;
  level?: number;
}

export interface BlogNavigation {
  previous: ContentField | null;
  next: ContentField | null;
}

export interface BlogRenderProps {
  category: BlogCategory;
  onBack?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onLike?: () => void;
  showTableOfContents?: boolean;
  enableReadingProgress?: boolean;
  enableComments?: boolean;
}

export interface BlogSkeletonProps {
  sectionsCount?: number;
  showHeader?: boolean;
  showProgress?: boolean;
  showMeta?: boolean;
}

export interface MediaViewerProps {
  images?: string[];
  videos?: string[];
  pdfs?: string[];
  initialIndex?: number;
  title?: string;
  onClose?: () => void;
}

export interface BlogSearchResult {
  category: BlogCategory;
  matchedFields: ContentField[];
  relevanceScore: number;
}

export interface BlogFilter {
  layoutType?: BlogLayoutType[];
  hasImages?: boolean;
  hasVideos?: boolean;
  hasPdfs?: boolean;
  minReadingTime?: number;
  maxReadingTime?: number;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface BlogSortOptions {
  field: 'title' | 'createdAt' | 'updatedAt' | 'readingTime' | 'viewCount' | 'likeCount';
  direction: 'asc' | 'desc';
}

export interface BlogListProps {
  categories: BlogCategory[];
  loading?: boolean;
  error?: string | null;
  onCategoryPress: (category: BlogCategory) => void;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  filter?: BlogFilter;
  sortOptions?: BlogSortOptions;
  searchTerm?: string;
}

export interface BlogCardProps {
  category: BlogCategory;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'featured';
  showStats?: boolean;
  showTags?: boolean;
}

export interface BlogHeaderProps {
  title: string;
  subtitle?: string;
  readingTime: number;
  sectionsCount: number;
  onBack?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export interface BlogProgressProps {
  progress: number;
  visible?: boolean;
}

export interface BlogMetaProps {
  readingTime: number;
  sectionsCount: number;
  viewCount?: number;
  likeCount?: number;
  publishedAt?: string;
  author?: string;
  tags?: string[];
}

export interface BlogActionProps {
  onLike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onComment?: () => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
  likeCount?: number;
  commentCount?: number;
}

export interface BlogCommentProps {
  comments: BlogComment[];
  onAddComment?: (comment: string) => void;
  onReplyComment?: (commentId: string, reply: string) => void;
  onLikeComment?: (commentId: string) => void;
  loading?: boolean;
}

export interface BlogComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  replies?: BlogComment[];
  parentId?: string;
}

export interface BlogAnalytics {
  viewCount: number;
  likeCount: number;
  shareCount: number;
  bookmarkCount: number;
  commentCount: number;
  averageReadingTime: number;
  completionRate: number;
  bounceRate: number;
  topExitPoints: string[];
  popularSections: string[];
}

export interface BlogError {
  code: string;
  message: string;
  details?: any;
}

export interface BlogApiResponse<T> {
  success: boolean;
  data?: T;
  error?: BlogError;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface BlogCreateRequest {
  title: string;
  subtitle?: string;
  description1?: string;
  description2?: string;
  contentFields: Omit<ContentField, '_id'>[];
  layoutType?: BlogLayoutType;
  sectionId: string;
  tags?: string[];
  isPublished?: boolean;
}

export interface BlogUpdateRequest extends Partial<BlogCreateRequest> {
  _id: string;
}

export interface BlogSearchRequest {
  query: string;
  filter?: BlogFilter;
  sortOptions?: BlogSortOptions;
  page?: number;
  limit?: number;
}

// Utility Types
export type BlogFieldType = ContentField['type'];
export type BlogStatus = 'draft' | 'published' | 'archived';
export type BlogPermission = 'read' | 'write' | 'admin';

// Context Types
export interface BlogContextValue {
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  currentCategory: BlogCategory | null;
  searchTerm: string;
  filter: BlogFilter;
  sortOptions: BlogSortOptions;
  
  // Actions
  loadCategories: () => Promise<void>;
  loadCategory: (id: string) => Promise<void>;
  createCategory: (data: BlogCreateRequest) => Promise<void>;
  updateCategory: (data: BlogUpdateRequest) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  searchCategories: (query: string) => Promise<void>;
  setFilter: (filter: BlogFilter) => void;
  setSortOptions: (options: BlogSortOptions) => void;
  clearError: () => void;
}

// Hook Types
export interface UseBlogReturn extends BlogContextValue {}

export interface UseBlogCategoryReturn {
  category: BlogCategory | null;
  loading: boolean;
  error: string | null;
  stats: BlogContentStats | null;
  tableOfContents: TableOfContentsItem[];
  
  loadCategory: (id: string) => Promise<void>;
  refreshCategory: () => Promise<void>;
}

export interface UseBlogProgressReturn {
  progress: number;
  currentSection: number;
  isHeaderVisible: boolean;
  
  updateProgress: (scrollY: number, contentHeight: number, screenHeight: number) => void;
  resetProgress: () => void;
}

// Component Ref Types
export interface BlogRendererRef {
  scrollToSection: (sectionId: string) => void;
  scrollToTop: () => void;
  getCurrentProgress: () => number;
  getCurrentSection: () => number;
}

export interface BlogListRef {
  scrollToTop: () => void;
  refresh: () => void;
  loadMore: () => void;
}

// Event Types
export interface BlogScrollEvent {
  contentOffset: { x: number; y: number };
  contentSize: { width: number; height: number };
  layoutMeasurement: { width: number; height: number };
}

export interface BlogSectionChangeEvent {
  sectionId: string;
  sectionIndex: number;
  progress: number;
}

export interface BlogInteractionEvent {
  type: 'like' | 'share' | 'bookmark' | 'comment' | 'view';
  categoryId: string;
  sectionId?: string;
  timestamp: number;
}

// Pull-to-Refresh Types
export interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  refreshThreshold?: number;
  pullDistance?: number;
  style?: any;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: any;
}

export interface RefreshState {
  state: 'idle' | 'pulling' | 'ready' | 'refreshing';
  progress: number;
  distance: number;
}

export interface RefreshAnimations {
  pullDistance: any;
  refreshOpacity: any;
  iconRotation: any;
  iconScale: any;
  waveAnimation: any;
  particleAnimations: any[];
}

export default {
  ContentField,
  BlogCategory,
  BlogLayoutType,
  BlogContentStats,
  TableOfContentsItem,
  BlogNavigation,
  BlogRenderProps,
  BlogSkeletonProps,
  MediaViewerProps,
  BlogSearchResult,
  BlogFilter,
  BlogSortOptions,
  BlogListProps,
  BlogCardProps,
  BlogHeaderProps,
  BlogProgressProps,
  BlogMetaProps,
  BlogActionProps,
  BlogCommentProps,
  BlogComment,
  BlogAnalytics,
  BlogError,
  BlogApiResponse,
  BlogCreateRequest,
  BlogUpdateRequest,
  BlogSearchRequest,
  BlogFieldType,
  BlogStatus,
  BlogPermission,
  BlogContextValue,
  UseBlogReturn,
  UseBlogCategoryReturn,
  UseBlogProgressReturn,
  BlogRendererRef,
  BlogListRef,
  BlogScrollEvent,
  BlogSectionChangeEvent,
  BlogInteractionEvent,
};