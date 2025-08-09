const API_BASE = 'https://clinicaltrials.gov/api/v2/studies'; // our api for trial finder (clinicaltrials.gov)

function createForm() {
  const formHtml = `
    <!-- Progress Indicator -->
    <div class="progress-indicator">
      <div class="progress-bar-top" id="progressBar"></div>
    </div>

    <div class="trial-search-form">
      <form id="trialForm">
        <div class="form-row">
          <div class="form-group">
            <label for="condition">Cancer Type or Treatment:</label>
            <input type="text" id="condition" placeholder="e.g., breast cancer, lung cancer, immunotherapy" required />
          </div>
          <div class="form-group">
            <label for="location">State:</label>
            <input type="text" id="location" placeholder="e.g., California, New York, Texas" />
          </div>
          <div class="form-group small">
            <label for="status">Status:</label>
            <select id="status">
              <option value="active">Active Trials</option>
              <option value="recruiting">Recruiting</option>
              <option value="all">All Trials</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <button type="submit" class="search-btn" id="searchBtn">
            Find Cancer Trials
          </button>
        </div>
      </form>
    </div>

    <!-- Floating Action Buttons -->
    <div class="floating-actions">
      <button class="floating-btn primary" onclick="scrollToTop()" title="Back to Top">
        ↑
      </button>
      <button class="floating-btn secondary" onclick="openHelp()" title="Get Help">
        💬
      </button>
    </div>

    <style>
      /* Progress indicator at top */
      .progress-indicator {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(37, 99, 235, 0.2);
        z-index: 1000;
      }

      .progress-bar-top {
        height: 100%;
        background: linear-gradient(90deg, #2563eb, #dc2626);
        width: 0%;
        transition: width 0.1s ease;
      }

      /* Main TrialLens text styling */
      .header__content h1 {
        animation: fadeInUp 1s ease-out;
        background: linear-gradient(45deg, #2563eb, #dc2626);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .header__content h3 {
        animation: fadeInUp 1s ease-out 0.3s both;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Floating action buttons */
      .floating-actions {
        position: fixed;
        bottom: 30px;
        right: 30px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        z-index: 1000;
      }

      .floating-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        color: white;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .floating-btn.primary {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
      }

      .floating-btn.secondary {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
      }

      .floating-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }

      .trial-search-form {
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        margin-bottom: 30px;
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
      }

      .trial-search-form:hover {
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }

      .form-row {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 20px;
        align-items: end;
      }

      .form-group {
        flex: 1;
        min-width: 250px;
      }

      .form-group.small {
        flex: 0 0 180px;
        min-width: 150px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #2d3748;
        font-size: 0.95rem;
      }

      .form-group input, .form-group select {
        width: 100%;
        padding: 14px 18px;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: white;
        box-sizing: border-box;
      }

      .form-group input:focus, .form-group select:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.12);
        transform: translateY(-1px);
      }

      .form-group input:hover, .form-group select:hover {
        border-color: #cbd5e0;
      }

      .search-btn {
        background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
        color: white;
        padding: 14px 28px;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
        position: relative;
        overflow: hidden;
      }

      .search-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transition: all 0.5s ease;
        transform: translate(-50%, -50%);
      }

      .search-btn:hover::before {
        width: 300px;
        height: 300px;
      }

      .search-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(49, 130, 206, 0.4);
        background: linear-gradient(135deg, #2c5282 0%, #2a4365 100%);
      }

      .search-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .loading {
        text-align: center;
        padding: 40px;
        font-size: 1.1rem;
        color: #3182ce;
      }

      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3182ce;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .results-info {
        background: #ebf8ff;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
        border-left: 4px solid #3182ce;
        font-weight: 600;
        color: #1a365d;
      }

      .trial-card {
        background: white;
        border-radius: 16px;
        padding: 28px;
        margin-bottom: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        border: 1px solid #f1f5f9;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
      }

      .trial-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
        border-color: #e2e8f0;
      }

      .trial-card.priority {
        border-left: 5px solid #e53e3e;
        background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
      }

      .trial-card.nearby {
        border-left: 5px solid #38a169;
        background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
      }

      .trial-card.both-priority {
        border-left: 5px solid #d69e2e;
        background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
      }

      .priority-badge {
        position: absolute;
        top: 18px;
        right: 18px;
        padding: 6px 14px;
        border-radius: 25px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .badge-recruiting {
        background: #e53e3e;
        color: white;
      }

      .badge-nearby {
        background: #38a169;
        color: white;
      }

      .badge-both {
        background: #d69e2e;
        color: white;
      }

      .trial-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1a365d;
        margin-bottom: 15px;
        line-height: 1.4;
        margin-right: 120px;
      }

      .trial-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }

      .meta-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      .meta-label {
        font-weight: 600;
        color: #3182ce;
        min-width: 70px;
        flex-shrink: 0;
      }

      .meta-value {
        color: #2d3748;
        flex: 1;
        word-wrap: break-word;
      }

      .status-recruiting {
        color: #e53e3e;
        font-weight: 600;
      }

      .status-active {
        color: #38a169;
        font-weight: 600;
      }

      .trial-summary {
        background: #f7fafc;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        font-size: 0.95rem;
        line-height: 1.6;
        border-left: 3px solid #3182ce;
      }

      .trial-locations {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
      }

      .locations-title {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .location-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 10px;
      }

      .location-item {
        background: #fff;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        font-size: 0.9rem;
        line-height: 1.4;
        position: relative;
      }

      .location-item.nearby-location {
        background: #f0fff4;
        border-color: #38a169;
        border-width: 2px;
      }

      .trial-link {
        display: inline-block;
        background: #3182ce;
        color: white;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.3s ease;
        margin-top: 15px;
      }

      .trial-link:hover {
        background: #2c5282;
        transform: translateY(-1px);
        text-decoration: none;
        color: white;
      }

      .error {
        background: #fed7d7;
        color: #c53030;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        border-left: 4px solid #c53030;
      }

      .no-results {
        text-align: center;
        padding: 40px;
        color: #718096;
        font-size: 1.1rem;
        background: #f7fafc;
        border-radius: 10px;
        border: 2px dashed #cbd5e0;
      }

      .no-results h3 {
        margin-bottom: 10px;
        color: #2d3748;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .floating-actions {
          bottom: 20px;
          right: 20px;
        }

        .floating-btn {
          width: 50px;
          height: 50px;
          font-size: 1.2rem;
        }

        .form-row {
          flex-direction: column;
        }

        .form-group, .form-group.small {
          flex: 1;
          min-width: auto;
        }

        .trial-meta {
          grid-template-columns: 1fr;
        }

        .location-list {
          grid-template-columns: 1fr;
        }

        .search-btn {
          width: 100%;
        }

        .trial-title {
          margin-right: 0;
        }

        .priority-badge {
          position: static;
          display: inline-block;
          margin-bottom: 10px;
        }
      }
    </style>
  `;

  document.getElementById('form-container').innerHTML = formHtml;

  //yay the progress bar
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / documentHeight) * 100;
    document.getElementById('progressBar').style.width = scrollPercent + '%';
  });

  //floating functions
  window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.openHelp = function() {
    window.open('bot.html', '_blank');
  };

  //states that are close to each other
  const stateProximity = {
    'california': ['nevada', 'oregon', 'arizona'],
    'texas': ['oklahoma', 'louisiana', 'arkansas', 'new mexico'],
    'florida': ['georgia', 'alabama', 'south carolina'],
    'new york': ['new jersey', 'pennsylvania', 'connecticut', 'massachusetts'],
    'illinois': ['indiana', 'wisconsin', 'iowa', 'missouri'],
    'pennsylvania': ['new york', 'new jersey', 'delaware', 'maryland', 'ohio'],
    'ohio': ['pennsylvania', 'michigan', 'indiana', 'kentucky', 'west virginia'],
    'georgia': ['florida', 'alabama', 'south carolina', 'north carolina', 'tennessee'],
    'north carolina': ['south carolina', 'georgia', 'tennessee', 'virginia'],
    'michigan': ['ohio', 'indiana', 'wisconsin'],
    'new jersey': ['new york', 'pennsylvania', 'delaware'],
    'virginia': ['north carolina', 'tennessee', 'kentucky', 'west virginia', 'maryland'],
    'washington': ['oregon', 'idaho'],
    'arizona': ['california', 'nevada', 'new mexico', 'utah'],
    'massachusetts': ['new york', 'connecticut', 'rhode island', 'new hampshire', 'vermont'],
    'tennessee': ['kentucky', 'virginia', 'north carolina', 'georgia', 'alabama', 'mississippi', 'arkansas', 'missouri'],
    'indiana': ['ohio', 'michigan', 'illinois', 'kentucky'],
    'missouri': ['illinois', 'kentucky', 'tennessee', 'arkansas', 'oklahoma', 'kansas', 'iowa'],
    'maryland': ['pennsylvania', 'virginia', 'west virginia', 'delaware'],
    'wisconsin': ['illinois', 'indiana', 'michigan', 'minnesota', 'iowa'],
    'colorado': ['wyoming', 'nebraska', 'kansas', 'oklahoma', 'new mexico', 'arizona', 'utah'],
    'minnesota': ['wisconsin', 'iowa', 'south dakota', 'north dakota'],
    'south carolina': ['north carolina', 'georgia'],
    'alabama': ['georgia', 'florida', 'mississippi', 'tennessee'],
    'louisiana': ['texas', 'arkansas', 'mississippi'],
    'kentucky': ['virginia', 'west virginia', 'ohio', 'indiana', 'illinois', 'missouri', 'tennessee'],
    'oregon': ['washington', 'california', 'idaho', 'nevada'],
    'oklahoma': ['texas', 'arkansas', 'missouri', 'kansas', 'colorado', 'new mexico'],
    'connecticut': ['massachusetts', 'rhode island', 'new york'],
    'utah': ['idaho', 'wyoming', 'colorado', 'arizona', 'nevada'],
    'nevada': ['california', 'oregon', 'idaho', 'utah', 'arizona'],
    'arkansas': ['tennessee', 'mississippi', 'louisiana', 'texas', 'oklahoma', 'missouri'],
    'mississippi': ['alabama', 'tennessee', 'arkansas', 'louisiana'],
    'kansas': ['nebraska', 'missouri', 'oklahoma', 'colorado'],
    'iowa': ['minnesota', 'wisconsin', 'illinois', 'missouri', 'south dakota', 'nebraska'],
    'west virginia': ['ohio', 'pennsylvania', 'maryland', 'virginia', 'kentucky'],
    'nebraska': ['south dakota', 'iowa', 'missouri', 'kansas', 'colorado', 'wyoming'],
    'idaho': ['montana', 'wyoming', 'utah', 'nevada', 'oregon', 'washington'],
    'hawaii': [],
    'new hampshire': ['massachusetts', 'vermont', 'maine'],
    'maine': ['new hampshire'],
    'montana': ['north dakota', 'south dakota', 'wyoming', 'idaho'],
    'rhode island': ['massachusetts', 'connecticut'],
    'delaware': ['maryland', 'pennsylvania', 'new jersey'],
    'south dakota': ['north dakota', 'minnesota', 'iowa', 'nebraska', 'wyoming', 'montana'],
    'north dakota': ['minnesota', 'south dakota', 'montana'],
    'alaska': [],
    'vermont': ['new hampshire', 'massachusetts', 'new york'],
    'wyoming': ['montana', 'south dakota', 'nebraska', 'colorado', 'utah', 'idaho']
  };

  //all the events
  document.getElementById('trialForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const condition = document.getElementById('condition').value.trim();
    const location = document.getElementById('location').value.trim().toLowerCase();
    const status = document.getElementById('status').value;
    const resultsContainer = document.getElementById('results');
    const searchBtn = document.getElementById('searchBtn');

    // Show loading state
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span class="spinner"></span>Searching...';
    resultsContainer.innerHTML = '<div class="loading"><span class="spinner"></span>Searching for cancer trials...</div>';

    try {
      //parameters
      const params = new URLSearchParams();

      //cancer, condition added
      let queryTerms = ['cancer'];
      if (condition) {
        queryTerms.push(condition);
      }
      params.append('query.cond', queryTerms.join(' '));

      //large page sizsing
      params.append('format', 'json');
      params.append('pageSize', '50');
      params.append('fields', 'NCTId,BriefTitle,Phase,OverallStatus,BriefSummary,Condition,LocationCity,LocationState,LocationCountry,LocationFacility');

      const url = `${API_BASE}?${params.toString()}`;
      console.log('Fetching from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      let studies = data.studies || [];

      if (studies.length === 0) {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <h3>No cancer trials found</h3>
            <p>Try different cancer types or treatment keywords.</p>
            <p><small>Examples: "breast cancer", "lung cancer", "immunotherapy", "chemotherapy"</small></p>
          </div>
        `;
        return;
      }

      //close states
      const nearbyStates = location && stateProximity[location] ? stateProximity[location] : [];

      //list of importance
      studies.sort((a, b) => {
        const statusA = a.protocolSection?.statusModule?.overallStatus || '';
        const statusB = b.protocolSection?.statusModule?.overallStatus || '';
        const locationsA = a.protocolSection?.contactsLocationsModule?.locations || [];
        const locationsB = b.protocolSection?.contactsLocationsModule?.locations || [];

        const isActiveA = statusA === 'RECRUITING' || statusA === 'NOT_YET_RECRUITING';
        const isActiveB = statusB === 'RECRUITING' || statusB === 'NOT_YET_RECRUITING';

        //near the users location
        const hasNearbyLocationA = locationsA.some(loc => {
          const state = (loc.state || '').toLowerCase();
          return state === location || nearbyStates.includes(state);
        });
        const hasNearbyLocationB = locationsB.some(loc => {
          const state = (loc.state || '').toLowerCase();
          return state === location || nearbyStates.includes(state);
        });

        //prioritzing
        if (status === 'active' || status === 'recruiting') {
          if (isActiveA && !isActiveB) return -1;
          if (!isActiveA && isActiveB) return 1;
        }

        // thenlocations
        if (hasNearbyLocationA && !hasNearbyLocationB) return -1;
        if (!hasNearbyLocationA && hasNearbyLocationB) return 1;

        // then status
        if (isActiveA && !isActiveB) return -1;
        if (!isActiveA && isActiveB) return 1;

        return 0;
      });

      // status pref
      if (status === 'recruiting') {
        studies = studies.filter(study => {
          const currentStatus = study.protocolSection?.statusModule?.overallStatus || '';
          return currentStatus === 'RECRUITING';
        });
      }

      // final results show on screen
      let resultsHtml = `
        <div class="results-info">
          Found <strong>${studies.length}</strong> cancer trials
        </div>
      `;

      // processing
      studies.slice(0, 25).forEach((study, index) => {
        const protocolSection = study.protocolSection || {};
        const identificationModule = protocolSection.identificationModule || {};
        const designModule = protocolSection.designModule || {};
        const descriptionModule = protocolSection.descriptionModule || {};
        const conditionsModule = protocolSection.conditionsModule || {};
        const contactsLocationsModule = protocolSection.contactsLocationsModule || {};
        const statusModule = protocolSection.statusModule || {};

        const nctId = identificationModule.nctId || 'N/A';
        const title = identificationModule.briefTitle || 'Untitled Study';
        const phases = designModule.phases || [];
        const phaseText = phases.length > 0 ? phases.join(', ') : 'N/A';
        const currentStatus = statusModule.overallStatus || 'Unknown';
        const summary = descriptionModule.briefSummary || 'No summary available';
        const conditions = conditionsModule.conditions || [];
        const locations = contactsLocationsModule.locations || [];

        const trialLink = `https://clinicaltrials.gov/study/${nctId}`;

        // priotiry status
        const isRecruiting = currentStatus === 'RECRUITING' || currentStatus === 'NOT_YET_RECRUITING';
        const hasNearbyLocation = location && locations.some(loc => {
          const state = (loc.state || '').toLowerCase();
          return state === location || nearbyStates.includes(state);
        });

        let cardClass = 'trial-card';
        let badgeHtml = '';

        if (isRecruiting && hasNearbyLocation) {
          cardClass += ' both-priority';
          badgeHtml = '<div class="priority-badge badge-both">PRIORITY</div>';
        } else if (isRecruiting) {
          cardClass += ' priority';
          badgeHtml = '<div class="priority-badge badge-recruiting">ACTIVE</div>';
        } else if (hasNearbyLocation) {
          cardClass += ' nearby';
          badgeHtml = '<div class="priority-badge badge-nearby">NEARBY</div>';
        }
        const statusDisplay = currentStatus.replace(/_/g, ' ').toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        let statusClass = '';
        if (currentStatus === 'RECRUITING') {
          statusClass = 'status-recruiting';
        } else if (currentStatus === 'ACTIVE_NOT_RECRUITING' || currentStatus === 'NOT_YET_RECRUITING') {
          statusClass = 'status-active';
        }

        resultsHtml += `
          <div class="${cardClass}">
            ${badgeHtml}
            <div class="trial-title">${title}</div>

            <div class="trial-meta">
              <div class="meta-item">
                <span class="meta-label">ID:</span>
                <span class="meta-value">${nctId}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Phase:</span>
                <span class="meta-value">${phaseText}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Status:</span>
                <span class="meta-value ${statusClass}">${statusDisplay}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Focus:</span>
                <span class="meta-value">${conditions.slice(0, 2).join(', ') || 'Cancer Treatment'}</span>
              </div>
            </div>

            <div class="trial-summary">
              <strong>Trial Summary:</strong><br>
              ${summary.length > 400 ? summary.substring(0, 400) + '...' : summary}
            </div>
        `;
//a lot of designing stuff
        if (locations.length > 0) {
          const sortedLocations = locations.sort((a, b) => {
            const stateA = (a.state || '').toLowerCase();
            const stateB = (b.state || '').toLowerCase();

            const isNearbyA = stateA === location || nearbyStates.includes(stateA);
            const isNearbyB = stateB === location || nearbyStates.includes(stateB);

            if (isNearbyA && !isNearbyB) return -1;
            if (!isNearbyA && isNearbyB) return 1;
            return 0;
          });

          resultsHtml += `
            <div class="trial-locations">
              <div class="locations-title">
                Study Locations (${locations.length} total):
              </div>
              <div class="location-list">
          `;

          sortedLocations.slice(0, 8).forEach(loc => {
            const facility = loc.facility || 'Cancer Center';
            const city = loc.city || '';
            const state = loc.state || '';
            const country = loc.country || '';

            const locState = state.toLowerCase();
            const isNearby = locState === location || nearbyStates.includes(locState);

            let locationText = `<strong>${facility}</strong>`;
            const locationParts = [city, state, country].filter(Boolean);
            if (locationParts.length > 0) {
              locationText += `<br><small>${locationParts.join(', ')}</small>`;
            }

            const locationClass = isNearby ? 'location-item nearby-location' : 'location-item';

            resultsHtml += `<div class="${locationClass}">${locationText}</div>`;
          });

          if (locations.length > 8) {
            resultsHtml += `<div class="location-item"><em>+${locations.length - 8} more locations available</em></div>`;
          }

          resultsHtml += `
              </div>
            </div>
          `;
        }

        resultsHtml += `
            <a href="${trialLink}" target="_blank" rel="noopener noreferrer" class="trial-link">
              View Complete Trial Details
            </a>
          </div>
        `;
      });

      resultsContainer.innerHTML = resultsHtml;

      //scrolling bar
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      console.error('Search error:', err);
      resultsContainer.innerHTML = `
        <div class="error">
          <strong>Search Error:</strong> ${err.message}
          <br><br>
          <small>
            This could be due to:
            <ul>
              <li>Network connection issues</li>
              <li>ClinicalTrials.gov API temporarily unavailable</li>
              <li>Invalid search parameters</li>
            </ul>
            Please try again with different cancer-related keywords.
          </small>
        </div>
      `;
    } finally {
      //reset
      searchBtn.disabled = false;
      searchBtn.innerHTML = 'Find Cancer Trials';
    }
  });

  setTimeout(() => {
    const conditionInput = document.getElementById('condition');
    if (conditionInput) {
      conditionInput.focus();
    }
  }, 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createForm);
} else {
  createForm();
}
window.onload = createForm;
