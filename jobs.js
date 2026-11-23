(async function () {
  const status = document.getElementById('jobs-status');
  const list = document.getElementById('jobs-list');
  const selected = new URLSearchParams(window.location.search).get('job');
  const text = (tag, value, className) => { const el = document.createElement(tag); el.textContent = value; if(className) el.className = className; return el; };
  try {
    const response = await fetch('jobs-data.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('Job feed unavailable');
    const jobs = await response.json();
    if (!Array.isArray(jobs)) throw new Error('Invalid job feed');
    if (selected) {
      const job = jobs.find(j => j.id === selected);
      document.getElementById('jobs-list-view').classList.add('hidden');
      document.getElementById('job-detail-view').classList.remove('hidden');
      if (!job) { document.getElementById('job-title').textContent = 'Opportunity not found'; return; }
      document.title = job.title + ' | CTTL';
      document.getElementById('job-title').textContent = job.title;
      document.getElementById('job-meta').textContent = [job.location, job.pay].filter(Boolean).join(' · ');
      // Description HTML is sanitised during the Netlify build.
      document.getElementById('job-description').innerHTML = job.description;
      document.getElementById('job-apply').href = 'mailto:apply@classroomteachers.co.uk?subject=' + encodeURIComponent('Application enquiry: ' + job.title);
      return;
    }
    status.textContent = jobs.length ? '' : 'There are no opportunities listed at present. Please contact us to register your interest.';
    for (const job of jobs) {
      const card = text('article', '', 'job-listing');
      const h = document.createElement('h2');
      const link = text('a', job.title); link.href = 'jobs.html?job=' + encodeURIComponent(job.id); h.append(link);
      card.append(h, text('p', [job.location, job.pay].filter(Boolean).join(' · '), 'job-meta'));
      const detail = text('a', 'View job details'); detail.href = link.href; detail.className = 'btn'; card.append(detail);
      list.append(card);
    }
  } catch(e) {
    status.textContent = 'We could not load the vacancies right now. Please email apply@classroomteachers.co.uk for current opportunities.';
  }
})();
