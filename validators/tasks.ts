import { Task, Worker, ValidationResult } from '../types';

export function validateTasks(tasks: Task[], workers: Worker[] = []): ValidationResult[] {
  const errors: ValidationResult[] = [];
  const seen = new Set<string>();

  tasks.forEach((task, index) => {
    if (!task.TaskID || task.TaskID.trim() === '') {
      errors.push({ entity: 'Task', row: index, message: 'Missing or empty TaskID' });
      return;
    }
    if (seen.has(task.TaskID)) {
      errors.push({ entity: 'Task', row: index, message: `Duplicate TaskID: ${task.TaskID}` });
    }
    seen.add(task.TaskID);

    const duration = typeof task.Duration === 'string' ? parseInt(task.Duration) : task.Duration;
    if (isNaN(duration) || duration < 1) {
      errors.push({ entity: 'Task', row: index, message: 'Duration must be ≥1' });
    }

    if (!Array.isArray(task.PreferredPhases) || task.PreferredPhases.some((n: number) => isNaN(n) || n < 1)) {
      errors.push({ entity: 'Task', row: index, message: 'PreferredPhases must be an array of positive numbers' });
    }

    const maxConcurrent = typeof task.MaxConcurrent === 'string' ? parseInt(task.MaxConcurrent) : task.MaxConcurrent;
    if (isNaN(maxConcurrent) || maxConcurrent < 1) {
      errors.push({ entity: 'Task', row: index, message: 'MaxConcurrent must be ≥1' });
    }

    if (!Array.isArray(task.RequiredSkills)) {
      errors.push({ entity: 'Task', row: index, message: 'RequiredSkills must be an array' });
    }

    // Max-concurrency feasibility
    if (workers.length > 0) {
      const qualifiedWorkers = workers.filter(w =>
        task.RequiredSkills.every(skill => w.Skills.includes(skill)) &&
        task.PreferredPhases.some(phase => w.AvailableSlots.includes(phase))
      );
      if (qualifiedWorkers.length < maxConcurrent) {
        errors.push({
          entity: 'Task',
          row: index,
          message: `MaxConcurrent (${maxConcurrent}) exceeds qualified workers (${qualifiedWorkers.length})`,
        });
      }
    }
  });

  return errors;
}