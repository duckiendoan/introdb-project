ALL_SECTIONS = """
SELECT courseName,
       numberOfCredits                                                               AS credits,
       CONCAT(s.courseID, ' ', sectionID)                                            AS classCode,
       IF(GroupNo = 0, 'CL', GroupNo)                                                AS 'group',

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