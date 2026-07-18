/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/student/controller.js
 * Purpose: Handles fetching student-specific profile, activities, analytics, and deadlines.
 */

const db = require('../db');

// Helper to format date identical to PHP's 'd M Y, h:i A'
function formatDate(dateInput) {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;

    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Hour '0' should be '12'
    const formattedHour = String(hours).padStart(2, '0');

    return `${day} ${month} ${year}, ${formattedHour}:${minutes} ${ampm}`;
}

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch Student Profile details
        const profileSql = `
            SELECT sp.id AS student_profile_id, sp.name, sp.usn AS prn, sp.section, sp.admission_year, 
                   dept.name AS department, sem.term AS semester
            FROM student_profiles sp
            JOIN departments dept ON sp.department_id = dept.id
            JOIN semesters sem ON sp.current_semester_id = sem.id
            WHERE sp.user_id = ? AND sp.is_deleted = 0
        `;
        const profileRows = await db.query(profileSql, [userId]);

        if (profileRows.length === 0) {
            return res.status(404).json({ success: false, error: 'Student profile not found.' });
        }

        const student = profileRows[0];
        const studentId = student.student_profile_id;
        // Default batch calculation
        student.batch = 'Batch ' + (student.section === 'A' ? 'A1' : 'B1');

        // 2. Fetch all published activities with submission & evaluation statuses
        const activitiesSql = `
            SELECT a.id AS activity_id, a.title, a.description, a.max_marks, a.weightage, a.deadline,
                   sub.name AS subject_name, sub.code AS subject_code,
                   t.name AS activity_type_name, t.code AS activity_type_code,
                   s.id AS submission_id, s.submission_status, s.submitted_at,
                   e.marks_awarded, e.general_feedback
            FROM student_course_enrollments sce
            JOIN subject_allocations sa ON sce.subject_allocation_id = sa.id
            JOIN subjects sub ON sa.subject_id = sub.id
            JOIN activities a ON a.subject_allocation_id = sa.id AND a.is_deleted = 0 AND a.status = 'published'
            JOIN activity_types t ON a.activity_type_id = t.id
            LEFT JOIN submissions s ON s.activity_id = a.id AND s.student_id = sce.student_id AND s.is_deleted = 0
            LEFT JOIN evaluations e ON e.submission_id = s.id AND e.is_deleted = 0
            WHERE sce.student_id = ?
            ORDER BY a.deadline ASC
        `;
        const rawActivities = await db.query(activitiesSql, [studentId]);

        const activities = [];
        let totalMarksAwarded = 0;
        let totalPossibleMarks = 0;
        let submittedCount = 0;
        let overdueCount = 0;
        let pendingCount = 0;

        const subjectBreakdown = {};
        const currentTime = Date.now();

        for (const act of rawActivities) {
            const deadlineTime = new Date(act.deadline).getTime();
            const isSubmitted = (act.submission_status === 'submitted');

            // Calculate status
            let status = 'Pending';
            if (isSubmitted) {
                status = 'Submitted';
                submittedCount++;
            } else if (currentTime > deadlineTime) {
                status = 'Overdue';
                overdueCount++;
            } else {
                status = 'Pending';
                pendingCount++;
            }

            // Add marks to summary if evaluated
            let marksHtml = 'N/A';
            if (act.marks_awarded !== null) {
                totalMarksAwarded += parseFloat(act.marks_awarded);
                totalPossibleMarks += parseFloat(act.max_marks);
                marksHtml = parseFloat(act.marks_awarded) + ' / ' + parseFloat(act.max_marks);
            }

            // Infer unit based on title or defaults
            let unit = 'Unit 1';
            const titleUpper = act.title.toUpperCase();
            if (titleUpper.includes('RELATIONAL') || titleUpper.includes('CALCULUS')) {
                unit = 'Unit 2';
            } else if (titleUpper.includes('TREE') || titleUpper.includes('GRAPH')) {
                unit = 'Unit 3';
            }

            const activityItem = {
                id: act.activity_id,
                title: act.title,
                subject: `${act.subject_name} (${act.subject_code})`,
                subject_code: act.subject_code,
                type: act.activity_type_name,
                type_code: act.activity_type_code,
                unit: unit,
                deadline: formatDate(act.deadline),
                raw_deadline: act.deadline,
                submission_status: status,
                is_submitted: isSubmitted,
                submitted_at: act.submitted_at ? formatDate(act.submitted_at) : null,
                marks: marksHtml,
                marks_obtained: act.marks_awarded,
                max_marks: act.max_marks,
                feedback: act.general_feedback || 'No feedback provided yet.'
            };

            activities.push(activityItem);

            // Populate Subject Breakdown analytics
            const subCode = act.subject_code;
            if (!subjectBreakdown[subCode]) {
                subjectBreakdown[subCode] = {
                    subject_name: act.subject_name,
                    total_activities: 0,
                    completed: 0,
                    marks_obtained: 0,
                    max_marks: 0
                };
            }
            subjectBreakdown[subCode].total_activities++;
            if (isSubmitted) {
                subjectBreakdown[subCode].completed++;
            }
            if (act.marks_awarded !== null) {
                subjectBreakdown[subCode].marks_obtained += parseFloat(act.marks_awarded);
                subjectBreakdown[subCode].max_marks += parseFloat(act.max_marks);
            }
        }

        // 3. Compute Analytics
        const totalActivities = activities.length;
        const completionRate = totalActivities > 0 ? Math.round((submittedCount / totalActivities) * 100) : 0;
        const overallPercentage = totalPossibleMarks > 0 ? Math.round((totalMarksAwarded / totalPossibleMarks) * 100 * 10) / 10 : 0;

        // Convert subject breakdown to indexed list
        const subjectWiseAnalytics = [];
        for (const [code, data] of Object.entries(subjectBreakdown)) {
            const subPercent = data.max_marks > 0 ? Math.round((data.marks_obtained / data.max_marks) * 100 * 10) / 10 : 0;
            subjectWiseAnalytics.push({
                subject_code: code,
                subject_name: data.subject_name,
                activities_count: data.total_activities,
                completion_rate: Math.round((data.completed / data.total_activities) * 100),
                percentage: subPercent,
                marks_summary: data.max_marks > 0 ? `${parseFloat(data.marks_obtained)} / ${parseFloat(data.max_marks)}` : 'N/A'
            });
        }

        // 4. Upcoming Deadlines
        const upcomingDeadlines = [];
        for (const act of activities) {
            if (act.submission_status === 'Pending') {
                upcomingDeadlines.push({
                    title: act.title,
                    subject: act.subject,
                    deadline: act.deadline
                });
            }
        }

        // 5. Generate Real Dynamic Notifications
        let notifications = [];
        const notifSql = 'SELECT * FROM notifications WHERE recipient_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 5';
        const dbNotifications = await db.query(notifSql, [userId]);

        for (const n of dbNotifications) {
            notifications.push({
                id: n.id,
                message: n.message || n.title,
                type: n.notification_type || 'info',
                time: formatDate(n.created_at)
            });
        }

        // If notifications are empty, seed custom ones dynamically (fallback)
        if (notifications.length === 0) {
            for (const act of activities) {
                if (act.marks_obtained !== null) {
                    notifications.push({
                        id: `notif-eval-${act.id}`,
                        message: `Result Published: Marks awarded for ${act.title}.`,
                        type: 'result',
                        time: act.submitted_at || 'Recently'
                    });
                } else if (act.is_submitted) {
                    notifications.push({
                        id: `notif-sub-${act.id}`,
                        message: `Submission Confirmed: ${act.title} PDF received.`,
                        type: 'submission',
                        time: act.submitted_at
                    });
                }
            }

            // Add new pending activity notification
            for (const act of activities) {
                if (act.submission_status === 'Pending') {
                    notifications.push({
                        id: `notif-new-${act.id}`,
                        message: `New Activity Assigned: ${act.title}.`,
                        type: 'new_activity',
                        time: '1 day ago'
                    });
                }
            }
        }

        // Performance Trend timeline
        const performanceTrend = [];
        for (const act of activities) {
            if (act.marks_obtained !== null) {
                performanceTrend.push({
                    label: act.title,
                    score: Math.round((parseFloat(act.marks_obtained) / parseFloat(act.max_marks)) * 100)
                });
            }
        }

        return res.status(200).json({
            success: true,
            student,
            summary: {
                total_activities: totalActivities,
                completed: submittedCount,
                pending: pendingCount,
                overdue: overdueCount,
                completion_rate: completionRate,
                total_marks: totalPossibleMarks > 0 ? `${totalMarksAwarded} / ${totalPossibleMarks}` : '0 / 0',
                overall_percentage: overallPercentage
            },
            activities,
            subject_analytics: subjectWiseAnalytics,
            upcoming_deadlines: upcomingDeadlines.slice(0, 3),
            notifications: notifications.slice(0, 5),
            performance_trend: performanceTrend
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard content.'
        });
    }
};
