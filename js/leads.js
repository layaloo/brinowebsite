(function () {
  'use strict';

  const body = document.getElementById('leads-body');
  const search = document.getElementById('lead-search');
  const cityFilter = document.getElementById('city-filter');
  const count = document.getElementById('results-count');
  const empty = document.getElementById('leads-empty');
  const copyButton = document.getElementById('copy-prompt');
  let leads = [];

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === '"') {
        if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
        else quoted = !quoted;
      } else if (character === ',' && !quoted) {
        row.push(field.trim()); field = '';
      } else if ((character === '\n' || character === '\r') && !quoted) {
        if (character === '\r' && text[index + 1] === '\n') index += 1;
        row.push(field.trim());
        if (row.some(Boolean)) rows.push(row);
        row = []; field = '';
      } else field += character;
    }
    if (field || row.length) { row.push(field.trim()); rows.push(row); }
    const headers = rows.shift() || [];
    return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }

  function textCell(value) {
    const cell = document.createElement('td');
    cell.textContent = value || '—';
    return cell;
  }

  function link(label, href, className) {
    const anchor = document.createElement('a');
    anchor.textContent = label;
    anchor.href = href;
    anchor.className = className;
    if (href.startsWith('http')) { anchor.target = '_blank'; anchor.rel = 'noopener'; }
    return anchor;
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const city = cityFilter.value;
    const filtered = leads.filter((lead) => {
      const searchable = [lead.Company, lead.City, lead.Email, lead.Phone].join(' ').toLowerCase();
      return (!query || searchable.includes(query)) && (!city || lead.City === city);
    });

    body.innerHTML = '';
    const fragment = document.createDocumentFragment();
    filtered.forEach((lead, index) => {
      const row = document.createElement('tr');
      row.appendChild(textCell(String(index + 1)));

      const companyCell = document.createElement('td');
      const company = document.createElement('strong');
      company.textContent = lead.Company || 'Unnamed diner';
      companyCell.appendChild(company);
      row.appendChild(companyCell);
      row.appendChild(textCell(lead.City));

      const emailCell = document.createElement('td');
      if (lead.Email) emailCell.appendChild(link(lead.Email, `mailto:${lead.Email}`, 'lead-contact'));
      else emailCell.textContent = '—';
      row.appendChild(emailCell);

      const phoneCell = document.createElement('td');
      if (lead.Phone) phoneCell.appendChild(link(lead.Phone, `tel:${lead.Phone.replace(/[^+\d]/g, '')}`, 'lead-contact'));
      else phoneCell.textContent = '—';
      row.appendChild(phoneCell);

      const onlineCell = document.createElement('td');
      const website = safeUrl(lead.Website);
      const social = safeUrl(lead.Social);
      if (website) onlineCell.appendChild(link('Website', website, 'lead-pill'));
      if (social) onlineCell.appendChild(link('Social', social, 'lead-pill lead-pill--soft'));
      if (!website && !social) onlineCell.textContent = '—';
      row.appendChild(onlineCell);

      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      status.className = `email-status ${lead['Email Flag'] === 'Valid-looking' ? 'email-status--valid' : ''}`;
      status.textContent = lead['Email Flag'] || 'Unspecified';
      statusCell.appendChild(status);
      row.appendChild(statusCell);
      fragment.appendChild(row);
    });
    body.appendChild(fragment);
    count.textContent = `${filtered.length} of ${leads.length} diner leads`;
    empty.hidden = filtered.length > 0;
  }

  fetch('data/vintage_diners_200_clean_leads.csv')
    .then((response) => {
      if (!response.ok) throw new Error('Unable to load leads');
      return response.text();
    })
    .then((text) => {
      leads = parseCSV(text);
      const cities = [...new Set(leads.map((lead) => lead.City).filter(Boolean))].sort();
      cities.forEach((city) => {
        const option = document.createElement('option');
        option.value = city; option.textContent = city; cityFilter.appendChild(option);
      });
      render();
    })
    .catch(() => {
      count.textContent = 'The diner directory could not be loaded.';
      empty.hidden = false;
      empty.textContent = 'Please refresh the page or download the CSV.';
    });

  search.addEventListener('input', render);
  cityFilter.addEventListener('change', render);
  copyButton.addEventListener('click', async () => {
    const message = document.getElementById('outreach-message').innerText.trim();
    try {
      await navigator.clipboard.writeText(message);
      copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy email'; }, 1800);
    } catch (_) {
      copyButton.textContent = 'Select and copy';
    }
  });
})();
