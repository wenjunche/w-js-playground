function FindProxyForURL(url, host) {
 
// If the hostname matches, send direct.
if (dnsDomainIs(host, "openf.in"))
    return "DIRECT";
  
if (dnsDomainIs(host, "openfin.co"))
    return "DIRECT";

if (dnsDomainIs(host, "chartiq.com"))
    return "DIRECT";

if (shExpMatch(host, "localhost"))
    return "DIRECT";

// DEFAULT RULE: All other traffic, use below proxies, in fail-over order.
    return "PROXY proxy.openfin.co:3128;";
 
}