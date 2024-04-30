import React from 'react';
import SearchBar from '../components/SearchBar';
import LogoImage from '../assets/gridirongpt_logo.png';

function HomePage() {
    const handleSearch = (searchTerm) => {
        console.log(`Search Term: ${searchTerm}`);
    };

  return (
    <div style = {{marginTop: '75px'}}>
        <SearchBar onSearch={handleSearch} />
    </div>
  );
}

export default HomePage;