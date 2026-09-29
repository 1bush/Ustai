import React from 'react';

import PlaceholderScreen from '../components/PlaceholderScreen';

export default function InsuranceScreen({ navigation }: any) {
  return (
    <PlaceholderScreen
      titulli="Sigurimet"
      ikona="🛡️"
      pershkrimi="Planifikimet e sigurimit te punes nuk jane aktive ende."
      navigation={navigation}
    />
  );
}
