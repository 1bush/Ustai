import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, TouchableOpacity, StyleSheet, Image, StatusBar, View, Alert } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { NGJYRAT } from './src/theme/colors';

// ═══ AUTH ═══
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import SelectCategoryScreen from './src/screens/SelectCategoryScreen';

// ═══ KLIENT ═══
import ClientMatchPaymentScreen from './src/screens/ClientMatchPaymentScreen';
import JobPostScreen from './src/screens/JobPostScreen';
import JobBidsScreen from './src/screens/JobBidsScreen';
import ReportUserScreen from './src/screens/ReportUserScreen';
import ClientProfileScreen from './src/screens/ClientProfileScreen';
import RefundRequestScreen from './src/screens/RefundRequestScreen';

// ═══ USTAI ═══
import AvailableJobsScreen from './src/screens/AvailableJobsScreen';
import MyBidsScreen from './src/screens/MyBidsScreen';
import UstaiProfileScreen from './src/screens/UstaiProfileScreen';
import UstaiPublicProfileScreen from './src/screens/UstaiPublicProfileScreen';
import UstaiAnalyticsScreen from './src/screens/UstaiAnalyticsScreen';
import VerificationUploadScreen from './src/screens/VerificationUploadScreen';
import CommissionPaymentScreen from './src/screens/CommissionPaymentScreen';

// ═══ JOB FLOW ═══
import RatingScreen from './src/screens/RatingScreen';
import ChatScreen from './src/screens/ChatScreen';
import BrowseUstajteScreen from './src/screens/BrowseUstajteScreen';
import JobTimelineScreen from './src/screens/JobTimelineScreen';
import BeforeAfterPhotosScreen from './src/screens/BeforeAfterPhotosScreen';
import MaterialSuppliersScreen from './src/screens/MaterialSuppliersScreen';
import InsuranceScreen from './src/screens/InsuranceScreen';
import SponsorListingScreen from './src/screens/SponsorListingScreen';

// ═══ EXTRA ═══
import ReferralScreen from './src/screens/ReferralScreen';
import FavoriteUstaiScreen from './src/screens/FavoriteUstaiScreen';
import AddonPaymentScreen from './src/screens/AddonPaymentScreen';
import ConformitySheetScreen from './src/screens/ConformitySheetScreen';
import VideoVerificationScreen from './src/screens/VideoVerificationScreen';
import ContactMapScreen from './src/screens/ContactMapScreen';
import InstantBookScreen from './src/screens/InstantBookScreen';
import InstantBookIncomingScreen from './src/screens/InstantBookIncomingScreen';
import MaintenancePlansScreen from './src/screens/MaintenancePlansScreen';
import MyMaintenanceSubscriptionsScreen from './src/screens/MyMaintenanceSubscriptionsScreen';

// ═══ AI ═══
import AIPreventivScreen from './src/screens/AIPreventivScreen';
import AIScanScreen from './src/screens/AIScanScreen';
import AdminTestScreen from './src/screens/AdminTestScreen';
import AIBathroomPlannerScreen from './src/screens/AIBathroomPlannerScreen';
import AIRoomPlannerScreen from './src/screens/AIRoomPlannerScreen';
import AIMatjaScreen from './src/screens/AIMatjaScreen';

import { regjistroPerNjoftime } from './src/lib/pushNotifications';
import { flushMutations, pendingMutationCount } from './src/lib/offlineQueue';
import { pb, pbReady } from './src/lib/pocketbase';
import { seedCategories } from './src/lib/seedData';

const Stack = createNativeStackNavigator();

const STRIPE_PUBLISHABLE_KEY =
  (Constants.expoConfig?.extra?.stripePublishableKey as string | undefined) ??
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
  '';

function StartScreen({ navigation }: any) {
  React.useEffect(() => {
    // Këtë pjesë është E MBYLLUR për testim — nuk refshij sesionin automatikisht
    /*
    let aktiv = true;
    const ridrejtoSesioni = async () => {
      try {
        await pbReady;
        if (!pb.authStore.model || !aktiv) return;
        ...
    };
    ridrejtoSesioni();
    return () => { aktiv = false; };
    */
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NGJYRAT.sfondi} />
      <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>USTAI-IM</Text>
      <Text style={styles.subtitle}>Gjej ustain e duhur, ose gjej punë</Text>

      {/* HYRJE ADMIN — me 1 buton: logohet si admin (sesion test) + hap panelin */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: '#4CAF50', marginBottom: 20 }]}
        onPress={() => {
          pb.authStore.save('admin-test-token', {
            id: 'mock-admin', username: 'admin', role: 'admin', emri: 'Admin (Test)',
          } as any);
          navigation.navigate('PanelAdminTest');
        }}
      >
        <Text style={styles.btnText}>HYR SI ADMIN (TEST)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Regjistrimi', { roli: 'klient' })}>
        <Text style={styles.btnText}>Jam Klient i Ri</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.btnDark]} onPress={() => navigation.navigate('Regjistrimi', { roli: 'ustai' })}>
        <Text style={styles.btnText}>Jam Ustai i Ri</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: 'transparent', borderWidth: 2, borderColor: NGJYRAT.primare }]} onPress={() => navigation.navigate('Hyrje')}>
        <Text style={[styles.btnText, { color: NGJYRAT.primare }]}>Tashmë kam llogari</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 30 }}
        onPress={() => {
          pb.authStore.clear();
          Alert.alert('Sesioni u pastrua', 'Tani mund të provoni të hyni përsëri.');
        }}
      >
        <Text style={{ color: NGJYRAT.gabim, fontWeight: '700' }}>Pastro Sesionin (Reset)</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Restore pb.authStore.onChange logic if needed
    const unsubscribe = pb.authStore.onChange((token: any, model: any) => {
      // .catch bosh: njoftimet push kërkojnë internet dhe nuk duhet të bllokojnë app-in offline.
      if (model) {
        regjistroPerNjoftime().catch((error) => {
          console.warn('Njoftimet dështuan; aplikacioni vazhdon offline.', error);
        });
      }
    });

    if (pb.authStore.model) {
      regjistroPerNjoftime().catch((error) => {
        console.warn('Njoftimet fillestare dështuan; aplikacioni vazhdon offline.', error);
      });
    }

    // Sync mutations that were created while offline.
    const syncOffline = async () => {
      const count = await pendingMutationCount();
      if (count > 0) await flushMutations(pb);
    };
    syncOffline().catch((error) => console.warn('Sinkronizimi offline dështoi.', error));
    const syncTimer = setInterval(() => {
      syncOffline().catch((error) => console.warn('Sinkronizimi periodik dështoi.', error));
    }, 30000);

    setIsReady(true);
    return () => {
      clearInterval(syncTimer);
      unsubscribe();
    };
  }, []);

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: NGJYRAT.sfondi } }}>
            <Stack.Screen name="Start" component={StartScreen} />
            <Stack.Screen name="Hyrje" component={LoginScreen} />
            <Stack.Screen name="PanelAdminTest" component={AdminTestScreen} />
            <Stack.Screen name="Regjistrimi" component={RegisterScreen} />
            <Stack.Screen name="VerifikoOTP" component={VerifyOTPScreen} />
            <Stack.Screen name="ZgjidhKategori" component={SelectCategoryScreen} />
            <Stack.Screen name="TarifaPerputhjes" component={ClientMatchPaymentScreen} />
            <Stack.Screen name="PagesaShtesat" component={AddonPaymentScreen} />
            <Stack.Screen name="FaqjaKlientit" component={JobPostScreen} />
            <Stack.Screen name="FaqjaUstait" component={AvailableJobsScreen} />
            <Stack.Screen name="OfertatEPunes" component={JobBidsScreen} />
            <Stack.Screen name="Vleresimi" component={RatingScreen} />
            <Stack.Screen name="ProfiliUstait" component={UstaiProfileScreen} />
            <Stack.Screen name="GjejUstai" component={BrowseUstajteScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="VerifikoIdentitetin" component={VerificationUploadScreen} />
            <Stack.Screen name="RaportoPerdorues" component={ReportUserScreen} />
            <Stack.Screen name="Referimet" component={ReferralScreen} />
            <Stack.Screen name="Sponsorizim" component={SponsorListingScreen} />
            <Stack.Screen name="PagesaKomisioni" component={CommissionPaymentScreen} />
            <Stack.Screen name="OfertatEMia" component={MyBidsScreen} />
            <Stack.Screen name="FotoParaPas" component={BeforeAfterPhotosScreen} />
            <Stack.Screen name="UstallaretEMi" component={FavoriteUstaiScreen} />
            <Stack.Screen name="AnalitikaIme" component={UstaiAnalyticsScreen} />
            <Stack.Screen name="Sigurimi" component={InsuranceScreen} />
            <Stack.Screen name="VerifikimVideo" component={VideoVerificationScreen} />
            <Stack.Screen name="TimelinePunes" component={JobTimelineScreen} />
            <Stack.Screen name="FletaKonformitetit" component={ConformitySheetScreen} />
            <Stack.Screen name="FurnitoretMaterialeve" component={MaterialSuppliersScreen} />
            <Stack.Screen name="ProfiliKlientit" component={ClientProfileScreen} />
            <Stack.Screen name="ProfiliPublikUstait" component={UstaiPublicProfileScreen} />
            <Stack.Screen name="InstantBook" component={InstantBookScreen} />
            <Stack.Screen name="InstantBookHyrese" component={InstantBookIncomingScreen} />
            <Stack.Screen name="PlanetMirembajtjes" component={MaintenancePlansScreen} />
            <Stack.Screen name="AbonimetEMiaMirembajtje" component={MyMaintenanceSubscriptionsScreen} />
            <Stack.Screen name="KerkoRimbursim" component={RefundRequestScreen} />
            <Stack.Screen name="HartaKontakti" component={ContactMapScreen} />
            <Stack.Screen name="AIPreventiv" component={AIPreventivScreen} />
            <Stack.Screen name="AISkanim" component={AIScanScreen} />
            <Stack.Screen name="AIPlanifikuesTualeti" component={AIBathroomPlannerScreen} />
            <Stack.Screen name="AIPlanifikuesHapesire" component={AIRoomPlannerScreen} />
            <Stack.Screen name="AIMatja" component={AIMatjaScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: NGJYRAT.sfondi },
  logo: { width: 200, height: 200, marginBottom: 10 },
  title: { fontSize: 44, fontWeight: '900', color: NGJYRAT.primare },
  subtitle: { color: NGJYRAT.tekstiZbehur, marginBottom: 40, fontSize: 16 },
  btn: { backgroundColor: NGJYRAT.primare, paddingVertical: 18, borderRadius: 14, marginBottom: 14, width: '100%' },
  btnDark: { backgroundColor: NGJYRAT.sfondiKarte },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 18 },
});
