CAREERCONNECT — WINDOWS INSTALLATION

Requested destination:
C:\Users\DELL\Downloads\careerportal

Option A (recommended):
1. Extract careerportal-source.zip somewhere in Downloads.
2. Open the extracted careerportal folder.
3. Right-click COPY-TO-WINDOWS.ps1 and choose Run with PowerShell,
   OR open PowerShell in this folder and run:
       powershell -ExecutionPolicy Bypass -File .\COPY-TO-WINDOWS.ps1
4. Open a terminal in C:\Users\DELL\Downloads\careerportal.
5. Run:
       npm install

Option B:
Extract the ZIP directly into:
C:\Users\DELL\Downloads\careerportal

Then continue with the setup instructions in README.md.

IMPORTANT:
- This source package contains .env.example templates only. Add your own
  Supabase project URL and publishable key locally.
- Never put Supabase secret/service-role keys in browser or mobile apps.
- node_modules and generated build folders are intentionally not included.
