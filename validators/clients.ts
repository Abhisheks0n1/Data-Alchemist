import { Client, ValidationResult } from '../types';

export function validateClients(clients: Client[], taskIDs: Set<string>): ValidationResult[] {
  const errors: ValidationResult[] = [];
  const seen = new Set<string>();

  clients.forEach((client, index) => {
    if (!client.ClientID || client.ClientID.trim() === '') {
      errors.push({ entity: 'Client', row: index, message: 'Missing or empty ClientID' });
      return;
    }
    if (seen.has(client.ClientID)) {
      errors.push({ entity: 'Client', row: index, message: `Duplicate ClientID: ${client.ClientID}` });
    }
    seen.add(client.ClientID);

    const priorityLevel = typeof client.PriorityLevel === 'string' ? parseInt(client.PriorityLevel) : client.PriorityLevel;
    if (isNaN(priorityLevel) || priorityLevel < 1 || priorityLevel > 5) {
      errors.push({ entity: 'Client', row: index, message: 'PriorityLevel must be 1–5' });
    }

    if (!Array.isArray(client.RequestedTaskIDs)) {
      errors.push({ entity: 'Client', row: index, message: 'RequestedTaskIDs must be an array' });
    } else {
      client.RequestedTaskIDs.forEach((taskID: string) => {
        if (!taskIDs.has(taskID)) {
          errors.push({ entity: 'Client', row: index, message: `Unknown TaskID: ${taskID}` });
        }
      });
    }

    if (typeof client.AttributesJSON === 'string') {
      try {
        JSON.parse(client.AttributesJSON);
      } catch {
        errors.push({ entity: 'Client', row: index, message: 'Malformed JSON in AttributesJSON' });
      }
    } else if (typeof client.AttributesJSON !== 'object' || client.AttributesJSON === null) {
      errors.push({ entity: 'Client', row: index, message: 'AttributesJSON must be an object' });
    }
  });

  return errors;
}