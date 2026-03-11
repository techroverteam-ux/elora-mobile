import { UserType } from "../context/AuthContext";

export type RootStackParamList = {
  App: undefined;
  ImageViewer: { uri: string };
  AuthModal: {
    redirectTo?: string;
    redirectParams?: Record<string, any>;
  };
  Settings: undefined;
  About: undefined;
  HelpSupport: undefined;
  SearchScreen: undefined;
  ReportIssue: undefined;
  FeatureRequest: undefined;
  GalleryList: { initialIndex?: number };
};

export type RecceStackParamList = {
  RecceList: undefined;
  RecceDetail: { storeId: string };
  RecceForm: { storeId?: string; recceId?: string };
  RecceReview: { storeId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  AllAudios: undefined;
  AllPDFs: undefined;
  AudioCategoryScreen: { title: any };
  AllVideos: { item: any };
  AudioPlayer: { item: any };
  VideoPlayer: { item: any };
  EnhancedAudioPlayer: { item: any; playlist?: any[] };
  EnhancedVideoPlayer: { item: any; playlist?: any[] };
  EnhancedAllAudios: undefined;
  EnhancedAllVideos: { item?: any };
  SearchScreen: undefined;
  GalleryList: { initialIndex?: number };
  PdfViewer: { item?: any };
  RecentlyPlayed: undefined;
};

export type CategoriesStackParamList = {
  CategoriesMain: undefined;
  CategorieDataList: { title: string, id: string, sectionContentType?: string };
  BlogPage: { categoryData: any };
  SubCategorie: { 
    categoryData?: any;
    sectionId?: string;
    categoryId?: string;
    buttonType?: string;
    title?: string;
    actionButton?: any;
    isChaptersList?: boolean;
  };
  ContentListView: {
    contentList: any[];
    title: string;
    categoryData?: any;
  };
  AttractiveButtonsScreen: { sectionId: string; title: string };
  BookDetailsScreen: { item: any; title?: string };
  EnhancedAudioPlayer: { item: any; playlist?: any[] };
  EnhancedVideoPlayer: { item: any; playlist?: any[] };
  PdfViewer: { uri?: string; title?: string; item?: any };
  GalleryList: { initialIndex?: number };
  ImageViewer: { images: string[]; initialIndex: number; title?: string };
  AllVideos: { categoryId?: string; title?: string; videos?: any[] };
  AllAudios: { categoryId?: string; title?: string; audios?: any[] };
};

export type AccountStackParamList = {
  AccountMain: undefined;
  Appearence: undefined;
  SelectLanguage: undefined;
  AudioPlayer: {
    item: {
      title: string;
      artist: string;
      imageUrl: string;
      audioUrl: string;
    };
  };
  VideoPlayer: { item: any };
  EnhancedAudioPlayer: { item: any; playlist?: any[] };
  EnhancedVideoPlayer: { item: any; playlist?: any[] };
  PdfViewer: { item?: any };
  Settings: undefined;
  About: undefined;
  HelpSupport: undefined;
  ReportIssue: undefined;
  FeatureRequest: undefined;
  GalleryList: { initialIndex?: number };
  RecentlyPlayed: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeMain: { user: UserType };
};