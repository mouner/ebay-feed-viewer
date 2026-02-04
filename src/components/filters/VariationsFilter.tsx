import { useFilterStore } from '../../stores/filterStore';

export function VariationsFilter() {
  const { variations, setVariations } = useFilterStore();

  const options = [
    { value: 'all', label: 'All Products' },
    { value: 'with_variations', label: 'With Variations' },
    { value: 'without_variations', label: 'Without Variations' },
  ] as const;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Variations
      </label>
      <div className="space-y-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer py-1"
          >
            <input
              type="radio"
              name="variations"
              value={option.value}
              checked={variations === option.value}
              onChange={() => setVariations(option.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
