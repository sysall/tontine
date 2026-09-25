# 📋 Cahier des Charges & Roadmap : Service API (NestJS) & Back-Office (React)

## 📌 1. Contexte & Architecture du Projet
* **Stack Backend** : NestJS (TypeScript), Firebase Admin SDK, Cloud Firestore, Redis.
* **Stack Back-Office Admin** : React + Vite, TailwindCSS, Firebase Auth Web.
* **Projet Firebase** : `tontine-53d58`.
* **Branche Git Actuelle** : `auth` (Poussée sur Remote Origin).

---

## 🟢 2. Fonctionnalités Déjà Réalisées & Opérationnelles

### A. Service API (`services/api`) :
* 🔒 **Authentification & Sécurité** :
  * Endpoint `POST /api/v1/auth/firebase-login` pour valider les tokens Firebase Phone Auth et synchroniser les profils clients dans Cloud Firestore.
  * Guards de sécurité : `FirebaseAuthGuard` et `RolesGuard` avec décorateur `@Roles('ADMIN', 'MEMBER')`.
* ☁️ **Base de Données Cloud Firestore** :
  * Intégration complète du service `FirestoreService` alimentant les collections : `users`, `user_natts`, `event_natts`, `transactions`, `natt_payments`, `treasury`, `kyc_documents`.
* 📊 **Endpoints Dashboard & Tontines** :
  * `GET /api/v1/tontines/dashboard-summary` : Calcul dynamique des métriques d'épargne utilisateur (`totalSavedFcfa`, `nextPaymentFcfa`, `nextPaymentDueDate`, `expectedPayoutFcfa`, `myPayoutTurn`, `activeTontinesCount`).
  * `GET /api/v1/tontines/transactions` : Historique des transactions financières connecté à Firestore.
  * `GET /api/v1/natts/events` & `GET /api/v1/natts/offers` : Catalogue des offres d'épargne.
  * `POST /api/v1/natts/subscribe` : Enregistrement des souscriptions Natt dans Cloud Firestore.
* 💼 **Gestion Administrateur & Règle des 70%** :
  * CRUD complet pour la gestion des Natts Événements (`/api/v1/admin/events`).
  * Moteur de calcul du seuil des 70% de cotisation avec placement automatique des souscriptions éligibles dans la file d'attente de versement.
  * `POST /api/v1/admin/payouts/process` : Exécution manuelle du versement 100% par l'Admin depuis la Trésorerie Unique.
  * `GET /api/v1/admin/treasury` : Consultation en temps réel du solde de la Trésorerie Centrale.

### B. Back-Office Web (`apps/web`) :
* 🖥️ **Interface Administrateur Modernisée** : Écrans de Dashboard, Catalogue Natts, Clients, Cotisations, Versements, KYC.
* 🔐 **Authentification Admin** : Connexion sécurisée via Firebase Auth pour les comptes administrateurs.
* 📅 **Gestion Événements** : Interface dynamique de création, modification et suppression des Natts Événements reliée à Cloud Firestore.

---

## 🟧 3. Spécifications des Fonctionnalités Restant à Implémenter

### 🚀 A. Service API NestJS (`services/api`)

#### 1. Webhooks de Paiement Mobile Money Réels
* **Priorité** : 🔴 HAUTE
* **Spécifications** :
  * Développer les endpoints d'écoute Webhook : `POST /api/v1/payments/webhooks/wave` et `POST /api/v1/payments/webhooks/orange-money`.
  * Vérifier la signature cryptographique (HMAC / Secret Token) transmise par Wave et Orange Money.
  * À la réception d'un événement `payment.succeeded` :
    * Mettre à jour le document `user_natts` (`totalPaid`, `remainingBalance`, et évaluation de la règle des 70%).
    * Créer un document d'historique dans `natt_payments` et `transactions`.

#### 2. Service de Modération KYC & Upload de Documents
* **Priorité** : 🔴 HAUTE
* **Spécifications** :
  * `POST /api/v1/kyc/upload` : Téléversement sécurisé des photos CNI / Passeport recto-verso vers **Firebase Storage**.
  * `POST /api/v1/kyc/review` : Traitement des décisions d'approbation ou de refus par l'administrateur.
  * Mettre à jour le statut du document `users/{uid}` (`isVerified: true/false`).

#### 3. Envoi de Notifications Push (FCM / Expo Push SDK)
* **Priorité** : 🟡 MOYENNE
* **Spécifications** :
  * Intégrer Expo Server SDK ou Firebase Cloud Messaging (FCM).
  * Déclencher les notifications automatiques suivantes :
    * **Rappel de versement** : 3 jours avant la date d'échéance `nextDueDate`.
    * **Seuil des 70% atteint** : Notification au client l'informant que son dossier est prêt pour déblocage.
    * **Versement des 100% exécuté** : Confirmation du transfert sur son compte Mobile Money.

#### 4. Calcul de la Date de Prise & Dérogations Administrateur (Pas de Tirage au Sort)
* **Priorité** : 🔴 HAUTE
* **Spécifications** :
  * **Aucun tirage au sort** : Suppression de toute notion de tirage aléatoire des tours.
  * **Calcul prévisionnel automatique** : Dès la souscription d'un client à un Natt, calculer automatiquement la date de prise estimée (`payoutDate`) qui correspond au jour où le cumul des versements atteindra **70% du montant cible** (selon le rythme d'échéance daily/weekly/monthly).
  * **Validation automatique à 70%** : Placement automatique du dossier en file d'attente de versement dès que les 70% sont cotisés.
  * **Dérogation Administrateur (`POST /api/v1/admin/user-natts/:userNattId/override-payout-date`)** :
    * L'administrateur a la possibilité de modifier manuellement la date de prise (`payoutDate`) et d'accorder une **dérogation exceptionnelle** à des clients spécifiques, les rendant éligibles au versement des 100% à cette date personnalisée même s'ils n'ont pas encore atteint le seuil des 70%.

#### 5. Génération & Exportation de Documents PDF
* **Priorité** : 🟢 BASSE
* **Spécifications** :
  * Service de génération de contrats d'adhésion Natt au format PDF (conforme aux normes BCEAO).
  * Génération de reçus officiels pour chaque transaction de cotisation.

---

### 🖥️ B. Back-Office Web React (`apps/web`)

#### 1. Connexion des Tables de Données aux APIs Backend
* **Priorité** : 🔴 HAUTE
* **Spécifications** :
  * Remplacer les données de test des pages `Clients.tsx`, `Cotisations.tsx`, `Versements.tsx` et `Kyc.tsx` par des requêtes API réelles vers le backend NestJS (`/api/v1/admin/...`).

#### 2. Interface de Validation KYC avec Visionneuse CNI
* **Priorité** : 🔴 HAUTE
* **Spécifications** :
  * Ajouter une visionneuse d'images CNI Recto/Verso avec fonction zoom dans la page `Kyc.tsx`.
  * Intégrer les boutons d'action rapide **Approuver** et **Rejeter** (avec saisie du motif de refus) appelant la route `/api/v1/kyc/review`.

#### 3. Déclenchement Instantané des Versements (Payouts)
* **Priorité** : 🔴 HAUTE
* **Spécifications** :
  * Dans la page `Versements.tsx`, charger la liste des clients éligibles via `GET /api/v1/admin/payouts/eligible`.
  * Ajouter un bouton de confirmation déclenchant l'API `POST /api/v1/admin/payouts/process` pour verser les 100% de la Trésorerie Unique vers le compte du client.

#### 4. Interface de Dérogation & Modification de la Date de Prise
* **Priorité** : 🔴 HAUTE
* **Spécifications** :
  * Dans la gestion des souscriptions clients (`Versements.tsx` / `Natts.tsx`), ajouter un champ de sélection de date (Date Picker) et un bouton d'action **"Accorder une Dérogation"**.
  * Permettre à l'administrateur de modifier la date de prise prévisionnelle (`payoutDate`) d'un souscripteur spécifique et de valider son éligibilité de versement via l'API `POST /api/v1/admin/payouts/override-payout-date`, même si le seuil des 70% n'est pas encore cotisé.

#### 5. Exports Comptables (CSV / Excel)
* **Priorité** : 🟡 MOYENNE
* **Spécifications** :
  * Boutons d'exportation en 1 clic au format CSV/Excel pour la Trésorerie Centrale et l'historique des cotisations.
