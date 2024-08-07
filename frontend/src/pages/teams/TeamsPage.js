import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './TeamsPage.css';

const TeamsPage = () => {
    const [matchups, setMatchups] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [zoomLevel, setZoomLevel] = useState(5);
    const [year, setYear] = useState(2024);
    const [week, setWeek] = useState("Preseason Week 1");

    useEffect(() => {
        const fetchMatchups = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_LINK}/teams/matchups?year=${year}&week=${week}`);
                setMatchups(response.data);
                setErrorMessage('');
            } catch (error) {
                console.error('Error fetching matchups:', error);
                const msg = error.response ? `Error: ${error.response.data.error}` : "Error: Failed to fetch matchups. Please try again.";
                setErrorMessage(msg);
            }
        };

        fetchMatchups();
    }, [year, week]);

    const isConcurrentGame = (teamName, allMatchups) => {
        const teamCityPrefix = teamName.split(' ')[0];
        return allMatchups.filter(({ hometeamname }) => hometeamname.startsWith(teamCityPrefix)).length > 1;
    };

    const getIcon = (homeLogoUrl, awayLogoUrl) => {
        return L.divIcon({
            html: `
                <div class="matchup-icon">
                    <img src="${awayLogoUrl}" alt="Away Team Logo" />
                    <span class="matchup-symbol">@</span>
                    <img src="${homeLogoUrl}" alt="Home Team Logo" />
                </div>`,
            iconSize: [150, 50],
            iconAnchor: [75, 25],
            popupAnchor: [0, -25]
        });
    };

    const getAdjustedPosition = (latitude, longitude, teamName, allMatchups) => {
        if (!isConcurrentGame(teamName, allMatchups)) {
            return [parseFloat(latitude), parseFloat(longitude)];
        }

        const baseOffset = 0.8 * Math.pow(2, 5 - zoomLevel);

        switch(teamName) {
            case 'Los Angeles Chargers':
                return [parseFloat(latitude) + baseOffset, parseFloat(longitude) + baseOffset / 2];
            case 'Los Angeles Rams':
                return [parseFloat(latitude) - baseOffset, parseFloat(longitude) + baseOffset / 2];
            case 'New York Giants':
                return [parseFloat(latitude) + baseOffset, parseFloat(longitude) - baseOffset / 2];
            case 'New York Jets':
                return [parseFloat(latitude) - baseOffset, parseFloat(longitude) - baseOffset / 2];
            default:
                return [parseFloat(latitude), parseFloat(longitude)];
        }
    };

    const MapEvents = () => {
        const map = useMapEvents({
            zoomend: () => {
                setZoomLevel(map.getZoom());
            }
        });
        return null;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const groupedMatchups = matchups.reduce((acc, matchup) => {
        const dateStr = formatDate(matchup.dateTime);
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(matchup);
        return acc;
    }, {});

    return (
        <div className="teams-page-container">
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}
            <div className="control-panel">
                <div className="header">{year} Matchups - {week}</div>
                <div className="filters">
                    <label>
                        <select value={year} onChange={(e) => setYear(e.target.value)}>
                            <option value={2024}>2024</option>
                        </select>
                    </label>
                    <label>
                        <select value={week} onChange={(e) => setWeek(e.target.value)}>
                            <option value="Preseason Week 1">Preseason Week 1</option>
                            <option value="Preseason Week 2">Preseason Week 2</option>
                            <option value="Preseason Week 3">Preseason Week 3</option>
                            <option value="Week 1">Week 1</option>
                            <option value="Week 2">Week 2</option>
                            <option value="Week 3">Week 3</option>
                            <option value="Week 4">Week 4</option>
                            <option value="Week 5">Week 5</option>
                            <option value="Week 6">Week 6</option>
                            <option value="Week 7">Week 7</option>
                            <option value="Week 8">Week 8</option>
                            <option value="Week 9">Week 9</option>
                            <option value="Week 10">Week 10</option>
                            <option value="Week 11">Week 11</option>
                            <option value="Week 12">Week 12</option>
                            <option value="Week 13">Week 13</option>
                            <option value="Week 14">Week 14</option>
                            <option value="Week 15">Week 15</option>
                            <option value="Week 16">Week 16</option>
                            <option value="Week 17">Week 17</option>
                            <option value="Week 18">Week 18</option>

                        </select>
                    </label>
                </div>

                <div className="matchup-list">
                    {Object.keys(groupedMatchups).map((date) => (
                        <div key={date}>
                            <h2 className="date-header">{date}</h2>
                            {groupedMatchups[date].map(matchup => (
                                <div key={matchup.matchupID} className="matchup-details">
                                    <div className="time-box">
                                        {new Date(matchup.dateTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short'
                                        })}
                                    </div>
                                    <h3>
                                        <img src={matchup.awayteamimageurl} alt="Away Team" className="team-icon" />
                                        @
                                        <img src={matchup.hometeamimageurl} alt="Home Team" className="team-icon" />
                                    </h3>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <MapContainer center={[39.0902, -95.7129]} zoom={zoomLevel} minZoom={5} maxZoom={7} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapEvents />
                {matchups.map(matchup => {
                    const adjustedPosition = getAdjustedPosition(matchup.hometeamlatitude, matchup.hometeamlongitude, matchup.hometeamname, matchups);
                    return (
                        <Marker
                            key={matchup.matchupID}
                            position={adjustedPosition}
                            icon={getIcon(matchup.hometeamimageurl, matchup.awayteamimageurl)}
                        >
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default TeamsPage;