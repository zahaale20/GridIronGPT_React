import React, { useState } from 'react';
import DraftRankingsTable from './DraftRankingsTable';
import PlayerDetails from './PlayerDetails';
import './DraftRankingsPage.css';
import '../rankings/RankingsPage.css';

function DraftRankingsPage() {
    const [teamCount, setTeamCount] = useState(10);
    const [isRosterView, setIsRosterView] = useState(false);
    const rounds = 16;
    const totalPicks = teamCount * rounds;
    const [selectedPlayers, setSelectedPlayers] = useState(Array(totalPicks).fill(null));
    const [teamByeWeeks, setTeamByeWeeks] = useState({});
    const positionOrder = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'DST', 'K', ...Array(7).fill('BNCH')];

const handleSelectPlayer = (player) => {
    const index = selectedPlayers.indexOf(null);
    const playerWithPick = { ...player, draftPick: index + 1, id: player.PLAYER_ID || player.player_id };

    setSelectedPlayers(prevPlayers =>
        prevPlayers.map((p, idx) => idx === index ? playerWithPick : p)
    );
};

    const handleDeselectPlayer = (playerId) => {
        console.log("Deselecting player with ID:", playerId);
        
        // Find the index of the player to be deselected
        const playerToDeselectIndex = selectedPlayers.findIndex(player => player && player.id === playerId);
        
        if (playerToDeselectIndex === -1) {
            console.log("Player not found");
            return; // If player ID not found, exit the function
        }
        
        // Prepare to update the selected players array and bye weeks
        const newSelectedPlayers = [...selectedPlayers];
        const playerToDeselect = newSelectedPlayers[playerToDeselectIndex];
        newSelectedPlayers[playerToDeselectIndex] = null;
        
        // Update the team bye weeks
        const updatedByeWeeks = { ...teamByeWeeks };
        console.log("Before: ", updatedByeWeeks)
        const teamIndex = teamsDraftOrder[playerToDeselectIndex];
        const positionByes = updatedByeWeeks[teamIndex] && updatedByeWeeks[teamIndex][playerToDeselect.position];
        
        if (positionByes) {
            // Specifically remove only the matching bye week of the deselected player
            const byeIndex = positionByes.indexOf(playerToDeselect.bye);
            if (byeIndex > -1) {
                positionByes.splice(byeIndex, 1);
                // If there are no more byes left for this position, delete the position key
                if (positionByes.length === 0) {
                    delete updatedByeWeeks[teamIndex][playerToDeselect.position];
                }
            }
        }
        
        console.log(`Updated bye weeks for team ${teamIndex}:`, updatedByeWeeks[teamIndex]);
        
        // Set the updated state
        setSelectedPlayers(newSelectedPlayers);
        setTeamByeWeeks(updatedByeWeeks);
    };

    const resetDraftBoard = () => {
        setSelectedPlayers(Array(totalPicks).fill(null));
        setTeamByeWeeks({});
    };

    const toggleRosterView = () => {
        setIsRosterView(!isRosterView);
    };

    const renderDraftBoard = () => (
        <div className="horizontal-scroll-container">
            {Array.from({ length: teamCount }).map((_, col) => (
                <div key={col} className="draft-column">
                    <div className="draft-column-header" style={{ background: 'rgb(48, 145, 177)' }}>Team {col + 1}</div>
                    {Array.from({ length: rounds }).map((_, round) => {
                        const idx = round * teamCount + (round % 2 === 0 ? col : (teamCount - 1 - col));
                        const pick_number = `Round: ${round + 1}, Pick: ${idx + 1}`;
                        const pick_num = `${round + 1}.${idx + 1}`;
                        const player = selectedPlayers[idx];
                        return player ? (
                            <PlayerDetails key={pick_number} player={player} onDeselectPlayer={handleDeselectPlayer} pickNumber={pick_num} />
                        ) : (
                            <div key={pick_number} className={`empty-slot ${idx === selectedPlayers.indexOf(null) ? 'current-pick' : ''}`}>
                                {pick_number}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    const renderRosterView = () => {
        const startingPlayers = {};  // Track players assigned to starting positions
        const assignedPlayers = {};  // Track all players assigned to any position (including FLEX, BENCH)
    
        return (
            <div className="horizontal-scroll-container">
                {Array.from({ length: teamCount }).map((_, col) => (
                    <div key={col} className="draft-column">
                        <div className="draft-column-header" style={{ background: 'rgb(48, 145, 177)' }}>
                            Team {col + 1}
                        </div>
                        {positionOrder.map((position, idx) => {
                            let player;
                            
                            // Filter the players for this team based on the draft position
                            const teamPlayers = selectedPlayers.filter((p, index) => {
                                const round = Math.floor(index / teamCount);
                                const isEvenRound = round % 2 === 0;
                                const teamIdx = isEvenRound ? col : teamCount - 1 - col;
                                return p && teamIdx === (index % teamCount);
                            });
    
                            // Handle standard positions (QB, RB, WR, TE)
                            if (['QB', 'RB', 'WR', 'TE'].includes(position)) {
                                const positionIndex = positionOrder.slice(0, idx + 1).filter(pos => pos === position).length - 1;
                                player = teamPlayers.filter(p => p.position === position)[positionIndex];
                                // Track assigned players
                                if (player) {
                                    startingPlayers[player.draftPick] = player;
                                    assignedPlayers[player.draftPick] = player;
                                }
                            }
                            // Handle FLEX position
                            else if (position === 'FLEX') {
                                player = teamPlayers
                                    .filter(p => ['RB', 'WR', 'TE'].includes(p.position) && !startingPlayers[p.draftPick])
                                    .sort((a, b) => a.draftPick - b.draftPick)[0];
                                if (player) {
                                    assignedPlayers[player.draftPick] = player;
                                }
                            }
                            // Handle BENCH positions
                            else if (position === 'BNCH') {
                                player = teamPlayers
                                    .filter(p => !assignedPlayers[p.draftPick])
                                    .sort((a, b) => a.draftPick - b.draftPick)[0];
                                if (player) {
                                    assignedPlayers[player.draftPick] = player;
                                }
                            }
    
                            const pick_number = `${position}`;
                            return player ? (
                                <PlayerDetails 
                                    key={idx} 
                                    player={player} 
                                    onDeselectPlayer={handleDeselectPlayer} 
                                    pickNumber={pick_number} 
                                />
                            ) : (
                                <div key={idx} className="empty-slot">
                                    {pick_number}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    const getSnakeDraftOrder = (teamCount, rounds) => {
        let order = [];
        for (let round = 0; round < rounds; round++) {
            let roundOrder = Array.from({ length: teamCount }, (_, i) => i);
            if (round % 2 !== 0) roundOrder.reverse();
            order = order.concat(roundOrder);
        }
        return order;
    };

    const teamsDraftOrder = getSnakeDraftOrder(teamCount, rounds);
    

    return (
        <div className="fantasy-rankings-container">
            <h1 className="filter-header">Picks</h1>
            <div className="draft-filter-container">
                <div className="draft-filter">
                    <select value={teamCount} onChange={(e) => setTeamCount(parseInt(e.target.value, 10))}>
                        <option value={8}>8 Teams</option>
                        <option value={10}>10 Teams</option>
                        <option value={12}>12 Teams</option>
                    </select>
                </div>
                <button className="toggle-roster-button" onClick={toggleRosterView}>
                    {isRosterView ? "Show Board" : "Show Roster"}
                </button>
                <button className="reset-button" onClick={resetDraftBoard}>
                    Reset Draft Board
                </button>
            </div>
            {isRosterView ? renderRosterView() : renderDraftBoard()}
            <div className="draft-rankings-table">
                <DraftRankingsTable
                    onSelectPlayer={handleSelectPlayer}
                    selectedPlayerIds={selectedPlayers.map(player => player ? player.id : null)}
                    currentDraftingTeamId={teamsDraftOrder[selectedPlayers.findIndex(p => p === null)]}
                    teamsDraftOrder={teamsDraftOrder}
                    teamByeWeeks={teamByeWeeks}
                    setTeamByeWeeks={setTeamByeWeeks}
                />
            </div>
        </div>
    );
}

export default DraftRankingsPage;