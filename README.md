# WebOccult Angular Practical

This repository contains Angular practical projects and exercises developed as part of the WebOccult Angular learning program.

# Demonstration Recording Link:
## 🎥 Demo
[Watch the demo here](https://www.loom.com/share/175e41e7f15f44ca8a258c3f71e82310?sid=68b2f834-8c6c-41bd-bbe3-42b34a88d96e)

## Projects

### 🍽️ Restaurant Planner
A modern, responsive restaurant reservation management system built with Angular 18.

**Location:** `restaurant-planner/`

**Description:** This application provides a comprehensive solution for restaurant staff to manage tables and reservations with a visual Gantt chart interface. It features a 24-hour timeline, automatic table allocation, conflict detection, and a modern responsive design.

**Key Features:**
- 24-hour scrollable timeline (6:00 AM - 11:00 PM)
- Table management with capacity tracking
- Smart reservation system with optimal table allocation
- Visual Gantt chart for reservation overview
- Real-time conflict detection
- Drag-to-resize functionality for reservations
- Responsive design for desktop and tablet

**Technologies Used:**
- Angular 18+ with standalone components
- TypeScript
- SCSS
- RxJS for reactive programming
- Angular Reactive Forms

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- Angular CLI

### Running a Project

1. Navigate to the desired project directory:
   ```bash
   cd restaurant-planner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
WebOccult Angular Practical/
├── restaurant-planner/          # Restaurant reservation management system
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Angular components
│   │   │   ├── models/          # TypeScript interfaces
│   │   │   ├── services/        # Business logic services
│   │   │   └── ...
│   │   └── ...
│   ├── package.json
│   ├── angular.json
│   └── README.md               # Detailed project documentation
└── README.md                   # This file
```

## Learning Objectives

This repository demonstrates:

- **Modern Angular Development**: Using Angular 18+ with standalone components
- **Component Architecture**: Well-structured component hierarchy
- **Service-based Architecture**: Separation of concerns with dedicated services
- **Reactive Programming**: RxJS for state management and data flow
- **Type Safety**: Full TypeScript implementation with interfaces
- **Responsive Design**: Mobile-first approach with SCSS
- **Form Handling**: Angular Reactive Forms with validation
- **State Management**: Local state management with BehaviorSubjects

## Development Notes

### Architecture Decisions
- **Standalone Components**: Leveraging Angular's latest standalone component architecture for better performance and tree-shaking
- **Service Layer**: Business logic separated into dedicated services for maintainability
- **Reactive Forms**: Used for better validation and user experience
- **SCSS**: Maintainable and scalable styling approach

### Best Practices Demonstrated
- Type-safe development with TypeScript
- Component composition and reusability
- Proper separation of concerns
- Responsive design principles
- Accessibility considerations
- Performance optimization techniques

## Future Enhancements

Potential improvements and additional features:
- Drag and drop functionality for reservations
- Multi-day calendar view
- Export capabilities (CSV/PDF)
- User authentication and role management
- Real-time updates with WebSocket integration
- Advanced reporting and analytics
