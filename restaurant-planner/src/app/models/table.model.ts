export interface Table {
  id: string;
  name: string;
  capacity: number;
}

export interface CreateTableRequest {
  name: string;
  capacity: number;
}
