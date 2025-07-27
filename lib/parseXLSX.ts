import * as XLSX from 'xlsx';

interface ParsedRow {
  [key: string]: string | undefined;
  ClientID?: string;
  WorkerID?: string;
  TaskID?: string;
}

export async function parseXLSX(arrayBuffer: ArrayBuffer): Promise<ParsedRow[]> {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });

  const headers = (data[0] as string[]) || [];
  const rows = data.slice(1).map((row: string[]) =>
    headers.reduce((obj, header, i) => {
      obj[header] = row[i]?.toString();
      return obj;
    }, {} as ParsedRow)
  );

 
  return rows.filter(row => row.ClientID || row.WorkerID || row.TaskID);
}