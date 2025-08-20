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
    image: require('../assets/images/shreeKrishna.png'),
    title: 'Bhagavad Gita – As It Is',
    subtitle: 'Geeta Press, Gorakhpur',
    contentTag: 'Trending',
    time: "5:30 min"
  },
  {
    image: require('../assets/images/shreeKrishna.png'),
    title: 'Ramcharitmanas',
    subtitle: 'Geeta Press, Gorakhpur',
    contentTag: 'Best Seller',
    time: "8:15 min"
  },
  {
    image: require('../assets/images/shreeKrishna.png'),
    title: 'Shri Krishna Leela',
    subtitle: 'Chaukhamba Sanskrit Sansthan',
    contentTag: 'Editor’s Pick',
    time: "4:45 min"
  },
  {
    image: require('../assets/images/shreeKrishna.png'),
    title: 'Vedas for Beginners',
    subtitle: 'Motilal Banarsidass Publishers',
    contentTag: '',
    time: "3:20 min"
  },
  {
    image: require('../assets/images/shreeKrishna.png'),
    title: 'Upanishads: The Essence of Vedas',
    subtitle: 'Ramakrishna Mission',
    contentTag: '',
    time: "6:10 min"
  },
  {
    image: require('../assets/images/shreeKrishna.png'),
    title: 'Hanuman Chalisa – Illustrated Edition',
    subtitle: 'Geeta Press, Gorakhpur',
    contentTag: 'New Arrival',
    time: "1:30 min"
  },
  {
    image: require('../assets/images/shreeKrishna.png'),
    title: 'Stories of Indian Saints',
    subtitle: 'Bharatiya Vidya Bhavan',
    contentTag: '',
    time: "7:00 min"
  },
  {
    image: require('../assets/images/shreeKrishna.png'),
    title: 'Essence of the Mahabharata',
    subtitle: 'Chinmaya Mission',
    contentTag: 'Recommended',
    time: "9:45 min"
  },
];
