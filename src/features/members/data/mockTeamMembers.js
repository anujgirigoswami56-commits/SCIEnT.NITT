/**
 * mockTeamMembers.js
 * Isolated DEV-ONLY mock data covering all 5 subteams across 3 years.
 * Used ONLY for local UI verification. Never imported in production.
 *
 * Core members:  role='Core', subteam='Core'  → shown as flat grid (no role sections)
 * Other members: role='Senior Manager'|'Manager'|'Deputy Manager', subteam=<team>
 * Project Management: Senior Manager ONLY
 */

const makeMembers = (year, role, subteam, dept, count, startNum) =>
  Array.from({ length: count }, (_, i) => {
    const num = String(startNum + i).padStart(2, '0');
    return {
      _id: `mock-${year}-${role.toLowerCase().replace(/\s+/g, '-')}-${subteam ? subteam.toLowerCase().replace(/\s+/g, '-') + '-' : ''}${num}`,
      name: `Demo ${subteam || 'Core'} ${num}`,
      year,
      role,
      subteam: subteam || null,
      Department: dept,
      photoUrl: null,
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      email: `demo${num}@nitt.edu`,
      description: `Demo ${role} in ${subteam || 'Core'}. Testing card layout and hierarchy render.`,
      order: i + 1,
      cardColor: '#facc15',
      isMock: true,
    };
  });

export const MOCK_TEAM_MEMBERS = [
  // ── 24-25 ────────────────────────────────────────────────────────────────
  // Core — flat list (role='Core', subteam='Core')
  ...makeMembers('24-25', 'Core', 'Core', 'Mechanical Engineering', 5, 1),

  // DevOps
  ...makeMembers('24-25', 'Senior Manager', 'DevOps', 'Computer Science & Engineering', 3, 12),
  ...makeMembers('24-25', 'Manager',        'DevOps', 'Computer Science & Engineering', 3, 15),
  ...makeMembers('24-25', 'Deputy Manager', 'DevOps', 'Computer Science & Engineering', 3, 18),

  // Creatives
  ...makeMembers('24-25', 'Senior Manager', 'Creatives', 'Architecture & Design', 3, 21),
  ...makeMembers('24-25', 'Manager',        'Creatives', 'Architecture & Design', 3, 24),
  ...makeMembers('24-25', 'Deputy Manager', 'Creatives', 'Architecture & Design', 3, 27),

  // Corporate Communication (singular — normalised to plural in filterMembers)
  ...makeMembers('24-25', 'Senior Manager', 'Corporate Communication', 'Humanities & Management', 3, 30),
  ...makeMembers('24-25', 'Manager',        'Corporate Communication', 'Humanities & Management', 3, 33),
  ...makeMembers('24-25', 'Deputy Manager', 'Corporate Communication', 'Humanities & Management', 2, 36),

  // Project Management — Senior Managers ONLY
  ...makeMembers('24-25', 'Senior Manager', 'Project Management', 'Industrial Engineering', 3, 38),

  // ── 25-26 ────────────────────────────────────────────────────────────────
  ...makeMembers('25-26', 'Core', 'Core', 'Electrical & Electronics', 5, 50),

  ...makeMembers('25-26', 'Senior Manager', 'DevOps', 'Computer Science & Engineering', 3, 56),
  ...makeMembers('25-26', 'Manager',        'DevOps', 'Computer Science & Engineering', 3, 59),
  ...makeMembers('25-26', 'Deputy Manager', 'DevOps', 'Computer Science & Engineering', 3, 62),

  ...makeMembers('25-26', 'Senior Manager', 'Creatives', 'Production Engineering', 3, 65),
  ...makeMembers('25-26', 'Manager',        'Creatives', 'Production Engineering', 3, 68),
  ...makeMembers('25-26', 'Deputy Manager', 'Creatives', 'Production Engineering', 3, 71),

  ...makeMembers('25-26', 'Senior Manager', 'Corporate Communication', 'Instrumentation & Control', 3, 74),
  ...makeMembers('25-26', 'Manager',        'Corporate Communication', 'Instrumentation & Control', 3, 77),
  ...makeMembers('25-26', 'Deputy Manager', 'Corporate Communication', 'Instrumentation & Control', 2, 80),

  ...makeMembers('25-26', 'Senior Manager', 'Project Management', 'Industrial Engineering', 3, 82),

  // ── 26-27 ────────────────────────────────────────────────────────────────
  ...makeMembers('26-27', 'Core', 'Core', 'Civil Engineering', 5, 90),

  ...makeMembers('26-27', 'Senior Manager', 'DevOps', 'Computer Science & Engineering', 3, 96),
  ...makeMembers('26-27', 'Manager',        'DevOps', 'Computer Science & Engineering', 3, 99),
  ...makeMembers('26-27', 'Deputy Manager', 'DevOps', 'Computer Science & Engineering', 3, 102),

  ...makeMembers('26-27', 'Senior Manager', 'Creatives', 'Chemical Engineering', 3, 105),
  ...makeMembers('26-27', 'Manager',        'Creatives', 'Chemical Engineering', 3, 108),
  ...makeMembers('26-27', 'Deputy Manager', 'Creatives', 'Chemical Engineering', 3, 111),

  ...makeMembers('26-27', 'Senior Manager', 'Corporate Communication', 'Metallurgical & Materials', 3, 114),
  ...makeMembers('26-27', 'Manager',        'Corporate Communication', 'Metallurgical & Materials', 3, 117),
  ...makeMembers('26-27', 'Deputy Manager', 'Corporate Communication', 'Metallurgical & Materials', 2, 120),

  ...makeMembers('26-27', 'Senior Manager', 'Project Management', 'Industrial Engineering', 3, 122),
];

export const MOCK_PRINCE_ADVISOR = {
  _id: 'mock-advisor-prince',
  name: 'Dr. -Ing Prince Gideon Kubendran Amos',
  role: 'Faculty Advisor',
  subteam: null,
  Department: 'Metallurgical and Materials Engineering',
  email: 'prince@nitt.edu',
  photoUrl: 'https://www.nitt.edu/home/academics/departments/meta/faculty/prince/Prince200x238.jpg',
  linkedin: 'https://nitt.irins.org/profile/214573',
  description:
    'Assistant Professor, Dept. of Metallurgical and Materials Engineering, NIT Trichy. Ph.D. from Karlsruhe Institute of Technology.',
  year: null,
  order: 2,
  cardColor: '#facc15',
  isMock: true,
};
