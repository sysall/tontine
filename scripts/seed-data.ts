import { 
  NattCatalogItem, 
  EventNatt, 
  Treasury 
} from '../packages/types/src';

/**
 * Seed Script Initial — Initialisation des collections Firestore
 * Crée les catalogues permanents, les Natts Événements d'exemple et la Trésorerie Centrale
 */

export async function runSeedData() {
  console.log('🌱 Starting Tontine Express Firestore Database Seeding...\n');

  // 1. Catalogues Permanents (/natt_catalogs)
  const permanentCatalogs: NattCatalogItem[] = [
    {
      catalogId: 'natt_classique',
      type: 'PERMANENT',
      name: 'Natt Classique',
      description: 'Formule d\'épargne périodique classique avec montants cibles ajustables (250k à 3M FCFA). Conçue pour une épargne mensuelle régulière.',
      minTargetAmount: 250000,
      maxTargetAmount: 3000000,
      allowedFrequencies: ['MONTHLY'],
      thresholdPayoutPercentage: 70,
    },
    {
      catalogId: 'tekk_tegui',
      type: 'PERMANENT',
      name: 'Tekk Tegui',
      description: 'Offre d\'épargne progressive rapide (journalière ou hebdomadaire) permettant aux commerçants et entrepreneurs de réaliser un projet.',
      minTargetAmount: 100000,
      maxTargetAmount: 3000000,
      allowedFrequencies: ['DAILY', 'WEEKLY'],
      thresholdPayoutPercentage: 70,
    },
  ];

  console.log('📦 1. Permanent Catalogs to Seed (/natt_catalogs):');
  permanentCatalogs.forEach(item => {
    console.log(`   - [${item.catalogId}] ${item.name} (${item.minTargetAmount.toLocaleString('fr-FR')} - ${item.maxTargetAmount.toLocaleString('fr-FR')} FCFA) | Seuil Déblocage: ${item.thresholdPayoutPercentage}%`);
  });

  // 2. Natts Événements d'Exemple (/event_natts)
  const sampleEventNatts: EventNatt[] = [
    {
      eventId: 'evt-tabaski-2026',
      title: 'Opération Tabaski 2026',
      description: 'Épargne ciblée pour l\'achat de moutons et préparatifs de la grande fête de la Tabaski.',
      bannerImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      targetAmount: 300000,
      thresholdAmount: 210000, // 70% de 300 000 FCFA
      installmentAmount: 50000,
      frequency: 'MONTHLY',
      subscriptionDeadline: '2026-05-15T23:59:59.000Z',
      eventDueDate: '2026-06-15T00:00:00.000Z',
      status: 'ACTIVE',
      createdBy: 'admin-super-uid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      eventId: 'evt-rentree-2026',
      title: 'Pack Rentrée Scolaire 2026',
      description: 'Cotisation bimensuelle / hebdomadaire pour anticiper les fournitures et frais de scolarité.',
      bannerImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      targetAmount: 150000,
      thresholdAmount: 105000, // 70% de 150 000 FCFA
      installmentAmount: 15000,
      frequency: 'WEEKLY',
      subscriptionDeadline: '2026-09-01T23:59:59.000Z',
      eventDueDate: '2026-10-01T00:00:00.000Z',
      status: 'ACTIVE',
      createdBy: 'admin-super-uid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  console.log('\n🎉 2. Dynamic Event Natts to Seed (/event_natts):');
  sampleEventNatts.forEach(evt => {
    console.log(`   - [${evt.eventId}] ${evt.title} | Montant Cible: ${evt.targetAmount.toLocaleString('fr-FR')} FCFA | Seuil (70%): ${evt.thresholdAmount.toLocaleString('fr-FR')} FCFA | Fréquence: ${evt.frequency} | Échéance: ${evt.eventDueDate.split('T')[0]}`);
  });

  // 3. Document Trésorerie Centrale (/treasury/main_vault)
  const initialTreasury: Treasury = {
    vaultId: 'main_vault',
    totalCollected: 125000000,
    totalDisbursed: 76500000,
    currentCashBalance: 48500000,
    outstandingAdvances: 22500000,
    updatedAt: new Date().toISOString(),
  };

  console.log('\n🏛️ 3. Main Treasury Vault Document (/treasury/main_vault):');
  console.log(`   - Solde Trésorerie Centralisée: ${initialTreasury.currentCashBalance.toLocaleString('fr-FR')} FCFA`);
  console.log(`   - Total Collecté: ${initialTreasury.totalCollected.toLocaleString('fr-FR')} FCFA`);
  console.log(`   - Total Déboursé à 70%: ${initialTreasury.totalDisbursed.toLocaleString('fr-FR')} FCFA`);
  console.log(`   - Avances en Cours (30% restants): ${initialTreasury.outstandingAdvances.toLocaleString('fr-FR')} FCFA`);

  console.log('\n✅ Seed Script Configuration Complete!');
  return {
    permanentCatalogs,
    sampleEventNatts,
    initialTreasury,
  };
}

if (require.main === module) {
  runSeedData().catch(err => {
    console.error('❌ Error executing seed script:', err);
    process.exit(1);
  });
}
