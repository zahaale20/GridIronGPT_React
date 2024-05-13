import React from 'react';
import SearchBar from '../components/SearchBar';
import LeftColumn from '../components/LeftColumn';
import RightColumn from '../components/RightColumn';

function HomePage() {
    const handleSearch = (searchTerm) => {
        console.log(`Search Term: ${searchTerm}`);
    };

  return (
    <div style = {{paddingTop: '110px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', flexDirection: 'row', backgroundColor: '#efefef'}}>
        <LeftColumn />
        <SearchBar onSearch={handleSearch} />
        <RightColumn />
    </div>
  );
}

export default HomePage;