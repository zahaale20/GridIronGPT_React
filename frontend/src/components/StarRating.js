import React from 'react';
import './StarRating.css';

const StarRating = ({ rating }) => {
    const scaleRating = rating / 20; // Converts rating out of 100 to a scale of 5
    const fullStars = Math.floor(scaleRating);
    const halfStar = (scaleRating % 1) >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
        <div className="star-rating">
            {Array.from({ length: fullStars }).map((_, index) => (
                <img key={`full-${index}`} src={require('../assets/stars/full-star.png')} alt="Full Star" className="star" />
            ))}
            {halfStar === 1 && (
                <img key="half" src={require('../assets/stars/half-star.png')} alt="Half Star" className="star" />
            )}
            {Array.from({ length: emptyStars }).map((_, index) => (
                <img key={`empty-${index}`} src={require('../assets/stars/empty-star.png')} alt="Empty Star" className="star" />
            ))}
        </div>
    );
};

export default StarRating;