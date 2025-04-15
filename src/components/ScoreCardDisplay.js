import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './ScorecardDisplay.css';

const socket = io('https://wccbackendoffl.onrender.com');

function ScoreCardDisplay() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scorecards, setScorecards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef(null);

  const fetchScorecards = () => {
    fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard')
      .then((res) => res.json())
      .then((data) => {
        setScorecards(data);
        setCurrentIndex(0);
      })
      .catch((err) => {
        console.error('Error fetching scorecards:', err);
        alert('Failed to load scorecards, please try again later.');
      });
  };

  useEffect(() => {
    fetchScorecards();

    const handleNewScorecard = () => {
      console.log('📥 New scorecard received');
      fetchScorecards();
    };

    socket.on('connect', () => {
      console.log('🟢 Connected to socket');
    });

    socket.on('newScorecard', handleNewScorecard);

    return () => {
      socket.off('newScorecard', handleNewScorecard);
      socket.disconnect();
    };
  }, []);

  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF!');
    if (file.type !== 'application/pdf') return alert('Only PDF files are allowed!');

    const formData = new FormData();
    formData.append('pdf', file);

    setUploading(true);
    try {
      const res = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      alert('Uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchScorecards();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const currentMatch = scorecards[currentIndex];

  return (
    <div className="scorecard-manager">
      <div className="upload-container">
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          disabled={uploading}
        />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>

      <div className="scorecards">
        {scorecards.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            No scorecards available. Please upload a scorecard.
          </p>
        ) : (
          <>
            <div className="match-card">
              <h2>{currentMatch.matchInfo?.title || 'Untitled Match'}</h2>
              <p><b>Teams:</b> {currentMatch.matchInfo?.teams?.join(' vs ')}</p>
              <p><b>Venue:</b> {currentMatch.matchInfo?.venue} | <b>Date:</b> {currentMatch.matchInfo?.date}</p>
              <p><b>Toss:</b> {currentMatch.matchInfo?.toss}</p>
              <p><b>Result:</b> {currentMatch.matchInfo?.result}</p>
              <p><b>Player of the Match:</b> {currentMatch.matchInfo?.playerOfMatch || '-'}</p>

              {currentMatch.innings?.map((inn, i) => (
                <div key={i} className="innings">
                  <h3>{inn.team} - {inn.total} ({inn.overs} overs)</h3>
                  <p><b>Run Rate:</b> {inn.runRate || 'N/A'}</p>
                  <p><b>Extras:</b> {inn.extras || '0'}</p>

                  <h4>Batting</h4>
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
                          <td>{p.outDesc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {inn.fallOfWickets?.length > 0 && (
                    <p><b>Fall of Wickets:</b> {inn.fallOfWickets.join(', ')}</p>
                  )}

                  <h4>Bowling</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Bowler</th>
                        <th>O</th><th>M</th><th>R</th><th>W</th><th>Eco</th>
                        <th>0s</th><th>4s</th><th>6s</th><th>WD</th><th>NB</th>
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
              ))}
            </div>

            {scorecards.length > 1 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % scorecards.length)}
                >
                  View Previous
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ScoreCardDisplay;
