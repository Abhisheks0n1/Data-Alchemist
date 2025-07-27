import RuleBuilder from '../components/RuleBuilder';
import { Rule, Client, Task, Worker, ValidationResult, Correction } from '../types';
import { useState, useCallback, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import DataGridEditor from '../components/DataGridEditor';
import ValidationPanel from '../components/ValidationPanel';
import NaturalLanguageSearch from '../components/NaturalLanguageSearch';
import { GridColDef } from '@mui/x-data-grid';
import { validateClients } from '../validators/clients';
import { validateWorkers } from '../validators/workers';
import { validateTasks } from '../validators/tasks';
import { validateSkillCoverage } from '../validators/skillCoverage';
import { queryAI } from '../lib/queryAI';
import { Button } from '@mui/material';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';



export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [errors, setErrors] = useState<ValidationResult[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[] | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [priorities, setPriorities] = useState({ priorityLevel: 50, taskFulfillment: 30, fairness: 20 });
  const [corrections, setCorrections] = useState<Correction[]>([]);

  const addRule = useCallback((rule: Rule) => setRules(prev => [...prev, rule]), []);

  const handleParsed = useCallback((entity: string, data: any[]) => {
    
    const dataWithId = data
      .filter(item => {
        const hasValidId = item.ClientID || item.WorkerID || item.TaskID;
        if (!hasValidId) {
          
          return false;
        }
        return true;
      })
      .map((item, index) => {
        const id = item.ClientID || item.WorkerID || item.TaskID || `fallback-${entity}-${index}`;
        const normalized: any = {
          ...item,
          id,
          RequestedTaskIDs: typeof item.RequestedTaskIDs === 'string' ? item.RequestedTaskIDs.split(',').map((id: string) => id.trim()) : item.RequestedTaskIDs || [],
          Skills: typeof item.Skills === 'string' ? item.Skills.split(',').map((s: string) => s.trim()) : item.Skills || [],
          AvailableSlots: typeof item.AvailableSlots === 'string' ? JSON.parse(item.AvailableSlots || '[]') : item.AvailableSlots || [],
          PreferredPhases: typeof item.PreferredPhases === 'string' ? parsePhases(item.PreferredPhases) : item.PreferredPhases || [],
          AttributesJSON: typeof item.AttributesJSON === 'string' ? tryParseJSON(item.AttributesJSON) : item.AttributesJSON || {},
          PriorityLevel: typeof item.PriorityLevel === 'string' ? parseInt(item.PriorityLevel) : item.PriorityLevel || 1,
          Duration: typeof item.Duration === 'string' ? parseInt(item.Duration) : item.Duration || 1,
          MaxConcurrent: typeof item.MaxConcurrent === 'string' ? parseInt(item.MaxConcurrent) : item.MaxConcurrent || 1,
          MaxLoadPerPhase: typeof item.MaxLoadPerPhase === 'string' ? parseInt(item.MaxLoadPerPhase) : item.MaxLoadPerPhase || 1,
        };
        return normalized;
      });
   

    if (entity === 'clients') setClients(dataWithId);
    if (entity === 'tasks') setTasks(dataWithId);
    if (entity === 'workers') setWorkers(dataWithId);
  }, []);

  const parsePhases = (phases: string): number[] => {
    try {
      if (phases.includes('-')) {
        const [start, end] = phases.split('-').map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      return JSON.parse(phases);
    } catch {
      return [];
    }
  };

  const tryParseJSON = (json: string): Record<string, any> => {
    try {
      return JSON.parse(json);
    } catch {
      return { error: 'Invalid JSON' };
    }
  };

  const validateAll = useCallback(() => {
    const taskIDs = new Set(tasks.map((t) => t.TaskID).filter(Boolean));
    const clientErrors = validateClients(clients, taskIDs);
    const taskErrors = validateTasks(tasks);
    const workerErrors = validateWorkers(workers);
    const skillErrors = validateSkillCoverage(tasks, workers);
    const allErrors = [...clientErrors, ...taskErrors, ...workerErrors, ...skillErrors];
    setErrors(allErrors);

    if (allErrors.length > 0) {
      suggestCorrections(allErrors);
    }
  }, [clients, tasks, workers]);

  const suggestCorrections = async (errors: ValidationResult[]) => {
    const correctionPromises = errors.map(async (err) => {
      const prompt = `Suggest a correction for this error in ${err.entity} at row ${err.row + 1}: ${err.message}. Provide JSON: { "entity": string, "row": number, "field": string, "suggestedValue": any }`;
      const aiResponse = await queryAI(prompt);
      try {
        return JSON.parse(aiResponse);
      } catch {
        return null;
      }
    });
    const results = (await Promise.all(correctionPromises)).filter((c): c is Correction => !!c);
    setCorrections(results);
  };

  const applyCorrection = (entity: string, row: number, field: string, value: any) => {
    if (entity === 'clients') {
      setClients(prev => prev.map((item, idx) => idx === row ? { ...item, [field]: value, id: item.id } : item));
    } else if (entity === 'tasks') {
      setTasks(prev => prev.map((item, idx) => idx === row ? { ...item, [field]: value, id: item.id } : item));
    } else if (entity === 'workers') {
      setWorkers(prev => prev.map((item, idx) => idx === row ? { ...item, [field]: value, id: item.id } : item));
    }
    validateAll();
  };

  const handleSearch = async (query: string) => {
    const aiResponse = await queryAI(`Parse this natural language query for filtering tasks: "${query}". Return JSON: { "entity": "tasks", "filter": { "Duration"?: string, "PreferredPhases"?: string } }`);
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.entity === 'tasks' && parsed.filter) {
        let result = [...tasks];
        if (parsed.filter.Duration?.startsWith('>')) {
          const threshold = parseInt(parsed.filter.Duration.slice(1));
          result = result.filter(t => t.Duration > threshold);
        }
        if (parsed.filter.PreferredPhases?.includes('includes')) {
          const phase = parseInt(parsed.filter.PreferredPhases.replace('includes ', ''));
          result = result.filter(t => t.PreferredPhases.includes(phase));
        }
        const resultWithId = result.map((item, index) => ({
          ...item,
          id: item.id || item.TaskID || `filtered-task-${index}`,
        }));
        
        setFilteredTasks(resultWithId);
      }
    } catch (err) {
      alert('Invalid filter from AI. Raw: ' + aiResponse);
    }
  };

  const handleNaturalLanguageRule = async (query: string) => {
    const prompt = `Convert this natural language rule to JSON for a resource allocation system: "${query}". Use context from clients, tasks, and workers data. Return JSON: { "type": string, "tasks"?: string[], "group"?: string, "minCommonSlots"?: number, "maxSlotsPerPhase"?: number, "allowedPhases"?: number[], "pattern"?: string, "overrideType"?: "global" | "specific", "priority"?: number }. Data context: ${JSON.stringify({ clients, tasks, workers }, null, 2)}`;
    const aiResponse = await queryAI(prompt);
    try {
      const rule = JSON.parse(aiResponse);
      if (rule.type) {
        addRule(rule);
      } else {
        alert('Invalid rule from AI. Raw: ' + aiResponse);
      }
    } catch (err) {
      alert('Failed to parse AI rule. Raw: ' + aiResponse);
    }
  };

  const handleRowUpdate = useCallback((entity: string) => (newRow: any, oldRow: any) => {
    const updatedRow = { ...newRow, id: newRow.id || oldRow.id || `${entity}-${Date.now()}` };
    if (entity === 'clients') {
      setClients(prev => prev.map(row => row.id === newRow.id ? updatedRow : row));
    } else if (entity === 'tasks') {
      setTasks(prev => prev.map(row => row.id === newRow.id ? updatedRow : row));
      if (filteredTasks) {
        setFilteredTasks(prev => prev ? prev.map(row => row.id === newRow.id ? updatedRow : row) : null);
      }
    } else if (entity === 'workers') {
      setWorkers(prev => prev.map(row => row.id === newRow.id ? updatedRow : row));
    }
    validateAll();
    return updatedRow;
  }, [filteredTasks, validateAll]);

  const handlePriorityChange = (key: string, value: number) => {
    setPriorities(prev => ({ ...prev, [key]: value }));
  };

  const exportData = () => {
    const exportClients = clients.map(c => ({
      ClientID: c.ClientID,
      ClientName: c.ClientName,
      PriorityLevel: c.PriorityLevel,
      RequestedTaskIDs: c.RequestedTaskIDs.join(','),
      GroupTag: c.GroupTag,
      AttributesJSON: typeof c.AttributesJSON === 'object' ? JSON.stringify(c.AttributesJSON) : c.AttributesJSON,
    }));
    const exportTasks = tasks.map(t => ({
      TaskID: t.TaskID,
      TaskName: t.TaskName,
      Category: t.Category,
      Duration: t.Duration,
      RequiredSkills: t.RequiredSkills.join(','),
      PreferredPhases: JSON.stringify(t.PreferredPhases),
      MaxConcurrent: t.MaxConcurrent,
    }));
    const exportWorkers = workers.map(w => ({
      WorkerID: w.WorkerID,
      WorkerName: w.WorkerName,
      Skills: w.Skills.join(','),
      AvailableSlots: JSON.stringify(w.AvailableSlots),
      MaxLoadPerPhase: w.MaxLoadPerPhase,
      WorkerGroup: w.WorkerGroup,
      QualificationLevel: w.QualificationLevel,
    }));
    const rulesConfig = { rules, priorities };

    const clientBlob = new Blob([Papa.unparse(exportClients)], { type: 'text/csv' });
    const taskBlob = new Blob([Papa.unparse(exportTasks)], { type: 'text/csv' });
    const workerBlob = new Blob([Papa.unparse(exportWorkers)], { type: 'text/csv' });
    const rulesBlob = new Blob([JSON.stringify(rulesConfig, null, 2)], { type: 'application/json' });

    saveAs(clientBlob, 'clients.csv');
    saveAs(taskBlob, 'tasks.csv');
    saveAs(workerBlob, 'workers.csv');
    saveAs(rulesBlob, 'rules.json');
  };

  const defaultCols = (data: any[]): GridColDef[] =>
    data.length > 0
      ? Object.keys(data[0])
          .filter(k => k !== 'id')
          .map(k => ({
            field: k,
            headerName: k,
            width: 150,
            editable: true,
          }))
      : [];

  useEffect(() => {
    
  }, [clients, tasks, workers]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-3 sm:text-5xl">Data Alchemist</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform messy spreadsheets into organized, validated data with AI-powered insights.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create Business Rules</h2>
          <RuleBuilder onAddRule={addRule} onNaturalLanguageRule={handleNaturalLanguageRule} />
          {rules.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Defined Rules</h3>
              <pre className="bg-white p-4 rounded text-sm text-gray-700 overflow-x-auto shadow-inner">
                {JSON.stringify(rules, null, 2)}
              </pre>
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Set Prioritization Weights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {['priorityLevel', 'taskFulfillment', 'fairness'].map(key => (
              <div key={key} className="flex flex-col">
                <label className="text-gray-700 font-medium capitalize mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priorities[key as keyof typeof priorities]}
                  onChange={(e) => handlePriorityChange(key, Number(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-lg cursor-pointer accent-blue-600"
                  aria-label={`${key} priority slider`}
                />
                <span className="text-gray-600 mt-2 text-center">
                  {priorities[key as keyof typeof priorities]}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {corrections.length > 0 && (
          <section className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI-Suggested Corrections</h2>
            <ul className="space-y-3">
              {corrections.map((c, i) => (
                <li key={i} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-gray-100">
                  <span className="text-gray-700">
                    {c.entity} (row {c.row + 1}): Set {c.field} to {JSON.stringify(c.suggestedValue)}
                  </span>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => applyCorrection(c.entity, c.row, c.field, c.suggestedValue)}
                    sx={{ textTransform: 'none', fontWeight: 'medium' }}
                    aria-label={`Apply correction to ${c.entity} row ${c.row + 1}`}
                  >
                    Apply
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Data</h2>
          <FileUpload onDataParsed={handleParsed} />
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Search Tasks</h2>
          <NaturalLanguageSearch onSearch={handleSearch} />
        </section>

        <section className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            variant="contained"
            color="primary"
            onClick={validateAll}
            sx={{ textTransform: 'none', fontWeight: 'bold', paddingY: 1.5 }}
            fullWidth
            aria-label="Run validation on all data"
          >
            Run Validation
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={exportData}
            sx={{ textTransform: 'none', fontWeight: 'bold', paddingY: 1.5 }}
            fullWidth
            aria-label="Export validated data and rules"
          >
            Export Data
          </Button>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Validation Results</h2>
          <ValidationPanel results={errors} />
        </section>

        {clients.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Clients</h2>
            <DataGridEditor
              title="Clients"
              rows={clients}
              columns={defaultCols(clients)}
              onRowUpdate={handleRowUpdate('clients')}
            />
          </section>
        )}

        {workers.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Workers</h2>
            <DataGridEditor
              title="Workers"
              rows={workers}
              columns={defaultCols(workers)}
              onRowUpdate={handleRowUpdate('workers')}
            />
          </section>
        )}

        {(filteredTasks || tasks).length > 0 && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{filteredTasks ? 'Filtered Tasks' : 'Tasks'}</h2>
            <DataGridEditor
              title={filteredTasks ? 'Filtered Tasks' : 'Tasks'}
              rows={filteredTasks || tasks}
              columns={defaultCols(filteredTasks || tasks)}
              onRowUpdate={handleRowUpdate('tasks')}
            />
          </section>
        )}
      </div>
    </main>
  );
}
