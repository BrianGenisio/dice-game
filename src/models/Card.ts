export interface Card {
  name: string;
  kind: 'Bonus300' | 'Bonus400' | 'Bonus500' | 'MustBust' | 'MustFill' | 'DoubleTrouble' | 'NoDice' | 'Vengeance2500';
  description: string;
  quantity: number;
}

// Predefined cards with quantities
export const cards: Card[] = [
  { name: 'Bonus 300', kind: 'Bonus300', description: 'Bonus 300 points if you pass the cheese', quantity: 12 },
  { name: 'Bonus 400', kind: 'Bonus400', description: 'Bonus 400 points if you pass the cheese', quantity: 10 },
  { name: 'Bonus 500', kind: 'Bonus500', description: 'Bonus 500 points if you pass the cheese', quantity: 8 },
  { name: 'Must Bust', kind: 'MustBust', description: 'You roll until you bust but take all the points you are able to take until you bust', quantity: 0 },
  { name: 'Must Fill', kind: 'MustFill', description: 'You must fill but you get a 1000 point bonus', quantity: 0 },
  { name: 'Double Trouble', kind: 'DoubleTrouble', description: 'Double your trouble. Double Trouble means you must fill twice in a row. If you manage this, you get to double your score.', quantity: 0 },
  { name: 'No Dice', kind: 'NoDice', description: 'No dice for you. NoDice means you pass the turn without scoring.', quantity: 8 },
  { name: 'Vengeance 2500', kind: 'Vengeance2500', description: 'Vengeance 2500 points. Vengeance2500 requires that you fill. But if you do, the leader (or the people tied for the lead) will lose 2500 points. You may skip this card and draw another.', quantity: 0 },
];
