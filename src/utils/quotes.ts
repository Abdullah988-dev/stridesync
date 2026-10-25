export interface Quote {
  text: string;
  author: string;
}

export const motivationalQuotes: Quote[] = [
  {
    text: 'A journey of a thousand miles begins with a single step.',
    author: 'Lao Tzu',
  },
  {
    text: 'Walking is the best medicine for body and mind.',
    author: 'Hippocrates',
  },
  {
    text: 'Small daily improvements over time lead to stunning results.',
    author: 'Robin Sharma',
  },
  {
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
  },
  {
    text: 'Take care of your body. It is the only place you have to live.',
    author: 'Jim Rohn',
  },
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
  {
    text: 'Every step you take is a vote for the person you want to become.',
    author: 'James Clear',
  },
  {
    text: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
  },
  {
    text: 'An early-morning walk is a blessing for the whole day.',
    author: 'Henry David Thoreau',
  },
];

export function getQuoteForToday(): Quote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear) % motivationalQuotes.length;
  return motivationalQuotes[index];
}
