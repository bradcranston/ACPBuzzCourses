// Global data storage
let coursesData = [];
let selectedCourse = null;

// Function that FileMaker will call to load course data
window.loadCourseData = function(data) {
    try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        coursesData = parsedData.value || [];
        renderCourseList();
        console.log('Course data loaded:', coursesData.length, 'courses');
    } catch (error) {
        console.error('Error parsing course data:', error);
        showError('Failed to load course data');
    }
};

// Function that FileMaker can call to get the selected course
window.getSelectedCourse = function() {
    return selectedCourse;
};

// Function to create the main interface
function createInterface() {
    document.body.innerHTML = `
        <div class="container">
            <h1>Select a Course</h1>
            
            <div class="controls">
                <div class="search-container">
                    <input type="text" id="searchInput" placeholder="Search courses, teachers, or course ID..." />
                </div>
                
                <div class="filter-container">
                    <select id="termFilter">
                        <option value="">All Terms</option>
                    </select>
                    
                    <select id="typeFilter">
                        <option value="">All Types</option>
                    </select>
                    
                    <select id="teacherFilter">
                        <option value="">All Teachers</option>
                    </select>
                </div>
                
                <button id="clearFilters">Clear Filters</button>
            </div>
            
            <div id="courseCount" class="course-count"></div>
            
            <div id="courseList" class="course-list"></div>
            
            <div id="selectedCourseInfo" class="selected-course-info" style="display: none;">
                <h2>Selected Course</h2>
                <div id="selectedCourseDetails"></div>
                <button id="confirmSelection">Confirm Selection</button>
                <button id="clearSelection">Clear Selection</button>
            </div>
            
            <div id="errorMessage" class="error-message" style="display: none;"></div>
        </div>
    `;
    
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const termFilter = document.getElementById('termFilter');
    const typeFilter = document.getElementById('typeFilter');
    const teacherFilter = document.getElementById('teacherFilter');
    const clearFilters = document.getElementById('clearFilters');
    const confirmSelection = document.getElementById('confirmSelection');
    const clearSelection = document.getElementById('clearSelection');
    
    searchInput.addEventListener('input', debounce(filterCourses, 300));
    termFilter.addEventListener('change', filterCourses);
    typeFilter.addEventListener('change', filterCourses);
    teacherFilter.addEventListener('change', filterCourses);
    
    clearFilters.addEventListener('click', () => {
        searchInput.value = '';
        termFilter.value = '';
        typeFilter.value = '';
        teacherFilter.value = '';
        filterCourses();
    });
    
    confirmSelection.addEventListener('click', () => {
        if (selectedCourse) {
            // Call FileMaker script with course data
            selectedCourse.mode = 'selected'; // Add mode to indicate selection
            callFileMakerScript('Enroll Student in Course', JSON.stringify(selectedCourse));
            console.log('Course confirmed:', selectedCourse);
            showSuccess('Course selection confirmed and sent to FileMaker!');
        }
    });
    
    clearSelection.addEventListener('click', () => {
        selectedCourse = null;
        document.getElementById('selectedCourseInfo').style.display = 'none';
        // Remove selection styling from all course items
        document.querySelectorAll('.course-item').forEach(item => {
            item.classList.remove('selected');
        });
    });
}

// Render the course list
function renderCourseList(filteredCourses = null) {
    const courseList = document.getElementById('courseList');
    const courses = filteredCourses || coursesData;
    
    updateCourseCount(courses.length);
    
    // Only populate filters if this is the initial render (no filtered courses)
    if (filteredCourses === null) {
        populateFilters();
    }
    
    if (courses.length === 0) {
        courseList.innerHTML = '<div class="no-courses">No courses found</div>';
        return;
    }
    
    courseList.innerHTML = courses.map(course => `
        <div class="course-item" data-course-id="${String(course.courseid || '')}" onclick="selectCourse('${String(course.courseid || '')}')">
            <div class="course-header">
                <h3 class="course-title">${escapeHtml(course.title || 'Untitled Course')}</h3>
                <span class="course-term">${escapeHtml(course.term || 'No Term')}</span>
            </div>
            
            <div class="course-details">
                <div class="course-info">
                    <span class="course-teacher">
                        ${escapeHtml(course.teacherFirst && course.teacherLast ? 
                          `${course.teacherFirst} ${course.teacherLast}` : 
                          course.teacherEmail || 'No Teacher Assigned')}
                    </span>
                    <span class="course-type">${escapeHtml(course.type || 'No Type')}</span>
                    <span class="course-id">ID: ${escapeHtml(String(course.courseid || 'No ID'))}</span>
                </div>
                
                <div class="course-dates">
                    <span class="start-date">Start: ${formatDate(course.startdate)}</span>
                    <span class="end-date">End: ${formatDate(course.enddate)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Select a course
window.selectCourse = function(courseId) {
    const course = coursesData.find(c => String(c.courseid || '') === String(courseId));
    if (!course) return;
    
    selectedCourse = course;
    
    // Update visual selection
    document.querySelectorAll('.course-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-course-id="${String(courseId)}"]`).classList.add('selected');
    
    // Show selected course info
    const selectedInfo = document.getElementById('selectedCourseInfo');
    const selectedDetails = document.getElementById('selectedCourseDetails');
    
    selectedDetails.innerHTML = `
        <div class="selected-details">
            <h3>${escapeHtml(course.title)}</h3>
            <p><strong>Teacher:</strong> ${escapeHtml(course.teacherFirst && course.teacherLast ? 
              `${course.teacherFirst} ${course.teacherLast}` : 
              course.teacherEmail || 'No Teacher Assigned')}</p>
            <p><strong>Term:</strong> ${escapeHtml(course.term || 'No Term')}</p>
            <p><strong>Type:</strong> ${escapeHtml(course.type || 'No Type')}</p>
            <p><strong>Start Date:</strong> ${formatDate(course.startdate)}</p>
            <p><strong>End Date:</strong> ${formatDate(course.enddate)}</p>
            <p><strong>Course ID:</strong> ${escapeHtml(String(course.courseid || 'No ID'))}</p>
        </div>
    `;
    
    selectedInfo.style.display = 'block';
    selectedInfo.scrollIntoView({ behavior: 'smooth' });
};

// Filter courses
function filterCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const termFilter = document.getElementById('termFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const teacherFilter = document.getElementById('teacherFilter').value;
    
    const filtered = coursesData.filter((course) => {
        const matchesSearch = !searchTerm || 
            (course.title && String(course.title).toLowerCase().includes(searchTerm)) ||
            (course.teacherFirst && String(course.teacherFirst).toLowerCase().includes(searchTerm)) ||
            (course.teacherLast && String(course.teacherLast).toLowerCase().includes(searchTerm)) ||
            (course.teacherEmail && String(course.teacherEmail).toLowerCase().includes(searchTerm)) ||
            (course.courseid && String(course.courseid).toLowerCase().includes(searchTerm));
            
        // Simplified comparisons - just direct string equality
        const matchesTerm = !termFilter || course.term === termFilter;
        const matchesType = !typeFilter || course.type === typeFilter;
        const courseTeacher = course.teacherFirst && course.teacherLast ? 
            `${course.teacherFirst} ${course.teacherLast}` : '';
        const matchesTeacher = !teacherFilter || courseTeacher === teacherFilter;
        
        return matchesSearch && matchesTerm && matchesType && matchesTeacher;
    });
    
    renderCourseList(filtered);
}

// Populate filter dropdowns
function populateFilters() {
    const termFilter = document.getElementById('termFilter');
    const typeFilter = document.getElementById('typeFilter');
    const teacherFilter = document.getElementById('teacherFilter');
    
    // Save current values
    const currentTermValue = termFilter.value;
    const currentTypeValue = typeFilter.value;
    const currentTeacherValue = teacherFilter.value;
    
    // Get unique values - no trimming to keep original values
    const terms = [...new Set(coursesData.map(c => c.term).filter(Boolean))].sort();
    const types = [...new Set(coursesData.map(c => c.type).filter(Boolean))].sort();
    const teachers = [...new Set(coursesData
        .filter(c => c.teacherFirst && c.teacherLast)
        .map(c => `${c.teacherFirst} ${c.teacherLast}`))].sort();
    
    // Populate term filter
    termFilter.innerHTML = '<option value="">All Terms</option>' + 
        terms.map(term => `<option value="${escapeHtml(term)}">${escapeHtml(term)}</option>`).join('');
    if (currentTermValue && terms.includes(currentTermValue)) {
        termFilter.value = currentTermValue;
    }
    
    // Populate type filter
    typeFilter.innerHTML = '<option value="">All Types</option>' + 
        types.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join('');
    if (currentTypeValue && types.includes(currentTypeValue)) {
        typeFilter.value = currentTypeValue;
    }
    
    // Populate teacher filter
    teacherFilter.innerHTML = '<option value="">All Teachers</option>' + 
        teachers.map(teacher => `<option value="${escapeHtml(teacher)}">${escapeHtml(teacher)}</option>`).join('');
    if (currentTeacherValue && teachers.includes(currentTeacherValue)) {
        teacherFilter.value = currentTeacherValue;
    }
}

// Update course count
function updateCourseCount(count) {
    const courseCount = document.getElementById('courseCount');
    courseCount.innerHTML = `Showing ${count} course${count !== 1 ? 's' : ''}`;
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.className = 'success-message';
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorDiv.className = 'error-message';
    }, 3000);
}

// Function to call FileMaker script
function callFileMakerScript(scriptName, parameter) {
    try {
        // Method 1: Try using FileMaker.PerformScript (FileMaker 19+)
        if (typeof FileMaker !== 'undefined' && FileMaker.PerformScript) {
            FileMaker.PerformScript(scriptName, parameter);
            return;
        }
        
        // Method 2: Try using window.FileMaker (alternative approach)
        if (typeof window.FileMaker !== 'undefined' && window.FileMaker.PerformScript) {
            window.FileMaker.PerformScript(scriptName, parameter);
            return;
        }
        
        // Method 3: Try using fmp:// URL scheme (older FileMaker versions)
        const encodedParam = encodeURIComponent(parameter);
        const fmpUrl = `fmp://$/${scriptName}?script=${scriptName}&param=${encodedParam}`;
        window.location.href = fmpUrl;
        
    } catch (error) {
        console.error('Error calling FileMaker script:', error);
        showError('Failed to communicate with FileMaker. Please ensure the webviewer is properly configured.');
    }
}

// Initialize the interface when the page loads
document.addEventListener('DOMContentLoaded', createInterface);