import { Room, HousekeeperAssignment, RoomType } from '../types';

/**
 * Shuffles an array in place.
 */
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const ROOM_WEIGHTS: Record<RoomType, number> = {
  individual: 1,
  matrimonial: 1,
  double: 2,
  triple: 3,
  quintuple: 4, // As per user's mention "quíntuple con 4 camas"
};

const RESTAURANT_WEIGHT = 2; // Equivalent to 2 matrimonial rooms

export function distributeRooms(
  rooms: Room[],
  housekeeperNames: string[],
  restaurantCleanerIndex: number
): HousekeeperAssignment[] {
  const n = housekeeperNames.length;
  if (n === 0) return [];

  const dirtyRooms = rooms.filter(r => r.isDirty);
  if (dirtyRooms.length === 0) return [];

  // 1. Initialize assignments
  const assignments: HousekeeperAssignment[] = housekeeperNames.map((name, index) => ({
    id: Math.random().toString(36).substr(2, 9),
    name,
    isRestaurantCleaner: index === restaurantCleanerIndex,
    assignedRooms: [],
    roomCounts: {
      triple: 0,
      double: 0,
      matrimonial: 0,
      quintuple: 0,
      individual: 0,
    },
    totalRooms: 0,
    totalBeds: 0,
  }));

  // 2. Workload tracking
  // We use a "currentWorkload" to balance. 
  // The restaurant cleaner starts with a pre-assigned workload.
  const workloads = new Array(n).fill(0);
  workloads[restaurantCleanerIndex] = RESTAURANT_WEIGHT;

  // 3. Sort rooms for distribution
  // We sort by weight (descending) to use a greedy approach for better balancing.
  // We also add some randomness to the sort for variety.
  const sortedRooms = [...dirtyRooms].sort((a, b) => {
    const weightDiff = ROOM_WEIGHTS[b.type] - ROOM_WEIGHTS[a.type];
    if (weightDiff !== 0) return weightDiff;
    return Math.random() - 0.5; // Randomize within same weight
  });

  // 4. Greedy distribution
  // To avoid the "same rooms" syndrome, we can randomize the order of housekeepers 
  // when they have the same workload.
  sortedRooms.forEach(room => {
    const weight = ROOM_WEIGHTS[room.type];
    
    // Find housekeeper(s) with minimum workload
    const minWorkload = Math.min(...workloads);
    const candidates = workloads
      .map((w, i) => (w === minWorkload ? i : -1))
      .filter(i => i !== -1);
    
    // Pick one candidate randomly
    const chosenIdx = candidates[Math.floor(Math.random() * candidates.length)];
    
    // Assign room
    assignments[chosenIdx].assignedRooms.push(room);
    assignments[chosenIdx].roomCounts[room.type]++;
    assignments[chosenIdx].totalBeds += weight;
    workloads[chosenIdx] += weight;
  });

  // 5. Finalize
  assignments.forEach(a => {
    // Sort assigned rooms by floor and number for better workflow
    a.assignedRooms.sort((x, y) => x.floor - y.floor || x.number - y.number);
    a.totalRooms = a.assignedRooms.length;
  });

  return assignments;
}
