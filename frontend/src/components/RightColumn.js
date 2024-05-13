import React from 'react';
import './RightColumn.css'; // Linking the CSS file for styling

function RightColumn() {
    return (
        <div className="right-col">
            <div className="top-headlines">
                <h4>Top Headlines</h4>
                <ul>
                    <li>Headline 1</li>
                    <li>Headline 2</li>
                    <li>Headline 3</li>
                </ul>
            </div>
        </div>
    );
}

export default RightColumn;