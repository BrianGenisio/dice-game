export interface Card {
  name: string;
  kind: 'Bonus300' | 'Bonus400' | 'Bonus500' | 'MustBust' | 'MustFill' | 'DoubleCheese' | 'NoCheese' | 'CheeseStrikesBack';
  bonus: number;
  description: string;
  quantity: number;
}

// Predefined cards with quantities
export const cards: Card[] = [
  { name: 'Bonus 300', kind: 'Bonus300', bonus: 300, description: 'Bonus 300 points if you pass the cheese', quantity: 12 },
  { name: 'Bonus 400', kind: 'Bonus400', bonus: 400, description: 'Bonus 400 points if you pass the cheese', quantity: 10 },
  { name: 'Bonus 500', kind: 'Bonus500', bonus: 500, description: 'Bonus 500 points if you pass the cheese', quantity: 8 },
  { name: 'Must Cut', kind: 'MustBust', bonus: 0, description: 'You roll until you cut the cheese but take all the points you are able to take until you cut the cheese', quantity: 0 },
  { name: 'Must Pass', kind: 'MustFill', bonus: 1000, description: 'You must pass the cheese but you get a 1000 point bonus', quantity: 0 },
  { name: 'Double Cheese', kind: 'DoubleCheese', bonus: 0, description: 'Double your trouble. Double Trouble means you must pass the cheese twice in a row. If you manage this, you get to double your score.', quantity: 0 },
  { name: 'No Cheese!', kind: 'NoCheese', bonus: 0, description: 'No cheese for you. You pass the turn without scoring.', quantity: 0 },
  { name: 'Cheese Strikes Back!', kind: 'CheeseStrikesBack', bonus: -2500, description: 'Cheese Strikes Backequires that you pass the cheese. If you do, the leader (or the people tied for the lead) will lose 2500 points. You may skip this card and draw another.', quantity: 0 },
];
