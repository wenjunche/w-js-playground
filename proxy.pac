function FindProxyForURL(url, host) {
 
// If the hostname matches, send direct.
if (dnsDomainIs(host, "openfin.co"))
    return "DIRECT";

if (dnsDomainIs(host, "chartiq.com"))
    return "DIRECT";

if (dnsDomainIs(host, "google.com"))
    return "DIRECT";

if (dnsDomainIs(host, "googleapis.com"))
    return "DIRECT";

if (dnsDomainIs(host, "google-analytics.com"))
    return "DIRECT";

if (dnsDomainIs(host, "gstatic.com"))
    return "DIRECT";

if (shExpMatch(host, "localhost"))
    return "DIRECT";

if (isPlainHostName(host))
    return "DIRECT";

// DEFAULT RULE: All other traffic, use below proxies, in fail-over order.
    return "PROXY proxy.openfin.co:3128;";
 
}