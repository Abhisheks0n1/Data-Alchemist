import Papa from 'papaparse';

interface ParsedRow {
  [key: string]: string | undefined;
  ClientID?: string;
  WorkerID?: string;
  TaskID?: string;
}

export function parseCSV(text: string): ParsedRow[] {
  const { data, errors } = Papa.parse<ParsedRow>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  

  const filteredData = data.filter(row => {
    const hasValidId = row.ClientID || row.WorkerID || row.TaskID;
    const hasExtra = '__parsed_extra' in row;
    if (!hasValidId || hasExtra) {
       return false;
    }
    return true;
  });

  return filteredData;
}