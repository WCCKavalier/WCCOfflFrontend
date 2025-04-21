import React from 'react';
import './Series.css'; // Shared CSS for styling

const ScoreCard = ({ currentMatch, onClose }) => {
  if (!currentMatch) return null;

  const formatResult = (result) => {
    if (!result) return '';

    // 1. Remove any 4-digit year-like numbers (2023, 2024, etc.)
    result = result.replace(/\d{4}/g, ' ');
    result = result.replace(/notout/gi, 'not out');
    // 2. Insert spaces where needed (camelCase or glued words)
    result = result
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([a-zA-Z])(\d+)/g, '$1 $2')
      .replace(/(\d+)([a-zA-Z])/g, '$1 $2')
      .replace(/(won|lost|beat|lostwith|wonwith)(by|with)/g, '$1 $2');

    // 3. Trim and normalize whitespace
    result = result.trim().replace(/\s+/g, ' ');

    // 4. Fix team name casing: convert uppercase words like TEAMJAYANTH → Team Jayanth
    result = result
      .split(' ')
      .map((word) => {
        if (/^TEAM[A-Z]{3,}$/.test(word)) {
          const namePart = word.replace(/^TEAM/, '');
          return 'Team ' + namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
        } else if (/^[A-Z]{3,}$/.test(word)) {
          return word
            .charAt(0)
            .toUpperCase() + word.slice(1).toLowerCase();
        } else {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
      })
      .join(' ');

    return result;
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="series-close-btn"
          onClick={(e) => {
            e.preventDefault();     // Add this
            e.stopPropagation();    // And this
            onClose();              // Call the close function
          }}
        >
          ×
        </button>
        <h2 style={{ borderBottom: '1px solid #ffd700', paddingBottom: '10px' }}>
          {formatResult(currentMatch.matchInfo?.teams?.join(' vs '))}
        </h2>
        <div className="match-info-row">
          <p className="match-info-left">
            <b>Venue:</b> {formatResult(currentMatch.matchInfo?.venue?.trim() || 'Nidhi')} | <b>Date:</b> {formatResult(currentMatch.matchInfo?.date)}
          </p>
          <p className="match-info-right">
            <b>Toss:</b> {formatResult(currentMatch.matchInfo?.toss)}
          </p>
        </div>

        {/* <p><b>Player of the Match:</b> {currentMatch.matchInfo?.playerOfMatch || '-'}</p> */}

        {/* Display innings data */}
        <div className="innings-container">
          {currentMatch.innings?.map((inn, i) => (
            <div key={i} className="innings-box">
              <h3>{formatResult(inn.team)} - {inn.total} ({inn.overs} overs)</h3>

              <h4>Batting</h4>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Batsman</th>
                      <th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th><th>Dismissal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inn.batsmen?.map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.name}</td>
                        <td>{p.runs}</td>
                        <td>{p.balls}</td>
                        <td>{p.fours}</td>
                        <td>{p.sixes}</td>
                        <td>{p.sr}</td>
                        <td>{formatResult(p.outDesc)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="summary-section">
                {inn.fallOfWickets?.length > 0 ? (
                  <p><b>Fall of Wickets:</b> {formatResult(inn.fallOfWickets.join(' || '))}</p>
                ) : <div style={{ height: '20px' }}></div>}

                <p><b>Run Rate:</b> {inn.runRate || 'N/A'} | <b>Extras:</b> {inn.extras || '0'}</p>

                <h4>Bowling</h4>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th>
                        <th>Eco</th><th>0s</th><th>4s</th><th>6s</th><th>WD</th><th>NB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inn.bowlers?.map((b, idx) => (
                        <tr key={idx}>
                          <td>{b.name}</td>
                          <td>{b.overs}</td>
                          <td>{b.maidens}</td>
                          <td>{b.runs}</td>
                          <td>{b.wickets}</td>
                          <td>{b.eco}</td>
                          <td>{b.dots}</td>
                          <td>{b.fours}</td>
                          <td>{b.sixes}</td>
                          <td>{b.wd}</td>
                          <td>{b.nb}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>


        <h2>{formatResult(currentMatch.matchInfo?.result)}</h2>
      </div>
    </div>
  );
};

export default ScoreCard;
