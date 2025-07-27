import { useState } from 'react';
import { TextField, Button } from '@mui/material';

type Props = {
  onSearch: (query: string) => void;
};

export default function NaturalLanguageSearch({ onSearch }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    <div className="my-4 flex gap-2">
      <TextField
        label="Search Tasks"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        placeholder="e.g., Tasks with Duration > 1 and phase 2 in PreferredPhases"
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Search
      </Button>
    </div>
  );
}
