# FileMaker Integration Guide

## Overview
This interface provides a course selection system that can be embedded in FileMaker Pro using a webviewer. The interface displays course data in a searchable, filterable list and allows users to select a course.

## FileMaker Integration

### 1. Setting up the Webviewer
1. Create a webviewer object in your FileMaker layout
2. Set the webviewer source to point to your `index.html` file
3. Ensure the webviewer has sufficient size to display the interface properly

### 2. Loading Course Data
Call the `loadCourseData` function from FileMaker to populate the interface:

```javascript
// From FileMaker, execute JavaScript in webviewer:
"loadCourseData(" & YourJSONData & ")"
```

The JSON data should be in the format:
```json
{
  "@odata.context": "...",
  "value": [
    {
      "__kptID": "unique-id",
      "title": "Course Title",
      "teacherFirst": "Teacher First Name",
      "teacherLast": "Teacher Last Name", 
      "teacherEmail": "teacher@email.com",
      "term": "2024-2025",
      "type": "Continuous",
      "startdate": "2024-08-20",
      "enddate": "2025-08-21"
    }
  ]
}
```

### 3. Getting Selected Course
Retrieve the selected course data from FileMaker:

```javascript
// From FileMaker, execute JavaScript in webviewer and capture result:
"getSelectedCourse()"
```

This returns the complete course object or `null` if no course is selected.

### 4. FileMaker Script Example

```applescript
# Load data into webviewer
Set Variable [ $result ; Value: Perform JavaScript in Web Viewer [ Object Name: "CourseSelector" ; Function: "loadCourseData(" & $courseJSON & ")" ] ]

# Wait for user selection (you might want to add a confirmation button that triggers a FileMaker script)

# Get selected course
Set Variable [ $selectedCourse ; Value: Perform JavaScript in Web Viewer [ Object Name: "CourseSelector" ; Function: "getSelectedCourse()" ] ]
```

### 5. Automatic Script Calling

When the user clicks "Confirm Selection", the interface automatically calls a FileMaker script named `CourseSelected` with the complete course data as a JSON parameter.

**Create this script in your FileMaker file:**

Script Name: `CourseSelected`
Script Parameter: Will receive the complete course object as JSON

```applescript
# CourseSelected Script
# Get the course data from script parameter
Set Variable [ $courseData ; Value: Get(ScriptParameter) ]

# Parse the JSON to extract course information
Set Variable [ $courseID ; Value: JSONGetElement ( $courseData ; "__kptID" ) ]
Set Variable [ $courseTitle ; Value: JSONGetElement ( $courseData ; "title" ) ]
Set Variable [ $teacherFirst ; Value: JSONGetElement ( $courseData ; "teacherFirst" ) ]
Set Variable [ $teacherLast ; Value: JSONGetElement ( $courseData ; "teacherLast" ) ]
Set Variable [ $teacherEmail ; Value: JSONGetElement ( $courseData ; "teacherEmail" ) ]
Set Variable [ $term ; Value: JSONGetElement ( $courseData ; "term" ) ]
Set Variable [ $type ; Value: JSONGetElement ( $courseData ; "type" ) ]
Set Variable [ $startDate ; Value: JSONGetElement ( $courseData ; "startdate" ) ]
Set Variable [ $endDate ; Value: JSONGetElement ( $courseData ; "enddate" ) ]

# Process the course selection (create records, navigate, etc.)
# Your custom logic here...

# Optional: Show confirmation
Show Custom Dialog [ "Course Selected" ; "Selected: " & $courseTitle ]
```

## Interface Features

### Search and Filtering
- **Search**: Type in the search box to filter courses by title, teacher name, or email
- **Term Filter**: Filter courses by academic term
- **Type Filter**: Filter courses by type (Continuous, Range, etc.)
- **Teacher Filter**: Filter courses by teacher name
- **Clear Filters**: Reset all filters and search

### Course Selection
- Click on any course to select it
- Selected course will be highlighted and details will appear at the bottom
- Use "Confirm Selection" to finalize the choice
- Use "Clear Selection" to deselect the current course

### Responsive Design
The interface adapts to different screen sizes and will work well in various webviewer dimensions.

## Technical Details

### Available Functions
- `window.loadCourseData(data)` - Load course data into the interface
- `window.getSelectedCourse()` - Get the currently selected course
- `window.selectCourse(courseId)` - Programmatically select a course by ID

### FileMaker Script Integration
When the user clicks "Confirm Selection", the interface automatically calls a FileMaker script with the course data:

**Script Called:** `CourseSelected`
**Parameter:** Complete course object as JSON string

The interface uses multiple methods to ensure compatibility across different FileMaker versions:
1. `FileMaker.PerformScript()` (FileMaker 19+)
2. `window.FileMaker.PerformScript()` (alternative approach)
3. `fmp://` URL scheme (older versions)

**Example Course Data Parameter:**
```json
{
  "__kptID": "2AB186B0-32EF-4F4E-ACD6-EA04168AC2BE",
  "title": "Robotics & Design (Wayland Master)",
  "teacherFirst": "Matthew",
  "teacherLast": "Neeb - admin",
  "teacherEmail": "admin@onlineacademy.email",
  "term": "2021-2023",
  "type": "Continuous",
  "startdate": "2021-08-27",
  "enddate": "2024-09-01"
}
```

### Data Format
The interface expects course objects with these properties:
- `__kptID` (required) - Unique identifier
- `title` - Course title
- `teacherFirst` - Teacher's first name
- `teacherLast` - Teacher's last name  
- `teacherEmail` - Teacher's email
- `term` - Academic term
- `type` - Course type
- `startdate` - Start date (YYYY-MM-DD format)
- `enddate` - End date (YYYY-MM-DD format)

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- FileMaker Pro webviewer (Chromium-based)

## Customization

### Styling
Modify `src/style.css` to customize the appearance:
- Colors are defined using CSS custom properties
- The design uses a card-based layout with hover effects
- Responsive breakpoints are included for mobile devices

### Functionality
Modify `src/index.js` to:
- Add additional search criteria
- Change the display format
- Add validation rules
- Integrate with other FileMaker scripts

## Testing

The interface includes sample data for testing. Open `index.html` in a browser to test the functionality before integrating with FileMaker.

To test with your own data:
1. Open browser console
2. Call `loadCourseData(yourDataObject)`
3. Test the search, filtering, and selection features
