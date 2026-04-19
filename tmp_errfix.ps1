$js = Get-Content 'C:\Users\joshu\public\boss.js' -Raw -Encoding UTF8

$old = "addMsg('bot', '⚠️ ' + (r.error || 'B.O.S.S offline — check API Keys & Settings.'));"

$new = @"
      const errMsg = r.error || '';
      if (errMsg.includes('All providers') || errMsg.includes('failed')) {
        addMsgRich('bot', '<strong>No AI provider active.</strong><br><br>' +
          '<b>Option 1 — Free right now:</b><br>' +
          'Get a free Groq key at <code>console.groq.com/keys</code><br>' +
          'Then paste it in the <b>Local Models</b> panel (sidebar)<br><br>' +
          '<b>Option 2 — Best quality:</b><br>' +
          'Top up Anthropic credits at <code>console.anthropic.com/billing</code>');
      } else {
        addMsg('bot', '⚠️ ' + (r.error || 'B.O.S.S offline — check API Keys & Settings.'));
      }
"@

if ($js.Contains($old)) {
    $js = $js.Replace($old, $new)
    Set-Content 'C:\Users\joshu\public\boss.js' $js -NoNewline -Encoding UTF8
    Write-Host "Error message patched OK"
} else {
    Write-Host "anchor not found — searching for similar..."
    $js | Select-String "B.O.S.S offline" | ForEach-Object { Write-Host $_.Line }
}
