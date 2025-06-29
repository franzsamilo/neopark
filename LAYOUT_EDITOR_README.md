# Neopark Layout Editor System

A comprehensive parking layout editor system for the Neopark app that allows admins to create and edit parking lot layouts with real-time availability tracking.

## 🎯 **Features**

### **Admin Layout Editor**

- **Interactive Canvas**: Drag-and-drop interface with grid snapping
- **Multiple Element Types**: Parking spaces, driving paths, entrances, exits, signs, lighting, vegetation, buildings
- **Real-time Manipulation**: Move, resize, rotate elements with visual handles
- **Copy & Paste**: Duplicate elements with Ctrl+C/Ctrl+V
- **Undo/Redo**: Full history management with keyboard shortcuts
- **Grid System**: Adjustable grid size with snap-to-grid functionality
- **Element Properties**: Edit position, size, rotation, and custom properties
- **Statistics**: Real-time counts of elements and parking spaces

### **User-Side Layout Viewing**

- **Map Integration**: Parking lots display on the main map with availability indicators
- **Layout Preview**: Click "View Layout" to see the parking lot layout
- **Real-time Availability**: Green (available) and red (occupied) parking spaces
- **Interactive Elements**: Click on parking spaces to see details
- **Live Updates**: Refresh button to get latest availability data
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ **Architecture**

### **Database Schema**

```prisma
model ParkingLot {
  id            String   @id @default(cuid())
  name          String
  address       String
  description   String?
  coordinates   Json     // { lat: number, lng: number }
  totalSpots    Int      @default(0)
  availableSpots Int     @default(0)
  layoutData    Json?    // Array of LayoutElement objects
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model LayoutElement {
  id            String   @id @default(cuid())
  parkingLotId  String
  elementType   LayoutElementType
  position      Json     // { x: number, y: number }
  size          Json     // { width: number, height: number }
  rotation      Float    @default(0)
  properties    Json?    // Custom properties for each element type
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### **Element Types**

- **PARKING_SPACE**: Core parking spots with occupancy tracking
- **DRIVING_PATH**: Roads and pathways
- **ENTRANCE/EXIT**: Entry and exit points
- **SIGN**: Traffic and parking signs
- **LIGHTING**: Street lights and illumination
- **VEGETATION**: Trees, plants, landscaping
- **BUILDING**: Structures and facilities

## 🚀 **Usage**

### **For Admins**

1. **Access Layout Editor**

   - Navigate to `/admin`
   - Click "Edit Layout" on any parking lot
   - Or go directly to `/createParkingLayout?id=<parkingLotId>`

2. **Create Layout**

   - Select tools from the sidebar
   - Click on canvas to place elements
   - Drag elements to move them
   - Use corner handles to resize
   - Use rotate handle to rotate elements

3. **Edit Properties**

   - Select an element to see its properties
   - Modify position, size, rotation
   - Set custom properties (spot ID, occupancy status, etc.)

4. **Save Layout**
   - Click "Save Layout" button
   - Layout is stored in database
   - Parking space counts are automatically updated

### **For Users**

1. **View Parking Lots**

   - Open the main dashboard
   - See parking lots on the map with availability indicators
   - Green markers = high availability
   - Yellow markers = moderate availability
   - Red markers = low availability

2. **View Layout Details**

   - Click on a parking lot marker
   - Click "View Layout" button in the popup
   - See the complete parking lot layout
   - Green spaces = available
   - Red spaces = occupied

3. **Check Specific Spots**
   - Click on individual parking spaces in the layout
   - See spot ID and availability status
   - Use refresh button to get latest data

## 🔧 **API Endpoints**

### **Layout Management**

- `GET /api/parking-lot/[id]/layout` - Get layout data for a parking lot
- `PUT /api/parking-lot/[id]/layout` - Update layout data
- `GET /api/parking-lot` - Get all parking lots with layout data
- `PATCH /api/parking-lot/[id]` - Update parking lot statistics

### **Data Flow**

1. Admin creates/edits layout in the editor
2. Layout is saved to `layoutData` field in database
3. User views parking lot on map
4. User clicks "View Layout" to see detailed layout
5. Layout shows real-time availability from IoT sensors

## 🎨 **UI Components**

### **Layout Editor**

- `src/app/createParkingLayout/page.tsx` - Main editor interface
- Canvas with grid system and element rendering
- Sidebar with tools, properties, and statistics
- Drag-and-drop functionality with visual feedback

### **User Interface**

- `src/components/dashboard/Map.tsx` - Interactive map with parking lots
- `src/components/dashboard/LayoutPreview.tsx` - Layout viewing component
- Real-time availability indicators
- Responsive design for all devices

## 🔄 **Real-time Features**

### **Availability Tracking**

- Parking spaces show green (available) or red (occupied)
- Status is updated from IoT sensor data
- Refresh button to get latest data
- Automatic count updates in statistics

### **Interactive Elements**

- Click parking spaces to see details
- Hover effects and visual feedback
- Responsive touch interactions
- Keyboard shortcuts for power users

## 🛠️ **Technical Implementation**

### **State Management**

- React hooks for local state
- History management for undo/redo
- Real-time updates from API calls
- Optimistic UI updates

### **Event Handling**

- Mouse events for drag-and-drop
- Keyboard events for shortcuts
- Touch events for mobile support
- Window events for popup interactions

### **Data Persistence**

- Layout data stored as JSON in database
- Automatic parsing and validation
- Error handling for corrupted data
- Backup and recovery mechanisms

## 🔮 **Future Enhancements**

### **Planned Features**

- **Multi-user Editing**: Collaborative layout editing
- **Version Control**: Layout history and rollback
- **Templates**: Pre-built layout templates
- **Advanced Elements**: More element types and properties
- **Analytics**: Usage statistics and optimization
- **Mobile Editor**: Touch-optimized mobile editing
- **Real-time Collaboration**: Live editing with multiple users
- **Export/Import**: Layout file formats (SVG, PDF, etc.)

### **IoT Integration**

- **Sensor Data**: Real-time occupancy from IoT sensors
- **Automated Updates**: Automatic layout updates based on sensor data
- **Predictive Analytics**: Occupancy prediction and optimization
- **Smart Routing**: Dynamic routing based on availability

## 📱 **Mobile Support**

The layout editor and viewer are fully responsive and work on:

- **Desktop**: Full-featured editing experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Simplified viewing and basic editing

## 🔒 **Security**

- **Authentication**: Admin-only access to layout editor
- **Authorization**: Role-based permissions
- **Data Validation**: Input sanitization and validation
- **Error Handling**: Graceful error recovery

## 🚀 **Getting Started**

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Configure Environment**

   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   DATABASE_URL=your_database_url
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Admin: `http://localhost:3000/admin`
   - User: `http://localhost:3000/dashboard`

## 📊 **Performance**

- **Optimized Rendering**: Efficient canvas rendering
- **Lazy Loading**: Load layout data on demand
- **Caching**: Cache frequently accessed data
- **Compression**: Optimized data storage and transfer

The Neopark Layout Editor System provides a complete solution for managing parking lot layouts with real-time availability tracking, making it easy for admins to design layouts and users to find available parking spaces.
