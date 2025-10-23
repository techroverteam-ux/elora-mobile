import { UserType } from "../context/AuthContext";

export type RootStackParamList = {
  App: undefined;
  ImageViewer: { uri: string };
  AuthModal: {
    redirectTo?: string;
    redirectParams?: Record<string, any>;
  };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  AllAudios: undefined;
  AudioCategoryScreen: { title: any };
  AllVideos: { item: any };
  AudioPlayer: { item: any };
  VideoPlayer: { item: any };
};

export type CategoriesStackParamList = {
  CategoriesMain: undefined;
  CategorieDataList: { title: string, id: string };
  BlogPage: { categoryData: any };
  SubCategorie: { categoryId: any };
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
  PdfViewer: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeMain: { user: UserType };
};