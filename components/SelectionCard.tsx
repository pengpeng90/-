import { FC } from 'react';

interface SelectionCardProps {
  id: string;
  label: string;
  description?: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const SelectionCard: FC<SelectionCardProps> = ({
  label,
  description,
  icon,
  selected,
  onClick,
  disabled
}) => {
  // Check if icon is an image URL (http, data URI, or local path starting with /)
  const isImageUrl = icon.startsWith('http') || icon.startsWith('data:') || icon.startsWith('/');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full text-left p-3 rounded-xl transition-all duration-300 transform
        flex items-center gap-3
        ${
          selected
            ? 'bg-white ring-4 ring-blue-500 shadow-xl scale-[1.02] z-10'
            : 'bg-white/80 hover:bg-white hover:shadow-lg hover:-translate-y-1'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className={`
        flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm
        ${selected ? 'bg-blue-50' : 'bg-slate-100'}
      `}>
        {isImageUrl ? (
            <img src={icon} alt={label} className="w-full h-full object-cover" />
        ) : (
            <span className="text-2xl">{icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-800 text-base truncate">{label}</h3>
        {description && <p className="text-xs text-slate-500 line-clamp-2">{description}</p>}
      </div>
      {selected && (
        <div className="absolute top-3 right-3 text-teal-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};