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
  CategorieDataList: { title: string, id: string };
  BlogPage: { categoryData: any };
  SubCategorie: { categoryData: any };
  EnhancedAudioPlayer: { item: any; playlist?: any[] };
  EnhancedVideoPlayer: { item: any; playlist?: any[] };
  GalleryList: { initialIndex?: number };
  ImageViewer: { images: string[]; initialIndex: number; title?: string };
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