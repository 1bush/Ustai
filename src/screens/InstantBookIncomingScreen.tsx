import React from 'react';

import PlaceholderScreen from '../components/PlaceholderScreen';

export default function InstantBookIncomingScreen({ navigation }: any) {
  return (
    <PlaceholderScreen
      titulli="Rezervime nga Klientët"
      ikona="📥"
      pershkrimi="Ndarja e rezervimeve te reja nuk eshte gati ende."
      navigation={navigation}
    />
  );
}
