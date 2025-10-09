import { UserType } from "../context/AuthContext";

export type RootStackParamList = {
  App: undefined;
  ImageViewer: { uri: string };
  AuthModal: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  AllAudios: undefined;
  AudioCategoryScreen: { title: any };
  AllVideos: undefined;
  AudioPlayer: { item: any };
  VideoPlayer: { item: any };
};

export type CategoriesStackParamList = {
  AuthModal: undefined;
  CategoriesMain: undefined;
  CategorieDataList: { title: string, id: string };
  BlogPage: { item: any };
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