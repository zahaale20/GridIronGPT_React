import React from 'react';
import LeftColumn from '../components/LeftColumn';
import RightColumn from '../components/RightColumn';

function HomePage() {

  return (
    <div style = {{paddingTop: '110px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', flexDirection: 'row', backgroundColor: '#efefef'}}>
        <LeftColumn />
        <RightColumn />
    </div>
  );
}

export default HomePage;