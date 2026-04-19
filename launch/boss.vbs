' B.O.S.S — Business Optimization System Service
' Silent launcher: starts Node server, opens Operator panel.

Option Explicit

Dim shell, fso, projectRoot, nodeExe, serverJs, url, args(0), nodeCandidates, i

Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

' Resolve project root = parent of this script's folder.
projectRoot = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
serverJs    = projectRoot & "\server.js"
url         = "http://localhost:4000"

' Find node.exe — try common locations, fall back to PATH.
nodeCandidates = Array( _
  "C:\Program Files\nodejs\node.exe", _
  "C:\Program Files (x86)\nodejs\node.exe", _
  shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Programs\nodejs\node.exe", _
  shell.ExpandEnvironmentStrings("%APPDATA%") & "\nvm\latest\node.exe", _
  "C:\Users\joshu\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" _
)
nodeExe = ""
For i = 0 To UBound(nodeCandidates)
  If fso.FileExists(nodeCandidates(i)) Then
    nodeExe = nodeCandidates(i)
    Exit For
  End If
Next
If nodeExe = "" Then nodeExe = "node"  ' fall back to PATH

' Run server hidden, from project root so .env loads.
shell.CurrentDirectory = projectRoot
shell.Run Chr(34) & nodeExe & Chr(34) & " " & Chr(34) & serverJs & Chr(34), 0, False

' Wait for port bind.
WScript.Sleep 1500

' Open in default browser.
shell.Run "cmd /c start """" """ & url & """", 0, False

Set shell = Nothing
Set fso   = Nothing
