export type MathSymbol = {
  id: string
  display: string
  latex: string
  label: string
  cursorBack?: number
}

export type SymbolCategory = {
  id: string
  label: string
  icon: string
  symbols: MathSymbol[]
}

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    id: 'math',
    label: 'Matematică',
    icon: '∑',
    symbols: [
      { id: 'times', display: '×', latex: '\\times ', label: 'înmulțire' },
      { id: 'div', display: '÷', latex: '\\div ', label: 'împărțire' },
      { id: 'pm', display: '±', latex: '\\pm ', label: 'plus sau minus' },
      { id: 'neq', display: '≠', latex: '\\neq ', label: 'diferit de' },
      { id: 'approx', display: '≈', latex: '\\approx ', label: 'aproximativ' },
      { id: 'leq', display: '≤', latex: '\\leq ', label: 'mai mic sau egal' },
      { id: 'geq', display: '≥', latex: '\\geq ', label: 'mai mare sau egal' },
      { id: 'sq', display: 'x²', latex: '^{2}', label: 'la puterea 2' },
      { id: 'cu', display: 'x³', latex: '^{3}', label: 'la puterea 3' },
      { id: 'pow', display: 'xⁿ', latex: '^{}', label: 'la puterea n', cursorBack: 1 },
      { id: 'sqrt', display: '√', latex: '\\sqrt{}', label: 'radical', cursorBack: 1 },
      { id: 'cbrt', display: '∛', latex: '\\sqrt[3]{}', label: 'radical cubic', cursorBack: 1 },
      { id: 'nrt', display: 'ⁿ√', latex: '\\sqrt[]{}', label: 'radical de ordinul n', cursorBack: 3 },
      { id: 'frac', display: 'a/b', latex: '\\frac{}{}', label: 'fracție', cursorBack: 3 },
      { id: 'abs', display: '|x|', latex: '|{}|', label: 'modul', cursorBack: 2 },
      { id: 'inf', display: '∞', latex: '\\infty ', label: 'infinit' },
      { id: 'int', display: '∫', latex: '\\int ', label: 'integrală nedefinită' },
      { id: 'dint', display: '∫ᵃᵇ', latex: '\\int ', label: 'integrală definită' },
      { id: 'partial', display: '∂', latex: '\\partial ', label: 'derivată parțială' },
      { id: 'lim', display: 'lim', latex: '\\lim ', label: 'limită' },
      { id: 'sum', display: '∑', latex: '\\sum ', label: 'sumă' },
      { id: 'prod', display: '∏', latex: '\\prod ', label: 'produs' },
      { id: 'dx', display: 'dx', latex: '\\,dx', label: 'dx' },
      { id: 'sin', display: 'sin', latex: '\\sin ', label: 'sinus' },
      { id: 'cos', display: 'cos', latex: '\\cos ', label: 'cosinus' },
      { id: 'tan', display: 'tg', latex: '\\tan ', label: 'tangentă' },
      { id: 'arcsin', display: 'arcsin', latex: '\\arcsin ', label: 'arcsin' },
      { id: 'arccos', display: 'arccos', latex: '\\arccos ', label: 'arccos' },
      { id: 'arctan', display: 'arctg', latex: '\\arctan ', label: 'arctg' },
      { id: 'log', display: 'log', latex: '\\log ', label: 'logaritm' },
      { id: 'loga', display: 'logₐ', latex: '\\log_{} ', label: 'logaritm în baza a', cursorBack: 2 },
      { id: 'ln', display: 'ln', latex: '\\ln ', label: 'logaritm natural' },
      { id: 'angle', display: '∠', latex: '\\angle ', label: 'unghi' },
      { id: 'perp', display: '⊥', latex: '\\perp ', label: 'perpendicular' },
      { id: 'par', display: '∥', latex: '\\parallel ', label: 'paralel' },
      { id: 'deg', display: '°', latex: '^{\\circ} ', label: 'grade' },
      { id: 'tri', display: '△', latex: '\\triangle ', label: 'triunghi' },
      { id: 'to', display: '→', latex: '\\to ', label: 'tinde la' },
      { id: 'imp', display: '⟹', latex: '\\Rightarrow ', label: 'implică' },
      { id: 'iff', display: '⟺', latex: '\\Leftrightarrow ', label: 'dacă și numai dacă' },
      { id: 'in', display: '∈', latex: '\\in ', label: 'aparține' },
      { id: 'nin', display: '∉', latex: '\\notin ', label: 'nu aparține' },
      { id: 'sub', display: '⊂', latex: '\\subset ', label: 'submulțime' },
      { id: 'cup', display: '∪', latex: '\\cup ', label: 'reuniune' },
      { id: 'cap', display: '∩', latex: '\\cap ', label: 'intersecție' },
      { id: 'empty', display: '∅', latex: '\\emptyset ', label: 'mulțimea vidă' },
      { id: 'R', display: 'ℝ', latex: '\\mathbb{R} ', label: 'numere reale' },
      { id: 'Z', display: 'ℤ', latex: '\\mathbb{Z} ', label: 'numere întregi' },
      { id: 'N', display: 'ℕ', latex: '\\mathbb{N} ', label: 'numere naturale' },
      { id: 'Q', display: 'ℚ', latex: '\\mathbb{Q} ', label: 'numere raționale' },
    ],
  },
  {
    id: 'chemistry',
    label: 'Chimie',
    icon: '⚗',
    symbols: [
      { id: 'rarr', display: '→', latex: '\\rightarrow ', label: 'reacție directă' },
      { id: 'larr', display: '←', latex: '\\leftarrow ', label: 'reacție inversă' },
      { id: 'eqarr', display: '⇌', latex: '\\rightleftharpoons ', label: 'echilibru chimic' },
      { id: 'gas', display: '↑', latex: '\\uparrow ', label: 'gaz degajat' },
      { id: 'ppt', display: '↓', latex: '\\downarrow ', label: 'precipitat' },
      { id: 'sub0', display: '₀', latex: '_0', label: 'indice 0' },
      { id: 'sub1', display: '₁', latex: '_1', label: 'indice 1' },
      { id: 'sub2', display: '₂', latex: '_2', label: 'indice 2' },
      { id: 'sub3', display: '₃', latex: '_3', label: 'indice 3' },
      { id: 'sub4', display: '₄', latex: '_4', label: 'indice 4' },
      { id: 'sub5', display: '₅', latex: '_5', label: 'indice 5' },
      { id: 'sub6', display: '₆', latex: '_6', label: 'indice 6' },
      { id: 'sub7', display: '₇', latex: '_7', label: 'indice 7' },
      { id: 'sub8', display: '₈', latex: '_8', label: 'indice 8' },
      { id: 'sub9', display: '₉', latex: '_9', label: 'indice 9' },
      { id: 'chpos', display: '⁺', latex: '^+', label: 'sarcină pozitivă' },
      { id: 'chneg', display: '⁻', latex: '^-', label: 'sarcină negativă' },
      { id: 'ch2p', display: '²⁺', latex: '^{2+}', label: 'sarcină 2+' },
      { id: 'ch3p', display: '³⁺', latex: '^{3+}', label: 'sarcină 3+' },
      { id: 'ch2n', display: '²⁻', latex: '^{2-}', label: 'sarcină 2-' },
      { id: 'delta', display: 'Δ', latex: '\\Delta ', label: 'delta / căldură' },
      { id: 'dH', display: 'ΔH', latex: '\\Delta H ', label: 'variație entalpie' },
      { id: 'dG', display: 'ΔG', latex: '\\Delta G ', label: 'energie Gibbs' },
      { id: 'dS', display: 'ΔS', latex: '\\Delta S ', label: 'variație entropie' },
      { id: 'Keq', display: 'Kₑq', latex: 'K_{eq} ', label: 'constanta de echilibru' },
      { id: 'Ka', display: 'Kₐ', latex: 'K_a ', label: 'constanta de aciditate' },
      { id: 'Kb', display: 'Kᵦ', latex: 'K_b ', label: 'constanta de bazicitate' },
      { id: 'Ksp', display: 'Kₛₚ', latex: 'K_{sp} ', label: 'produs de solubilitate' },
      { id: 'pH', display: 'pH', latex: '\\text{pH} ', label: 'pH' },
      { id: 'pOH', display: 'pOH', latex: '\\text{pOH} ', label: 'pOH' },
      { id: 'mol', display: 'mol', latex: '\\text{ mol}', label: 'moli' },
      { id: 'gmol', display: 'g/mol', latex: '\\text{ g/mol}', label: 'grame pe mol' },
      { id: 'moll', display: 'mol/L', latex: '\\text{ mol/L}', label: 'molaritate' },
      { id: 'cdot', display: '·', latex: '\\cdot ', label: 'punct de înmulțire' },
      { id: 'pct', display: '%', latex: '\\% ', label: 'procent' },
      { id: 'nu_c', display: 'ν', latex: '\\nu ', label: 'frecvență' },
      { id: 'lambda_c', display: 'λ', latex: '\\lambda ', label: 'lungime de undă' },
    ],
  },
  {
    id: 'greek',
    label: 'Greacă',
    icon: 'α',
    symbols: [
      { id: 'alpha', display: 'α', latex: '\\alpha ', label: 'alpha' },
      { id: 'beta', display: 'β', latex: '\\beta ', label: 'beta' },
      { id: 'gamma', display: 'γ', latex: '\\gamma ', label: 'gamma' },
      { id: 'delta_l', display: 'δ', latex: '\\delta ', label: 'delta mic' },
      { id: 'epsilon', display: 'ε', latex: '\\varepsilon ', label: 'epsilon' },
      { id: 'zeta', display: 'ζ', latex: '\\zeta ', label: 'zeta' },
      { id: 'eta', display: 'η', latex: '\\eta ', label: 'eta (randament)' },
      { id: 'theta', display: 'θ', latex: '\\theta ', label: 'theta (unghi)' },
      { id: 'kappa', display: 'κ', latex: '\\kappa ', label: 'kappa' },
      { id: 'lambda', display: 'λ', latex: '\\lambda ', label: 'lambda' },
      { id: 'mu', display: 'μ', latex: '\\mu ', label: 'mu (micro)' },
      { id: 'nu', display: 'ν', latex: '\\nu ', label: 'nu (frecvență)' },
      { id: 'xi', display: 'ξ', latex: '\\xi ', label: 'xi' },
      { id: 'pi', display: 'π', latex: '\\pi ', label: 'pi' },
      { id: 'rho', display: 'ρ', latex: '\\rho ', label: 'rho (densitate)' },
      { id: 'sigma_l', display: 'σ', latex: '\\sigma ', label: 'sigma' },
      { id: 'tau', display: 'τ', latex: '\\tau ', label: 'tau' },
      { id: 'phi', display: 'φ', latex: '\\varphi ', label: 'phi' },
      { id: 'chi', display: 'χ', latex: '\\chi ', label: 'chi' },
      { id: 'psi', display: 'ψ', latex: '\\psi ', label: 'psi' },
      { id: 'omega_l', display: 'ω', latex: '\\omega ', label: 'omega' },
      { id: 'Gamma_u', display: 'Γ', latex: '\\Gamma ', label: 'Gamma' },
      { id: 'Delta_u', display: 'Δ', latex: '\\Delta ', label: 'Delta' },
      { id: 'Theta_u', display: 'Θ', latex: '\\Theta ', label: 'Theta' },
      { id: 'Lambda_u', display: 'Λ', latex: '\\Lambda ', label: 'Lambda' },
      { id: 'Pi_u', display: 'Π', latex: '\\Pi ', label: 'Pi' },
      { id: 'Sigma_u', display: 'Σ', latex: '\\Sigma ', label: 'Sigma' },
      { id: 'Phi_u', display: 'Φ', latex: '\\Phi ', label: 'Phi' },
      { id: 'Omega_u', display: 'Ω', latex: '\\Omega ', label: 'Omega' },
    ],
  },
]

const RECENT_KEY = 'tuto_recent_symbols'
const MAX_RECENT = 16

export function getRecentSymbols(): MathSymbol[] {
  if (typeof window === 'undefined') return []
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    const all = SYMBOL_CATEGORIES.flatMap(c => c.symbols)
    return ids.map(id => all.find(s => s.id === id)).filter(Boolean) as MathSymbol[]
  } catch {
    return []
  }
}

export function recordSymbolUsage(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    const updated = [id, ...ids.filter(i => i !== id)].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch {}
}
