import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { TableService } from '../../services/table.service';
import { CreateReservationRequest, TimeSlot } from '../../models/reservation.model';
import { Table } from '../../models/table.model';

@Component({
  selector: 'app-reservation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservation-modal.component.html',
  styleUrl: './reservation-modal.component.scss'
})
export class ReservationModalComponent implements OnInit {
  @Input() selectedTimeSlot: string | null = null;
  @Input() selectedTableId: string | null = null;
  @Input() selectedDate: string = '';
  
  @Output() close = new EventEmitter<void>();

  reservationForm: FormGroup;
  timeSlots: TimeSlot[] = [];
  tables: Table[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private tableService: TableService
  ) {
    this.reservationForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      numberOfPersons: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      startTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateTimeSlots();
    this.loadTables();
    
    if (this.selectedTimeSlot) {
      this.reservationForm.patchValue({
        startTime: this.selectedTimeSlot
      });
    }
  }

  private generateTimeSlots(): void {
    for (let hour = 6; hour <= 23; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      this.timeSlots.push({
        hour: hour,
        display: timeSlot,
        isAvailable: this.isTimeSlotAvailable(timeSlot),
        isSelected: false
      });
    }
  }

  private isTimeSlotAvailable(timeSlot: string): boolean {
    // Check if the time slot is in the past
    if (this.isTimeSlotInPast(timeSlot)) {
      return false;
    }

    // Check if any table has availability for this time slot
    return this.tables.some(table => {
      return this.reservationService.isTimeSlotAvailable(table.id, timeSlot, this.selectedDate);
    });
  }

  private isTimeSlotInPast(timeSlot: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    
    // If the date is not today, it's not in the past
    if (this.selectedDate !== today) {
      return false;
    }
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format
    const currentMinutes = this.timeToMinutes(currentTime);
    const timeSlotMinutes = this.timeToMinutes(timeSlot);
    
    return timeSlotMinutes <= currentMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private loadTables(): void {
    this.tableService.getTables().subscribe(tables => {
      this.tables = tables;
      // Refresh time slot availability after tables are loaded
      this.refreshTimeSlotAvailability();
    });
  }

  private refreshTimeSlotAvailability(): void {
    this.timeSlots.forEach(timeSlot => {
      timeSlot.isAvailable = this.isTimeSlotAvailable(timeSlot.display);
    });
  }

  onTimeSlotSelect(timeSlot: TimeSlot): void {
    // Only allow selection of available time slots
    if (!timeSlot.isAvailable) {
      return;
    }
    
    // Reset all selections
    this.timeSlots.forEach(slot => slot.isSelected = false);
    
    // Select the clicked time slot
    timeSlot.isSelected = true;
    this.reservationForm.patchValue({
      startTime: timeSlot.display
    });
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      const formValue = this.reservationForm.value;
      
      const request: CreateReservationRequest = {
        customerName: formValue.customerName,
        numberOfPersons: formValue.numberOfPersons,
        startTime: formValue.startTime,
        date: this.selectedDate
      };

      const result = this.reservationService.createReservation(request);
      
      if (result.success) {
        this.successMessage = 'Reservation created successfully!';
        this.errorMessage = '';
        
        // Close modal after a short delay
        setTimeout(() => {
          this.closeModal();
        }, 1500);
      } else {
        this.errorMessage = result.conflict 
          ? `Time slot conflicts with existing reservation for ${result.conflict.conflictingReservation.customerName}`
          : 'No available tables for the selected time slot and party size.';
        this.successMessage = '';
      }
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.successMessage = '';
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  getAvailableTablesForTimeSlot(timeSlot: string): Table[] {
    // This would be used for showing which tables are available
    // For now, return all tables
    return this.tables;
  }
}
