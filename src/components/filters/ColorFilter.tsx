import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useFilterStore } from '../../stores/filterStore';
import { useProductStore } from '../../stores/productStore';

// Color name to hex mapping for common colors
const colorMap: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  pink: '#ec4899',
  grey: '#6b7280',
  gray: '#6b7280',
  brown: '#92400e',
  beige: '#d2b48c',
  navy: '#1e3a5f',
  cream: '#fffdd0',
  gold: '#ffd700',
  silver: '#c0c0c0',
  tan: '#d2b48c',
  teal: '#14b8a6',
  coral: '#ff7f50',
  turquoise: '#40e0d0',
  maroon: '#800000',
  olive: '#808000',
  mint: '#98ff98',
  lavender: '#e6e6fa',
  charcoal: '#36454f',
  burgundy: '#800020',
  rose: '#ff007f',
  aqua: '#00ffff',
  ivory: '#fffff0',
  natural: '#f5f5dc',
  walnut: '#5d3a1a',
  oak: '#b8860b',
  espresso: '#3c1414',
};

function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  // Check if the color name contains any known color
  for (const [name, hex] of Object.entries(colorMap)) {
    if (normalized.includes(name)) {
      return hex;
    }
  }
  // Generate a hash-based color for unknown colors
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 60%, 50%)`;
}

export function ColorFilter() {
  const { colors, setColors } = useFilterStore();
  const availableColors = useProductStore((state) => state.colors);

  const [isExpanded, setIsExpanded] = useState(true);

  if (availableColors.length === 0) return null;

  const toggleColor = (color: string) => {
    if (colors.includes(color)) {
      setColors(colors.filter((c) => c !== color));
    } else {
      setColors([...colors, color]);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span className="flex items-center gap-2">
          Colors
          {colors.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              {colors.length}
            </span>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {availableColors.map((color) => {
              const isSelected = colors.includes(color);
              const hexColor = getColorHex(color);
              const isLight = hexColor === '#ffffff' || hexColor === '#fffdd0' || hexColor === '#fffff0' || hexColor === '#f5f5dc';
              const displayName = color.charAt(0).toUpperCase() + color.slice(1);

              return (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`
                    flex flex-col items-center gap-1 p-1 rounded-lg transition-colors
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                  title={displayName}
                >
                  <div
                    className={`
                      relative w-6 h-6 rounded-full
                      ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900' : ''}
                      ${isLight ? 'border border-gray-300 dark:border-gray-600' : ''}
                    `}
                    style={{ backgroundColor: hexColor }}
                  >
                    {isSelected && (
                      <span
                        className={`absolute inset-0 flex items-center justify-center text-xs ${
                          isLight ? 'text-gray-800' : 'text-white'
                        }`}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 max-w-[60px] truncate">
                    {displayName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Colors Labels */}
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {colors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {color}
                  <button
                    onClick={() => toggleColor(color)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
