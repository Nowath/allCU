// ============================================================
//  chulaAll — website list
//  Edit this file to add / remove / reorder websites.
//
//  Each entry:
//    {
//      id:    unique short key (used internally)
//      name:  label shown in the menu
//      url:   the page loaded into the iframe
//      group: (optional) section header to group items under
//    }
//
//  Sites load inside an IFRAME. For logins to persist, your
//  browser must ALLOW THIRD-PARTY COOKIES for these sites
//  (see the README). The "↗ Open" button is a fallback that
//  opens the current site in a new tab.
// ============================================================

const sites = [
  { id: 'reg', name: 'Reg Chula', url: 'https://www2.reg.chula.ac.th/', group: 'Chula' },
  { id: 'rcu',          name: 'RCU Chula (Login)',  url: 'https://rcuchula.com/main/login_form_j.php?', group: 'Chula' },
  { id: 'mycourseville',name: 'MyCourseVille',      url: 'https://www.mycourseville.com/',              group: 'Learning' },
  { id: 'cusc',         name: 'CUSC Booking',       url: 'https://book.cusc.chula.ac.th/',              group: 'Services' },
  { id: 'cudson',       name: 'CU DSON',            url: 'https://cudson.chula.ac.th/#/',               group: 'Services' },
  { id: 'gpacalc',      name: 'GPA Calculator',     url: 'https://podsawee.com/grade/',                group: 'Tools' },
  { id: 'cugetreg',     name: 'CU Get Reg',         url: 'https://cugetreg.com/S/courses',              group: 'Tools' },
]

export default sites
