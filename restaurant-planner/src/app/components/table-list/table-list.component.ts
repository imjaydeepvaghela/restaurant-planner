import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table } from '../../models/table.model';
import { Reservation } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';

export interface TimeSlotClickEvent {
  timeSlot: string;
  tableId: string;
}

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-list.component.html',
  styleUrl: './table-list.component.scss'
})
export class TableListComponent implements OnInit {
  @Input() tables: Table[] = [];
  @Input() reservations: Reservation[] = [];
  @Input() selectedDate: string = '';
  @Input() timeSlots: string[] = [];

  @Input() currentTime: string = '';
  @Input() getCurrentTimePosition!: () => number;
  
  @Output() timeSlotClick = new EventEmitter<TimeSlotClickEvent>();
  isDragging = false;
  dragStartX = 0;
  dragStartWidth = 0;
  draggedReservation: Reservation | null = null;

  constructor(
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Component is now ready
  }

  getReservationsForTable(tableId: string): Reservation[] {
    return this.reservations.filter(res => res.tableId === tableId);
  }

  getReservationsForTableSorted(tableId: string): Reservation[] {
    const tableReservations = this.getReservationsForTable(tableId);
    return tableReservations.sort((a, b) => {
      const aStart = this.timeToMinutes(a.startTime);
      const bStart = this.timeToMinutes(b.startTime);
      return aStart - bStart;
    });
  }

  getReservationForTimeSlot(tableId: string, timeSlot: string): Reservation | undefined {
    const tableReservations = this.getReservationsForTable(tableId);
    return tableReservations.find(res => res.startTime === timeSlot);
  }

  onTimeSlotClick(timeSlot: string, tableId: string): void {
    // Don't allow clicking on past time slots
    if (this.isTimeSlotInPast(timeSlot)) {
      return;
    }
    
    this.timeSlotClick.emit({ timeSlot, tableId });
  }

  // getReservationPosition(reservation: Reservation): { left: number; width: number } {
  //   const startHour = parseInt(reservation.startTime.split(':')[0]);
  //   const endHour = parseInt(reservation.endTime.split(':')[0]);
    
  //   // Calculate position relative to 6:00 AM start (6:00 AM = 0px)
  //   const left = (startHour - 6) * 60; // 60px per hour
  //   const width = (endHour - startHour) * 60;
    
  //   return { left, width };
  // }

  getReservationPosition(reservation: Reservation): { left: number; width: number } {
    const startMinutes = this.timeToMinutes(reservation.startTime);
    const endMinutes = this.timeToMinutes(reservation.endTime);
  
    // Timeline starts at 06:00
    const timelineStartMinutes = 6 * 60;
  
    // Position the reservation at the start of the time slot cell
    const left = (startMinutes - timelineStartMinutes);
    
    // Calculate width to fill all time slot cells the reservation spans
    const width = (endMinutes - startMinutes) + 60;
  
    return { left, width };
  }

  isTimeSlotAvailable(tableId: string, timeSlot: string): boolean {
    // Check if the time slot is in the past
    if (this.isTimeSlotInPast(timeSlot)) {
      return false;
    }

    const tableReservations = this.getReservationsForTable(tableId);
    const timeSlotMinutes = this.timeToMinutes(timeSlot);
    
    return !tableReservations.some(res => {
      const resStartMinutes = this.timeToMinutes(res.startTime);
      const resEndMinutes = this.timeToMinutes(res.endTime);
      return timeSlotMinutes >= resStartMinutes && timeSlotMinutes < resEndMinutes;
    });
  }

  isTimeSlotInPast(timeSlot: string): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format
    const currentMinutes = this.timeToMinutes(currentTime);
    const timeSlotMinutes = this.timeToMinutes(timeSlot);
    
    return timeSlotMinutes <= currentMinutes;
  }

  onReservationMouseDown(event: MouseEvent, reservation: Reservation): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.draggedReservation = reservation;
    
    // Store the actual duration in minutes for drag calculations
    const startMinutes = this.timeToMinutes(reservation.startTime);
    const endMinutes = this.timeToMinutes(reservation.endTime);
    this.dragStartWidth = endMinutes - startMinutes;
    
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.draggedReservation) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const newWidth = Math.max(60, this.dragStartWidth + deltaX); // Minimum 1 hour
    const newDurationHours = Math.round(newWidth / 60);
    
    // Update the reservation duration
    const startHour = parseInt(this.draggedReservation.startTime.split(':')[0]);
    const requestedEndHour = startHour + newDurationHours;
    
    // Find the maximum allowed end time considering conflicts
    const maxAllowedEndTime = this.getMaxAllowedEndTime(
      this.draggedReservation.tableId,
      this.draggedReservation.startTime,
      this.draggedReservation.id
    );
    
    const maxAllowedEndHour = parseInt(maxAllowedEndTime.split(':')[0]);
    const newEndHour = Math.min(requestedEndHour, maxAllowedEndHour, 23); // Don't exceed 23:00
    
    if (newEndHour > startHour) { // Ensure we have at least 1 hour duration
      const newEndTime = `${newEndHour.toString().padStart(2, '0')}:00`;
      this.draggedReservation.endTime = newEndTime;
    }
  }

  private onMouseUp(): void {
    if (this.isDragging && this.draggedReservation) {
      // Save the updated reservation
      this.reservationService.updateReservation(this.draggedReservation.id, {
        endTime: this.draggedReservation.endTime
      });
    }
    
    this.isDragging = false;
    this.draggedReservation = null;
    
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private checkReservationConflict(tableId: string, startTime: string, endTime: string, excludeReservationId: string): boolean {
    const tableReservations = this.getReservationsForTable(tableId)
      .filter(res => res.id !== excludeReservationId);
    
    return tableReservations.some(res => {
      return this.timesOverlap(startTime, endTime, res.startTime, res.endTime);
    });
  }

  private getMaxAllowedEndTime(tableId: string, startTime: string, excludeReservationId: string): string {
    const tableReservations = this.getReservationsForTable(tableId)
      .filter(res => res.id !== excludeReservationId);
    
    const startMinutes = this.timeToMinutes(startTime);
    
    // Find all reservations that start after our start time
    const futureReservations = tableReservations
      .filter(res => this.timeToMinutes(res.startTime) > startMinutes)
      .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));
    
    // If there are no future reservations, we can extend to 23:00
    if (futureReservations.length === 0) {
      return '23:00';
    }
    
    // Return the start time of the first future reservation
    // This allows the current reservation to extend up to (but not including) the next reservation
    return futureReservations[0].startTime;
  }

  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const time1Start = this.timeToMinutes(start1);
    const time1End = this.timeToMinutes(end1);
    const time2Start = this.timeToMinutes(start2);
    const time2End = this.timeToMinutes(end2);
    
    return time1Start < time2End && time1End > time2Start;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  hasOverlappingReservations(reservation: Reservation): boolean {
    const tableReservations = this.getReservationsForTable(reservation.tableId);
    return tableReservations.some(res => 
      res.id !== reservation.id && 
      this.timesOverlap(reservation.startTime, reservation.endTime, res.startTime, res.endTime)
    );
  }

  getReservationZIndex(reservation: Reservation): number {
    const tableReservations = this.getReservationsForTableSorted(reservation.tableId);
    const index = tableReservations.findIndex(res => res.id === reservation.id);
    return index + 1;
  }

  getReservationVerticalOffset(reservation: Reservation): number {
    const tableReservations = this.getReservationsForTableSorted(reservation.tableId);
    const index = tableReservations.findIndex(res => res.id === reservation.id);
    
    // Check if this reservation overlaps with any previous ones
    let offset = 0;
    for (let i = 0; i < index; i++) {
      const prevReservation = tableReservations[i];
      if (this.timesOverlap(reservation.startTime, reservation.endTime, prevReservation.startTime, prevReservation.endTime)) {
        offset += 2; // 2px offset for each overlapping reservation
      }
    }
    
    return offset;
  }
}
