export default function GeoSurveyLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="-90 -90 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="0" cy="0" r="80" stroke="#4A80F5" strokeWidth="4"/>
      <ellipse cx="0" cy="0" rx="35" ry="80" stroke="#4A80F5" strokeWidth="2.5"/>
      <line x1="-80" y1="0" x2="80" y2="0" stroke="#4A80F5" strokeWidth="2.5"/>
      <line x1="-70" y1="-30" x2="70" y2="-30" stroke="#4A80F5" strokeWidth="1.5"/>
      <line x1="-70" y1="30" x2="70" y2="30" stroke="#4A80F5" strokeWidth="1.5"/>
      <polyline points="-55,35 -25,-10 10,15 50,-35" stroke="#2D5FCC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="-55" cy="35" r="6" fill="#2D5FCC"/>
      <circle cx="-25" cy="-10" r="6" fill="#2D5FCC"/>
      <circle cx="10" cy="15" r="6" fill="#2D5FCC"/>
      <circle cx="50" cy="-35" r="6" fill="#2D5FCC"/>
      <circle cx="-55" cy="35" r="3" fill="#fff"/>
      <circle cx="-25" cy="-10" r="3" fill="#fff"/>
      <circle cx="10" cy="15" r="3" fill="#fff"/>
      <circle cx="50" cy="-35" r="3" fill="#fff"/>
    </svg>
  )
}