import { Task, Worker, ValidationResult } from '../types';

export function validateSkillCoverage(tasks: Task[], workers: Worker[]): ValidationResult[] {
  const errors: ValidationResult[] = [];
  const allWorkerSkills = new Set<string>(workers.flatMap(w => w.Skills));

  tasks.forEach((task, index) => {
    if (!task.TaskID || task.TaskID.trim() === '') return;
    task.RequiredSkills.forEach(skill => {
      if (!allWorkerSkills.has(skill)) {
        errors.push({
          entity: 'Task',
          row: index,
          message: `Required skill "${skill}" not found in any worker's skills`,
        });
      }
    });
  });

  return errors;
}