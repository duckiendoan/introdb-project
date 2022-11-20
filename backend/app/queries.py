ALL_SECTIONS = """
SELECT courseName,
       numberOfCredits                                                               AS credits,
       CONCAT(s.courseID, ' ', sectionID)                                            AS classCode,
       IF(GroupNo = 0, 'CL', GroupNo)                                                AS 'group',
       EXISTS(SELECT * FROM section s1 WHERE s1.courseID = s.courseID AND s1.GroupNo = 1) AS hasGroup,
       (SELECT COUNT(*)
        FROM student_enrollment se
        WHERE se.SectionID = s.SectionID
          AND se.AcademicYear = s.AcademicYear
          AND se.courseID = s.courseID
          AND se.SemesterCode = s.SemesterCode
          AND se.GroupNo = s.GroupNo)                                                AS currentCapacity,
       MaxCapacity                                                                   AS maxCapacity,
       Instructor                                                                    AS instructor,
       CONCAT('T', DayOfWeek, '-', '(', StartTime, '-', EndTime, ')', '-', Location) AS time
FROM course c
         JOIN SECTION s ON c.courseID = s.courseID
"""

ALL_SECTIONS_IN_MAJOR = """
SELECT courseName,
       numberOfCredits                                                               AS credits,
       CONCAT(s.courseID, ' ', sectionID)                                            AS classCode,
       IF(GroupNo = 0, 'CL', GroupNo)                                                AS "group",
       EXISTS(SELECT * FROM section s1 WHERE s1.courseID = s.courseID AND s1.GroupNo = 1) AS hasGroup,
       (SELECT COUNT(*)
        FROM student_enrollment se
        WHERE se.SectionID = s.SectionID
          AND se.AcademicYear = s.AcademicYear
          AND se.courseID = s.courseID
          AND se.SemesterCode = s.SemesterCode
          AND se.GroupNo = s.GroupNo)                                                AS currentCapacity,
       MaxCapacity                                                                   AS maxCapacity,
       Instructor                                                                    AS instructor,
       CONCAT('T', DayOfWeek, '-', '(', StartTime, '-', EndTime, ')', '-', Location) AS time
FROM (SELECT course.courseID, courseName, numberOfCredits
      FROM course
               JOIN major_course mc on course.courseID = mc.CourseID
      WHERE MajorID = %s) c
         JOIN SECTION s ON c.courseID = s.courseID
"""

STUDENT_INFO = """
    SELECT studentID, studentName, m.majorID, m.majorName
    FROM student
            JOIN major m on student.majorID = m.majorID
    WHERE email = %s
"""

ADMIN_INFO = """
SELECT adminID, adminName
    FROM admin
    WHERE email = %s
"""

ACCOUNT_INFO = """
SELECT email, IsAdmin
FROM account
WHERE (username = %s OR email = %s) AND password = %s
"""

ENROLLED_SECTIONS = """
SELECT DISTINCT c.courseName,
       c.numberOfCredits                                                                     AS credits,
       CONCAT(s.courseID, ' ', s.sectionID)                                                  AS classCode,
       IF(se.GroupNo = 0, 'CL', se.GroupNo)                                                  AS "group",
       s.Instructor                                                                          AS instructor,
       CONCAT('T', s.DayOfWeek, '-', '(', s.StartTime, '-', s.EndTime, ')', '-', s.Location) AS time
FROM student_enrollment se
         JOIN section
         JOIN section s on se.SemesterCode = s.SemesterCode and se.SectionID = s.SectionID and
                           se.AcademicYear = s.AcademicYear and se.GroupNo = s.GroupNo and se.courseID = s.courseID
         JOIN course c on se.courseID = c.courseID
WHERE se.studentID = %s;
"""

ENROLL_SECTIONS = """
INSERT INTO student_enrollment VALUES (%s, %s, %s, %s, %s, %s)
"""

UNENROLL_SECTIONS = """
DELETE
FROM student_enrollment
WHERE studentID = %s
  AND SemesterCode = %s
  AND SectionID = %s
  AND AcademicYear = %s
  AND GroupNo = %s
  AND courseID = %s;
"""