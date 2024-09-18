import React, { useState, useMemo } from 'react';
import DraftRankingsTable from './DraftRankingsTable';
import PlayerDetails from './PlayerDetails';
import RosterSettingsModal from './RosterSettingsModal';
import './DraftRankingsPage.css';
import '../rankings/RankingsPage.css';

function DraftRankingsPage() {
    const [teamCount, setTeamCount] = useState(10);
    const [scoringFormat, setScoringFormat] = useState('PPR');
    const [isRosterView, setIsRosterView] = useState(false);

    const [rosterConfig, setRosterConfig] = useState({
        QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1, DST: 1, K: 1, BNCH: 7
    });

    const defaultConfig = {
        QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1, DST: 1, K: 1, BNCH: 7
    };

    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const positionOrder = useMemo(() => {
        const positions = [];
        Object.keys(rosterConfig).forEach(position => {
            for (let i = 0; i < rosterConfig[position]; i++) {
                positions.push(position);
            }
        });
        return positions;
    }, [rosterConfig]);

    const rounds = useMemo(() => positionOrder.length, [positionOrder]);
    const totalPicks = useMemo(() => teamCount * rounds, [teamCount, rounds]);
    const [selectedPlayers, setSelectedPlayers] = useState(Array(totalPicks).fill(null));
    const [teamByeWeeks, setTeamByeWeeks] = useState({});

    const currentPickIndex = selectedPlayers.findIndex(player => player === null);
    const currentRound = Math.floor(currentPickIndex / teamCount) + 1;
    const currentPick = (currentPickIndex % teamCount) + 1;

    const handleScoringFormatChange = (e) => {
        setScoringFormat(e.target.value);
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

    const handleSelectPlayer = (player) => {
        const index = selectedPlayers.indexOf(null);
        const playerWithPick = { ...player, draftPick: index + 1, id: player.PLAYER_ID || player.player_id };

        setSelectedPlayers(prevPlayers =>
            prevPlayers.map((p, idx) => idx === index ? playerWithPick : p)
        );
    };

    const handleDeselectPlayer = (playerId) => {
        
        const playerToDeselectIndex = selectedPlayers.findIndex(player => player && player.id === playerId);

        
        if (playerToDeselectIndex === -1) {
            console.log("Player not found");
            return;
        }
        
        const newSelectedPlayers = [...selectedPlayers];
        const playerToDeselect = newSelectedPlayers[playerToDeselectIndex];
        newSelectedPlayers[playerToDeselectIndex] = null;
        
        const updatedByeWeeks = { ...teamByeWeeks };
        const teamIndex = teamsDraftOrder[playerToDeselectIndex];
        const positionByes = updatedByeWeeks[teamIndex][playerToDeselect.position];
        if (positionByes) {
            for (let i = 0; i < positionByes.length; i++) {
                if (positionByes[i] === playerToDeselect.draft_bye) {
                    positionByes.splice(i, 1);
                    break;
                }
            }

            if (positionByes.length === 0) {
                delete updatedByeWeeks[teamIndex][playerToDeselect.position];
            }
        }
        
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

    const toggleSettingsModal = () => {
        setShowSettingsModal(!showSettingsModal);
    };

    const renderDraftBoard = () => (
        <div className="horizontal-scroll-container">
            {Array.from({ length: teamCount }).map((_, col) => (
                <div key={col} className="draft-column">
                    <div className="draft-column-header" style={{ background: 'rgb(48, 145, 177)' }}>Team {col + 1}</div>
                    {Array.from({ length: rounds }).map((_, round) => {
                        const idx = round * teamCount + (round % 2 === 0 ? col : (teamCount - 1 - col));
                        const pick_number = `Round ${round + 1} - Pick ${idx + 1}`;
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
        const startingPlayers = {};
        const assignedPlayers = {};
    
        return (
            <div className="horizontal-scroll-container">
                {Array.from({ length: teamCount }).map((_, col) => (
                    <div key={col} className="draft-column">
                        <div className="draft-column-header" style={{ background: 'rgb(48, 145, 177)' }}>
                            Team {col + 1}
                        </div>
                        {positionOrder.map((position, idx) => {
                            let player;
                            
                            const teamPlayers = selectedPlayers.filter((p, index) => {
                                const round = Math.floor(index / teamCount);
                                const isEvenRound = round % 2 === 0;
                                const teamIdx = isEvenRound ? col : teamCount - 1 - col;
                                return p && teamIdx === (index % teamCount);
                            });
    
                            if (['QB', 'RB', 'WR', 'TE', 'DST', 'K'].includes(position)) {
                                const positionIndex = positionOrder.slice(0, idx + 1).filter(pos => pos === position).length - 1;
                                player = teamPlayers.filter(p => p.position === position)[positionIndex];
                                // Track assigned players
                                if (player) {
                                    startingPlayers[player.draftPick] = player;
                                    assignedPlayers[player.draftPick] = player;
                                }
                            }
                            
                            else if (position === 'FLEX') {
                                player = teamPlayers
                                    .filter(p => ['RB', 'WR', 'TE'].includes(p.position) && !startingPlayers[p.draftPick])
                                    .sort((a, b) => a.draftPick - b.draftPick)[0];
                                if (player) {
                                    assignedPlayers[player.draftPick] = player;
                                }
                            }

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
    

    return (
        <div className="fantasy-rankings-container">
            <div className="round-pick-header">
                <h1 className="filter-header">Picks</h1>
                <h1 className="filter-subheader">Round {currentRound} - Pick {currentPick}</h1>
            </div>
            <div className="draft-filter-container">
            <div className="draft-filter">
                    <select value={teamCount} onChange={(e) => setTeamCount(parseInt(e.target.value, 10))}>
                        <option value={8}>8 Teams</option>
                        <option value={10}>10 Teams</option>
                        <option value={12}>12 Teams</option>
                    </select>
                </div>
                <div className="draft-filter">
                    <select value={scoringFormat} onChange={handleScoringFormatChange}>
                        <option value="PPR">PPR</option>
                        <option value="Half PPR">Half PPR</option>
                        <option value="Standard">Standard</option>
                    </select>
                </div>
                <button className="settings-button" onClick={toggleSettingsModal}>
                    Roster
                </button>
                <button className="toggle-roster-button" onClick={toggleRosterView}>
                    {isRosterView ? "Show Board" : "Show Roster"}
                </button>
                <button className="reset-button" onClick={resetDraftBoard}>
                    Reset Draft Board
                </button>
            </div>
            {showSettingsModal && (
                <RosterSettingsModal
                    rosterConfig={rosterConfig}
                    defaultConfig={defaultConfig}
                    onSave={setRosterConfig}
                    onClose={() => setShowSettingsModal(false)}
                />
            )}
            {isRosterView ? renderRosterView() : renderDraftBoard()}
            <div className="draft-rankings-table">
                <DraftRankingsTable
                    onSelectPlayer={handleSelectPlayer}
                    selectedPlayerIds={selectedPlayers.map(player => player ? player.id : null)}
                    currentDraftingTeamId={teamsDraftOrder[selectedPlayers.findIndex(p => p === null)]}
                    teamsDraftOrder={teamsDraftOrder}
                    teamByeWeeks={teamByeWeeks}
                    setTeamByeWeeks={setTeamByeWeeks}
                    scoringFormat={scoringFormat}
                />
            </div>
        </div>
    );
}

export default DraftRankingsPage;