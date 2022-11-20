-- ACCOUNT(Email, Username, Password, IsAdmin)
-- ADMIN(AdminID, AdminName, Email)
-- STUDENT(StudentName, StudentID, Email, MajorID)
-- MAJOR(MajorID, MajorName)
-- COURSE(CourseID, NumberOfCredits, CourseName)
-- SECTION(SemesterCode, SectionID, AcademicYear, GroupNo, CourseId, Instructor, MaxCa-
-- pacity, Location, DayOfWeek, StartTime, EndTime)
-- STUDENT_ENROLLMENT(StudentID, SectionID)
-- MAJOR_COURSE(MajorID, CourseID)
-- PREREQUISITE(PreqID, CourseID)
CREATE DATABASE IF NOT EXISTS course_reg;
USE course_reg;

CREATE TABLE account(
	email VARCHAR(255) NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password CHAR(64) NOT NULL,
    IsAdmin BOOLEAN NOT NULL
);

CREATE TABLE admin(
	adminID INT NOT NULL PRIMARY KEY,
    adminName VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL
);

CREATE TABLE student(
	studentID CHAR(8) NOT NULL PRIMARY KEY,
    studentName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    majorID VARCHAR(4) NOT NULL
);

CREATE TABLE major(
	majorID VARCHAR(4) NOT NULL PRIMARY KEY,
    majorName VARCHAR(100) NOT NULL
);

CREATE TABLE course(
	courseID VARCHAR(8) NOT NULL PRIMARY KEY, 
	numberOfCredits INT NOT NULL, 
	courseName VARCHAR(100) NOT NULL
);

CREATE TABLE section(
	SemesterCode INT NOT NULL,
    SectionID INT NOT NULL, 
    AcademicYear CHAR(9) NOT NULL, 
    GroupNo INT NOT NULL, 
    courseID VARCHAR(8) NOT NULL, 
    Instructor VARCHAR(100) NOT NULL, 
    MaxCapacity INT NOT NULL, 
    Location VARCHAR(10) NOT NULL, 
    DayOfWeek INT NOT NULL, 
    StartTime INT NOT NULL, 
    EndTime INT NOT NULL,
    PRIMARY KEY(SemesterCode, SectionID, AcademicYear, GroupNo, courseID)
);

CREATE TABLE student_enrollment(
	studentID CHAR(8) NOT NULL,
    SemesterCode INT NOT NULL,
    SectionID INT NOT NULL, 
    AcademicYear CHAR(9) NOT NULL, 
    GroupNo INT NOT NULL, 
    courseID VARCHAR(8) NOT NULL, 
    PRIMARY KEY(studentID, SemesterCode, SectionID, AcademicYear, GroupNo, courseID)
);

CREATE TABLE MAJOR_COURSE(
	MajorID VARCHAR(4) NOT NULL, 
	CourseID VARCHAR(8) NOT NULL,
    PRIMARY KEY(MajorID, CourseID)
);

CREATE TABLE PREREQUISITE(
	PreqID VARCHAR(8) NOT NULL,
	CourseID VARCHAR(8) NOT NULL,
    PRIMARY KEY(PreqID, CourseID)
);

ALTER TABLE student
ADD CONSTRAINT fk_stu_acc
FOREIGN KEY (Email) REFERENCES account(email) ON UPDATE CASCADE ON DELETE RESTRICT, 
ADD CONSTRAINT fk_stu_major
FOREIGN KEY(MajorID) references major(majorID) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE admin
ADD CONSTRAINT fk_admin_acc
FOREIGN KEY (Email) REFERENCES account(email) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE section
ADD CONSTRAINT fk_sec_course
FOREIGN KEY (CourseID) REFERENCES course(CourseID) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE student_enrollment
ADD CONSTRAINT fk_se_stu
FOREIGN KEY (studentID) REFERENCES student(studentID) ON UPDATE CASCADE ON DELETE RESTRICT,
ADD CONSTRAINT fk_se_sec
FOREIGN KEY(SemesterCode, SectionID, AcademicYear, GroupNo, courseID) REFERENCES section(SemesterCode, SectionID, AcademicYear, GroupNo, courseID) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE MAJOR_COURSE
ADD CONSTRAINT fk_mc_majorid
FOREIGN KEY (MajorID) REFERENCES major(MajorID) ON UPDATE CASCADE ON DELETE RESTRICT,
ADD CONSTRAINT fk_mc_courseid
FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE PREREQUISITE
ADD CONSTRAINT fk_preq_id
FOREIGN KEY (PreqID) REFERENCES Course(CourseID) ON UPDATE CASCADE ON DELETE RESTRICT,
ADD CONSTRAINT fk_preq_course
FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON UPDATE CASCADE ON DELETE RESTRICT;
