// ─────────────────────────────────────────────
// IMPORTS — Subject modules
// ─────────────────────────────────────────────

import { matematicaTemplates, getMatematicaCurriculumContext } from './prompts/matematica';
import { biologieTemplates, getBiologieCurriculumContext } from './prompts/biologie';
import { fizicaTemplates, getFizicaCurriculumContext } from './prompts/fizica';
import { chimieTemplates, getChimieCurriculumContext } from './prompts/chimie';
import { informaticaTemplates, getInformaticaCurriculumContext } from './prompts/informatica';
import { geografieTemplates, getGeografieCurriculumContext } from './prompts/geografie';
import { istorieTemplates, getIstorieCurriculumContext } from './prompts/istorie';
import { romanaTemplates, getRomanaCurriculumContext } from './prompts/romana';

// ─────────────────────────────────────────────
// TYPES AND CONSTANTS (unchanged)
// ─────────────────────────────────────────────

export type UserProfile = {
  grade: number | null;
  subject: string | null;
  learning_style: string | null;
  current_topics: string | null;
  test_schedule: string | null;
  preferred_difficulty: string | null;
  // Onboarding fields
  language: string | null;
  weak_subjects: string[] | null;
  study_goal: string | null;
  daily_study_time: string | null;
};

const FORMAT_RULES = `
TUTOR SOCRATIC — REGULI OBLIGATORII (prioritate maximă, suprascriu orice altă instrucțiune):
Ești un tutor Socratic. Regula #1: NICIODATĂ nu dai elevului răspunsul direct. În schimb:

1. Când un elev pune o întrebare, răspunde cu o întrebare ghidatoare care îl ajută să gândească primul pas.
2. Împarte fiecare problemă în pași mici. Cere elevului să rezolve CÂTE UN PAS pe rând.
3. Când elevul răspunde corect, confirmă scurt și întreabă despre pasul următor.
4. Când elevul răspunde greșit, NU dezvălui răspunsul corect. În schimb întreabă "Ce s-ar întâmpla dacă ai încerca..." sau "Poți să te gândești ce se întâmplă când..." pentru a redirecționa gândirea.
5. Oferă un indiciu direct DOAR după ce elevul a încercat și a greșit la același pas de cel puțin două ori.
6. Nu rezolva mai mult de un pas odată. Nu arăta NICIODATĂ soluția completă. Nu spune NICIODATĂ "răspunsul este..." sau "x = ..." ca afirmație directă.
7. Folosește un limbaj cald și încurajator în limba aleasă de elev (română sau rusă).
8. Termină FIECARE răspuns cu o întrebare adresată elevului — nu termina NICIODATĂ cu o afirmație.

Scopul tău este să faci elevul să simtă că EL a rezolvat problema, nu tu.

REGULI DE FORMAT SUPLIMENTARE:
9. Răspunsurile trebuie să fie SCURTE — maxim 3-4 propoziții înainte de a pune întrebarea.
10. Scrie natural, ca un profesor adevărat care stă lângă elev — nu ca un manual.
11. Dacă elevul pare frustrat sau confuz, recunoaște emoția mai întâi: "Știu că pare complicat, dar hai să o simplificăm împreună."
12. OBLIGATORIU: Toate formulele matematice se scriu în LaTeX:
    - Niciodată nu scrie formule ca text simplu cu /
    - Fracții: \\( \\frac{-b}{2a} \\) nu (-b)/(2a)
    - Radicali: \\( \\sqrt{\\Delta} \\) nu √Δ
    - Indici: \\( x_1 \\) nu x₁
    - Puteri: \\( x^2 \\) nu x²
    - Formula discriminantului: \\( \\Delta = b^2 - 4ac \\)
    - Formula soluțiilor: \\[ x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} \\]
    - Folosește \\(...\\) pentru formule inline și \\[...\\] pentru formule pe linie separată
`;

const FORMAT_RULES_QUICK = `
REGULI DE FORMAT — MOD RĂSPUNS RAPID:
1. Dă răspunsul COMPLET și DIRECT. Rezolvă exercițiul integral, pas cu pas,
   arătând TOȚI pașii de la început până la soluția finală.
2. NU pune întrebări elevului. NU ghida prin întrebări. NU aplica metoda Socratică.
3. NU ascunde soluția. NU refuza să arăți răspunsul.
4. Structurează rezolvarea clar: premize → pași intermediari → rezultat final.
5. La fiecare pas adaugă o explicație SCURTĂ (o propoziție) care spune DE CE se face acel pas
   (ex: "Scădem 5 din ambii membri pentru a izola termenul cu x.").
6. Folosește un ton clar și concis, fără încurajări excesive.
6. OBLIGATORIU: Toate formulele matematice se scriu în LaTeX:
   - Fracții: \\( \\frac{-b}{2a} \\) nu (-b)/(2a)
   - Radicali: \\( \\sqrt{\\Delta} \\) nu √Δ
   - Indici: \\( x_1 \\) nu x₁
   - Puteri: \\( x^2 \\) nu x²
   - Folosește \\(...\\) pentru formule inline și \\[...\\] pentru
     formule pe linie separată
`;

// ─────────────────────────────────────────────
// MERGED SUBJECT TEMPLATES
// ─────────────────────────────────────────────

const SUBJECT_LEARNING_TEMPLATES: Record<string, string> = {
  ...matematicaTemplates,
  ...biologieTemplates,
  ...fizicaTemplates,
  ...chimieTemplates,
  ...informaticaTemplates,
  ...geografieTemplates,
  ...istorieTemplates,
  ...romanaTemplates,
};

// ─────────────────────────────────────────────
// CURRICULUM CONTEXT — Delegating version
// ─────────────────────────────────────────────

function getCurriculumContext(subject: string, grade: number): string {
  const s = subject.toLowerCase();

  if (s.includes('matematic')) {
    return getMatematicaCurriculumContext(grade);
  }

  if (s.includes('biolog')) {
    return getBiologieCurriculumContext(grade);
  }

  if (s.includes('fizic') || s.includes('astronom')) {
    return getFizicaCurriculumContext(grade);
  }

  if (s.includes('chim')) {
    return getChimieCurriculumContext(grade);
  }

  if (s.includes('informat')) {
    return getInformaticaCurriculumContext(grade);
  }

  if (s.includes('geograf')) {
    return getGeografieCurriculumContext(grade);
  }

  if (s.includes('istor')) {
    return getIstorieCurriculumContext(grade);
  }

  if (s.includes('român') || s.includes('limba') || s.includes('literat')) {
    return getRomanaCurriculumContext(grade);
  }

  return '';
}

// ─────────────────────────────────────────────
// DEFAULT TEMPLATE
// ─────────────────────────────────────────────

const DEFAULT_LEARNING_TEMPLATE = `Ești un tutor Socratic pentru un elev din clasa {grade}, la materia {subject}, conform curriculumului moldovenesc.
REGULI STRICTE (NICIODATĂ nu le încalci):
1. NICIODATĂ nu da răspunsul direct sau soluția completă.
2. La orice întrebare, răspunde cu o întrebare ghidatoare care îl ajută pe elev să gândească primul pas.
3. Ghidează prin câte UN singur pas la un moment dat — nu face mai mulți pași deodată.
4. Când elevul răspunde corect, confirmă scurt și cere pasul următor.
5. Când elevul greșește, NU dezvălui răspunsul corect — întreabă o întrebare care îl face să observe singur eroarea.
6. Termină FIECARE răspuns cu o întrebare adresată elevului.
7. Răspunde în română (sau rusă dacă elevul scrie în rusă).`;

// ─────────────────────────────────────────────
// GRADE BAND CONTEXT
// ─────────────────────────────────────────────

function getGradeBandContext(grade: number | null): string {
  if (!grade) return '';
  if (grade <= 7) return 'Nivel: gimnaziu inferior (cl. V-VII). Folosește vocabular simplu și exemple concrete din viața cotidiană. Evită terminologia tehnică fără explicație prealabilă. Pașii trebuie să fie foarte mici și clari. Adaptează limbajul la vârsta de 11-13 ani.';
  if (grade <= 10) return 'Nivel: gimnaziu superior / liceu inferior (cl. VIII-X). Folosește terminologia corectă a materiei. Poți face referire la concepte studiate anterior. Încurajează conexiuni între capitole și gândirea analitică.';
  return 'Nivel: liceu superior, pregătire BAC (cl. XI-XII). Folosește limbajul și rigorile examenului de Bacalaureat moldovenesc. Cere demonstrații complete și argumentare formală. Pregătește elevul pentru cerințele BAC.';
}

// ─────────────────────────────────────────────
// VARK LEARNING STYLE MODIFIERS
// ─────────────────────────────────────────────

function getVARKModifier(learning_style: string | null): string {
  if (!learning_style) return '';
  const s = learning_style.toLowerCase();
  if (s.includes('vizual') || s === 'v') return 'Stilul de învățare al elevului este VIZUAL. Când explici: structurează răspunsul în blocuri vizuale clare, descrie tabele comparative, scheme cu săgeți și diagrame în format text. Organizează informația în pași numerotați cu titluri clare.';
  if (s.includes('auditiv') || s === 'a') return 'Stilul de învățare al elevului este AUDITIV. Explică folosind analogii verbale și povești. Vorbește ca și cum ai explica unui prieten. Folosește repetiție și rezumare: "Deci, ca să recapitulăm...". Preferă explicațiile în propoziții complete.';
  if (s.includes('citit') || s.includes('scris') || s === 'r') return 'Stilul de învățare al elevului este CITIT/SCRIS. Începe întotdeauna cu definiția formală, apoi elaborează. Oferă liste numerotate și structuri clare cu termeni tehnici definiți. Încurajează elevul să scrie pașii cu mâna lui.';
  if (s.includes('kinestez') || s === 'k') return 'Stilul de învățare al elevului este KINESTEZIC. Dă întotdeauna un exemplu concret rezolvat înainte de teorie. Cere elevului să aplice imediat pe un exercițiu similar. Leagă fiecare concept de o acțiune, experiment sau situație reală din viața lui.';
  return '';
}

// ─────────────────────────────────────────────
// DIFFICULTY MODIFIER
// ─────────────────────────────────────────────

function getDifficultyModifier(preferred_difficulty: string | null): string {
  if (!preferred_difficulty) return '';
  const d = preferred_difficulty.toLowerCase();
  if (d.includes('ușor') || d === 'easy') return 'Nivel dificultate: UȘOR. Oferă mai mult scaffolding. Dacă elevul este blocat după 2 încercări, sugerează primul pas. Folosește exemple foarte simple și verifică des înțelegerea.';
  if (d.includes('dificil') || d === 'hard') return 'Nivel dificultate: DIFICIL. Oferă minim scaffolding. Nu sugera pașii — pune doar întrebări. Dacă elevul cere ajutor direct, răspunde cu o altă întrebare mai precisă. Acceptă răspunsuri incomplete doar ca punct de plecare pentru întrebări ulterioare.';
  return '';
}

// ─────────────────────────────────────────────
// LANGUAGE INSTRUCTION
// ─────────────────────────────────────────────

function getLanguageInstruction(language: string | null): string {
  if (language === 'ru') return 'IMPORTANT: Răspunde MEREU în limba RUSĂ, indiferent de limba în care scrie elevul. Nu schimba niciodată limba răspunsului.';
  return '';
}

// ─────────────────────────────────────────────
// STUDY GOAL MODIFIER
// ─────────────────────────────────────────────

function getStudyGoalModifier(study_goal: string | null): string {
  if (!study_goal) return '';
  if (study_goal === 'bac') return 'Elevul se pregătește pentru BAC. Prioritizează formatul și tipologia subiectelor de BAC. Când explici o formulă sau tehnică, menționează explicit dacă apare frecvent la examen și în ce formă.';
  if (study_goal === 'teme') return 'Elevul are nevoie de ajutor cu temele. Focusează-te pe problema concretă din față. Nu divaga la concepte adiacente dacă nu sunt strict necesare pentru rezolvarea temei curente.';
  if (study_goal === 'recuperare') return 'Elevul recuperează materie din urmă. Verifică explicit înțelegerea conceptelor de bază înainte de a avansa. Nu presupune cunoștințe anterioare. Fii răbdător și celebrează fiecare progres mic.';
  if (study_goal === 'intelegere') return 'Elevul vrea înțelegere profundă, nu doar răspunsuri. Explică mereu "de ce" înainte de "cum". Conectează conceptul nou cu ce știe deja elevul și cu situații din viața reală.';
  return '';
}

// ─────────────────────────────────────────────
// WEAK SUBJECT MODIFIER
// ─────────────────────────────────────────────

function getWeakSubjectModifier(weak_subjects: string[] | null, current_subject: string | null): string {
  if (!weak_subjects || !current_subject) return '';
  const isWeak = weak_subjects.some(s =>
    current_subject.toLowerCase().includes(s.toLowerCase()) ||
    s.toLowerCase().includes(current_subject.toLowerCase())
  );
  if (isWeak) return 'Aceasta este o materie în care elevul întâmpină dificultăți. Oferă mai mult scaffolding decât de obicei. Nu presupune cunoștințe prealabile. Propune un hint înainte ca elevul să ceară. Celebrează fiecare răspuns corect, chiar și parțial.';
  return '';
}

// ─────────────────────────────────────────────
// DAILY TIME MODIFIER
// ─────────────────────────────────────────────

function getDailyTimeModifier(daily_study_time: string | null): string {
  if (!daily_study_time) return '';
  if (daily_study_time === '15min') return 'Elevul are doar ~15 minute de studiu pe zi. Fii concis: ajunge la miezul problemei în maxim 2 propoziții. Nu introduce concepte colaterale dacă nu sunt strict necesare.';
  if (daily_study_time === '1ora+') return 'Elevul are timp extins pentru studiu. Poți explora conexiuni cu alte concepte, oferi exemple suplimentare și aprofunda aspecte care nu sunt cerute explicit.';
  return '';
}

// ─────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────

export function buildSystemPrompt(
  profile: UserProfile,
  mode: 'learning' | 'quick'
): string {
  const grade = profile.grade ?? 9;
  const subject = profile.subject ?? '';
  const gradeStr = String(grade);

  if (mode === 'quick') {
    const gradeBand = getGradeBandContext(profile.grade);
    const currContext = getCurriculumContext(subject, grade);
    const lines = [
      `Ești un tutor pentru un elev din clasa ${gradeStr}, la materia ${subject || 'n/a'}, conform curriculumului moldovenesc.`,
      `MODUL RĂSPUNS RAPID — Oferă soluția completă și directă, cu TOȚI pașii de rezolvare. NU pune întrebări elevului, NU ghida prin întrebări, NU aplica metoda Socratică. Rezolvă complet și arată tot. Răspunde în ${profile.language === 'ru' ? 'rusă' : 'română'}.`,
      gradeBand,
      currContext,
      FORMAT_RULES_QUICK,
    ].filter(Boolean);
    return lines.join('\n\n');
  }

  // Learning mode — full personalized prompt
  // Check for grade-specific matematică templates
  let subjectKey: string | undefined;
  if (subject.toLowerCase().includes('matematic')) {
    if (grade <= 5) subjectKey = 'matematică_5';
    else if (grade === 6) subjectKey = 'matematică_6';
    else if (grade === 7) subjectKey = 'matematică_7';
    else if (grade === 8) subjectKey = 'matematică_8';
    else if (grade === 9) subjectKey = 'matematică_9';
    else if (grade === 10) subjectKey = 'matematică_10';
    else if (grade === 11) subjectKey = 'matematică_11';
    else subjectKey = 'matematică_12';
    // Fall back to matematică_12 if grade-specific doesn't exist yet
    if (!SUBJECT_LEARNING_TEMPLATES[subjectKey]) {
      subjectKey = 'matematică_12';
    }
  } else if (subject.toLowerCase().includes('biol')) {
    if (grade === 6) subjectKey = 'biologie_6';
    else if (grade === 7) subjectKey = 'biologie_7';
    else if (grade === 8) subjectKey = 'biologie_8';
    else if (grade === 9) subjectKey = 'biologie_9';
    else if (grade === 10) subjectKey = 'biologie_10';
    else if (grade === 11) subjectKey = 'biologie_11';
    else subjectKey = 'biologie_12'; // grade 12 și fallback
    if (!SUBJECT_LEARNING_TEMPLATES[subjectKey]) {
      subjectKey = Object.keys(SUBJECT_LEARNING_TEMPLATES).find(k =>
        subject.toLowerCase().includes(k)
      );
    }
  } else if (subject.toLowerCase().includes('chim')) {
    if (grade === 7) subjectKey = 'chimie_7';
    else if (grade === 8) subjectKey = 'chimie_8';
    else if (grade === 9) subjectKey = 'chimie_9';
    else if (grade === 10) subjectKey = 'chimie_10';
    else if (grade === 11) subjectKey = 'chimie_11';
    else subjectKey = 'chimie_12';
    if (!SUBJECT_LEARNING_TEMPLATES[subjectKey]) {
      subjectKey = Object.keys(SUBJECT_LEARNING_TEMPLATES).find(k =>
        subject.toLowerCase().includes(k.replace(/_\d+$/, ''))
      );
    }
  } else if (subject.toLowerCase().includes('informatic') || subject.toLowerCase().includes('informatică')) {
    if (grade === 7) subjectKey = 'informatică_7';
    else if (grade === 8) subjectKey = 'informatică_8';
    else if (grade === 9) subjectKey = 'informatică_9';
    else if (grade === 10) subjectKey = 'informatică_10';
    else if (grade === 11) subjectKey = 'informatica_11';
    else {
      const subLower = subject.toLowerCase();
      if (subLower.includes('prelucrari') || subLower.includes('liste'))
        subjectKey = 'informatica_12_Prelucrari_avansate_baze_de_date';
      else if (subLower.includes('extensii') || subLower.includes('newton') || subLower.includes('trapeze'))
        subjectKey = 'informatica_12_Extensii';
      else if (subLower.includes('umanistic') || subLower.includes('chestionar'))
        subjectKey = 'informatica_12_Metode_experimentale_stiinte_umanistice';
      else if (subLower.includes('web') || subLower.includes('javascript'))
        subjectKey = 'informatica_12_Programarea_WEB';
      else if (subLower.includes('pascal') && !subLower.includes('c++'))
        subjectKey = 'informatica_12_Structuri_dinamice_de_date_în_PASCAL';
      else if (subLower.includes('c++'))
        subjectKey = 'informatica_12_Structuri_dinamice_de_date_în_C_CPP';
      else subjectKey = 'informatica_12';
    }
    if (!SUBJECT_LEARNING_TEMPLATES[subjectKey]) {
      subjectKey = Object.keys(SUBJECT_LEARNING_TEMPLATES).find(k =>
        subject.toLowerCase().includes(k.replace(/_\d+$/, ''))
      );
    }
  } else if (subject.toLowerCase().includes('fizic')) {
    if (grade <= 6) subjectKey = 'fizică_6';
    else if (grade === 7) subjectKey = 'fizică_7';
    else if (grade === 8) subjectKey = 'fizică_8';
    else if (grade === 9) subjectKey = 'fizică_9';
    else if (grade === 10) subjectKey = 'fizică_10';
    else if (grade === 11) subjectKey = 'fizică_11';
    else subjectKey = 'fizică_12';
    if (!SUBJECT_LEARNING_TEMPLATES[subjectKey]) {
      subjectKey = Object.keys(SUBJECT_LEARNING_TEMPLATES).find(k =>
        subject.toLowerCase().includes(k.replace(/_\d+$/, ''))
      );
    }
  } else if (subject.toLowerCase().includes('geograf')) {
    if (grade <= 5) subjectKey = 'geografie_5';
    else if (grade === 6) subjectKey = 'geografie_6';
    else if (grade === 7) subjectKey = 'geografie_7';
    else if (grade === 8) subjectKey = 'geografie_8';
    else if (grade === 9) subjectKey = 'geografie_9';
    else if (grade === 10) subjectKey = 'geografie_10';
    else if (grade === 11) subjectKey = 'geografie_11';
    else subjectKey = 'geografie_12';
    if (!SUBJECT_LEARNING_TEMPLATES[subjectKey]) {
      subjectKey = 'geografie';
    }
  } else if (subject.toLowerCase().includes('român') || subject.toLowerCase().includes('limba') || subject.toLowerCase().includes('literat')) {
    if (grade <= 5) subjectKey = 'română_5';
    else if (grade === 6) subjectKey = 'română_6';
    else if (grade === 7) subjectKey = 'română_7';
    else if (grade === 8) subjectKey = 'română_8';
    else if (grade === 9) subjectKey = 'română_9';
    else if (grade === 10) subjectKey = 'română_10';
    else if (grade === 11) subjectKey = 'română_11';
    else subjectKey = 'română_12';
    if (!SUBJECT_LEARNING_TEMPLATES[subjectKey]) {
      subjectKey = Object.keys(SUBJECT_LEARNING_TEMPLATES).find(k =>
        k.startsWith('română')
      );
    }
  } else if (subject.toLowerCase().includes('istor')) {
    if (grade <= 5) subjectKey = 'istorie_5';
    else if (grade === 6) subjectKey = 'istorie_6';
    else if (grade === 7) subjectKey = 'istorie_7';
    else if (grade === 8) subjectKey = 'istorie_8';
    else if (grade === 9) subjectKey = 'istorie_9';
    else if (grade === 10) subjectKey = 'istorie_10';
    else if (grade === 11) subjectKey = 'istorie_11';
    else subjectKey = 'istorie_12';
    if (!SUBJECT_LEARNING_TEMPLATES[subjectKey]) {
      subjectKey = Object.keys(SUBJECT_LEARNING_TEMPLATES).find(k =>
        k.startsWith('istorie')
      );
    }
  } else {
    subjectKey = Object.keys(SUBJECT_LEARNING_TEMPLATES).find(k =>
      subject.toLowerCase().includes(k)
    );
  }

  let baseTemplate = subjectKey
    ? SUBJECT_LEARNING_TEMPLATES[subjectKey]
    : DEFAULT_LEARNING_TEMPLATE;

  baseTemplate = baseTemplate
    .replace('{grade}', gradeStr)
    .replace('{subject}', subject);

  // Remove hardcoded Romanian language rules when a different language is selected
  if (profile.language && profile.language !== 'ro') {
    baseTemplate = baseTemplate.replace(/\d+\. Răspunde EXCLUSIV în limba română\.\n?/g, '');
  }

  const currContext = getCurriculumContext(subject, grade);
  const gradeBand = getGradeBandContext(profile.grade);
  const varkMod = getVARKModifier(profile.learning_style);
  const diffMod = getDifficultyModifier(profile.preferred_difficulty);
  const langInstr = getLanguageInstruction(profile.language ?? null);
  const goalMod = getStudyGoalModifier(profile.study_goal ?? null);
  const weakMod = getWeakSubjectModifier(profile.weak_subjects ?? null, subject);
  const timeMod = getDailyTimeModifier(profile.daily_study_time ?? null);

  const contextLines: string[] = [];
  if (profile.current_topics) contextLines.push(`Temele studiate în prezent: ${profile.current_topics}.`);
  if (profile.test_schedule) contextLines.push(`Programul testelor: ${profile.test_schedule}.`);

  const EVAL_INSTRUCTION = `EVALUARE AUTOMATĂ (invizibil pentru elev):
La sfârșitul FIECĂRUI răspuns adaugă exact un tag în formatul [EVAL:N] unde N este:
- [EVAL:1] dacă elevul a recunoscut sau a spus că înțelege, fără să arate rezolvarea
- [EVAL:2] dacă elevul a încercat să explice sau să rezolve pas cu pas
- [EVAL:3] dacă elevul a demonstrat raționament independent clar sau a explicat conceptul înapoi
Nu menționezi evaluarea elevului. Adaugă tag-ul la finalul răspunsului, pe aceeași linie.`;

  const sections = [
    langInstr,
    baseTemplate,
    currContext,
    gradeBand,
    varkMod,
    diffMod,
    goalMod,
    weakMod,
    timeMod,
    contextLines.join('\n'),
    FORMAT_RULES,
    EVAL_INSTRUCTION,
  ].filter(Boolean);

  return sections.join('\n\n');
}
