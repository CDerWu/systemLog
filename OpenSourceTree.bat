set directory=%~dp1

for /f "delims=" %%i in ('git rev-parse --show-toplevel') do set directory=%%i
git rev-parse --show-toplevel 1> nul 2> nul

start "" "%LocalAppData%\SourceTree\SourceTree.exe" -f %directory:/=\%
