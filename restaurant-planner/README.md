# Restaurant Planner

A modern, responsive restaurant reservation management system built with Angular. This application allows restaurant staff to manage tables and reservations with a visual Gantt chart interface.

## Features

### Core Functionality
- **24-hour Timeline**: Horizontal scrollable timeline from 6:00 AM to 11:00 PM
- **Table Management**: Create, view, and manage restaurant tables with capacity information
- **Reservation System**: Create reservations with automatic optimal table allocation
- **Visual Gantt Chart**: See all reservations displayed as blocks on the timeline
- **Current Time Indicator**: Real-time indicator showing current time on the timeline
- **Conflict Detection**: Prevents overlapping reservations on the same table

### Bonus Features
- **Drag-to-Resize**: Resize reservation blocks by dragging to extend duration
- **Real-time Conflict Detection**: Visual feedback when trying to create conflicting reservations
- **Responsive Design**: Works on desktop and tablet devices
- **Modern UI**: Clean, professional interface matching the provided wireframes

## Technologies Used

- **Angular 18+**: Latest version with standalone components
- **TypeScript**: Type-safe development
- **SCSS**: Advanced styling with variables and mixins
- **RxJS**: Reactive programming for state management
- **Angular Reactive Forms**: Form validation and handling

## Setup Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- Angular CLI

### Installation

1. **Clone or download the project**
   ```bash
   cd restaurant-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Building for Production

```bash
ng build --configuration production
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── planner/           # Main application component
│   │   ├── timeline/          # 24-hour timeline display
│   │   ├── table-list/        # Table grid with reservations
│   │   ├── reservation-modal/ # Create/edit reservations
│   │   └── table-modal/       # Create new tables
│   ├── models/
│   │   ├── table.model.ts     # Table interface definitions
│   │   └── reservation.model.ts # Reservation interface definitions
│   ├── services/
│   │   ├── table.service.ts   # Table management logic
│   │   └── reservation.service.ts # Reservation management logic
│   └── app.component.*        # Root component
├── styles.scss                # Global styles
└── index.html                 # Main HTML file
```

## Key Features Implementation

### Business Logic
- **Optimal Table Allocation**: Automatically selects the smallest available table that can accommodate the party size
- **Time Conflict Prevention**: Ensures no overlapping reservations on the same table
- **Capacity Validation**: Respects table capacity limits
- **Default Duration**: All reservations default to 1-hour duration

### User Interface
- **Intuitive Timeline**: Easy-to-read 24-hour view with hourly increments
- **Visual Feedback**: Color-coded availability and reservation status
- **Modal Forms**: Clean, accessible forms for creating tables and reservations
- **Responsive Design**: Adapts to different screen sizes

### Data Management
- **Reactive State**: Uses RxJS BehaviorSubjects for real-time updates
- **Local Storage**: All data persists during the session
- **Type Safety**: Full TypeScript implementation with interfaces

## Usage

### Creating Tables
1. Click the "+ Create Table" button
2. Enter table name and capacity
3. Click "Create Table"

### Making Reservations
1. Click on any available time slot or use "New Reservation" button
2. Enter guest name and number of persons
3. Select desired time slot
4. System automatically allocates the best available table

### Resizing Reservations
1. Hover over any reservation block
2. Drag the resize handle on the right edge
3. Release to save the new duration

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

### Key Decisions
- **Standalone Components**: Used Angular's latest standalone component architecture for better tree-shaking and performance
- **Reactive Forms**: Implemented for better validation and user experience
- **SCSS**: Used for maintainable and scalable styling
- **Service-based Architecture**: Separated business logic into dedicated services

### Performance Considerations
- **OnPush Change Detection**: Components use OnPush strategy where applicable
- **Lazy Loading**: Ready for lazy loading implementation if needed
- **Optimized Rendering**: Efficient DOM updates with Angular's change detection

### Future Enhancements
- **Drag and Drop**: Move reservations between tables
- **Multi-day View**: Calendar view for multiple days
- **Export Functionality**: Export reservations to CSV/PDF
- **User Authentication**: Multi-user support with roles
- **Real-time Updates**: WebSocket integration for live updates
