
' TheSaaSsin Operator Launcher
' Starts the Node server silently, then opens the panel in Chrome/Edge

Dim node, serverJs, url, shell
node      = "C:\Users\joshu\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe"
serverJs  = "C:\Users\joshu\server.js"
url       = "http://localhost:4000"

Set shell = CreateObject("WScript.Shell")

' Check if server is already up by trying a port check — just launch node anyway
' (node server.js is idempotent if port is already bound, it'll error silently)
shell.Run Chr(34) & node & Chr(34) & " " & Chr(34) & serverJs & Chr(34), 0, False

' Give server a moment to bind
WScript.Sleep 1200

' Open in default browser
shell.Run "cmd /c start " & url, 0, False

Set shell = Nothing
