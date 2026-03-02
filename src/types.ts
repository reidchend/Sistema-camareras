
export type RoomType = 'triple' | 'double' | 'matrimonial' | 'quintuple' | 'individual';

export interface Room {
  number: number;
  type: RoomType;
  isDirty: boolean;
  floor: number; // 0: Ground, 1: First, 2: Second
}

export interface RoomCounts {
  triple: number;
  double: number;
  matrimonial: number;
  quintuple: number;
  individual: number;
}

export interface HousekeeperAssignment {
  id: string;
  name: string;
  isRestaurantCleaner: boolean;
  assignedRooms: Room[];
  roomCounts: {
    triple: number;
    double: number;
    matrimonial: number;
    quintuple: number;
    individual: number;
  };
  totalRooms: number;
  totalBeds: number;
}
