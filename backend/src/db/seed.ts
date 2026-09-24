import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

async function seed() {
  console.log('Seeding EduHelp database with realistic enterprise data...');

  try {
    // Clean existing data
    await pool.query('TRUNCATE TABLE notifications, attachments, ticket_history, ticket_comments, tickets, categories, users CASCADE;');

    // 1. Seed Categories
    console.log('Seeding categories...');
    const categoryData = [
      { name: 'Fees & Accounts', code: 'FEES', description: 'Tuition fees, fee receipts, installment requests, scholarship adjustments', sla: 48 },
      { name: 'Attendance & Leave', code: 'ATTENDANCE', description: 'Attendance discrepancies, medical leave approvals, on-duty approvals', sla: 24 },
      { name: 'ID Card & Access', code: 'ID_CARD', description: 'Lost ID card reissue, RFID access errors, digital badge updates', sla: 24 },
      { name: 'Official Documents', code: 'DOCUMENTS', description: 'Bonafide letters, medium of instruction letters, fee estimate letters', sla: 48 },
      { name: 'Certificates & Transcripts', code: 'CERTIFICATES', description: 'Grade sheets, provisional certificates, character certificates', sla: 72 },
      { name: 'Examination & Grades', code: 'EXAMINATION', description: 'Re-evaluation, hall tickets, exam schedule conflicts, backlog queries', sla: 24 },
      { name: 'Hostel & Mess', code: 'HOSTEL', description: 'Room allocation, maintenance repairs, mess rebate, roommate issues', sla: 24 },
      { name: 'Campus Transport', code: 'TRANSPORT', description: 'Bus pass renewal, route modifications, transit schedules', sla: 48 },
      { name: 'Technical Support', code: 'TECH_SUPPORT', description: 'Portal login issues, LMS access, campus Wi-Fi credentials', sla: 12 },
      { name: 'Administrative & Other', code: 'OTHER', description: 'General inquiries, sports department requests, extracurricular claims', sla: 72 },
    ];

    const categoryMap = new Map<string, number>();
    for (const cat of categoryData) {
      const res = await pool.query(
        `INSERT INTO categories (name, code, description, default_sla_hours, is_active)
         VALUES ($1, $2, $3, $4, TRUE) RETURNING id, code`,
        [cat.name, cat.code, cat.description, cat.sla]
      );
      categoryMap.set(res.rows[0].code, res.rows[0].id);
    }

    // 2. Seed Users
    console.log('Seeding users (1 Manager, 4 Support Staff, 10 Students)...');
    const defaultPassword = await bcrypt.hash('password123', 10);

    // Manager
    const managerRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department, phone, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, role`,
      [
        'Dr. Rajeshwar Rao',
        'manager@eduhelp.demo',
        defaultPassword,
        'MANAGER',
        'Student Affairs & Administration',
        '+91 98765 43210',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      ]
    );
    const managerId = managerRes.rows[0].id;

    // 4 Support Staff
    const staffMembers = [
      { name: 'Priya Sharma', email: 'staff@eduhelp.demo', dept: 'Registrar & Examination Services', phone: '+91 98111 22334' },
      { name: 'Ananya Verma', email: 'ananya.staff@eduhelp.demo', dept: 'Student Accounts & Finance', phone: '+91 98222 33445' },
      { name: 'Vikram Joshi', email: 'vikram.staff@eduhelp.demo', dept: 'Hostel & Facilities Administration', phone: '+91 98333 44556' },
      { name: 'Kavita Nair', email: 'kavita.staff@eduhelp.demo', dept: 'IT & Digital Infrastructure', phone: '+91 98444 55667' },
    ];

    const staffIds: string[] = [];
    for (const staff of staffMembers) {
      const res = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, department, phone, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [staff.name, staff.email, defaultPassword, 'STAFF', staff.dept, staff.phone, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150']
      );
      staffIds.push(res.rows[0].id);
    }

    // 10 Students
    const studentMembers = [
      { name: 'Aarav Patel', email: 'student@eduhelp.demo', dept: 'Computer Science & Engineering', phone: '+91 99000 11111' },
      { name: 'Sneha Kulkarni', email: 'sneha.student@eduhelp.demo', dept: 'Electronics & Communication', phone: '+91 99000 22222' },
      { name: 'Rohan Mehra', email: 'rohan.student@eduhelp.demo', dept: 'Mechanical Engineering', phone: '+91 99000 33333' },
      { name: 'Diya Sengupta', email: 'diya.student@eduhelp.demo', dept: 'Information Science', phone: '+91 99000 44444' },
      { name: 'Karthik Raja', email: 'karthik.student@eduhelp.demo', dept: 'Civil Engineering', phone: '+91 99000 55555' },
      { name: 'Meera Nambiar', email: 'meera.student@eduhelp.demo', dept: 'Biotechnology', phone: '+91 99000 66666' },
      { name: 'Aditya Deshmukh', email: 'aditya.student@eduhelp.demo', dept: 'Artificial Intelligence & Data Science', phone: '+91 99000 77777' },
      { name: 'Tanvi Iyer', email: 'tanvi.student@eduhelp.demo', dept: 'Electrical & Electronics', phone: '+91 99000 88888' },
      { name: 'Siddharth Nair', email: 'siddharth.student@eduhelp.demo', dept: 'Chemical Engineering', phone: '+91 99000 99999' },
      { name: 'Pooja Reddy', email: 'pooja.student@eduhelp.demo', dept: 'Aerospace Engineering', phone: '+91 99000 00000' },
    ];

    const studentIds: string[] = [];
    for (const stu of studentMembers) {
      const res = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, department, phone, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [stu.name, stu.email, defaultPassword, 'STUDENT', stu.dept, stu.phone, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150']
      );
      studentIds.push(res.rows[0].id);
    }

    // 3. Seed Realistic Tickets (24 tickets spanning all required states, priorities, SLA conditions, and categories)
    console.log('Seeding 24 realistic tickets across all lifecycle states and SLA conditions...');
    const now = new Date();

    const ticketsData = [
      // 1. NEW & Unassigned (Recent)
      {
        studentIdx: 0,
        catCode: 'FEES',
        subject: 'Tuition Fee Receipt for Education Loan reimbursement',
        description: 'I paid semester 5 fees via bank transfer yesterday (Ref: TXN98721345). Kindly issue the official stamped receipt required by State Bank of India for education loan subsidy.',
        priority: 'MEDIUM',
        status: 'NEW',
        assigneeIdx: null,
        createdHoursAgo: 2,
        slaHours: 48,
        slaBreached: false,
      },
      // 2. ASSIGNED to Priya
      {
        studentIdx: 0,
        catCode: 'ID_CARD',
        subject: 'Replacement Smart Card needed after transit loss',
        description: 'Misplaced my campus smart ID card on the college shuttle route 14 yesterday morning. I have paid the replacement fee at the cashier desk.',
        priority: 'LOW',
        status: 'ASSIGNED',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 14,
        slaHours: 72,
        slaBreached: false,
      },
      // 3. IN_PROGRESS (On Track)
      {
        studentIdx: 1,
        catCode: 'EXAMINATION',
        subject: 'Hall Ticket blocked due to elective registration glitch',
        description: 'My end-semester exam hall ticket shows elective CSE504 as unregistered, despite departmental approval email from Dr. Sen dated 12th Aug.',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 4,
        slaHours: 8,
        slaBreached: false,
      },
      // 4. WAITING_FOR_STUDENT (Staff replied, waiting for fee receipt copy)
      {
        studentIdx: 0,
        catCode: 'DOCUMENTS',
        subject: 'Request for Bonafide Certificate for Passport Renewal',
        description: 'Need bonafide certificate stating current residential status and university enrollment for passport seva kendra appointment next Monday.',
        priority: 'MEDIUM',
        status: 'WAITING_FOR_STUDENT',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 18,
        slaHours: 48,
        slaBreached: false,
      },
      // 5. RESOLVED (Eligible for reopening)
      {
        studentIdx: 0,
        catCode: 'TECH_SUPPORT',
        subject: 'Campus Wi-Fi portal 802.1X authentication failure in Library',
        description: 'Unable to connect to EduCampus-Secure Wi-Fi on MacBook in Central Library 2nd floor since maintenance upgrade.',
        priority: 'HIGH',
        status: 'RESOLVED',
        assigneeIdx: 3, // Kavita
        createdHoursAgo: 30,
        slaHours: 12,
        slaBreached: false,
        resolvedHoursAgo: 6,
        resolutionNotes: 'Network profile re-provisioned on campus RADIUS server. User verified connection successfully.',
      },
      // 6. CLOSED
      {
        studentIdx: 2,
        catCode: 'TRANSPORT',
        subject: 'Bus Pass Route 8 Extension to Whitefield Junction',
        description: 'Requesting stop addition at Whitefield metro junction for evening 5:30 PM shuttle.',
        priority: 'LOW',
        status: 'CLOSED',
        assigneeIdx: 2, // Vikram
        createdHoursAgo: 96,
        slaHours: 72,
        slaBreached: false,
        resolvedHoursAgo: 48,
        closedHoursAgo: 24,
        resolutionNotes: 'Transport committee approved temporary halt at Gate 2 Whitefield. Pass re-stamped.',
      },
      // 7. REOPENED (Student reopened because previous fix did not work)
      {
        studentIdx: 3,
        catCode: 'HOSTEL',
        subject: 'Water leakage in Block B Room 304 washroom persists',
        description: 'Maintenance team inspected yesterday and marked ticket resolved, but overhead pipe fitting started dripping heavily again this morning.',
        priority: 'HIGH',
        status: 'REOPENED',
        assigneeIdx: 2, // Vikram
        createdHoursAgo: 40,
        slaHours: 24,
        slaBreached: false,
      },
      // 8. ESCALATED (Manager escalated due to SLA breach and exam urgency)
      {
        studentIdx: 4,
        catCode: 'EXAMINATION',
        subject: 'Re-evaluation mark tally mismatch in Applied Mathematics IV',
        description: 'Scanned answer script shows Section C question 4(b) carrying 7 marks was unmarked. Re-evaluation fee was submitted on 5th September.',
        priority: 'URGENT',
        status: 'ESCALATED',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 28,
        slaHours: 8,
        slaBreached: true,
      },
      // 9. SLA BREACHED (Open and over SLA due date)
      {
        studentIdx: 5,
        catCode: 'CERTIFICATES',
        subject: 'Urgent Transcript for Germany Visa Application',
        description: 'Embassy appointment on Friday. Need 3 sets of sealed official transcripts with university stamp.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assigneeIdx: 1, // Ananya
        createdHoursAgo: 48,
        slaHours: 24,
        slaBreached: true,
      },
      // 10. SLA AT RISK (< 20% SLA remaining)
      {
        studentIdx: 6,
        catCode: 'TECH_SUPPORT',
        subject: 'LMS Portal Quiz submission timeout error',
        description: 'System logged me out 5 minutes before Mid-term test submission. Need professor confirmation and log extraction.',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        assigneeIdx: 3, // Kavita
        createdHoursAgo: 7,
        slaHours: 8, // 1 hour left out of 8 = 12.5% remaining -> At risk
        slaBreached: false,
      },
      // 11. Student 0 (Aarav) - In Progress Hostel issue
      {
        studentIdx: 0,
        catCode: 'HOSTEL',
        subject: 'Study table light fixture electrical spark in Block A-210',
        description: 'Switchboard emits sparks whenever plug is inserted. Requesting urgent electrician inspection for room safety.',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        assigneeIdx: 2, // Vikram
        createdHoursAgo: 3,
        slaHours: 8,
        slaBreached: false,
      },
      // 12. Student 7 - Fee installment request
      {
        studentIdx: 7,
        catCode: 'FEES',
        subject: 'Request for 2-phase installment payment of Semester 4 fees',
        description: 'Due to family medical emergency, requesting permission from Accounts department to pay 50% now and balance by October 30.',
        priority: 'HIGH',
        status: 'ASSIGNED',
        assigneeIdx: 1, // Ananya
        createdHoursAgo: 16,
        slaHours: 24,
        slaBreached: false,
      },
      // 13. Student 8 - Attendance Medical Exemption
      {
        studentIdx: 8,
        catCode: 'ATTENDANCE',
        subject: 'Medical Leave certificate endorsement for Dengue hospitalization',
        description: 'Hospitalized at City Care Hospital from 1st to 10th September. Discharge summary and physician certificate attached for attendance credit.',
        priority: 'MEDIUM',
        status: 'WAITING_FOR_STUDENT',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 35,
        slaHours: 48,
        slaBreached: false,
      },
      // 14. Student 9 - Duplicate Marksheet
      {
        studentIdx: 9,
        catCode: 'CERTIFICATES',
        subject: 'Issue of Duplicate Grade Card for 2nd Semester',
        description: 'Original grade card damaged during transit. Paid statutory fee of Rs. 500 at Accounts section (Receipt #44910).',
        priority: 'LOW',
        status: 'NEW',
        assigneeIdx: null,
        createdHoursAgo: 6,
        slaHours: 72,
        slaBreached: false,
      },
      // 15. Student 1 - Transport bus pass renewal
      {
        studentIdx: 1,
        catCode: 'TRANSPORT',
        subject: 'Transport Route 5 Pass renewal for second term',
        description: 'Paid bus transit charges online on 15th Sep. Need digital sticker updated for terminal gate scanning.',
        priority: 'LOW',
        status: 'RESOLVED',
        assigneeIdx: 2, // Vikram
        createdHoursAgo: 50,
        slaHours: 48,
        slaBreached: false,
        resolvedHoursAgo: 12,
        resolutionNotes: 'Transport gate terminal RFID database synced. Student card successfully validated.',
      },
      // 16. Student 2 - Course registration mismatch
      {
        studentIdx: 2,
        catCode: 'OTHER',
        subject: 'NSS volunteer credit points missing in semester transcript',
        description: 'Completed 120 hours of community service in rural literacy mission under NSS Unit III. Certificate submitted to Dean of Student Welfare.',
        priority: 'LOW',
        status: 'ASSIGNED',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 22,
        slaHours: 72,
        slaBreached: false,
      },
      // 17. Student 3 - Library fine dispute
      {
        studentIdx: 3,
        catCode: 'FEES',
        subject: 'Library overdue fine shown despite book returned on due date',
        description: 'Database shows Rs. 420 overdue for Introduction to Algorithms (Accession #CS-8921). Book was returned to drop box on Sept 4 before 5 PM.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assigneeIdx: 1, // Ananya
        createdHoursAgo: 20,
        slaHours: 48,
        slaBreached: false,
      },
      // 18. Student 4 - ID card magnetic stripe
      {
        studentIdx: 4,
        catCode: 'ID_CARD',
        subject: 'Turnstile gate barrier rejecting student barcode',
        description: 'Main campus entry turnstiles flash red error code E-102. Library access works normally.',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        assigneeIdx: 3, // Kavita
        createdHoursAgo: 25,
        slaHours: 24,
        slaBreached: false,
        resolvedHoursAgo: 5,
        resolutionNotes: 'Turnstile gate reader firmware updated and student badge synced on door controller.',
      },
      // 19. Student 5 - Exam conflict
      {
        studentIdx: 5,
        catCode: 'EXAMINATION',
        subject: 'Mid-term clash between Elective Cryptography and Open Elective Robotics',
        description: 'Both subjects are scheduled on 28th September 09:30 AM in Exam Hall 3 and Hall 7 respectively.',
        priority: 'URGENT',
        status: 'ASSIGNED',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 6,
        slaHours: 8,
        slaBreached: false,
      },
      // 20. Student 6 - Wi-Fi Hostel Block C
      {
        studentIdx: 6,
        catCode: 'TECH_SUPPORT',
        subject: 'Access Point offline on 4th floor Block C Hostel',
        description: 'AP-C4-North has been power cycling since rainfall yesterday. 24 rooms currently without Wi-Fi connectivity.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assigneeIdx: 3, // Kavita
        createdHoursAgo: 10,
        slaHours: 24,
        slaBreached: false,
      },
      // 21. Student 7 - Medium of Instruction Letter
      {
        studentIdx: 7,
        catCode: 'DOCUMENTS',
        subject: 'English Medium of Instruction Certificate for higher studies in UK',
        description: 'Applying for MSc Computer Science at University of Edinburgh. Need letter signed by Controller of Examinations.',
        priority: 'LOW',
        status: 'CLOSED',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 120,
        slaHours: 72,
        slaBreached: false,
        resolvedHoursAgo: 48,
        closedHoursAgo: 20,
        resolutionNotes: 'Signed certificate sealed in university envelope dispatched to student address.',
      },
      // 22. Student 8 - Hostel Mess Change
      {
        studentIdx: 8,
        catCode: 'HOSTEL',
        subject: 'Transfer request from South Indian Mess to North Indian Caterer',
        description: 'Requesting monthly mess allotment change effective from 1st of next month.',
        priority: 'LOW',
        status: 'NEW',
        assigneeIdx: null,
        createdHoursAgo: 5,
        slaHours: 48,
        slaBreached: false,
      },
      // 23. Student 9 - Scholarship Cheque Clearance
      {
        studentIdx: 9,
        catCode: 'FEES',
        subject: 'National Merit Scholarship direct benefit transfer not credited',
        description: 'State portal lists remittance sanction on Aug 28th. Institutional accounts section hasn’t updated fee ledger.',
        priority: 'HIGH',
        status: 'ESCALATED',
        assigneeIdx: 1, // Ananya
        createdHoursAgo: 52,
        slaHours: 24,
        slaBreached: true,
      },
      // 24. Student 0 (Aarav) - Migration Certificate
      {
        studentIdx: 0,
        catCode: 'CERTIFICATES',
        subject: 'Inter-University Migration Certificate for research internship abroad',
        description: 'Selected for MIT Summer Research Fellowship. Need official migration certificate stamped by Academic Dean.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        assigneeIdx: 0, // Priya
        createdHoursAgo: 26,
        slaHours: 48,
        slaBreached: false,
      }
    ];

    let ticketSeq = 1000;
    const datePrefix = '20260924';

    for (const t of ticketsData) {
      ticketSeq += 1;
      const ticketNum = `EDU-${datePrefix}-${ticketSeq}`;
      const studentId = studentIds[t.studentIdx];
      const categoryId = categoryMap.get(t.catCode)!;
      const assigneeId = t.assigneeIdx !== null ? staffIds[t.assigneeIdx] : null;

      const createdAt = new Date(now.getTime() - t.createdHoursAgo * 60 * 60 * 1000);
      const slaDueAt = new Date(createdAt.getTime() + t.slaHours * 60 * 60 * 1000);
      const resolvedAt = t.resolvedHoursAgo ? new Date(now.getTime() - t.resolvedHoursAgo * 60 * 60 * 1000) : null;
      const closedAt = t.closedHoursAgo ? new Date(now.getTime() - t.closedHoursAgo * 60 * 60 * 1000) : null;

      const ticketRes = await pool.query(
        `INSERT INTO tickets (
          ticket_number, student_id, category_id, subject, description,
          priority, status, assigned_to, sla_due_at, sla_breached,
          resolved_at, closed_at, resolution_notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)
        RETURNING id`,
        [
          ticketNum,
          studentId,
          categoryId,
          t.subject,
          t.description,
          t.priority,
          t.status,
          assigneeId,
          slaDueAt,
          t.slaBreached,
          resolvedAt,
          closedAt,
          t.resolutionNotes || null,
          createdAt
        ]
      );

      const ticketId = ticketRes.rows[0].id;

      // Seed Initial History Event: Creation
      await pool.query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value, created_at)
         VALUES ($1, $2, 'TICKET_CREATED', NULL, $3, $4)`,
        [ticketId, studentId, `Status: ${t.status}, Priority: ${t.priority}`, createdAt]
      );

      // Seed Assignment History if assigned
      if (assigneeId) {
        const assignedTime = new Date(createdAt.getTime() + 15 * 60 * 1000);
        await pool.query(
          `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value, created_at)
           VALUES ($1, $2, 'TICKET_ASSIGNED', 'UNASSIGNED', (SELECT name FROM users WHERE id = $3), $4)`,
          [ticketId, managerId, assigneeId, assignedTime]
        );
      }

      // Seed Comments (Public comments + strictly protected internal notes)
      if (t.status === 'WAITING_FOR_STUDENT' && assigneeId) {
        const replyTime = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
        await pool.query(
          `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
           VALUES ($1, $2, 'Dear student, please attach the scanned PDF of your original identity card and passport appointment slip.', FALSE, $3)`,
          [ticketId, assigneeId, replyTime]
        );

        // Internal Staff Note: MUST NOT BE VISIBLE TO STUDENT
        const noteTime = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000 + 10 * 60 * 1000);
        await pool.query(
          `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
           VALUES ($1, $2, 'Internal Note: Student visited registrar counter previously without parent consent letter. Verify guardianship status before dispatching.', TRUE, $3)`,
          [ticketId, assigneeId, noteTime]
        );
      }

      if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
        if (assigneeId) {
          const resTime = resolvedAt || new Date(createdAt.getTime() + 12 * 60 * 60 * 1000);
          await pool.query(
            `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
             VALUES ($1, $2, $3, FALSE, $4)`,
            [ticketId, assigneeId, `Ticket resolution: ${t.resolutionNotes}`, resTime]
          );

          await pool.query(
            `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value, created_at)
             VALUES ($1, $2, 'STATUS_CHANGED', 'IN_PROGRESS', 'RESOLVED', $3)`,
            [ticketId, assigneeId, resTime]
          );
        }
      }

      if (t.status === 'ESCALATED') {
        const escTime = new Date(createdAt.getTime() + 10 * 60 * 60 * 1000);
        await pool.query(
          `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value, created_at)
           VALUES ($1, $2, 'TICKET_ESCALATED', 'IN_PROGRESS', 'ESCALATED', $3)`,
          [ticketId, managerId, escTime]
        );

        // Internal note on escalation
        await pool.query(
          `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at)
           VALUES ($1, $2, 'Internal Note: Escalated directly to Department Head due to pending examination deadlines and SLA breach.', TRUE, $3)`,
          [ticketId, managerId, escTime]
        );
      }

      // Seed Notifications for student
      await pool.query(
        `INSERT INTO notifications (user_id, ticket_id, title, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, FALSE, $5)`,
        [
          studentId,
          ticketId,
          `Request Created: ${ticketNum}`,
          `Your request regarding "${t.subject}" has been submitted successfully.`,
          createdAt
        ]
      );
    }

    console.log('Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS READY:');
    console.log('Manager:  manager@eduhelp.demo  / password123');
    console.log('Staff:    staff@eduhelp.demo    / password123');
    console.log('Student:  student@eduhelp.demo  / password123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
