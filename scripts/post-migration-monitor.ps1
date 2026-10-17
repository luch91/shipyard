param(
  [Parameter(Mandatory = $true)]
  [string]$OutputPath,

  [Parameter(Mandatory = $true)]
  [datetime]$EndTimeUtc,

  [int]$IntervalSeconds = 300
)

$ErrorActionPreference = 'Stop'
$hostsToCheck = @(
  @{ Host = 'genshipyard.com'; Expected = 200 },
  @{ Host = 'www.genshipyard.com'; Expected = 308 },
  @{ Host = 'skills.genshipyard.com'; Expected = 200 }
)

function Invoke-CurlProbe {
  param([string]$HostName)

  $format = '{"status":%{http_code},"seconds":%{time_total},"tls":%{ssl_verify_result},"remote_ip":"%{remote_ip}","redirect":"%{redirect_url}"}'
  $raw = & curl.exe --ssl-no-revoke --silent --show-error --output NUL --write-out $format "https://$HostName/" 2>&1
  if ($LASTEXITCODE -ne 0) {
    return @{ error = [string]$raw; status = 0; seconds = $null; tls = $null }
  }
  return ($raw | ConvertFrom-Json -AsHashtable)
}

function Invoke-JsonRequest {
  param(
    [string]$Url,
    [string[]]$Arguments
  )

  $raw = & curl.exe --ssl-no-revoke --silent --show-error @Arguments $Url 2>&1
  if ($LASTEXITCODE -ne 0) {
    return @{ ok = $false; error = [string]$raw }
  }
  try {
    return @{ ok = $true; value = ($raw | ConvertFrom-Json -AsHashtable) }
  } catch {
    return @{ ok = $false; error = $_.Exception.Message }
  }
}

while ((Get-Date).ToUniversalTime() -lt $EndTimeUtc.ToUniversalTime()) {
  $record = [ordered]@{
    timestamp_utc = (Get-Date).ToUniversalTime().ToString('o')
    hosts = [ordered]@{}
  }

  foreach ($entry in $hostsToCheck) {
    $probe = Invoke-CurlProbe -HostName $entry.Host
    $probe.expected = $entry.Expected
    $probe.healthy = ($probe.status -eq $entry.Expected -and $probe.tls -eq 0)
    $record.hosts[$entry.Host] = $probe
  }

  $dns = Invoke-JsonRequest -Url 'https://cloudflare-dns.com/dns-query?name=genshipyard.com&type=NS' -Arguments @('-H', 'accept: application/dns-json')
  if ($dns.ok) {
    $record.nameservers = @($dns.value.Answer | Where-Object { $_.type -eq 2 } | ForEach-Object { $_.data })
  } else {
    $record.nameserver_error = $dns.error
  }

  $rpcBody = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
  $rpc = Invoke-JsonRequest -Url 'https://studio.genlayer.com/api' -Arguments @('-H', 'Content-Type: application/json', '--data-raw', $rpcBody)
  if ($rpc.ok) {
    $record.studionet = @{ healthy = [bool]$rpc.value.result; block = $rpc.value.result; error = $rpc.value.error }
  } else {
    $record.studionet = @{ healthy = $false; error = $rpc.error }
  }

  $record | ConvertTo-Json -Compress -Depth 8 | Add-Content -LiteralPath $OutputPath -Encoding utf8
  Start-Sleep -Seconds $IntervalSeconds
}
