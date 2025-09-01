export interface Reservation {
  id: string;
  customerName: string;
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
  numberOfPersons: number;
  tableId: string;
  date: string;      // Format: "YYYY-MM-DD"
}

export interface CreateReservationRequest {
  customerName: string;
  numberOfPersons: number;
  startTime: string;
  date: string;
}

export interface TimeSlot {
  hour: number;
  display: string;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface ReservationConflict {
  tableId: string;
  conflictingReservation: Reservation;
}
