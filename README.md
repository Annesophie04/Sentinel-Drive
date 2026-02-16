# Sentinel Drive Sense

Application mobile iOS/Android de prévention routière, construite avec React Native + Expo (TypeScript).

> **Avertissement** : Sentinel Drive Sense est une aide à la prévention. Elle ne remplace pas votre vigilance au volant.

## Fonctionnalités

- **Mode Focus** : interface minimale pendant la conduite (vitesse, durée, vigilance)
- **Détection d'événements** : freinages brusques, accélérations, vitesse élevée (via GPS)
- **Score pédagogique** : score transparent 0-100 avec explication des critères
- **Safety Timeline** : chronologie des événements après chaque trajet
- **Suivi de vigilance** : estimation basée sur la durée de conduite
- **Alertes non-intrusives** : toast + vibration légère, sans popup envahissant
- **Historique** : tous vos trajets enregistrés localement
- **100% hors-ligne** : aucun backend, toutes les données restent sur votre appareil

## Arborescence

```
├── App.tsx                          # Point d'entrée, navigation, providers
├── app.json                         # Configuration Expo
├── package.json                     # Dépendances
├── tsconfig.json                    # Configuration TypeScript
├── babel.config.js                  # Configuration Babel
└── src/
    ├── components/
    │   ├── AlertToast.tsx           # Toast d'alerte non-intrusif
    │   ├── Button.tsx               # Bouton réutilisable
    │   ├── Card.tsx                 # Carte avec thème sombre
    │   ├── EventTimeline.tsx        # Timeline des événements
    │   ├── ScoreCircle.tsx          # Cercle de score animé
    │   ├── StatRow.tsx              # Ligne de statistiques
    │   └── VigilanceRing.tsx        # Anneau de vigilance
    ├── constants/
    │   ├── config.ts                # Seuils et paramètres de détection
    │   └── theme.ts                 # Design system (couleurs, spacing...)
    ├── context/
    │   ├── DriveContext.tsx          # État du trajet en cours, GPS, détection
    │   └── SettingsContext.tsx       # Préférences utilisateur
    ├── screens/
    │   ├── OnboardingScreen.tsx      # Disclaimer sécurité (affiché 1 fois)
    │   ├── HomeScreen.tsx            # Dashboard principal
    │   ├── DriveScreen.tsx           # Mode conduite Focus
    │   ├── SummaryScreen.tsx         # Résumé fin de trajet
    │   ├── HistoryScreen.tsx         # Liste des trajets passés
    │   ├── TripDetailScreen.tsx      # Détail d'un trajet
    │   └── SettingsScreen.tsx        # Paramètres
    ├── services/
    │   ├── database.ts              # Couche SQLite (expo-sqlite)
    │   ├── eventDetector.ts         # Moteur de détection d'événements
    │   ├── geo.ts                   # Utilitaires géo (haversine, conversions)
    │   └── scoring.ts              # Moteur de score pédagogique
    ├── types/
    │   └── index.ts                 # Types TypeScript
    └── assets/                      # Logo et ressources
```

## Installation et lancement

### Prérequis

- Node.js >= 18
- npm ou yarn
- Expo CLI (`npx expo`)
- iOS : Xcode (pour simulateur) ou Expo Go sur device
- Android : Android Studio (pour émulateur) ou Expo Go sur device

### Étapes

```bash
# 1. Cloner le projet
git clone <repo-url>
cd Sentinel-Drive

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npx expo start

# 4. Scanner le QR code avec Expo Go (device)
#    ou appuyer sur 'i' (iOS simulator) / 'a' (Android emulator)
```

### Notes importantes

- L'application nécessite la **permission GPS** pour fonctionner
- Sur un simulateur, la vitesse GPS sera 0 — testez sur un appareil réel pour l'expérience complète
- Les données sont stockées localement en SQLite, aucune donnée n'est envoyée à un serveur

## Stack technique

- **React Native** + **Expo SDK 52**
- **TypeScript** strict
- **@react-navigation/native-stack** pour la navigation
- **expo-sqlite** pour le stockage local
- **expo-location** pour le GPS
- **expo-haptics** pour le retour haptique
- **expo-keep-awake** pour garder l'écran allumé en conduite
- **react-native-svg** pour les jauges circulaires
