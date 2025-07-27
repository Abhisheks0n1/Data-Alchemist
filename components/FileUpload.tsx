import { parseCSV } from '../lib/parseCSV';
import { parseXLSX } from '../lib/parseXLSX';

type Props = {
  onDataParsed: (entity: string, data: any[]) => void;
};

export default function FileUpload({ onDataParsed }: Props) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const entity = file.name.includes('clients') ? 'clients' : file.name.includes('tasks') ? 'tasks' : 'workers';
    let data: any[] = [];

    try {
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        data = parseCSV(text);
      } else if (file.name.endsWith('.xlsx')) {
        const arrayBuffer = await file.arrayBuffer();
        data = await parseXLSX(arrayBuffer);
      }
      onDataParsed(entity, data);
    } catch (error) {
      alert(`Failed to parse ${file.name}. Check for details.`);
    }
  };

  return (
    <div className="my-4">
      <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-xs" />
    </div>
  );
}