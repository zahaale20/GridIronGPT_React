import React, { useState } from 'react';
import './RosterSettingsModal.css';

function RosterSettingsModal({ rosterConfig, onSave, onClose, defaultConfig }) {
    const [localConfig, setLocalConfig] = useState(rosterConfig);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalConfig(prev => ({
            ...prev,
            [name]: parseInt(value, 10)
        }));
    };

    const handleSave = () => {
        onSave(localConfig);
        onClose();
    };

    const handleReset = () => {
        setLocalConfig(defaultConfig);  // Reset to the default configuration
    };

    // Function to generate options based on the position
    const generateOptions = (position) => {
        const lowerLimit = position === "BNCH" ? 4 : 1;
        const upperLimit = position === "BNCH" ? 10 : 3;
        let options = [];
        for (let i = lowerLimit; i <= upperLimit; i++) {
            options.push(<option key={i} value={i}>{i}</option>);
        }
        return options;
    };

    return (
        <div className="roster-settings-modal">
            <div className="modal-content">
                <div className="header-container">
                    <p className="header-label">Roster Settings</p>
                    <p className="subheader-label">Set the lineup configuration.</p>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                    {Object.keys(localConfig).map(position => (
                        <div key={position} className="form-group">
                            <p className="position-label"htmlFor={position}>{position}</p>
                            <select
                                id={position}
                                name={position}
                                value={localConfig[position]}
                                onChange={handleChange}>
                                {generateOptions(position)}
                            </select>
                        </div>
                    ))}
                    <div className="modal-actions">
                        <button type="button" onClick={handleSave}>Save</button>
                        <div className="reset-cancel-group">
                            <button type="button" onClick={handleReset}>Reset</button>
                            <button type="button" onClick={onClose}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RosterSettingsModal;
