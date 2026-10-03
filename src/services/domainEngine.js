// --- Data & Pricing Configuration ---
export const TLD_PRICING = {
  '.com': {
    reg: '$12.98/yr',
    renew: '$15.98/yr',
    termNote: '1 yr min',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  },
  '.ai': {
    reg: '$83.98/yr',
    renew: '$91.98/yr',
    termNote: '2 yr min registry rule (~$168 upfront)',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  },
  '.io': {
    reg: '$39.98/yr',
    renew: '$49.98/yr',
    termNote: '1 yr min',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  },
  '.co': {
    reg: '$11.98/yr',
    renew: '$29.98/yr',
    termNote: '1 yr promo',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  },
  '.net': {
    reg: '$13.98/yr',
    renew: '$16.98/yr',
    termNote: '1 yr min',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  },
  '.org': {
    reg: '$12.98/yr',
    renew: '$15.98/yr',
    termNote: '1 yr min',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  },
  '.dev': {
    reg: '$14.98/yr',
    renew: '$17.98/yr',
    termNote: 'Requires HTTPS setup',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  },
  '.app': {
    reg: '$15.98/yr',
    renew: '$18.98/yr',
    termNote: 'Requires HTTPS setup',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  },
  '.in': {
    reg: '$8.98/yr',
    renew: '$11.98/yr',
    termNote: '1 yr min',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  }
};

export const PRESET_LISTS = {
  aiTech: {
    label: 'AI & Data',
    words: ['neuralflow', 'cortexgrid', 'vectormesh', 'synthetix', 'tensorpulse', 'cognispark', 'dataprisma', 'inframind']
  },
  cloudInfra: {
    label: 'Cloud & Infra',
    words: ['cloudpulse', 'kubestack', 'meshscale', 'hyperedge', 'dockernode', 'serverproxy', 'zerolatency', 'bytevault']
  },
  shortPunchy: {
    label: 'Short Brandable',
    words: ['kura', 'zeno', 'vela', 'nova', 'brio', 'axon', 'tess', 'mira']
  }
};

export function getTldMeta(domain) {
  const match = domain.match(/(\.[a-z0-9\-]+)$/i);
  const tld = match ? match[1].toLowerCase() : '.com';
  if (TLD_PRICING[tld]) {
    return { tld, ...TLD_PRICING[tld] };
  }
  return {
    tld,
    reg: '~$10 - $25/yr',
    renew: 'Standard fee',
    termNote: 'Standard registry term',
    buyUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`
  };
}

export function cleanDomainOrKeyword(rawLine) {
  let cleaned = rawLine.trim().toLowerCase();
  // Strip URL protocol and www
  cleaned = cleaned.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  // Strip trailing path/query/fragment
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
  return cleaned;
}

export function isExplicitDomain(str) {
  // Check if string contains at least one dot with valid TLD structure
  return /^[a-z0-9][a-z0-9\-]*\.[a-z]{2,}(\.[a-z]{2,})?$/i.test(str);
}

// Smart Unified Generator: Automatically detects whether each line is an exact domain or a keyword
export function generateTargetDomains(inputText, selectedTlds = ['.com', '.ai']) {
  const lines = inputText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  if (lines.length === 0) return [];

  const domains = [];

  for (const rawLine of lines) {
    const cleaned = cleanDomainOrKeyword(rawLine);
    if (!cleaned) continue;

    if (isExplicitDomain(cleaned)) {
      // It has an extension (e.g. stripe.com, app.io) -> check exact domain
      domains.push(cleaned);
    } else {
      // It is a name or keyword (e.g. neuralflow) -> expand with selected TLDs
      const sanitizedName = cleaned.replace(/[^a-z0-9\-]/g, '');
      if (sanitizedName) {
        for (const tld of selectedTlds) {
          domains.push(`${sanitizedName}${tld}`);
        }
      }
    }
  }

  return Array.from(new Set(domains));
}

// Direct registry endpoint routing
export function getDirectRdapUrl(domain) {
  const match = domain.match(/(\.[a-z0-9\-]+)$/i);
  const tld = match ? match[1].toLowerCase() : '.com';
  if (tld === '.com') return `https://rdap.verisign.com/com/v1/domain/${encodeURIComponent(domain)}`;
  if (tld === '.net') return `https://rdap.verisign.com/net/v1/domain/${encodeURIComponent(domain)}`;
  if (tld === '.ai' || tld === '.io' || tld === '.co') {
    return `https://rdap.identitydigital.services/rdap/domain/${encodeURIComponent(domain)}`;
  }
  return `https://rdap.org/domain/${encodeURIComponent(domain)}`;
}

export async function queryDns(domain) {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function queryRdap(domain) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5500);

  try {
    const url = getDirectRdapUrl(domain);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/rdap+json, application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.status === 404) {
      let details = null;
      try { details = await response.json(); } catch(e) {}
      return { status: 'available', httpCode: 404, raw: details };
    } else if (response.status === 200) {
      let details = null;
      try { details = await response.json(); } catch(e) {}
      return { status: 'taken', httpCode: 200, raw: details };
    } else if (response.status === 429) {
      return { status: 'rate_limited', httpCode: 429, raw: null };
    } else {
      return { status: 'error', httpCode: response.status, raw: null };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    return { status: 'network_error', error: error.message };
  }
}

// Two-tier hybrid check: Instant Google DoH pre-flight + Authoritative RDAP
export async function verifyDomain(domain) {
  const dnsResult = await queryDns(domain);
  if (dnsResult && dnsResult.Status === 0 && dnsResult.Answer && dnsResult.Answer.length > 0) {
    return {
      status: 'taken',
      method: 'doh_authoritative',
      details: 'Domain is actively resolving on public DNS servers',
      raw: dnsResult
    };
  }

  const rdapResult = await queryRdap(domain);
  if (rdapResult.status === 'available') {
    return {
      status: 'available',
      method: 'direct_rdap',
      details: 'Official Registry RDAP reports 404 (Unassigned/Available)',
      raw: rdapResult.raw
    };
  } else if (rdapResult.status === 'taken') {
    return {
      status: 'taken',
      method: 'direct_rdap',
      details: 'Official Registry RDAP record exists (Registered)',
      raw: rdapResult.raw
    };
  }

  if (dnsResult && dnsResult.Status === 3) {
    return {
      status: 'available',
      method: 'doh_nxdomain',
      details: 'NXDOMAIN reported by public resolver',
      raw: dnsResult
    };
  }

  return {
    status: 'error',
    method: 'rdap_error',
    details: rdapResult.status || 'Verification timeout',
    raw: rdapResult
  };
}

// --- Export Utilities ---
export function exportToCsv(resultsList) {
  if (!resultsList || resultsList.length === 0) return;
  
  const availableOnly = resultsList.filter(r => r.status === 'available');
  const exportList = availableOnly.length > 0 ? availableOnly : resultsList;

  let csv = 'Domain,TLD,Status,Est_Registration_Price,Est_Renewal_Price,Pricing_Notes,Registrar_Link,Checked_At\n';
  exportList.forEach(r => {
    csv += `"${r.domain}","${r.tld}","${r.status}","${r.price}","${r.renewal}","${r.termNote}","${r.buyUrl}","${r.checkedAt}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `domainscope_available_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToPdf(resultsList) {
  if (!resultsList || resultsList.length === 0) return;

  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || autoTableModule;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // Header Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 595.28, 80, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 80, 595.28, 80);

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DomainScope — Availability & Registry Price Report', 40, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${new Date().toLocaleString()} • Public RDAP Intelligence`, 40, 60);

  // Stats summary band
  const availableCount = resultsList.filter(r => r.status === 'available').length;
  const takenCount = resultsList.filter(r => r.status === 'taken').length;
  
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Summary: ${resultsList.length} Total Checked   |   ${availableCount} Available   |   ${takenCount} Registered`, 40, 105);

  const availableRows = resultsList
    .filter(r => r.status === 'available')
    .map((r, i) => [
      (i + 1).toString(),
      r.domain,
      'AVAILABLE',
      r.price,
      r.termNote,
      `https://namecheap.com/domains/registration/results/?domain=${r.domain}`
    ]);

  const finalRows = availableRows.length > 0 ? availableRows : resultsList.map((r, i) => [
    (i + 1).toString(),
    r.domain,
    r.status.toUpperCase(),
    r.price,
    r.termNote,
    r.buyUrl
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['#', 'Domain Name', 'Status', 'Est. Price', 'Pricing Details', 'Registrar Direct Link']],
    body: finalRows,
    theme: 'plain',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 120, fontStyle: 'bold' },
      2: { cellWidth: 65, textColor: [22, 163, 74] },
      3: { cellWidth: 65 },
      4: { cellWidth: 110 },
      5: { cellWidth: 130 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 40, right: 40 }
  });

  doc.save(`domainscope_report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
