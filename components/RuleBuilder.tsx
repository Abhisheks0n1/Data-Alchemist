import { useState } from 'react';
import { Rule } from '../types';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

type Props = {
  onAddRule: (rule: Rule) => void;
  onNaturalLanguageRule: (query: string) => void;
};

export default function RuleBuilder({ onAddRule, onNaturalLanguageRule }: Props) {
  const [type, setType] = useState('');
  const [tasks, setTasks] = useState('');
  const [group, setGroup] = useState('');
  const [minCommonSlots, setMinCommonSlots] = useState('');
  const [maxSlotsPerPhase, setMaxSlotsPerPhase] = useState('');
  const [allowedPhases, setAllowedPhases] = useState('');
  const [pattern, setPattern] = useState('');
  const [overrideType, setOverrideType] = useState<'global' | 'specific'>('global');
  const [priority, setPriority] = useState('');
  const [nlQuery, setNlQuery] = useState('');

  const handleSubmit = () => {
    const rule: Rule = {
      type,
      ...(tasks && { tasks: tasks.split(',').map(t => t.trim()) }),
      ...(group && { group }),
      ...(minCommonSlots && { minCommonSlots: parseInt(minCommonSlots) }),
      ...(maxSlotsPerPhase && { maxSlotsPerPhase: parseInt(maxSlotsPerPhase) }),
      ...(allowedPhases && { allowedPhases: allowedPhases.split(',').map(Number) }),
      ...(pattern && { pattern }),
      ...(overrideType && { overrideType }),
      ...(priority && { priority: parseInt(priority) }),
    };
    onAddRule(rule);
    setType('');
    setTasks('');
    setGroup('');
    setMinCommonSlots('');
    setMaxSlotsPerPhase('');
    setAllowedPhases('');
    setPattern('');
    setOverrideType('global');
    setPriority('');
  };

  const handleNaturalLanguageSubmit = () => {
    if (nlQuery) {
      onNaturalLanguageRule(nlQuery);
      setNlQuery('');
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Add Business Rule</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl fullWidth>
          <InputLabel>Rule Type</InputLabel>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <MenuItem value="coRun">Co-run</MenuItem>
            <MenuItem value="slotRestriction">Slot Restriction</MenuItem>
            <MenuItem value="loadLimit">Load Limit</MenuItem>
            <MenuItem value="phaseWindow">Phase Window</MenuItem>
            <MenuItem value="patternMatch">Pattern Match</MenuItem>
            <MenuItem value="precedenceOverride">Precedence Override</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Tasks (comma-separated)"
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
          fullWidth
        />
        <TextField label="Group" value={group} onChange={(e) => setGroup(e.target.value)} fullWidth />
        <TextField
          label="Min Common Slots"
          value={minCommonSlots}
          onChange={(e) => setMinCommonSlots(e.target.value)}
          type="number"
          fullWidth
        />
        <TextField
          label="Max Slots Per Phase"
          value={maxSlotsPerPhase}
          onChange={(e) => setMaxSlotsPerPhase(e.target.value)}
          type="number"
          fullWidth
        />
        <TextField
          label="Allowed Phases (comma-separated)"
          value={allowedPhases}
          onChange={(e) => setAllowedPhases(e.target.value)}
          fullWidth
        />
        <TextField label="Pattern (regex)" value={pattern} onChange={(e) => setPattern(e.target.value)} fullWidth />
        <FormControl fullWidth>
          <InputLabel>Override Type</InputLabel>
          <Select value={overrideType} onChange={(e) => setOverrideType(e.target.value as 'global' | 'specific')}>
            <MenuItem value="global">Global</MenuItem>
            <MenuItem value="specific">Specific</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          type="number"
          fullWidth
        />
      </div>
      <Button variant="contained" color="primary" onClick={handleSubmit} className="mt-4">
        Add Rule
      </Button>
      <div className="mt-4">
        <TextField
          label="Natural Language Rule"
          value={nlQuery}
          onChange={(e) => setNlQuery(e.target.value)}
          fullWidth
          placeholder="e.g., Tasks T1 and T2 must run together"
        />
        <Button variant="contained" color="secondary" onClick={handleNaturalLanguageSubmit} className="mt-2">
          Add Natural Language Rule
        </Button>
      </div>
    </div>
  );
}