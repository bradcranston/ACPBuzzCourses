# ACP Buzz Course Selection Interface

*A FileMaker WebViewer Interface for Course Selection*

## What it does
This interface provides a modern, searchable course selection system designed to be embedded in FileMaker Pro using a webviewer. It allows users to browse, search, filter, and select courses from OData feed data.

## Features
- **Search functionality** - Find courses by title, teacher name, or email
- **Advanced filtering** - Filter by term, course type, and teacher
- **Modern UI** - Clean, responsive design that works in FileMaker webviewers
- **Course selection** - Click to select with detailed course information display
- **FileMaker integration** - Easy-to-use JavaScript functions for data loading and retrieval

## Quick Start
1. `npm install`
2. `npm start`
3. Open the jsDev.fmp12 file to see the interface in action
4. Use the interface to browse and select courses

## FileMaker Integration
The interface exposes two main functions for FileMaker:

- `loadCourseData(jsonData)` - Load course data from your FileMaker OData source
- `getSelectedCourse()` - Retrieve the selected course object

See [FILEMAKER_INTEGRATION.md](FILEMAKER_INTEGRATION.md) for detailed integration instructions.

## File Structure
- `src/index.js` - Main JavaScript functionality
- `src/style.css` - Modern CSS styling
- `index.html` - HTML container and test setup
- `jsDev.fmp12` - FileMaker file for testing and development

## Data Format
The interface expects OData JSON in this format:
```json
{
  "value": [
    {
      "__kptID": "unique-id",
      "title": "Course Title",
      "teacherFirst": "First",
      "teacherLast": "Last",
      "teacherEmail": "email@domain.com",
      "term": "2024-2025",
      "type": "Continuous",
      "startdate": "2024-08-20",
      "enddate": "2025-08-21"
    }
  ]
}
```

At this point you should see the web viewer on the layout load up with the HTML and JavaScript here. Edit the JavaScript or the HTML and you'll see the render in the web viewer update.

## Use this kit
Now you're ready to use this kit to create awesome JS widgets.
