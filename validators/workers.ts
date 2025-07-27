import { Worker, ValidationResult } from '../types';

export function validateWorkers(workers: Worker[]): ValidationResult[] {
  const errors: ValidationResult[] = [];
  const seen = new Set<string>();

  workers.forEach((worker, index) => {
    if (!worker.WorkerID || worker.WorkerID.trim() === '') {
      errors.push({ entity: 'Worker', row: index, message: 'Missing or empty WorkerID' });
      return;
    }
    if (seen.has(worker.WorkerID)) {
      errors.push({ entity: 'Worker', row: index, message: `Duplicate WorkerID: ${worker.WorkerID}` });
    }
    seen.add(worker.WorkerID);

    if (!Array.isArray(worker.AvailableSlots) || worker.AvailableSlots.some((n: number) => isNaN(n) || n < 1)) {
      errors.push({ entity: 'Worker', row: index, message: 'AvailableSlots must be an array of positive numbers' });
    }

    const maxLoad = typeof worker.MaxLoadPerPhase === 'string' ? parseInt(worker.MaxLoadPerPhase) : worker.MaxLoadPerPhase;
    if (isNaN(maxLoad) || maxLoad <= 0) {
      errors.push({ entity: 'Worker', row: index, message: 'MaxLoadPerPhase must be >0' });
    }

    if (!Array.isArray(worker.Skills)) {
      errors.push({ entity: 'Worker', row: index, message: 'Skills must be an array' });
    }

    if (worker.AvailableSlots.length < maxLoad) {
      errors.push({ entity: 'Worker', row: index, message: 'AvailableSlots count must be ≥ MaxLoadPerPhase' });
    }
  });

  return errors;
}