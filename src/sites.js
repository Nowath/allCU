// ============================================================
//  AllCU — link directory
//
//  Each entry opens DIRECTLY in a new browser tab when clicked.
//
//    {
//      id:    unique short key (used internally / for bookmarks)
//      name:  label shown in the card
//      url:   the site that opens when clicked
//      cat:   category key (see CATEGORIES below)
//      popular: (optional) true => shown in the "ยอดนิยม" section
//    }
//
//  Faculty / center / office links sourced from:
//    https://www.chula.ac.th/about/contact/departments/
// ============================================================

export const CATEGORIES = [
  { key: 'popular', label: 'ยอดนิยม' },
  { key: 'tool', label: 'เครื่องมือ / ระบบนิสิต' },
  { key: 'faculty', label: 'คณะ / วิทยาลัย / สำนักวิชา' },
  { key: 'institute', label: 'สถาบัน / บัณฑิตวิทยาลัย' },
  { key: 'center', label: 'ศูนย์' },
  { key: 'office', label: 'สำนัก / สำนักงาน' },
]

const sites = [
  // ---------- Popular (the ones the app shipped with) ----------
  { id: 'reg', name: 'Reg Chula (ลงทะเบียนเรียน)', url: 'https://www2.reg.chula.ac.th/', cat: 'popular', popular: true },
  { id: 'mycourseville', name: 'MyCourseVille', url: 'https://www.mycourseville.com/', cat: 'popular', popular: true },
  { id: 'rcu', name: 'RCU Chula (หอพักนิสิต)', url: 'https://rcuchula.com/', cat: 'popular', popular: true },
  { id: 'cusc', name: 'CUSC Booking (จองสนามกีฬา)', url: 'https://book.cusc.chula.ac.th/', cat: 'popular', popular: true },
  { id: 'cudson', name: 'CU DSON', url: 'https://cudson.chula.ac.th/#/', cat: 'popular', popular: true },
  { id: 'cugetreg', name: 'CU Get Reg', url: 'https://cugetreg.com/S/courses', cat: 'popular', popular: true },
  { id: 'chula', name: 'Chulalongkorn University (หน้าหลัก)', url: 'https://www.chula.ac.th/', cat: 'popular', popular: true },

  // ---------- Tools / student systems ----------
  { id: 'cuaccount', name: 'CUNET Account (ออกรหัสผ่าน/บัญชีจุฬาฯ)', url: 'https://account.it.chula.ac.th/', cat: 'tool' },
  { id: 'it', name: 'Office of Information Technology (สำนักบริหารเทคโนฯ)', url: 'https://www.it.chula.ac.th/', cat: 'tool' },
  { id: 'mooc', name: 'Chula MOOC', url: 'https://mooc.chula.ac.th/', cat: 'tool' },
  { id: 'atc', name: 'Academic Testing Center (CU-TEP / CU-AAT)', url: 'https://www.atc.chula.ac.th/', cat: 'tool' },
  { id: 'car', name: 'Office of Academic Resources (ห้องสมุดกลาง)', url: 'https://www.car.chula.ac.th/', cat: 'tool' },
  { id: 'chulabook', name: 'Chula Book Center (ศูนย์หนังสือจุฬาฯ)', url: 'https://www.chulabook.com', cat: 'tool' },

  // ---------- Faculties / Colleges / Schools ----------
  { id: 'eng', name: 'Faculty of Engineering (วิศวกรรมศาสตร์)', url: 'https://www.eng.chula.ac.th', cat: 'faculty' },
  { id: 'sc', name: 'Faculty of Science (วิทยาศาสตร์)', url: 'https://www.sc.chula.ac.th', cat: 'faculty' },
  { id: 'arts', name: 'Faculty of Arts (อักษรศาสตร์)', url: 'https://www.arts.chula.ac.th', cat: 'faculty' },
  { id: 'med', name: 'Faculty of Medicine (แพทยศาสตร์)', url: 'https://www.md.chula.ac.th', cat: 'faculty' },
  { id: 'dent', name: 'Faculty of Dentistry (ทันตแพทยศาสตร์)', url: 'https://www.dent.chula.ac.th', cat: 'faculty' },
  { id: 'pharm', name: 'Faculty of Pharmaceutical Sciences (เภสัชศาสตร์)', url: 'https://www.pharm.chula.ac.th', cat: 'faculty' },
  { id: 'vet', name: 'Faculty of Veterinary Science (สัตวแพทยศาสตร์)', url: 'https://www.vet.chula.ac.th', cat: 'faculty' },
  { id: 'nurse', name: 'Faculty of Nursing (พยาบาลศาสตร์)', url: 'https://www.nurse.chula.ac.th', cat: 'faculty' },
  { id: 'ahs', name: 'Faculty of Allied Health Sciences (สหเวชศาสตร์)', url: 'https://www.ahs.chula.ac.th', cat: 'faculty' },
  { id: 'psy', name: 'Faculty of Psychology (จิตวิทยา)', url: 'https://www.psy.chula.ac.th', cat: 'faculty' },
  { id: 'spsc', name: 'Faculty of Sports Science (วิทยาศาสตร์การกีฬา)', url: 'https://www.spsc.chula.ac.th', cat: 'faculty' },
  { id: 'law', name: 'Faculty of Law (นิติศาสตร์)', url: 'https://www.law.chula.ac.th', cat: 'faculty' },
  { id: 'polsci', name: 'Faculty of Political Science (รัฐศาสตร์)', url: 'https://www.polsci.chula.ac.th', cat: 'faculty' },
  { id: 'econ', name: 'Faculty of Economics (เศรษฐศาสตร์)', url: 'https://www.econ.chula.ac.th', cat: 'faculty' },
  { id: 'cbs', name: 'Faculty of Commerce & Accountancy (พาณิชยศาสตร์และการบัญชี)', url: 'https://www.cbs.chula.ac.th', cat: 'faculty' },
  { id: 'commarts', name: 'Faculty of Communication Arts (นิเทศศาสตร์)', url: 'https://www.commarts.chula.ac.th', cat: 'faculty' },
  { id: 'edu', name: 'Faculty of Education (ครุศาสตร์)', url: 'https://www.edu.chula.ac.th', cat: 'faculty' },
  { id: 'arch', name: 'Faculty of Architecture (สถาปัตยกรรมศาสตร์)', url: 'https://www.arch.chula.ac.th', cat: 'faculty' },
  { id: 'faa', name: 'Faculty of Fine & Applied Arts (ศิลปกรรมศาสตร์)', url: 'https://www.faa.chula.ac.th', cat: 'faculty' },
  { id: 'scii', name: 'School of Integrated Innovation (BAScii)', url: 'https://www.scii.chula.ac.th', cat: 'faculty' },
  { id: 'sasin', name: 'Sasin School of Management', url: 'https://www.sasin.edu', cat: 'faculty' },

  // ---------- Institutes / Graduate ----------
  { id: 'grad', name: 'Graduate School (บัณฑิตวิทยาลัย)', url: 'https://www.grad.chula.ac.th', cat: 'institute' },
  { id: 'cphs', name: 'College of Public Health Sciences (วิทยาลัยวิทยาศาสตร์สาธารณสุข)', url: 'https://www.cphs.chula.ac.th', cat: 'institute' },
  { id: 'cps', name: 'College of Population Studies (วิทยาลัยประชากรศาสตร์)', url: 'https://www.cps.chula.ac.th', cat: 'institute' },
  { id: 'ppc', name: 'Petroleum & Petrochemical College (วิทยาลัยปิโตรเลียมฯ)', url: 'https://www.ppc.chula.ac.th', cat: 'institute' },
  { id: 'culi', name: 'Language Institute (สถาบันภาษา · CULI)', url: 'https://www.culi.chula.ac.th', cat: 'institute' },
  { id: 'ias', name: 'Institute of Asian Studies (สถาบันเอเชียศึกษา)', url: 'https://www.ias.chula.ac.th', cat: 'institute' },
  { id: 'cusri', name: 'Social Research Institute (สถาบันวิจัยสังคม · CUSRI)', url: 'https://cusri.chula.ac.th', cat: 'institute' },
  { id: 'cuti', name: 'Transportation Institute (สถาบันการขนส่ง)', url: 'https://www.cuti.chula.ac.th', cat: 'institute' },
  { id: 'eri', name: 'Energy Research Institute (สถาบันวิจัยพลังงาน)', url: 'https://www.eri.chula.ac.th', cat: 'institute' },
  { id: 'eric', name: 'Environmental Research Institute (สถาบันวิจัยสภาวะแวดล้อม)', url: 'https://www.eric.chula.ac.th', cat: 'institute' },
  { id: 'asean', name: 'ASEAN Studies Center', url: 'http://www.asean.chula.ac.th', cat: 'institute' },

  // ---------- Centers ----------
  { id: 'gened', name: 'General Education Center (ศศท.)', url: 'https://www.gened.chula.ac.th/th', cat: 'center' },
  { id: 'cusc-center', name: 'Sports Center (ศูนย์กีฬาฯ)', url: 'http://www.cusc.chula.ac.th', cat: 'center' },
  { id: 'hsm', name: 'Hazardous Substance Management Center', url: 'https://hsm.chula.ac.th/website/', cat: 'center' },
  { id: 'strec', name: 'Scientific Research Equipment Centre (STREC)', url: 'https://strec.chula.ac.th/page/', cat: 'center' },
  { id: 'lic', name: 'Learning Innovation Center (ศนว.)', url: 'https://lic.chula.ac.th', cat: 'center' },
  { id: 'cuhc', name: 'Health Service Center (ศูนย์บริการสุขภาพ)', url: 'http://www.cuhc.chula.ac.th/th/', cat: 'center' },
  { id: 'halal', name: 'Halal Science Center (ศวฮ.)', url: 'https://www.halalscience.org', cat: 'center' },
  { id: 'ccc', name: 'Communication Center (ศสอ.)', url: 'http://www.ccc.chula.ac.th', cat: 'center' },
  { id: 'cuihub', name: 'CU Innovation Hub', url: 'https://cuihub.chula.ac.th/?lang=th', cat: 'center' },
  { id: 'shecu', name: 'Safety, Health & Environment Center (ศปอส.)', url: 'https://www.shecu.chula.ac.th/home/', cat: 'center' },

  // ---------- Offices ----------
  { id: 'prm', name: 'Office of Physical Resources Management (สบภ.)', url: 'http://www.prm.chula.ac.th/', cat: 'office' },
  { id: 'pmcu', name: 'Office of Property Management (PMCU)', url: 'https://pmcu.co.th/', cat: 'office' },
  { id: 'council', name: 'Office of the University Council (สนภ.)', url: 'https://council.chula.ac.th/', cat: 'office' },
  { id: 'ofas', name: 'Office of Financial Management (สบง.)', url: 'https://ofas.chula.ac.th/', cat: 'office' },
  { id: 'sa', name: 'Office of Student Affairs (สบน.)', url: 'https://www.sa.chula.ac.th/', cat: 'office' },
  { id: 'wellness', name: 'Student Health Promotion Unit (Chula Wellness)', url: 'https://chula.wellness.in.th/', cat: 'office' },
  { id: 'hrm', name: 'Office of Human Resources Management (สบม.)', url: 'https://www.hrm.chula.ac.th/th/home', cat: 'office' },
]

export default sites
