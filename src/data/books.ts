export type Book = {
  id: string;
  title: string;
  author: string;
  cover: number;
};

export type Collection = {
  id: string;
  title: string;
  subtitle: string;
  updated: string;
  count: number;
  /** The first three are the fanned covers on the card and the first three on the shelf. */
  shelf: string[];
  books: string[];
};

export const BOOKS: Record<string, Book> = {
  'orphaned-believers': { id: 'orphaned-believers', title: 'Orphaned Believers', author: 'Sara Billups', cover: require('@/assets/covers/orphaned-believers.jpg') },
  'next-of-kin': { id: 'next-of-kin', title: 'Next of Kin', author: 'Gabrielle Hamilton', cover: require('@/assets/covers/next-of-kin.jpg') },
  conform: { id: 'conform', title: 'Conform', author: 'Ariel Sullivan', cover: require('@/assets/covers/conform.jpg') },
  'richest-man': { id: 'richest-man', title: 'The Richest Man in Babylon', author: 'George S. Clason', cover: require('@/assets/covers/richest-man.jpg') },
  'too-big-to-fail': { id: 'too-big-to-fail', title: 'Too Big to Fail', author: 'Andrew Ross Sorkin', cover: require('@/assets/covers/too-big-to-fail.jpg') },
  'short-history': { id: 'short-history', title: 'A Short History of Financial Euphoria', author: 'John Kenneth Galbraith', cover: require('@/assets/covers/short-history.jpg') },
  'mastering-cycle': { id: 'mastering-cycle', title: 'Mastering the Market Cycle', author: 'Howard Marks', cover: require('@/assets/covers/mastering-cycle.jpg') },
  'atomic-habits': { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', cover: require('@/assets/covers/atomic-habits.jpg') },
  'power-discipline': { id: 'power-discipline', title: 'The Power of Discipline', author: 'Daniel Walter', cover: require('@/assets/covers/power-discipline.jpg') },
  'five-rings': { id: 'five-rings', title: 'The Book of Five Rings', author: 'Miyamoto Musashi', cover: require('@/assets/covers/five-rings.jpg') },
  one: { id: 'one', title: 'One', author: 'Bradley Charbonneau', cover: require('@/assets/covers/one.jpg') },
  trust: { id: 'trust', title: 'Trust', author: 'Hernan Diaz', cover: require('@/assets/covers/trust.jpg') },
  'electric-city': { id: 'electric-city', title: 'Electric City', author: 'Thomas Hager', cover: require('@/assets/covers/electric-city.jpg') },
  'practical-uncertainty': { id: 'practical-uncertainty', title: 'Practical Uncertainty', author: 'J. Morel', cover: require('@/assets/covers/practical-uncertainty.jpg') },
  'nervous-system': { id: 'nervous-system', title: 'Nervous System', author: 'Wang Yan', cover: require('@/assets/covers/nervous-system.jpg') },
  'the-magic': { id: 'the-magic', title: 'The Magic', author: 'Rhonda Byrne', cover: require('@/assets/covers/the-magic.jpg') },
  fahrenheit: { id: 'fahrenheit', title: 'Fahrenheit 451', author: 'Ray Bradbury', cover: require('@/assets/covers/fahrenheit.jpg') },
  'let-her-wolf': { id: 'let-her-wolf', title: 'Let Her Wolf', author: 'A Novel', cover: require('@/assets/covers/let-her-wolf.jpg') },
  'deep-work': { id: 'deep-work', title: 'Deep Work', author: 'Cal Newport', cover: require('@/assets/covers/deep-work.jpg') },
  'still-mind': { id: 'still-mind', title: 'The Still Mind', author: 'Anna Rivera', cover: require('@/assets/covers/still-mind.jpg') },
  'quiet-hours': { id: 'quiet-hours', title: 'Quiet Hours', author: 'M. Okafor', cover: require('@/assets/covers/quiet-hours.jpg') },
};

export const COLLECTIONS: Collection[] = [
  {
    id: 'spiritual',
    title: 'Spiritual',
    subtitle: 'Manifest your inner self',
    updated: '2 Hours ago',
    count: 93,
    shelf: ['orphaned-believers', 'next-of-kin', 'conform', 'still-mind', 'the-magic', 'atomic-habits'],
    books: ['richest-man', 'too-big-to-fail', 'short-history', 'mastering-cycle', 'quiet-hours', 'five-rings', 'one', 'deep-work'],
  },
  {
    id: 'finances',
    title: 'Finances',
    subtitle: 'Grow and manage your finances.',
    updated: '9 Days ago',
    count: 24,
    shelf: ['trust', 'electric-city', 'practical-uncertainty', 'richest-man', 'too-big-to-fail', 'mastering-cycle'],
    books: ['short-history', 'mastering-cycle', 'richest-man', 'too-big-to-fail', 'power-discipline', 'one'],
  },
  {
    id: 'mindful',
    title: 'Mindful',
    subtitle: 'Expand your mind',
    updated: '12 Days ago',
    count: 54,
    shelf: ['nervous-system', 'the-magic', 'fahrenheit', 'still-mind', 'quiet-hours', 'five-rings'],
    books: ['five-rings', 'still-mind', 'quiet-hours', 'deep-work', 'atomic-habits', 'one'],
  },
  {
    id: 'discipline',
    title: 'Discipline',
    subtitle: 'Build habits that last',
    updated: '3 Weeks ago',
    count: 31,
    shelf: ['power-discipline', 'atomic-habits', 'deep-work', 'one', 'five-rings', 'let-her-wolf'],
    books: ['one', 'five-rings', 'deep-work', 'atomic-habits', 'let-her-wolf', 'power-discipline'],
  },
];

export const TOP_SELECTIONS = ['power-discipline', 'atomic-habits', 'five-rings', 'one', 'let-her-wolf', 'deep-work', 'trust', 'the-magic'];
