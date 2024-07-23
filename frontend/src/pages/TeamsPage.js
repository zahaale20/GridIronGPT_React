import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Seattle_Seahawks_logo from '../assets/team-logos/seattle-seahawks.png';
import './TeamsPage.css';

const teamIcon = new L.Icon({
    iconUrl: Seattle_Seahawks_logo,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
});

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        // Fetch teams data from backend
        const fetchTeams = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND_LINK + '/teams');
                setTeams(response.data);
            } catch (error) {
                console.error('Error fetching teams data:', error);
            }
        };

        fetchTeams();
    }, []);

    return (
        <div style={{ height: '90vh', marginTop: '82px' }}>
            <MapContainer center={[37.0902, -95.7129]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {teams.map(team => (
                    <Marker
                        key={team.teamID}
                        position={[team.latitude, team.longitude]}
                        icon={teamIcon}
                    >
                        <Popup>
                            <div>
                                <h2>{team.name}</h2>
                                <p><strong>Roster:</strong> {JSON.parse(team.roster).join(', ')}</p>
                                <p><strong>Schedule:</strong> {JSON.parse(team.schedule).join(', ')}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default TeamsPage;