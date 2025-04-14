import React, { useEffect, useState } from 'react';
import './ScorecardDisplay.css';
import { io } from 'socket.io-client';

const socket = io('https://wccbackendoffl.onrender.com'); // your backend with sockets enabled

function ScoreCardDisplay() {
  const [scorecards, setScorecards] = useState([]);

  const fetchScorecards = () => {
    fetch('https://wccbackendoffl.onrender.com/api/scorecard')
      .then(res => res.json())
      .then(setScorecards)
      .catch(console.error);
  };

  useEffect(() => {
    fetchScorecards();

    socket.on('connect', () => {
      console.log('🟢 Connected to socket');
    });

    socket.on('newScorecard', (data) => {
      console.log('📥 New scorecard received');
      fetchScorecards(); // Refresh scorecard data
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="scorecards">
      {scorecards.map((match, index) => (
        <div key={index} className="match-card">
          <h2>{match.matchTitle}</h2>
          <p><b>Venue:</b> {match.venue} | <b>Date:</b> {match.date}</p>
          <p><b>Toss:</b> {match.toss}</p>
          <p><b>Result:</b> {match.result}</p>
          <p><b>Player of the Match:</b> {match.playerOfTheMatch}</p>

          {match.innings.map((inn, i) => (
            <div key={i} className="innings">
              <h3>{inn.team} - {inn.total} ({inn.overs} overs)</h3>
              <table>
                <thead>
                  <tr><th>Batsman</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th><th>Dismissal</th></tr>
                </thead>
                <tbody>
                  {inn.players.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.name}</td>
                      <td>{p.runs}</td>
                      <td>{p.balls}</td>
                      <td>{p.fours}</td>
                      <td>{p.sixes}</td>
                      <td>{p.sr}</td>
                      <td>{p.howOut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p><b>Extras:</b> {inn.extras}</p>
              <p><b>Fall of Wickets:</b> {inn.fallOfWickets}</p>

              <h4>Bowling</h4>
              <table>
                <thead>
                  <tr>
                    <th>Bowler</th><th>O</th><th>R</th><th>W</th><th>Eco</th><th>0s</th><th>4s</th><th>6s</th><th>Wd</th><th>Nb</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.bowlers.map((b, idx) => (
                    <tr key={idx}>
                      <td>{b.name}</td>
                      <td>{b.overs}</td>
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
      ))}
    </div>
  );
}

export default ScoreCardDisplay;
