import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reservation, CreateReservationRequest, ReservationConflict } from '../models/reservation.model';
import { Table } from '../models/table.model';
import { TableService } from './table.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  public reservations$ = this.reservationsSubject.asObservable();

  constructor(private tableService: TableService) {
    // Initialize with some sample reservations
    this.initializeSampleReservations();
  }

  private initializeSampleReservations(): void {
    const today = new Date().toISOString().split('T')[0];
    const sampleReservations: Reservation[] = [
      {
        id: '1',
        customerName: 'Smith Party',
        startTime: '09:00',
        endTime: '10:00',
        numberOfPersons: 4,
        tableId: '1',
        date: today
      },
      {
        id: '2',
        customerName: 'Davis',
        startTime: '10:00',
        endTime: '11:00',
        numberOfPersons: 2,
        tableId: '2',
        date: today
      },
      {
        id: '3',
        customerName: 'Wilson',
        startTime: '08:00',
        endTime: '10:00',
        numberOfPersons: 3,
        tableId: '3',
        date: today
      },
      {
        id: '4',
        customerName: 'Anderson Group',
        startTime: '09:00',
        endTime: '12:00',
        numberOfPersons: 8,
        tableId: '4',
        date: today
      },
      {
        id: '5',
        customerName: 'Johnson Family',
        startTime: '12:00',
        endTime: '14:00',
        numberOfPersons: 6,
        tableId: '1',
        date: today
      },
      {
        id: '6',
        customerName: 'Miller',
        startTime: '11:00',
        endTime: '12:00',
        numberOfPersons: 2,
        tableId: '5',
        date: today
      },
      {
        id: '7',
        customerName: 'Taylor Party',
        startTime: '14:00',
        endTime: '16:00',
        numberOfPersons: 4,
        tableId: '7',
        date: today
      },
      {
        id: '8',
        customerName: 'Garcia',
        startTime: '09:00',
        endTime: '10:00',
        numberOfPersons: 2,
        tableId: '8',
        date: today
      },
      {
        id: '9',
        customerName: 'Lee',
        startTime: '12:00',
        endTime: '13:00',
        numberOfPersons: 3,
        tableId: '8',
        date: today
      }
    ];
    this.reservationsSubject.next(sampleReservations);
  }

  getReservations(): Observable<Reservation[]> {
    return this.reservations$;
  }

  getReservationsForDate(date: string): Observable<Reservation[]> {
    return this.reservations$.pipe(
      map(reservations => reservations.filter(res => res.date === date))
    );
  }

  getReservationsForTable(tableId: string, date: string): Observable<Reservation[]> {
    return this.reservations$.pipe(
      map(reservations => 
        reservations.filter(res => res.tableId === tableId && res.date === date)
      )
    );
  }

  createReservation(request: CreateReservationRequest): { success: boolean; reservation?: Reservation; conflict?: ReservationConflict } {
    const endTime = this.calculateEndTime(request.startTime, 1); // Default 1 hour duration
    
    // Find optimal table
    const optimalTable = this.findOptimalTable(request.numberOfPersons, request.startTime, endTime, request.date);
    
    if (!optimalTable) {
      return { success: false };
    }

    // Check for conflicts - this should prevent overlapping reservations
    const conflict = this.checkForConflicts(optimalTable.id, request.startTime, endTime, request.date);
    if (conflict) {
      return { success: false, conflict };
    }

    const newReservation: Reservation = {
      id: this.generateId(),
      customerName: request.customerName,
      startTime: request.startTime,
      endTime: endTime,
      numberOfPersons: request.numberOfPersons,
      tableId: optimalTable.id,
      date: request.date
    };

    const currentReservations = this.reservationsSubject.value;
    this.reservationsSubject.next([...currentReservations, newReservation]);
    
    return { success: true, reservation: newReservation };
  }

  updateReservation(id: string, updates: Partial<Reservation>): boolean {
    const currentReservations = this.reservationsSubject.value;
    const reservationIndex = currentReservations.findIndex(res => res.id === id);
    
    if (reservationIndex !== -1) {
      currentReservations[reservationIndex] = { ...currentReservations[reservationIndex], ...updates };
      this.reservationsSubject.next([...currentReservations]);
      return true;
    }
    
    return false;
  }

  deleteReservation(id: string): boolean {
    const currentReservations = this.reservationsSubject.value;
    const filteredReservations = currentReservations.filter(res => res.id !== id);
    
    if (filteredReservations.length !== currentReservations.length) {
      this.reservationsSubject.next(filteredReservations);
      return true;
    }
    
    return false;
  }

  private findOptimalTable(numberOfPersons: number, startTime: string, endTime: string, date: string): Table | null {
    const tables = this.tableService.getTables();
    const reservations = this.reservationsSubject.value.filter(res => res.date === date);
    
    // Get available tables with sufficient capacity
    const availableTables: Table[] = [];
    
    // This is a synchronous operation, so we need to get the current value
    const currentTables = this.tableService['tablesSubject'].value;
    
    for (const table of currentTables) {
      if (table.capacity >= numberOfPersons) {
        const hasConflict = this.hasTimeConflict(table.id, startTime, endTime, reservations);
        if (!hasConflict) {
          availableTables.push(table);
        }
      }
    }
    
    if (availableTables.length === 0) {
      return null;
    }
    
    // Find the table with the smallest capacity that can accommodate the party
    return availableTables.reduce((best, current) => 
      current.capacity < best.capacity ? current : best
    );
  }

  private hasTimeConflict(tableId: string, startTime: string, endTime: string, reservations: Reservation[]): boolean {
    const tableReservations = reservations.filter(res => res.tableId === tableId);
    
    for (const reservation of tableReservations) {
      if (this.timesOverlap(startTime, endTime, reservation.startTime, reservation.endTime)) {
        return true;
      }
    }
    
    return false;
  }

  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const time1Start = this.timeToMinutes(start1);
    const time1End = this.timeToMinutes(end1);
    const time2Start = this.timeToMinutes(start2);
    const time2End = this.timeToMinutes(end2);
    
    return time1Start < time2End && time1End > time2Start;
  }

  private checkForConflicts(tableId: string, startTime: string, endTime: string, date: string): ReservationConflict | null {
    const reservations = this.reservationsSubject.value.filter(res => res.date === date);
    const conflictingReservation = reservations.find(res => 
      res.tableId === tableId && this.timesOverlap(startTime, endTime, res.startTime, res.endTime)
    );
    
    if (conflictingReservation) {
      return {
        tableId,
        conflictingReservation
      };
    }
    
    return null;
  }

  private calculateEndTime(startTime: string, durationHours: number): string {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = startMinutes + (durationHours * 60);
    return this.minutesToTime(endMinutes);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  isTimeSlotAvailable(tableId: string, timeSlot: string, date: string): boolean {
    // Check if the time slot is in the past
    if (this.isTimeSlotInPast(timeSlot, date)) {
      return false;
    }

    const reservations = this.reservationsSubject.value.filter(res => res.date === date);
    const tableReservations = reservations.filter(res => res.tableId === tableId);
    const timeSlotMinutes = this.timeToMinutes(timeSlot);
    
    return !tableReservations.some(res => {
      const resStartMinutes = this.timeToMinutes(res.startTime);
      const resEndMinutes = this.timeToMinutes(res.endTime);
      return timeSlotMinutes >= resStartMinutes && timeSlotMinutes < resEndMinutes;
    });
  }

  private isTimeSlotInPast(timeSlot: string, date: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    
    // If the date is not today, it's not in the past
    if (date !== today) {
      return false;
    }
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format
    const currentMinutes = this.timeToMinutes(currentTime);
    const timeSlotMinutes = this.timeToMinutes(timeSlot);
    
    return timeSlotMinutes <= currentMinutes;
  }
}
