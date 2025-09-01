import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableService } from '../../services/table.service';
import { CreateTableRequest } from '../../models/table.model';

@Component({
  selector: 'app-table-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './table-modal.component.html',
  styleUrl: './table-modal.component.scss'
})
export class TableModalComponent {
  @Output() close = new EventEmitter<void>();

  tableForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private tableService: TableService
  ) {
    this.tableForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(20)]]
    });
  }

  onSubmit(): void {
    if (this.tableForm.valid) {
      const formValue = this.tableForm.value;
      
      const request: CreateTableRequest = {
        name: formValue.name,
        capacity: formValue.capacity
      };

      try {
        this.tableService.createTable(request);
        this.successMessage = 'Table created successfully!';
        this.errorMessage = '';
        
        // Reset form
        this.tableForm.reset();
        
        // Close modal after a short delay
        setTimeout(() => {
          this.closeModal();
        }, 1500);
      } catch (error) {
        this.errorMessage = 'Failed to create table. Please try again.';
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
}
