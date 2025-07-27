Data Alchemist
Data Alchemist is a web app that helps you clean and organize messy spreadsheet data with ease. Upload your client, task, or worker data, let the app check for errors, suggest fixes using AI, and filter or create rules with simple language. The app is user-friendly, works on any device, and lets you download cleaned-up data.
Features

Upload Spreadsheets: Load CSV or Excel files for clients, tasks, or workers.
Check Data: Find errors like missing IDs or mismatched tasks.
AI Fixes: Get and apply smart suggestions to correct data errors.
Search with Words: Filter tasks using plain English (e.g., "Show tasks longer than 1 day").
Create Rules: Set rules for how tasks and workers connect, using simple language or a form.
Set Priorities: Adjust sliders to balance task importance, completion, and fairness.
Edit Data: Update data directly in easy-to-use tables.
Download Results: Save cleaned data and rules as CSV or JSON files.
Mobile-Friendly: Works on phones, tablets, and computers with a clean, clear design.
Accessible: Easy to navigate with a keyboard or screen reader.

Getting Started

Visit the App: Open the app at [insert deployed link, e.g., https://data-alchemist.vercel.app].
Use Sample Files: Download example files (clients.csv, tasks.csv, workers.csv) from the /samples folder in the project repository to try it out.

How to Use

Upload Data:

In the "Upload Data" section, select CSV or Excel files for clients, tasks, or workers.
The app shows your data in tables you can edit.


Check for Errors:

Click "Run Validation" to find problems in your data.
See errors listed in the "Validation Results" section.


Fix Errors:

If errors are found, the "AI-Suggested Corrections" section shows fixes.
Click "Apply" to correct errors and check again.


Filter Tasks:

In the "Search Tasks" section, type a query like "Tasks with Duration > 1 and phase 2" to filter tasks.
Filtered tasks appear in a separate table.


Add Rules:

In the "Create Business Rules" section, type a rule like "Tasks T17 and T27 must run together" or use the form.
Rules appear below in a readable format.


Adjust Priorities:

Use sliders in the "Set Prioritization Weights" section to focus on task priority, completion, or fairness.


Download Data:

Click "Export Data" to save your cleaned data as CSV files (clients.csv, tasks.csv, workers.csv) and rules as a JSON file (rules.json).



Example Files
The /samples folder includes:

clients.csv: Client details like ID, name, and task requests.
tasks.csv: Task details like ID, name, duration, and required skills.
workers.csv: Worker details like ID, name, skills, and availability.

Try this:

Upload all three sample files.
Click "Run Validation" and fix any errors using AI suggestions.
Search for tasks (e.g., "Tasks with Duration > 1").
Add a rule (e.g., "Tasks T17 and T27 must run together").
Download the cleaned files.

Testing the App

Spacing: Check that sections (Rules, Priorities, Corrections, etc.) have clear space between them (~48px gap).
Upload: Upload sample files and ensure data appears in tables.
Validation: Run validation and confirm errors show up.
AI Fixes: Apply corrections and verify data updates.
Search/Rules: Try a search (e.g., "Tasks with Duration > 1 and phase 2") and a rule (e.g., "Tasks T17 and T27 must run together").
Download: Export files and check they match your data.
Mobile View: Test on a phone to ensure sections stack neatly and tables scroll.
Accessibility: Use a keyboard to navigate or test with a screen reader.

Notes

The app uses a clean design with white cards, blue buttons, and yellow highlights for corrections.
All sections are clearly separated for easy reading.
If you encounter issues, check the browser console for logs like "Raw tasks data" or "Processed tasks data with IDs."

Contact
For questions or issues, reach out via the project repository or email [insert contact email].
