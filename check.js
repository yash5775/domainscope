// Verification benchmark tool for testing Google DoH + Direct Authoritative Registry RDAP
async function queryDns(domain) {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

function getDirectRdapUrl(domain) {
  const match = domain.match(/(\.[a-z0-9\-]+)$/i);
  const tld = match ? match[1].toLowerCase() : '.com';
  if (tld === '.com') return `https://rdap.verisign.com/com/v1/domain/${encodeURIComponent(domain)}`;
  if (tld === '.net') return `https://rdap.verisign.com/net/v1/domain/${encodeURIComponent(domain)}`;
  if (tld === '.ai' || tld === '.io' || tld === '.co') {
    return `https://rdap.identitydigital.services/rdap/domain/${encodeURIComponent(domain)}`;
  }
  return `https://rdap.org/domain/${encodeURIComponent(domain)}`;
}

async function queryRdap(domain) {
  try {
    const res = await fetch(getDirectRdapUrl(domain), {
      headers: { 'Accept': 'application/rdap+json, application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.status === 404) return { status: 'available' };
    if (res.status === 200) return { status: 'taken' };
    return { status: 'unknown', code: res.status };
  } catch (e) {
    return { status: 'error', error: e.message };
  }
}

async function verify(domain) {
  const dns = await queryDns(domain);
  if (dns && dns.Status === 0 && dns.Answer && dns.Answer.length > 0) {
    return { domain, status: 'taken', method: 'doh' };
  }
  const rdap = await queryRdap(domain);
  if (rdap.status === 'available') return { domain, status: 'available', method: 'rdap' };
  if (rdap.status === 'taken') return { domain, status: 'taken', method: 'rdap' };
  if (dns && dns.Status === 3) return { domain, status: 'available', method: 'doh_nxdomain' };
  return { domain, status: 'error', method: 'unknown' };
}

export { verify, queryDns, queryRdap, getDirectRdapUrl };
