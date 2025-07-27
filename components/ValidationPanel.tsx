import { ValidationResult } from '../types';

type Props = {
  results: ValidationResult[];
};

export default function ValidationPanel({ results }: Props) {
  return (
    <div className="my-4 p-4 bg-red-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Validation Errors</h3>
      {results.length === 0 ? (
        <p className="text-green-600">No errors found!</p>
      ) : (
        <ul className="list-disc list-inside">
          {results.map((result, index) => (
            <li key={index} className="text-red-600">
              {result.entity} (row {result.row + 1}): {result.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}