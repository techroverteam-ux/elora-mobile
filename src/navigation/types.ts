export type HomeStackParamList = {
  HomeMain: undefined;
  HomeDetail: { id: string };
  AudioPlayer: { item: any };
  VideoPlayer: { item: any };
};

export type CategoriesStackParamList = {
  CategoriesMain: undefined;
  CategorieDataList: { title: string };
  BlogPage: { item: any };
};

export type AccountStackParamList = {
  AccountMain: undefined;
  SelectLanguage: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};