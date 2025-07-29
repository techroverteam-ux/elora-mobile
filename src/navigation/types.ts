export type HomeStackParamList = {
  HomeMain: undefined;
  HomeDetail: { id: string };
};

export type CategoriesStackParamList = {
  CategoriesMain: undefined;
  CategorieDataList: { title: string };
  BlogPage: { item: any };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};