// src/data/bookData.ts

export type Book = {
  image: string;
  title: string;
  subtitle: string;
  contentTag?: string;
  time?: string;
};

export const books: Book[] = [
  {
    image: 'https://unsplash.it/400/400?image=1',
    title: 'Bhagavad Gita – As It Is',
    subtitle: 'Geeta Press, Gorakhpur',
    contentTag: 'Trending',
    time: "5:30 min"
  },
  {
    image: 'https://unsplash.it/400/400?image=2',
    title: 'Ramcharitmanas',
    subtitle: 'Geeta Press, Gorakhpur',
    contentTag: 'Best Seller',
    time: "8:15 min"
  },
  {
    image: 'https://unsplash.it/400/400?image=3',
    title: 'Shri Krishna Leela',
    subtitle: 'Chaukhamba Sanskrit Sansthan',
    contentTag: 'Editor’s Pick',
    time: "4:45 min"
  },
  {
    image: 'https://unsplash.it/400/400?image=4',
    title: 'Vedas for Beginners',
    subtitle: 'Motilal Banarsidass Publishers',
    contentTag: '',
    time: "3:20 min"
  },
  {
    image: 'https://unsplash.it/400/400?image=5',
    title: 'Upanishads: The Essence of Vedas',
    subtitle: 'Ramakrishna Mission',
    contentTag: '',
    time: "6:10 min"
  },
  {
    image: 'https://unsplash.it/400/400?image=6',
    title: 'Hanuman Chalisa – Illustrated Edition',
    subtitle: 'Geeta Press, Gorakhpur',
    contentTag: 'New Arrival',
    time: "1:30 min"
  },
  {
    image: 'https://unsplash.it/400/400?image=7',
    title: 'Stories of Indian Saints',
    subtitle: 'Bharatiya Vidya Bhavan',
    contentTag: '',
    time: "7:00 min"
  },
  {
    image: 'https://unsplash.it/400/400?image=8',
    title: 'Essence of the Mahabharata',
    subtitle: 'Chinmaya Mission',
    contentTag: 'Recommended',
    time: "9:45 min"
  },
];
