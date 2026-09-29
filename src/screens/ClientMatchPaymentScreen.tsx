import React from 'react';

import PlaceholderScreen from '../components/PlaceholderScreen';

export default function ClientMatchPaymentScreen({ navigation }: any) {
  return (
    <PlaceholderScreen
      titulli="Tarifat e Shtypjes"
      ikona="💰"
      pershkrimi="Ndarja e tarifave dhe pagesa e klientit nuk eshte gati ende."
      navigation={navigation}
    />
  );
}
