param([string]$Dir)

$Dir = $Dir.TrimEnd('\')
$userPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
if ($userPath -notlike "*$Dir*") {
    $newPath = if ($userPath) { $userPath.TrimEnd(';') + ';' + $Dir } else { $Dir }
    [Environment]::SetEnvironmentVariable('PATH', $newPath, 'User')
    Write-Host "   Pasta adicionada ao PATH do usuario (OK)"
} else {
    Write-Host "   Pasta ja esta no PATH do usuario (pulando)"
}

# [Environment]::SetEnvironmentVariable grava so no registro; sem este broadcast,
# processos ja abertos (inclusive o explorer.exe que costuma abrir novos terminais)
# ficam com o PATH antigo em cache ate um logoff — e novas janelas "abertas" a
# partir dele continuam sem achar o 'reel' ate isso acontecer.
Add-Type -Namespace Win32 -Name NativeMethods -MemberDefinition @'
[DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
'@
$result = [UIntPtr]::Zero
[Win32.NativeMethods]::SendMessageTimeout([IntPtr]0xffff, 0x1A, [UIntPtr]::Zero, "Environment", 2, 5000, [ref]$result) | Out-Null
