import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid';

type Props = {
  rows: any[];
  columns: GridColDef[];
  title: string;
  onRowUpdate?: (newRow: any, oldRow: any) => void;
};

export default function DataGridEditor({ rows, columns, title, onRowUpdate }: Props) {
  const rowsWithId = rows
    .filter(row => {
      const hasValidId = row.ClientID || row.WorkerID || row.TaskID;
      if (!hasValidId) {
        return false;
      }
      return true;
    })
    .map((row, index) => {
      if (!row.id) {
        return {
          ...row,
          id: row.ClientID || row.WorkerID || row.TaskID || `row-${title}-${index}`,
        };
      }
      return row;
    });

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div style={{ height: 400 }}>
        <DataGrid
          rows={rowsWithId}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          processRowUpdate={(newRow, oldRow) => {
            if (onRowUpdate) onRowUpdate(newRow, oldRow);
            return newRow;
          }}
          onProcessRowUpdateError={(error) => console.error(`Row update error in ${title}:`, error)}
          getCellClassName={(params: GridCellParams) => {
            return params.field === 'id' ? '' : params.value === '' || params.value == null ? 'bg-red-100' : '';
          }}
        />
      </div>
    </div>
  );
}