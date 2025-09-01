import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  @Input() currentTime: string = '';
  @Input() selectedDate: string = '';

  timeSlots: string[] = [];

  ngOnInit(): void {
    this.generateTimeSlots();
  }

  private generateTimeSlots(): void {
    for (let hour = 6; hour <= 23; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  getCurrentTimePosition(): number {
    if (!this.currentTime) return 0;
    
    const [hours, minutes] = this.currentTime.split(':').map(Number);
    const currentHour = hours + (minutes / 60);
    
    // Calculate position relative to 6:00 AM start
    return Math.max(0, currentHour - 6);
  }

  isCurrentTime(hour: number): boolean {
    if (!this.currentTime) return false;
    
    const [currentHours] = this.currentTime.split(':').map(Number);
    return currentHours === hour;
  }
}
