# MYDO - YISMS

Youth Information and Scholarship Management System (YISMS)

## BACKGROUND (ABOUT)

The Youth Information and Scholarship Management System is a web-based platform designed to assist the Municipal Youth Development Office (MYDO) in efficiently managing youth records, scholarship programs, and youth-related activities. The system centralizes information in a single database, streamlines application and evaluation processes, and provides administrators with tools for monitoring, reporting, and decision-making. By digitizing these processes, the platform improves service delivery, enhances transparency, and promotes better engagement with the youth sector.


## GENERAL OBJECTIVES

To develop a comprehensive web-based Youth Information, Scholarship, and Program Management System that enables the Municipal Youth Development Office (MYDO) to efficiently manage youth records, scholarship programs, cash incentives, volunteer activities, SK monitoring, and youth development initiatives through a centralized, secure, and integrated platform.

## SPECIFIC OBJECTIVES

1. To establish a centralized youth profiling system that maintains accurate and up-to-date demographic, educational, and socio-economic information of registered youth within the municipality.
2. To streamline scholarship administration by digitizing the application, document submission, eligibility verification, evaluation, monitoring, and renewal processes.
3. To improve the management of cash incentive programs by recording financial assistance releases, monitoring beneficiary status, and maintaining accurate disbursement records.
4. To facilitate volunteer management by tracking volunteer registrations, participation, attendance, and accumulated service hours for youth-led community activities.
5. To support the planning and monitoring of youth programs and activities through event scheduling, participant management, attendance monitoring, and program status tracking.
6. To strengthen Sangguniang Kabataan (SK) monitoring by maintaining records of SK officials, documenting activities, tracking KK Assembly compliance, and managing submitted reports and supporting documents.
7. To provide a centralized document management repository for securely storing, organizing, retrieving, and archiving digital records associated with youth members, scholars, programs, and SK activities.
8. To automate attendance recording for seminars, trainings, and community activities using manual or QR code-based attendance mechanisms to improve monitoring accuracy.
9. To provide comprehensive reporting and analytical tools that support operational monitoring, program evaluation, and evidence-based planning through dashboards and configurable reports.
10. To ensure data security, accountability, and controlled system access through role-based authentication, activity logging, and secure management of sensitive youth information.
11. To enhance operational efficiency by reducing manual processes, minimizing redundant data entry, and improving the accuracy, accessibility, and timeliness of information across all MYDO services.


## MAIN FEATURES

1. Youth Profiling
Register youth members
Store personal information
Record barangay, age, gender, school, course, and status
Search and update youth profiles (AY)

2. Scholarship Management
Scholarship application
Requirements checklist
Upload PSA, COE, COG, school ID, and other documents
Check eligibility
Monitor active, pending, rejected, and graduated scholars (under grad)

3. Cash Incentive Management
Record cash assistance release
Track amount received
Monitor release date and status
Generate cash incentive reports (fix amount)


4. Volunteer Tracking
Register volunteers (Youth)
Track volunteer activities
Record attendance and service hours
Generate volunteer participation reports


5. Program and Activity Management
Create youth programs and events
Schedule seminars, trainings, youth camp, tree planting, and Linggo ng Kabataan
Record participants
Monitor program status

6. SK Monitoring
Record SK officials per barangay
Monitor KK Assembly (How)
Track SK activities and reports (scan and upload?)
Store submitted SK documents (need storage)

6. Document Management
Upload and store requirements
View, update, download, and archive (5 years after) files
Organize documents per youth, scholar, program, or SK record

6. Attendance Management
Record attendance for seminars and activities
Manual or QR-based attendance
Time-in and time-out tracking (mobile app)

9. Reports and Analytics
Generate youth profile reports (form)
Scholarship reports (form)
Volunteer reports (form)
Program reports (form)
SK monitoring reports (form)
Dashboard with charts and statistics

10. User Management and Security
Admin and staff accounts (Admin, Staff, Scholar)
Login system
Role-based access
Secure data storage
Activity logs for monitoring system use


## USE CASE

### Actors
    Admin
    MYDO Staff
    Scholar / Youth Member
    Volunteer
    SK Official
    Evaluator / Approver

### Posiible Use Cases

#### 1. Youth Profiling
    Register youth profile
    Update youth information
    Search youth records
    View youth profile details
    Archive inactive youth records

### 2. Scholarship Management
    Apply for scholarship
    Upload scholarship requirements
    Check application eligibility
    Review application
    Approve or reject application
    Monitor scholar status
    Update scholar academic record
    Mark scholar as graduated
    
### 3. Cash Incentive Management
    Record cash incentive release
    Assign beneficiary
    Track amount received
    Update release status
    Generate cash incentive report

### 4. Volunteer Tracking
    Register as volunteer
    Assign volunteer to activity
    Record volunteer attendance
    Track service hours
    Generate volunteer participation report

### 5. Program and Activity Management
    Create youth program or event
    Schedule activity
    Register participants
    Record attendance
    Update program status
    Generate program report

### 6. SK Monitoring
    Register SK officials per barangay
    Upload SK documents and reports
    Record SK activities
    Monitor KK Assembly compliance
    View SK submission status

### 7. Documentt Management
    Upload documents
    View documents
    Download documents
    Update document status
    Archive documents after retention period
    Organize files by youth, scholar, program, or SK record


### Attendance Management
    Record manual attendance
    Generate QR attendance
    Scan QR code for time-in/time-out
    View attendance logs
    Generate attendance reports

### Reports and Analytics
    Generate youth profile report
    Generate scholarship report
    Generate volunteer report
    Generate program report
    Generate SK monitoring report
    View dashboard statistics

### User Management and Security
    Login
    Manage users
    Assign roles
    Manage permissions
    View activity logs
    Secure user access


## POSSIBLE CORE DB TABLES
    users
    roles
    youth_profiles
    barangays
    scholarship_programs
    scholarship_applications
    scholarship_requirements
    scholarship_documents
    scholar_statuses
    cash_incentives
    cash_incentive_releases
    volunteers
    volunteer_activities
    volunteer_attendance
    programs
    program_participants
    sk_officials
    sk_activities
    sk_documents
    documents
    attendance_logs
    activity_logs


## SOFTWARE SPECS

### SERVER SIDE
Component | Specification
--- | ----
Operating System | Ubuntu Server 22.04 LTS or later / Windows Server
Web Server          |   Apache or Nginx
Backend Framework   |   Laravel / PHP
Database            |   MySQL or MariaDB
API	                |   REST API
Authentication	    |   Role-based login system
File Storage	    |   Local server storage or cloud storage
Security	        |   SSL certificate, password hashing, access control, activity logs

### CLIENT SIDE
Component | Specification
--- | ---
Browser | Google Chrome, Microsoft Edge, Mozilla Firefox
Frontend | React / Inertia.js
UI Framework | Tailwind CSS / Ant Design
Device Support | Desktop, laptop, tablet, mobile browser

### DEVELOPMENT TOOLS
Component | Specification
--- | ---
Code Editor | Visual Studio Code
Version Control | Git / GitHub
Package Manager | Composer, npm
Testing Tool | Browser DevTools, Postman


## HARDWARE SPECS

### MINIMUM SERVER REQUIREMENTS
Component | Specification
--- | ---
Component | Specification
Processor | Dual-core processor
RAM | 4 GB
Storage | 100 GB HDD/SSD
Network | Stable internet connection
Backup | External drive or cloud backup

### RECOMMENDED SERVER REQUIREMENTS
Component | Specification
--- | ---
Component | Specification
Processor | Quad-core processor or higher
RAM | 8 GB to 16 GB
Storage | 256 GB SSD or higher
Network | Stable broadband connection
Backup | Automated cloud or offsite backup

### CLIENT DEVICE REQUIREMENTS
Component | Specification
--- | ---
Device | Desktop, laptop, tablet, or smartphone
Processor | Dual-core or higher
RAM | 2 GB minimum, 4 GB recommended
Browser | Latest Chrome, Edge, or Firefox
Camera | Required for QR attendance scanning
Internet | Required for online access
