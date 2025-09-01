import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { Table } from '../../models/table.model';
import { Reservation } from '../../models/reservation.model';
import { TableService } from '../../services/table.service';
import { ReservationService } from '../../services/reservation.service';
import { TableListComponent } from '../table-list/table-list.component';
import { ReservationModalComponent } from '../reservation-modal/reservation-modal.component';
import { TableModalComponent } from '../table-modal/table-modal.component';

type ViewMode = 'planner' | 'list';
type ActiveTab = 'tables' | 'reservations';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableListComponent,
    ReservationModalComponent,
    TableModalComponent,
    DatePipe
  ],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.scss'
})
export class PlannerComponent implements OnInit, OnDestroy {
  tables$: Observable<Table[]>;
  reservations$: Observable<Reservation[]>;
  selectedDate: string;
  currentTime: string = '';
  timeSlots: string[] = [];
  
  // View mode and tab management
  viewMode: ViewMode = 'planner';
  activeTab: ActiveTab = 'tables';
  showMainView: boolean = true;
  
  showReservationModal = false;
  showTableModal = false;
  selectedTimeSlot: string | null = null;
  selectedTableId: string | null = null;
  
  private timeIntervalId: any;
  private destroy$ = new Subject<void>();

  constructor(
    private tableService: TableService,
    private reservationService: ReservationService,
    private fb: FormBuilder
  ) {
    this.tables$ = this.tableService.getTables();
    this.reservations$ = this.reservationService.getReservations();
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.updateCurrentTime();
  }

  ngOnInit(): void {
    this.generateTimeSlots();
    this.updateCurrentTime();
    // Update current time every minute
    this.timeIntervalId = setInterval(() => {
      this.updateCurrentTime();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.timeIntervalId) {
      clearInterval(this.timeIntervalId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateTimeSlots(): void {
    for (let hour = 6; hour <= 23; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  private updateCurrentTime(): void {
    const now = new Date();
    this.currentTime = now.toTimeString().slice(0, 5); 
  }

  getCurrentTimePosition(): number {
    if (!this.currentTime) return 0;
  
    const [hours, minutes] = this.currentTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
  
    // Calculate position in pixels (1px per minute)
    // Timeline starts at 6:00 AM, so subtract 6 hours worth of minutes
    const positionInMinutes = totalMinutes - (6 * 60);
    
    // Convert to pixels (1px per minute)
    return positionInMinutes;
  }

  isCurrentTime(hour: number): boolean {
    if (!this.currentTime) return false;
    
    const [currentHours] = this.currentTime.split(':').map(Number);
    return currentHours === hour;
  }

  // View mode management
  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.showMainView = false; // Hide main view when selecting a mode
  }

  // Tab management
  setActiveTab(tab: ActiveTab): void {
    this.activeTab = tab;
  }

  // Back to main view
  backToMainView(): void {
    this.showMainView = true;
  }

  onTimeSlotClick(timeSlot: string, tableId: string): void {
    if (this.isTimeSlotInPast(timeSlot)) {
      return;
    }
    
    this.selectedTimeSlot = timeSlot;
    this.selectedTableId = tableId;
    this.showReservationModal = true;
  }

  onCreateTable(): void {
    this.showTableModal = true;
  }

  onNewReservation(): void {
    this.selectedTimeSlot = null;
    this.selectedTableId = null;
    this.showReservationModal = true;
  }

  onReservationModalClose(): void {
    this.showReservationModal = false;
    this.selectedTimeSlot = null;
    this.selectedTableId = null;
  }

  onTableModalClose(): void {
    this.showTableModal = false;
  }

  onDateChange(date: string): void {
    this.selectedDate = date;
  }

  getReservationsForDate(): Observable<Reservation[]> {
    return this.reservationService.getReservationsForDate(this.selectedDate);
  }

  // Helper methods for list view
  getTablesForList(): Observable<Table[]> {
    return this.tables$;
  }

  getReservationsForList(): Observable<Reservation[]> {
    return this.getReservationsForDate();
  }

  // Helper method to get table name by ID
  getTableName(tableId: string): string {
    // For now, return a simple string - in a real app you might want to use a computed observable
    return `Table ${tableId}`;
  }

  // Table management methods
 
  onDeleteTable(tableId: string): void {
    if (confirm('Are you sure you want to delete this table?')) {
      this.tableService.deleteTable(tableId);
    }
  }

  // Reservation management methods
  onEditReservation(reservation: Reservation): void {
    // TODO: Implement edit reservation functionality
    console.log('Edit reservation:', reservation);
  }

  onDeleteReservation(reservationId: string): void {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.reservationService.deleteReservation(reservationId);
    }
  }

  private isTimeSlotInPast(timeSlot: string): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentMinutes = this.timeToMinutes(currentTime);
    const timeSlotMinutes = this.timeToMinutes(timeSlot);
    return timeSlotMinutes <= currentMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
