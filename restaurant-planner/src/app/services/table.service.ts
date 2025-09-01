import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Table, CreateTableRequest } from '../models/table.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private tablesSubject = new BehaviorSubject<Table[]>([]);
  public tables$ = this.tablesSubject.asObservable();

  constructor() {
    // Initialize with some sample tables
    this.initializeSampleTables();
  }

  private initializeSampleTables(): void {
    const sampleTables: Table[] = [
      { id: '1', name: 'Table 1', capacity: 4 },
      { id: '2', name: 'Table 2', capacity: 2 },
      { id: '3', name: 'Table 3', capacity: 6 },
      { id: '4', name: 'Table 4', capacity: 8 },
      { id: '5', name: 'Table 5', capacity: 2 },
      { id: '6', name: 'Table 6', capacity: 4 },
      { id: '7', name: 'Table 7', capacity: 6 },
      { id: '8', name: 'Table 8', capacity: 4 }
    ];
    this.tablesSubject.next(sampleTables);
  }

  getTables(): Observable<Table[]> {
    return this.tables$;
  }

  getTableById(id: string): Table | undefined {
    return this.tablesSubject.value.find(table => table.id === id);
  }

  createTable(request: CreateTableRequest): Table {
    const newTable: Table = {
      id: this.generateId(),
      name: request.name,
      capacity: request.capacity
    };

    const currentTables = this.tablesSubject.value;
    this.tablesSubject.next([...currentTables, newTable]);
    
    return newTable;
  }

  updateTable(id: string, updates: Partial<Table>): boolean {
    const currentTables = this.tablesSubject.value;
    const tableIndex = currentTables.findIndex(table => table.id === id);
    
    if (tableIndex !== -1) {
      currentTables[tableIndex] = { ...currentTables[tableIndex], ...updates };
      this.tablesSubject.next([...currentTables]);
      return true;
    }
    
    return false;
  }

  deleteTable(id: string): boolean {
    const currentTables = this.tablesSubject.value;
    const filteredTables = currentTables.filter(table => table.id !== id);
    
    if (filteredTables.length !== currentTables.length) {
      this.tablesSubject.next(filteredTables);
      return true;
    }
    
    return false;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
