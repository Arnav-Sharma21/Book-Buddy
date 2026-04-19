import { SearchIcon, MapPinIcon, BooksIcon, BookOpenIcon, StarFilledIcon, PencilIcon, BarChartIcon, TextIcon } from '../ui/DoodleIcons'

const iconMap = {
  fantasy:     <StarFilledIcon size={14} style={{ marginBottom: '-2px' }} />,
  romance:     <PencilIcon    size={14} style={{ marginBottom: '-2px' }} />,
  'sci-fi':    <SparkleInline size={14} />,
  horror:      <WarningInline  size={14} />,
  mystery:     <SearchIcon    size={14} style={{ marginBottom: '-2px' }} />,
  history:     <BooksIcon     size={14} style={{ marginBottom: '-2px' }} />,
  science:     <BarChartIcon  size={14} style={{ marginBottom: '-2px' }} />,
  math:        <TextIcon      size={14} style={{ marginBottom: '-2px' }} />,
  programming: <TextIcon      size={14} style={{ marginBottom: '-2px' }} />,
  philosophy:  <PencilIcon    size={14} style={{ marginBottom: '-2px' }} />,
  biography:   <BookOpenIcon  size={14} style={{ marginBottom: '-2px' }} />,
  default:     <BookOpenIcon  size={14} style={{ marginBottom: '-2px' }} />,
}

// lightweight inline helpers so we don't add more imports
function SparkleInline({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display:'inline-block', verticalAlign:'middle', marginBottom:'-2px' }}><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="3"/></svg>
}
function WarningInline({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display:'inline-block', verticalAlign:'middle', marginBottom:'-2px' }}><path d="M10.3 3.5L2 20h20L13.7 3.5a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="14"/></svg>
}

export default function GenreIcon({ genre }) {
  const key = genre?.toLowerCase()
  const icon = iconMap[key] || iconMap.default
  return <span title={genre} style={{ display:'inline-flex', alignItems:'center' }}>{icon}</span>
}