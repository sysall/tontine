export interface LegalSection {
  id: string;
  title: string;
  content: string[];
}

export interface LegalDocument {
  title: string;
  subtitle: string;
  lastUpdated: string;
  complianceNotice: string;
  sections: LegalSection[];
}

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Conditions Générales d'Utilisation",
  subtitle: "Contrat d'adhésion aux services Tontine Express (Natt)",
  lastUpdated: "25 Octobre 2026",
  complianceNotice: "Régie par le droit sénégalais, la Loi n° 2008-08 sur les transactions électroniques et le cadre réglementaire de l'UEMOA.",
  sections: [
    {
      id: "preambule",
      title: "1. Présentation & Objet du Service",
      content: [
        "L'application Tontine Express (ci-après « la Plateforme ») est une solution numérique d'épargne rotative, de cagnottes collectives et de planification financière éditée au Sénégal.",
        "Les présentes Conditions Générales d'Utilisation (CGU) définissent les droits et obligations réciproques entre Tontine Express et tout utilisateur souscrivant aux services d'épargne (Natt Classique, Tekk Tegui, Event Natt).",
        "Toute inscription ou utilisation de l'application implique l'acceptation pleine, entière et sans réserve des présentes conditions."
      ]
    },
    {
      id: "eligibilite",
      title: "2. Éligibilité & Inscription",
      content: [
        "L'accès au service est strictement réservé aux personnes physiques majeures (âgées d'au moins 18 ans révolus au moment de l'inscription), jouissant de leur pleine capacité juridique.",
        "L'utilisateur doit disposer d'un numéro de téléphone mobile actif émis par un opérateur agréé au Sénégal (+221) et d'un compte de monnaie électronique personnel valide (Wave, Orange Money, Free Money) ou d'un compte bancaire.",
        "L'inscription s'effectue via vérification d'un code SMS à usage unique (OTP). L'utilisateur est seul responsable de la confidentialité de ses accès et de ses terminaux."
      ]
    },
    {
      id: "kyc",
      title: "3. Vérification d'Identité (KYC) & Lutte Anti-Blanchiment",
      content: [
        "Conformément aux directives de l'UEMOA et aux exigences de la CENTIF (Cellule Nationale de Traitement des Informations Financières), Tontine Express applique des procédures strictes de vigilance (Know Your Customer).",
        "Pour débloquer une cagnotte, recevoir un paiement (Payout) ou dépasser les seuils réglementaires de cotisation, l'utilisateur a l'obligation de soumettre : une pièce d'identité officielle en cours de validité (CNI CEDEAO ou Passeport) et un selfie facial d'authentification.",
        "Tontine Express se réserve le droit de suspendre tout compte ou transaction dont l'identité du titulaire n'a pas pu être certifiée de manière probante."
      ]
    },
    {
      id: "fonctionnement",
      title: "4. Fonctionnement des Tontines & Cotisations (Natt)",
      content: [
        "Souscription : L'utilisateur peut souscrire à une formule d'épargne permanente (Natt Classique, Tekk Tegui) ou rejoindre une cagnotte thématique/événementielle (Event Natt).",
        "Engagements de versement : Chaque membre s'engage irrévocablement à honorer ses cotisations selon la fréquence choisie (journalière, hebdomadaire ou mensuelle) jusqu'au terme de l'échéancier fixé lors de la souscription.",
        "Paiements : Les cotisations s'effectuent par prélèvement ou validation via les passerelles de paiement partenaires agréées (PayTech, Wave, Orange Money). Toute cotisation validée est définitive et inscrite au grand livre comptable de la tontine."
      ]
    },
    {
      id: "deblocage-70",
      title: "5. Seuil de Déblocage à 70% & Recouvrement des 30%",
      content: [
        "Principe de l'avance : Lorsque l'utilisateur atteint 70% de son objectif d'épargne convenu, il devient éligible au déblocage anticipé de 100% de sa cagnotte (sous réserve d'un dossier KYC validé).",
        "Obligation de remboursement : Le versement anticipé de la cagnotte confère à Tontine Express une créance exigible sur les 30% restants. L'utilisateur s'engage formellement à régler l'intégralité des échéances restantes selon le calendrier initial.",
        "Défaut de paiement : En cas de non-paiement des 30% restants à échéance, Tontine Express appliquera des pénalités de retard conventionnelles, procédera à la suspension immédiate du compte et engagera toute voie de recouvrement légale et judiciaire au Sénégal (y compris signalement aux centrales d'incidents de paiement autorisées)."
      ]
    },
    {
      id: "securite-fonds",
      title: "6. Sécurité des Dépôts & Comptes de Cantonnement",
      content: [
        "Les fonds collectés auprès des utilisateurs sont strictement cantonnés et séquestrés auprès d'établissements financiers ou bancaires agréés par la BCEAO.",
        "Tontine Express n'effectue aucun placement spéculatif avec les fonds d'épargne de ses membres. Les fonds demeurent protégés et réservés exclusivement aux paiements des cagnottes selon les règles de la plateforme."
      ]
    },
    {
      id: "frais",
      title: "7. Frais de Service & Transparence",
      content: [
        "La consultation de l'application et la création de compte sont gratuites.",
        "Des frais de gestion technique ou des commissions d'intermédiation peuvent s'appliquer lors de la souscription ou du versement de la cagnotte. Ces frais sont expressément et préalablement portés à la connaissance de l'utilisateur avant toute confirmation de transaction."
      ]
    },
    {
      id: "responsabilite",
      title: "8. Responsabilités de l'Utilisateur & Fraude",
      content: [
        "L'utilisateur s'engage à ne pas utiliser Tontine Express à des fins illégales, frauduleuses, ou contraires aux bonnes mœurs (notamment blanchiment de capitaux, financement du terrorisme, ou escroquerie).",
        "Toute fausse déclaration, falsification de document d'identité ou usurpation d'identité entraînera la résiliation immédiate du compte, le gel des avoirs suspects et une notification auprès des autorités judiciaires compétentes (Parquet de Dakar et CENTIF)."
      ]
    },
    {
      id: "resiliation",
      title: "9. Suspension & Clôture de Compte",
      content: [
        "L'utilisateur peut demander la clôture de son compte sous réserve qu'aucune tontine active ou créance en cours (notamment les 30% consécutifs à un déblocage anticipé) ne demeure impayée.",
        "Tontine Express se réserve la faculté de suspendre temporairement ou définitivement l'accès d'un utilisateur en cas de manquement grave aux présentes CGU, d'incident de paiement non régularisé ou de suspicion légitime de fraude."
      ]
    },
    {
      id: "litiges",
      title: "10. Loi Applicable & Juridiction Compétente",
      content: [
        "Les présentes CGU sont soumises exclusivement au droit de la République du Sénégal.",
        "En cas de différend relatif à l'interprétation ou à l'exécution du présent contrat, les parties s'engagent à privilégier une conciliation amiable. À défaut d'accord amiable dans un délai de trente (30) jours, le litige sera soumis à la compétence exclusive des Tribunaux de Dakar."
      ]
    }
  ]
};

export const PRIVACY_POLICY: LegalDocument = {
  title: "Politique de Confidentialité",
  subtitle: "Protection de vos données personnelles & Conformité CDP Sénégal",
  lastUpdated: "25 Octobre 2026",
  complianceNotice: "Établie conformément à la Loi n° 2008-12 du 25 janvier 2008 relative à la protection des données à caractère personnel (CDP Sénégal).",
  sections: [
    {
      id: "responsable",
      title: "1. Responsable du Traitement",
      content: [
        "Les données à caractère personnel collectées sur l'application Tontine Express sont traitées par la société éditrice de Tontine Express, ayant son siège social à Dakar, Sénégal (ci-après « Nous » ou « Tontine Express »).",
        "Nous nous engageons à assurer le plus haut niveau de protection de vos données conformément à la législation sénégalaise et aux recommandations de la Commission de Protection des Données Personnelles (CDP)."
      ]
    },
    {
      id: "donnees-collectees",
      title: "2. Données Personnelles Collectées",
      content: [
        "Données de compte : Nom et prénom, numéro de téléphone mobile (+221), adresse email (facultative), code PIN ou mot de passe chiffré.",
        "Données de vérification d'identité (KYC) : Copie numérique recto/verso de la Carte Nationale d'Identité (CNI CEDEAO) ou du Passeport, numéro d'identification national, date de naissance.",
        "Données biométriques : Photographie faciale (« selfie ») transmise lors du contrôle d'identité afin de comparer l'image avec la pièce officielle fournie.",
        "Données financières & transactions : Historique de vos cotisations, dates d'échéances, montants des cagnottes, numéros de comptes de paiement mobile money (Wave, Orange Money, Free Money) associés aux encaissements et retraits.",
        "Données techniques : Adresse IP, identifiant unique de l'appareil (Device ID), journaux de connexion et données d'audit de sécurité."
      ]
    },
    {
      id: "finalites",
      title: "3. Finalités du Traitement",
      content: [
        "Exécution du service : Gestion des ouvertures de compte, calcul des cycles de tontine, suivi des cotisations et déclenchement des versements (Payouts).",
        "Conformité réglementaire & KYC : Respect strict des obligations légales imposées aux plateformes financières (loi anti-blanchiment, exigences CENTIF et BCEAO).",
        "Sécurisation des transactions : Détection et prévention des tentatives d'accès non autorisé, de fraude d'identité et d'incidents de paiement.",
        "Communication & Assistance : Envoi de notifications push ou SMS relatives aux rappels d'échéances, confirmations de paiement et assistance client."
      ]
    },
    {
      id: "biometrie",
      title: "4. Données Biométriques & Consentement Exprès",
      content: [
        "La collecte et le traitement de vos données biométriques (photographie faciale pour la vérification KYC) font l'objet d'une demande d'autorisation expresse auprès de la CDP conformément à l'article 21 de la loi 2008-12.",
        "Vous consentez expressément et de manière éclairée à la capture et à la comparaison faciale de votre selfie avec votre pièce d'identité officielle aux seules fins de sécuriser vos avoirs et de prévenir l'usurpation d'identité.",
        "Ces données biométriques ne sont en aucun cas vendues, cédées ou exploitées à des fins commerciales ou publicitaires."
      ]
    },
    {
      id: "destinataires",
      title: "5. Destinataires des Données & Sous-Traitance",
      content: [
        "Vos données ne sont accessibles qu'aux collaborateurs habilités de Tontine Express strictement soumis à une obligation de confidentialité.",
        "Sous-traitants techniques & financiers : Vos données nécessaires au paiement sont transmises de manière sécurisée aux passerelles et agrégateurs de paiement agréés (PayTech, Wave, Orange Money) et aux institutions bancaires dépositaires des fonds de séquestre.",
        "Autorités judiciaires : Vos données peuvent être communiquées aux autorités administratives ou judiciaires sénégalaises habilitées (Parquet, CENTIF, Police judiciaire) uniquement sur réquisition légale formelle."
      ]
    },
    {
      id: "transfert-cloud",
      title: "6. Hébergement & Transfert International des Données",
      content: [
        "Les données de l'application sont hébergées sur des infrastructures Cloud sécurisées de premier plan (Google Cloud Platform / Firebase) disposant de certifications internationales reconnues (ISO 27001, SOC 2).",
        "Lorsque les données transitent ou sont stockées hors du territoire sénégalais, Tontine Express s'assure que des garanties de protection adéquates et des protocoles de chiffrement conformes aux exigences de la CDP sont rigoureusement appliqués."
      ]
    },
    {
      id: "conservation",
      title: "7. Durée de Conservation des Données",
      content: [
        "Les données de compte sont conservées pendant toute la durée d'activité de votre compte utilisateur.",
        "Les pièces justificatives KYC et les relevés de transactions financières sont conservés pendant une durée minimale de cinq (5) à dix (10) ans à compter de la clôture du compte, conformément aux obligations légales de traçabilité comptable et financière en vigueur au Sénégal."
      ]
    },
    {
      id: "droits-cdp",
      title: "8. Vos Droits & Modalités d'Exercice",
      content: [
        "Conformément à la Loi n° 2008-12, vous bénéficiez à tout moment des droits suivants sur vos données :",
        "• Droit d'accès : obtenir confirmation que vos données sont traitées et en obtenir une copie intelligible.",
        "• Droit de rectification : exiger la mise à jour ou la correction immédiate de données inexactes ou incomplètes.",
        "• Droit de suppression : demander l'effacement de vos données, sous réserve des obligations légales de conservation financière pesant sur Tontine Express.",
        "• Droit d'opposition : vous opposer pour des motifs légitimes au traitement de certaines données non obligatoires."
      ]
    },
    {
      id: "contact-dpo",
      title: "9. Contact DPO & Recours auprès de la CDP",
      content: [
        "Pour toute question relative à la protection de vos données ou pour exercer vos droits, vous pouvez contacter notre Délégué à la Protection des Données (DPO) :",
        "Email : dpo@tontine-express.sn | support@tontine-express.sn",
        "Adresse : Tontine Express, Service Conformité & Données, Dakar, Sénégal.",
        "Si vous estimez que vos droits n'ont pas été respectés après nous avoir contactés, vous disposez du droit d'introduire une réclamation officielle auprès de la Commission de Protection des Données Personnelles (CDP) : www.cdp.sn."
      ]
    },
    {
      id: "securite",
      title: "10. Sécurité & Confidentialité Technique",
      content: [
        "Tontine Express met en œuvre toutes les mesures techniques et organisationnelles requises pour prévenir la perte, l'altération, la divulgation ou l'accès non autorisé à vos données.",
        "Toutes les communications réseau sont chiffrées via le protocole TLS 1.3 / HTTPS. Les documents d'identité sont stockés de manière chiffrée avec des contrôles d'accès stricts et des clés d'accès temporaires signées."
      ]
    }
  ]
};
