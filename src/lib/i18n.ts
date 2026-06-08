import type { Locale } from 'date-fns'
import { enUS, fr, mk } from 'date-fns/locale'
import type { MatchTournamentPhase } from './matchEnums'

export type LanguageCode = 'fr' | 'en' | 'mk'

export interface LanguageOption {
  code: LanguageCode
  flagCode: string
  htmlLang: string
  label: string
  localeCode: string
  nativeLabel: string
  shortLabel: string
}

export interface OnboardingStepTranslation {
  body: string
  subtitle: string
  tip: string
  tipLabel: string
  title: string
}

export interface TranslationDictionary {
  aiBet: {
    back: string
    chooseProvider: string
    chooseProviderTitle: string
    chooseProviderSubtitle: string
    countSuffixPlural: string
    countSuffixSingular: string
    customsButton: string
    customsText: string
    customsTitle: string
    errorTitle: string
    loadingSubtitle: string
    loadingText: string
    loadingTitle: string
    noValidPrediction: string
    overwriteExisting: string
    promptPlaceholder: string
    promptSubtitle: string
    promptSuggestions: string[]
    promptTitle: string
    rejectedButton: string
    rejectedTextPrefix: string
    rejectedTextSuffix: string
    rejectedTitle: string
    securityNo: string
    securityQuestion: string
    securityTitle: string
    securityYes: string
    successFilledByAi: string
    unknownError: string
  }
  auth: {
    accountCreatedPrefix: string
    accountCreatedSuffix: string
    backToLogin: string
    checkEmailFallback: string
    checking: string
    continue: string
    continueWithGoogle: string
    createAccount: string
    creating: string
    descriptionDefault: string
    descriptionPrefix: string
    displayName: string
    displayNameMaxError: string
    displayNameMinError: string
    displayNamePlaceholder: string
    displayNameRange: string
    emailInvalid: string
    forgotPassword: string
    forgotPasswordSending: string
    loginErrorFallback: string
    openInSafari: string
    or: string
    password: string
    passwordResetSentPrefix: string
    passwordResetSentSuffix: string
    refreshPage: string
    resetEmailFallback: string
    signIn: string
    signingIn: string
    title: string
  }
  betting: {
    distributionTitle: string
    gainMax: string
    odds: string
    showTrend: string
    thermoBalanced: string
    thermoCold: string
    thermoRisky: string
    thermoSafe: string
    titlePotentialGain: string
  }
  authPassword: {
    invalidDescription: string
    invalidTitle: string
    savePassword: string
    savingPassword: string
    setupDescription: string
    setupSuccess: string
    setupTitle: string
    resetDescription: string
    resetSuccess: string
    resetTitle: string
  }
  common: {
    anonymous: string
    cancel: string
    close: string
    connection: string
    memberPlural: string
    memberSingular: string
    mystery: string
    noWinner: string
    points: string
    pointsShort: string
    profile: string
    retry: string
    save: string
    signOut: string
    tbd: string
  }
  finalWinner: {
    chooseTitle: string
    closingPrefix: string
    closingDateFormat: string
    finalWinnerQuestion: string
    loading: string
    lockedBetFor: string
    noTeamFound: string
    odd: string
    searchPlaceholder: string
    selectTeam: string
    winnerQuestionPrefix: string
    winnerTitle: string
  }
  groups: {
    accessCode: string
    adminBadge: string
    awaitingBadge: string
    codeCopied: string
    copyInviteCode: string
    createButton: string
    createDescription: string
    createTitle: string
    joinButton: string
    joinCodePlaceholder: string
    joinDescription: string
    joinTitle: string
    memberBadge: string
    myGroupsDescription: string
    myGroupsTitle: string
    nameMaxError: string
    nameMinError: string
    nameLabel: string
    namePlaceholder: string
    renameGroup: string
    subtitle: string
    title: string
  }
  home: {
    connectedLead: string
    guestLead: string
    legalLink: string
    onboardingCta: string
    onboardingSubtitle: string
    playOnboarding: string
    shortcutMatches: string
    shortcutRanking: string
    shortcutRules: string
    viewRules: string
    winnerSoon: string
  }
  language: {
    selectorLabel: string
  }
  matches: {
    aiButton: string
    empty: string
    finalWinnerAliveDescriptionPrefix: string
    finalWinnerAliveDescriptionSuffix: string
    finalWinnerAliveTitle: string
    finalWinnerChange: string
    finalWinnerChangeHint: string
    finalWinnerChoose: string
    finalWinnerMissingDescription: string
    finalWinnerMissingTitle: string
    finalWinnerOddPrefix: string
    finalWinnerOfficialDescriptionSuffix: string
    finalWinnerOfficialTitle: string
    finalWinnerRecordedChoice: string
    finalWinnerSelectedPrefix: string
    finalWinnerWinnerBonus: string
    groupDetailsName: string
    launchText: string
    launchTitle: string
    myPointsDetail: string
    moreInfoPrefix: string
    moreInfoLink: string
    moreInfoSuffix: string
    playoffWinner: string
    playoffWinnerInDraw: string
    scoreFinal: string
    scoringHelp: string
    tabFinished: string
    tabUpcoming: string
    unavailableText: string
    unavailableTitle: string
  }
  matchPhases: Record<MatchTournamentPhase, string>
  nav: {
    admin: string
    analytics: string
    faq: string
    groups: string
    home: string
    legal: string
    matches: string
    ranking: string
    rules: string
  }
  notFound: {
    action: string
    description: string
    title: string
  }
  onboarding: {
    finish: string
    joinGroup: string
    next: string
    previous: string
    startBetting: string
    steps: OnboardingStepTranslation[]
  }
  prompts: {
    addToHomeScreen: string
    closeLater: string
    installIos: string
    installText: string
    installTitle: string
    notificationButton: string
    notificationDismiss: string
    notificationIosText: string
    notificationTitle: string
    notificationText: string
    updateButton: string
    updateLoading: string
    updateText: string
    updateTitle: string
  }
  profile: {
    activateAlerts: string
    alertsEnabled: string
    avatarChange: string
    avatarUploading: string
    disableAlerts: string
    enableAgainText: string
    enableText: string
    fileFormatError: string
    imageTooHeavy: string
    loading: string
    localhostNotice: string
    nameUpdateError: string
    nameUpdated: string
    newPassword: string
    notificationsDenied: string
    notificationsDisabledToast: string
    notificationsEnableError: string
    notificationsSavedToast: string
    notificationsText: string
    notificationsTitle: string
    notificationsUnsupported: string
    photoUpdateError: string
    photoUpdated: string
    pushError: string
    reactivateAlerts: string
    rename: string
    signOut: string
    updatePassword: string
    updatePasswordDescription: string
    updatePasswordSubmitting: string
    passwordUpdated: string
    passwordTitle: string
    passwordMinError: string
    passwordMismatchError: string
    passwordUpdateFallback: string
    confirmPassword: string
  }
  ranking: {
    createOrJoinGroup: string
    general: string
    introPrefix: string
    introSuffix: string
    noFinalWinner: string
    officialWinnerPrefix: string
    eliminatedPrefix: string
    secretWinner: string
    mysteryWinner: string
    ownRankSuffix: string
    ownRankFirstSuffix: string
    ownRankOtherSuffix: string
    playerPlural: string
  }
  scoring: {
    adminHintPrefix: string
    adminHintSuffix: string
    algorithmLink: string
    algorithmIntro: string
    adminLabel: string
    basePoints: string
    baseTotal: string
    calculation: string
    finalScore: string
    finalWinner: string
    goodWinner: string
    goalDifference: string
    intro: string
    noBet: string
    pendingScore: string
    phaseMultiplier: string
    prediction: string
    precisionText: string
    precisionTitle: string
    resultCorrect: string
    scoreExactBonus: string
    scoreProximity: string
    title: string
    tooltip: string
    multiplierText: string
    multiplierTitle: string
    winningOdds: string
    winnerIfDraw: string
  }
  user: {
    back: string
    detailPrefix: string
    detailSuffix: string
    finalWinnerCorrectPrefix: string
    finalWinnerCorrectSuffix: string
    finalWinnerEliminated: string
    finalWinnerEliminatedSuffix: string
    finalWinnerHidden: string
    finalWinnerLost: string
    finalWinnerNoBonus: string
    finalWinnerNone: string
    finalWinnerPotential: string
    finalWinnerStillAliveSuffix: string
    finalWinnerWonSuffix: string
    matchMissing: string
    noFinishedMatch: string
    predictionSoon: string
  }
}

export const languageOptions: LanguageOption[] = [
  {
    code: 'fr',
    flagCode: 'fr',
    htmlLang: 'fr',
    label: 'Français',
    localeCode: 'fr-FR',
    nativeLabel: 'Français',
    shortLabel: 'FR',
  },
  {
    code: 'en',
    flagCode: 'gb',
    htmlLang: 'en',
    label: 'English',
    localeCode: 'en-US',
    nativeLabel: 'English',
    shortLabel: 'EN',
  },
  {
    code: 'mk',
    flagCode: 'mk',
    htmlLang: 'mk',
    label: 'Macédonien',
    localeCode: 'mk-MK',
    nativeLabel: 'Македонски',
    shortLabel: 'MK',
  },
]

export const languageOptionsByCode: Record<LanguageCode, LanguageOption> = {
  fr: languageOptions[0],
  en: languageOptions[1],
  mk: languageOptions[2],
}

export const dateLocales: Record<LanguageCode, Locale> = {
  fr,
  en: enUS,
  mk,
}

const frTranslations: TranslationDictionary = {
  aiBet: {
    back: '← Retour',
    chooseProvider: 'Choisir mon IA',
    chooseProviderTitle: 'Choisis ton IA',
    chooseProviderSubtitle: 'Chaque IA a sa propre vision du football',
    countSuffixPlural: 'matchs à pronostiquer',
    countSuffixSingular: 'match à pronostiquer',
    customsButton: 'Payer (50€)',
    customsText: 'Veuillez payer 50€ de frais de douanes avant !',
    customsTitle: 'Frais de douanes',
    errorTitle: 'Oups !',
    loadingSubtitle: 'Ça peut prendre quelques secondes',
    loadingText: 'Analyse des équipes et génération des pronostics',
    loadingTitle: "L'IA réfléchit...",
    noValidPrediction: "L'IA n'a retourné aucun pronostic valide",
    overwriteExisting: 'Écraser mes pronostics existants',
    promptPlaceholder: 'Ex: Je pense que la France va gagner...',
    promptSubtitle: "Écris tes préférences et l'IA remplira tes pronostics",
    promptSuggestions: [
      'Mbappé va tout casser cette année',
      'Que des buts et du spectacle !',
      'Je connais rien au foot, surprise-moi',
      'Les outsiders vont créer la surprise',
      "Cette année, c'est pour Haïti, c'est sûr !",
    ],
    promptTitle: "Laisse l'IA pronostiquer",
    rejectedButton: "Changer d'IA",
    rejectedTextPrefix: 'Mauvaise réponse',
    rejectedTextSuffix: 'Vous êtes désormais interdit de territoire en Chine.',
    rejectedTitle: 'Interdiction de territoire',
    securityNo: 'Non',
    securityQuestion:
      'Pensez-vous que la province rebelle de Taiwan fasse partie intégrante de la grande et glorieuse République Populaire de Chine ?',
    securityTitle: 'Vérification de sécurité 🇨🇳',
    securityYes: 'Oui, bien sûr !',
    successFilledByAi: "rempli par l'IA !",
    unknownError: 'Une erreur est survenue',
  },
  auth: {
    accountCreatedPrefix: 'Un compte vient d’être créé pour',
    accountCreatedSuffix:
      'Clique sur le lien reçu par email pour configurer ton mot de passe.',
    backToLogin: 'Retour à la connexion',
    checkEmailFallback: "Impossible de vérifier l'adresse email.",
    checking: 'Vérification…',
    continue: 'Continuer',
    continueWithGoogle: 'Continuer avec Google',
    createAccount: 'Créer le compte',
    creating: 'Création…',
    descriptionDefault:
      'Connectez-vous pour pronostiquer les matchs et défier vos amis.',
    descriptionPrefix: 'Connectez-vous pour pronostiquer les matchs de',
    displayName: 'Nom affiché',
    displayNameMaxError: 'Le nom doit contenir 20 caractères maximum.',
    displayNameMinError: 'Le nom doit contenir au moins 2 caractères.',
    displayNamePlaceholder: 'Ton pseudo',
    displayNameRange: 'Entre 2 et 20 caractères.',
    emailInvalid: 'Entre une adresse email valide.',
    forgotPassword: 'Mot de passe oublié',
    forgotPasswordSending: 'Envoi…',
    loginErrorFallback: 'Email ou mot de passe incorrect.',
    openInSafari:
      'Pour continuer avec Google, ouvre cette page dans Safari : touche le menu « ··· » en haut à droite, puis « Ouvrir dans Safari ».',
    or: 'ou',
    password: 'Mot de passe',
    passwordResetSentPrefix:
      'Un email de réinitialisation vient d’être envoyé à',
    passwordResetSentSuffix: '.',
    refreshPage: 'Rafraîchir la page',
    resetEmailFallback: "Impossible d'envoyer l'email de réinitialisation.",
    signIn: 'Se connecter',
    signingIn: 'Connexion…',
    title: 'Bienvenue !',
  },
  betting: {
    distributionTitle: 'Qui a prono quoi ?',
    gainMax: 'gain max',
    odds: 'Cotes',
    showTrend: 'Afficher la tendance des pronostics',
    thermoBalanced: 'Prono équilibré : ni trop sage, ni trop exotique.',
    thermoCold: 'Pas encore assez de pronos : la tendance va se préciser.',
    thermoRisky: 'Coup de poker : le gain potentiel peut grimper fort.',
    thermoSafe: 'Choix sécu : gain potentiel plus modeste.',
    titlePotentialGain: 'Gain potentiel estimé : jusqu’à',
  },
  authPassword: {
    invalidDescription:
      'Redemande un email de gestion du mot de passe pour continuer.',
    invalidTitle: 'Lien invalide ou expiré',
    savePassword: 'Enregistrer le mot de passe',
    savingPassword: 'Enregistrement…',
    setupDescription:
      'Choisis le mot de passe qui servira pour tes prochaines connexions.',
    setupSuccess: 'Mot de passe configuré',
    setupTitle: 'Configure ton mot de passe',
    resetDescription:
      'Définis un nouveau mot de passe pour récupérer ton compte.',
    resetSuccess: 'Mot de passe réinitialisé',
    resetTitle: 'Nouveau mot de passe',
  },
  common: {
    anonymous: 'Anonyme',
    cancel: 'Annuler',
    close: 'Fermer',
    connection: 'Connexion',
    memberPlural: 'membres',
    memberSingular: 'membre',
    mystery: 'Mystère',
    noWinner: 'Aucun',
    points: 'points',
    pointsShort: 'pts',
    profile: 'Profil',
    retry: 'Réessayer',
    save: 'Enregistrer',
    signOut: 'Se déconnecter',
    tbd: 'À déterminer',
  },
  finalWinner: {
    chooseTitle: 'Choisissez le vainqueur',
    closingPrefix: 'Clôture des pronostics vainqueur le',
    closingDateFormat: "d MMMM yyyy 'à' HH:mm",
    finalWinnerQuestion: 'Qui sera le vainqueur final ?',
    loading: 'Chargement du vainqueur final...',
    lockedBetFor: 'Vous avez parié pour :',
    noTeamFound: 'Aucune équipe trouvée',
    odd: 'Cote',
    searchPlaceholder: 'Rechercher...',
    selectTeam: 'Sélectionner une équipe',
    winnerQuestionPrefix: 'Qui gagnera',
    winnerTitle: 'Votre vainqueur final',
  },
  groups: {
    accessCode: "Code d'accès",
    adminBadge: 'Admin',
    awaitingBadge: 'En attente',
    codeCopied: 'Code copié !',
    copyInviteCode: "Copier le code d'invitation",
    createButton: 'Créer la tribu',
    createDescription:
      'Créez votre tribu et invitez vos proches à vous rejoindre',
    createTitle: 'Créer une tribu',
    joinButton: 'Envoyer la demande',
    joinCodePlaceholder: 'Entrez le code...',
    joinDescription: "Entrez le code fourni par l'administrateur de la tribu",
    joinTitle: 'Rejoindre une tribu',
    memberBadge: 'Membre',
    myGroupsDescription: 'Les tribus dont vous faites partie',
    myGroupsTitle: 'Mes tribus',
    nameMaxError: '20 caractères maximum',
    nameMinError: '2 caractères minimum',
    nameLabel: 'Nom de la tribu',
    namePlaceholder: 'Ex : Les intouchables',
    renameGroup: 'Renommer la tribu',
    subtitle: 'Gérez vos tribus et affrontez vos proches',
    title: 'Mes tribus',
  },
  home: {
    connectedLead:
      'Pronostiquez les résultats des matches, marquez des points et affrontez vos amis et votre famille dans votre tribu !',
    guestLead:
      'Pronostiquez les résultats des matches, marquez des points et affrontez vos amis dans votre tribu !',
    legalLink: 'Confidentialité et conditions',
    onboardingCta: 'Découvre comment jouer',
    onboardingSubtitle: "Sam, Iván et Pierre t'expliquent en 3 étapes",
    playOnboarding: 'Lancer →',
    shortcutMatches: 'Pronostics',
    shortcutRanking: 'Classement',
    shortcutRules: 'Règles',
    viewRules: 'Voir les règles',
    winnerSoon: 'Le pronostic du vainqueur final sera bientôt accessible !',
  },
  language: {
    selectorLabel: 'Changer de langue',
  },
  matches: {
    aiButton: "Laisse l'IA pronostiquer !",
    empty: 'Aucun match à afficher',
    finalWinnerAliveDescriptionPrefix: 'peut encore te rapporter',
    finalWinnerAliveDescriptionSuffix: 'si elle va au bout.',
    finalWinnerAliveTitle: 'Ton vainqueur est toujours en course',
    finalWinnerChange: 'Changer',
    finalWinnerChangeHint: 'Clique ici pour changer ton choix.',
    finalWinnerChoose: 'Choisir',
    finalWinnerMissingDescription:
      "Tu n'as pas encore tenté le gros bonus. Choisis ton champion maintenant.",
    finalWinnerMissingTitle: 'Il te manque le vainqueur final',
    finalWinnerOddPrefix: 'Cote associée :',
    finalWinnerOfficialDescriptionSuffix:
      'a gagné et ton bonus vainqueur final est validé.',
    finalWinnerOfficialTitle: 'Ton vainqueur a gagné',
    finalWinnerRecordedChoice: 'choix enregistré',
    finalWinnerSelectedPrefix: 'Ton vainqueur :',
    finalWinnerWinnerBonus: 'le bonus vainqueur final',
    groupDetailsName: 'Nom',
    launchText:
      "Les pronostics seront bientôt accessibles ! D'ici là, vous pouvez créer votre groupe et inviter vos amis !",
    launchTitle: 'Bientôt disponible',
    myPointsDetail: 'Détail de mes points',
    moreInfoPrefix: "Pour voir plus d'infos,",
    moreInfoLink: 'créez ou rejoignez une tribu',
    moreInfoSuffix: '.',
    playoffWinner: 'Vainqueur (prolongations / tirs au but)',
    playoffWinnerInDraw: 'Ton vainqueur si nul',
    scoreFinal: 'Score final',
    scoringHelp: 'Comment les points sont calculés ?',
    tabFinished: 'Terminés',
    tabUpcoming: 'À venir',
    unavailableText: 'Les pronostics seront bientôt accessibles !',
    unavailableTitle: 'Bientôt disponible',
  },
  matchPhases: {
    group: 'Groupe',
    round_of_16: '16es de finale',
    round_of_8: '8es de finale',
    quarter_final: 'Quarts de finale',
    semi_final: 'Demi-finales',
    third_place: '3e place',
    final: 'Finale',
  },
  nav: {
    admin: 'Admin',
    analytics: 'Analytics',
    faq: 'FAQ',
    groups: 'Tribus',
    home: 'Accueil',
    legal: 'Confidentialité',
    matches: 'Pronostics',
    ranking: 'Classement',
    rules: 'Règles',
  },
  notFound: {
    action: "Retour à l'accueil",
    description: "Cette page n'existe pas ou a été déplacée.",
    title: 'Page non trouvée',
  },
  onboarding: {
    finish: 'Terminer',
    joinGroup: '🏕️ Rejoindre une tribu',
    next: 'Suivant',
    previous: 'Précédent',
    startBetting: '⚽ Commencer à pronostiquer',
    steps: [
      {
        title: 'Pronostique chaque match',
        subtitle: '« Listen up, partner ! »',
        body: "Avant chaque coup d'envoi, donne ton pronostic : le score exact des deux équipes. Ton vote est sauvegardé automatiquement. Tu peux revenir le modifier autant que tu veux tant que le match n'a pas commencé.",
        tipLabel: 'Astuce de Sam',
        tip: "Pas le temps de tout pronostiquer ? L'IA peut le faire pour toi : repère le bouton violet en haut de la page des matchs.",
      },
      {
        title: 'Marque (et multiplie) tes points',
        subtitle: '« Sois malin, amigo ! »',
        body: "Score parfait, bon vainqueur, bon nul, écart proche : tu marques jusqu'à 20 points de base. Puis une cote « anti-mouton » multiplie ton score : plus tu pronostiques l'inattendu, plus le gain potentiel grimpe.",
        tipLabel: 'Astuce de Iván',
        tip: 'Regarde la barre de tendance sous chaque match : elle te montre où vont les autres joueurs et la cote correspondante.',
      },
      {
        title: 'Rejoins ta tribu, affronte tes amis',
        subtitle: '« On va voir qui est le bûcheron ! »',
        body: 'Crée une tribu ou rejoins-en une avec un code. Tu suivras le classement de ton groupe en temps réel, match après match. Que le meilleur gagne (et que les autres paient la cagnotte).',
        tipLabel: 'Astuce de Pierre',
        tip: "Va dans l'onglet Tribus pour créer la tienne ou en rejoindre une avec un code partagé par ton chef de tribu.",
      },
    ],
  },
  prompts: {
    addToHomeScreen: "Ajouter à l'écran d'accueil",
    closeLater: 'Plus tard',
    installIos: 'Appuyez sur le bouton Partager puis "Sur l’écran d’accueil"',
    installText: 'Pour un accès plus rapide, même hors ligne !',
    installTitle: "Installer l'application",
    notificationButton: 'Oui, sauve mon prono',
    notificationDismiss: 'Compris',
    notificationIosText:
      'Sur iPhone : ajoute d’abord l’app à l’écran d’accueil, puis active les alertes depuis le profil.',
    notificationTitle: 'Pierre te sauve du prono oublié',
    notificationText:
      'Un rappel 5 min avant le coup d’envoi si ta grille est vide. Pas de spam : Pierre a déjà assez de bois à couper.',
    updateButton: 'Recharger maintenant',
    updateLoading: 'Rechargement...',
    updateText:
      'Une nouvelle version est disponible. Recharge l’application pour continuer à pronostiquer.',
    updateTitle: 'Mise à jour obligatoire',
  },
  profile: {
    activateAlerts: 'Activer les alertes matchs',
    alertsEnabled: 'Alertes matchs activées',
    avatarChange: 'Changer la photo de profil',
    avatarUploading: 'Compression et envoi de la photo…',
    disableAlerts: 'Désactiver les alertes',
    enableAgainText:
      'Tu avais coupé les alertes dans l’app. Tu peux les réactiver ici.',
    enableText:
      'Tu n’as pas encore autorisé les notifications sur cet appareil.',
    fileFormatError: 'Format de fichier non supporté',
    imageTooHeavy: 'Image trop lourde (15 Mo max)',
    loading: 'Chargement…',
    localhostNotice:
      'Les notifications push ne sont pas disponibles sur localhost. Elles fonctionnent sur le site en ligne une fois déployé.',
    nameUpdateError: 'Erreur lors de la mise à jour du nom',
    nameUpdated: 'Nom mis à jour',
    newPassword: 'Nouveau mot de passe',
    notificationsDenied:
      'Le navigateur a refusé les notifications. Ouvre les réglages du site pour autoriser les notifications, puis reviens ici.',
    notificationsDisabledToast: 'Notifications désactivées pour ce site',
    notificationsEnableError: 'Impossible d’activer les notifications',
    notificationsSavedToast: 'Préférences enregistrées',
    notificationsText:
      'Les rappels t’aident à ne pas louper un coup d’envoi quand ton prono n’est pas encore posé (~5 min avant le match).',
    notificationsTitle: 'Notifications',
    notificationsUnsupported:
      'Les notifications ne sont pas disponibles sur ce navigateur ou cet appareil. Sur iPhone, installe l’app sur l’écran d’accueil puis réessaie.',
    photoUpdateError: 'Erreur lors de la mise à jour de la photo',
    photoUpdated: 'Photo mise à jour',
    pushError:
      'Le service de notifications n’a pas répondu à temps ou une erreur est survenue. Vérifie ta connexion ou réessaie dans un instant.',
    reactivateAlerts: 'Réactiver les alertes matchs',
    rename: 'Renommer',
    signOut: 'Se déconnecter',
    updatePassword: 'Mettre à jour',
    updatePasswordDescription:
      'Ajoute ou remplace le mot de passe utilisé avec ton email.',
    updatePasswordSubmitting: 'Mise à jour…',
    passwordUpdated: 'Mot de passe mis à jour',
    passwordTitle: 'Mot de passe',
    passwordMinError: 'Le mot de passe doit contenir au moins 8 caractères.',
    passwordMismatchError: 'Les deux mots de passe ne correspondent pas.',
    passwordUpdateFallback: 'Impossible de mettre à jour le mot de passe.',
    confirmPassword: 'Confirmer le mot de passe',
  },
  ranking: {
    createOrJoinGroup: 'créer ou rejoindre une tribu',
    general: 'Général',
    introPrefix: "Pour voir le classement, il faut d'abord",
    introSuffix: '.',
    noFinalWinner: 'Pas de vainqueur sélectionné',
    officialWinnerPrefix: 'Vainqueur officiel :',
    eliminatedPrefix: 'Éliminé :',
    secretWinner: 'Vainqueur encore secret',
    mysteryWinner: 'Vainqueur mystère',
    ownRankSuffix: 'sur',
    ownRankFirstSuffix: 'er',
    ownRankOtherSuffix: 'e',
    playerPlural: 'joueurs',
  },
  scoring: {
    adminHintPrefix: 'Tu peux rendre un match visible ou le masquer depuis',
    adminHintSuffix: ', pour chaque rencontre.',
    algorithmLink: 'règlement détaillé et algorithme',
    algorithmIntro: 'Tout le détail des barèmes et la formule officielle',
    adminLabel: 'Admin.',
    basePoints: 'Points de base',
    baseTotal: 'Total de base',
    calculation: 'Calcul final',
    finalScore: 'Score final',
    finalWinner: 'Vainqueur final',
    goodWinner: 'Gagnant effectif',
    goalDifference: 'Écart de buts',
    intro: '« Iván t’explique : sois précis, mais aussi malin ! »',
    noBet: 'Pas de pronostic pour ce match.',
    pendingScore: 'Score du match non publié.',
    phaseMultiplier: 'Multiplicateur de phase',
    prediction: 'Prono',
    precisionText:
      'Sur chaque match, tu peux marquer jusqu’à une vingtaine de points de base si ton pronostic colle bien au réel : bon vainqueur ou bon nul, score proche, petits bonus si tu es tout proche ou pile juste.',
    precisionTitle: 'La précision.',
    resultCorrect: 'Résultat correct (1 / N / 2)',
    scoreExactBonus: 'Bonus score exact',
    scoreProximity: 'Proximité du score',
    title: 'Comment sont calculés les points ?',
    tooltip: 'Multiplicateur de phase :',
    multiplierText:
      'Ensuite, ces points sont amplifiés par une cote « anti-mouton » : si ton choix est très majoritaire chez les joueurs, la cote reste modeste ; si tu es dans le camp des originaux, la cote peut monter fort, toujours dans une fourchette raisonnable.',
    multiplierTitle: 'Le multiplicateur dynamique.',
    winningOdds: 'Cote gagnante (popularité)',
    winnerIfDraw: 'vainqueur si nul',
  },
  user: {
    back: 'Retour',
    detailPrefix: 'Détail des points de',
    detailSuffix: 'ce joueur',
    finalWinnerCorrectPrefix: 'Ce joueur a gagné',
    finalWinnerCorrectSuffix: 'points',
    finalWinnerEliminated: 'Son vainqueur final est éliminé : 0 point',
    finalWinnerEliminatedSuffix: 'est éliminé.',
    finalWinnerHidden:
      'Son choix reste masqué tant que cette équipe est encore en course.',
    finalWinnerLost: "Son vainqueur final n'a pas gagné : 0 point",
    finalWinnerNoBonus: 'Aucun bonus ne pourra être ajouté au classement.',
    finalWinnerNone: 'Aucun vainqueur final sélectionné.',
    finalWinnerPotential:
      'Ce joueur peut encore gagner des points via le vainqueur final',
    finalWinnerStillAliveSuffix: 'est encore en course.',
    finalWinnerWonSuffix: 'a gagné la compétition.',
    matchMissing: 'Match introuvable ou pas encore terminé.',
    noFinishedMatch: 'Aucun match terminé pour le moment.',
    predictionSoon: 'Les pronostics seront bientôt accessibles !',
  },
}

const enTranslations: TranslationDictionary = {
  aiBet: {
    back: '← Back',
    chooseProvider: 'Choose my AI',
    chooseProviderTitle: 'Choose your AI',
    chooseProviderSubtitle: 'Each AI has its own view of football',
    countSuffixPlural: 'matches to predict',
    countSuffixSingular: 'match to predict',
    customsButton: 'Pay (€50)',
    customsText: 'Please pay €50 in customs fees first!',
    customsTitle: 'Customs fees',
    errorTitle: 'Oops!',
    loadingSubtitle: 'This can take a few seconds',
    loadingText: 'Analyzing teams and generating predictions',
    loadingTitle: 'The AI is thinking...',
    noValidPrediction: 'The AI did not return any valid prediction',
    overwriteExisting: 'Overwrite my existing predictions',
    promptPlaceholder: 'Example: I think France will win...',
    promptSubtitle: 'Write your preferences and the AI will fill your bets',
    promptSuggestions: [
      'Mbappe will tear it up this year',
      'Only goals and entertainment!',
      'I know nothing about football, surprise me',
      'Underdogs will cause upsets',
      'This year belongs to Haiti, obviously!',
    ],
    promptTitle: 'Let the AI predict',
    rejectedButton: 'Change AI',
    rejectedTextPrefix: 'Wrong answer',
    rejectedTextSuffix: 'You are now banned from entering China.',
    rejectedTitle: 'Territory ban',
    securityNo: 'No',
    securityQuestion:
      'Do you think the rebel province of Taiwan is an integral part of the great and glorious People’s Republic of China?',
    securityTitle: 'Security check 🇨🇳',
    securityYes: 'Yes, of course!',
    successFilledByAi: 'filled by the AI!',
    unknownError: 'An error occurred',
  },
  auth: {
    accountCreatedPrefix: 'An account has been created for',
    accountCreatedSuffix:
      'Click the link received by email to set up your password.',
    backToLogin: 'Back to sign in',
    checkEmailFallback: 'Unable to check the email address.',
    checking: 'Checking…',
    continue: 'Continue',
    continueWithGoogle: 'Continue with Google',
    createAccount: 'Create account',
    creating: 'Creating…',
    descriptionDefault:
      'Sign in to predict matches and challenge your friends.',
    descriptionPrefix: 'Sign in to predict matches for',
    displayName: 'Display name',
    displayNameMaxError: 'The name must be 20 characters maximum.',
    displayNameMinError: 'The name must contain at least 2 characters.',
    displayNamePlaceholder: 'Your nickname',
    displayNameRange: 'Between 2 and 20 characters.',
    emailInvalid: 'Enter a valid email address.',
    forgotPassword: 'Forgot password',
    forgotPasswordSending: 'Sending…',
    loginErrorFallback: 'Incorrect email or password.',
    openInSafari:
      'To continue with Google, open this page in Safari: tap the “…” menu at the top right, then “Open in Safari”.',
    or: 'or',
    password: 'Password',
    passwordResetSentPrefix: 'A reset email has just been sent to',
    passwordResetSentSuffix: '.',
    refreshPage: 'Refresh page',
    resetEmailFallback: 'Unable to send the reset email.',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    title: 'Welcome!',
  },
  betting: {
    distributionTitle: 'Who predicted what?',
    gainMax: 'max gain',
    odds: 'Odds',
    showTrend: 'Show prediction trend',
    thermoBalanced: 'Balanced pick: not too safe, not too wild.',
    thermoCold: 'Not enough predictions yet: the trend will settle soon.',
    thermoRisky: 'Bold move: the potential gain can climb high.',
    thermoSafe: 'Safe pick: more modest potential gain.',
    titlePotentialGain: 'Estimated potential gain: up to',
  },
  authPassword: {
    invalidDescription: 'Request a new password email to continue.',
    invalidTitle: 'Invalid or expired link',
    savePassword: 'Save password',
    savingPassword: 'Saving…',
    setupDescription:
      'Choose the password you will use for your next sign-ins.',
    setupSuccess: 'Password configured',
    setupTitle: 'Set up your password',
    resetDescription: 'Define a new password to recover your account.',
    resetSuccess: 'Password reset',
    resetTitle: 'New password',
  },
  common: {
    anonymous: 'Anonymous',
    cancel: 'Cancel',
    close: 'Close',
    connection: 'Sign in',
    memberPlural: 'members',
    memberSingular: 'member',
    mystery: 'Mystery',
    noWinner: 'None',
    points: 'points',
    pointsShort: 'pts',
    profile: 'Profile',
    retry: 'Try again',
    save: 'Save',
    signOut: 'Sign out',
    tbd: 'To be decided',
  },
  finalWinner: {
    chooseTitle: 'Choose the winner',
    closingPrefix: 'Winner predictions close on',
    closingDateFormat: 'MMMM d, yyyy HH:mm',
    finalWinnerQuestion: 'Who will be the final winner?',
    loading: 'Loading final winner...',
    lockedBetFor: 'You picked:',
    noTeamFound: 'No team found',
    odd: 'Odd',
    searchPlaceholder: 'Search...',
    selectTeam: 'Select a team',
    winnerQuestionPrefix: 'Who will win',
    winnerTitle: 'Your final winner',
  },
  groups: {
    accessCode: 'Access code',
    adminBadge: 'Admin',
    awaitingBadge: 'Pending',
    codeCopied: 'Code copied!',
    copyInviteCode: 'Copy invitation code',
    createButton: 'Create tribe',
    createDescription: 'Create your tribe and invite your people to join',
    createTitle: 'Create a tribe',
    joinButton: 'Send request',
    joinCodePlaceholder: 'Enter the code...',
    joinDescription: 'Enter the code shared by the tribe admin',
    joinTitle: 'Join a tribe',
    memberBadge: 'Member',
    myGroupsDescription: 'The tribes you belong to',
    myGroupsTitle: 'My tribes',
    nameMaxError: '20 characters maximum',
    nameMinError: '2 characters minimum',
    nameLabel: 'Tribe name',
    namePlaceholder: 'Example: The untouchables',
    renameGroup: 'Rename tribe',
    subtitle: 'Manage your tribes and challenge your people',
    title: 'My tribes',
  },
  home: {
    connectedLead:
      'Predict match results, score points, and challenge your friends and family in your tribe!',
    guestLead:
      'Predict match results, score points, and challenge your friends in your tribe!',
    legalLink: 'Privacy and terms',
    onboardingCta: 'Learn how to play',
    onboardingSubtitle: 'Sam, Ivan and Pierre explain it in 3 steps',
    playOnboarding: 'Start →',
    shortcutMatches: 'Predictions',
    shortcutRanking: 'Ranking',
    shortcutRules: 'Rules',
    viewRules: 'View rules',
    winnerSoon: 'The final winner prediction will be available soon!',
  },
  language: {
    selectorLabel: 'Change language',
  },
  matches: {
    aiButton: 'Let the AI predict!',
    empty: 'No match to show',
    finalWinnerAliveDescriptionPrefix: 'can still earn you',
    finalWinnerAliveDescriptionSuffix: 'if they go all the way.',
    finalWinnerAliveTitle: 'Your winner is still alive',
    finalWinnerChange: 'Change',
    finalWinnerChangeHint: 'Click here to change your pick.',
    finalWinnerChoose: 'Choose',
    finalWinnerMissingDescription:
      'You have not tried the big bonus yet. Pick your champion now.',
    finalWinnerMissingTitle: 'Your final winner is missing',
    finalWinnerOddPrefix: 'Associated odd:',
    finalWinnerOfficialDescriptionSuffix:
      'won and your final winner bonus is confirmed.',
    finalWinnerOfficialTitle: 'Your winner won',
    finalWinnerRecordedChoice: 'saved pick',
    finalWinnerSelectedPrefix: 'Your winner:',
    finalWinnerWinnerBonus: 'the final winner bonus',
    groupDetailsName: 'Name',
    launchText:
      'Predictions will be available soon! Until then, you can create your group and invite your friends!',
    launchTitle: 'Coming soon',
    myPointsDetail: 'My point details',
    moreInfoPrefix: 'To see more info,',
    moreInfoLink: 'create or join a tribe',
    moreInfoSuffix: '.',
    playoffWinner: 'Winner (extra time / penalties)',
    playoffWinnerInDraw: 'Your winner if draw',
    scoreFinal: 'Final score',
    scoringHelp: 'How are points calculated?',
    tabFinished: 'Finished',
    tabUpcoming: 'Upcoming',
    unavailableText: 'Predictions will be available soon!',
    unavailableTitle: 'Coming soon',
  },
  matchPhases: {
    group: 'Group',
    round_of_16: 'Round of 32',
    round_of_8: 'Round of 16',
    quarter_final: 'Quarter-finals',
    semi_final: 'Semi-finals',
    third_place: 'Third place',
    final: 'Final',
  },
  nav: {
    admin: 'Admin',
    analytics: 'Analytics',
    faq: 'FAQ',
    groups: 'Tribes',
    home: 'Home',
    legal: 'Privacy',
    matches: 'Predictions',
    ranking: 'Ranking',
    rules: 'Rules',
  },
  notFound: {
    action: 'Back home',
    description: 'This page does not exist or has been moved.',
    title: 'Page not found',
  },
  onboarding: {
    finish: 'Finish',
    joinGroup: '🏕️ Join a tribe',
    next: 'Next',
    previous: 'Previous',
    startBetting: '⚽ Start predicting',
    steps: [
      {
        title: 'Predict every match',
        subtitle: '“Listen up, partner!”',
        body: 'Before each kick-off, enter your prediction: the exact score for both teams. Your pick is saved automatically. You can edit it as often as you want until the match starts.',
        tipLabel: 'Sam’s tip',
        tip: 'No time to predict everything? The AI can do it for you: look for the purple button at the top of the matches page.',
      },
      {
        title: 'Score and multiply your points',
        subtitle: '“Be smart, amigo!”',
        body: 'Perfect score, correct winner, correct draw, close margin: you can score up to 20 base points. Then an anti-crowd odd multiplies your score: the more unexpected your prediction, the higher the potential gain.',
        tipLabel: 'Ivan’s tip',
        tip: 'Look at the trend bar under each match: it shows where other players are going and the matching odd.',
      },
      {
        title: 'Join your tribe, challenge your friends',
        subtitle: '“Let’s see who chops the table!”',
        body: 'Create a tribe or join one with a code. You will follow your group ranking in real time, match after match. May the best player win.',
        tipLabel: 'Pierre’s tip',
        tip: 'Go to the Tribes tab to create yours or join one with a code shared by your tribe leader.',
      },
    ],
  },
  prompts: {
    addToHomeScreen: 'Add to home screen',
    closeLater: 'Later',
    installIos: 'Tap Share, then “Add to Home Screen”',
    installText: 'For faster access, even offline!',
    installTitle: 'Install the app',
    notificationButton: 'Yes, save my prediction',
    notificationDismiss: 'Got it',
    notificationIosText:
      'On iPhone: first add the app to your home screen, then enable alerts from your profile.',
    notificationTitle: 'Pierre saves you from forgotten predictions',
    notificationText:
      'A reminder 5 min before kick-off if your grid is empty. No spam.',
    updateButton: 'Reload now',
    updateLoading: 'Reloading...',
    updateText:
      'A new version is available. Reload the app to keep predicting.',
    updateTitle: 'Required update',
  },
  profile: {
    activateAlerts: 'Enable match alerts',
    alertsEnabled: 'Match alerts enabled',
    avatarChange: 'Change profile photo',
    avatarUploading: 'Compressing and uploading photo…',
    disableAlerts: 'Disable alerts',
    enableAgainText:
      'You had turned off alerts in the app. You can turn them back on here.',
    enableText: 'You have not allowed notifications on this device yet.',
    fileFormatError: 'Unsupported file format',
    imageTooHeavy: 'Image too heavy (15 MB max)',
    loading: 'Loading…',
    localhostNotice:
      'Push notifications are not available on localhost. They work on the live site after deployment.',
    nameUpdateError: 'Error while updating the name',
    nameUpdated: 'Name updated',
    newPassword: 'New password',
    notificationsDenied:
      'The browser denied notifications. Open the site settings to allow notifications, then come back here.',
    notificationsDisabledToast: 'Notifications disabled for this site',
    notificationsEnableError: 'Unable to enable notifications',
    notificationsSavedToast: 'Preferences saved',
    notificationsText:
      'Reminders help you avoid missing kick-off when your prediction is still empty (~5 min before the match).',
    notificationsTitle: 'Notifications',
    notificationsUnsupported:
      'Notifications are not available on this browser or device. On iPhone, install the app on the home screen, then try again.',
    photoUpdateError: 'Error while updating the photo',
    photoUpdated: 'Photo updated',
    pushError:
      'The notification service did not respond in time or an error occurred. Check your connection or try again in a moment.',
    reactivateAlerts: 'Re-enable match alerts',
    rename: 'Rename',
    signOut: 'Sign out',
    updatePassword: 'Update',
    updatePasswordDescription:
      'Add or replace the password used with your email.',
    updatePasswordSubmitting: 'Updating…',
    passwordUpdated: 'Password updated',
    passwordTitle: 'Password',
    passwordMinError: 'The password must contain at least 8 characters.',
    passwordMismatchError: 'The two passwords do not match.',
    passwordUpdateFallback: 'Unable to update the password.',
    confirmPassword: 'Confirm password',
  },
  ranking: {
    createOrJoinGroup: 'create or join a tribe',
    general: 'Global',
    introPrefix: 'To view the ranking, you first need to',
    introSuffix: '.',
    noFinalWinner: 'No winner selected',
    officialWinnerPrefix: 'Official winner:',
    eliminatedPrefix: 'Eliminated:',
    secretWinner: 'Winner still secret',
    mysteryWinner: 'Mystery winner',
    ownRankSuffix: 'of',
    ownRankFirstSuffix: 'st',
    ownRankOtherSuffix: 'th',
    playerPlural: 'players',
  },
  scoring: {
    adminHintPrefix: 'You can show or hide a match from',
    adminHintSuffix: ', for each fixture.',
    algorithmLink: 'detailed rules and algorithm',
    algorithmIntro: 'Full scoring details and the official formula',
    adminLabel: 'Admin.',
    basePoints: 'Base points',
    baseTotal: 'Base total',
    calculation: 'Final calculation',
    finalScore: 'Final score',
    finalWinner: 'Final winner',
    goodWinner: 'Effective winner',
    goalDifference: 'Goal difference',
    intro: '“Ivan explains: be precise, but be smart too!”',
    noBet: 'No prediction for this match.',
    pendingScore: 'Match score not published yet.',
    phaseMultiplier: 'Phase multiplier',
    prediction: 'Prediction',
    precisionText:
      'On each match, you can score up to around twenty base points if your prediction is close to reality: correct winner or draw, close score, and small bonuses when you are very close or exactly right.',
    precisionTitle: 'Precision.',
    resultCorrect: 'Correct result (1 / D / 2)',
    scoreExactBonus: 'Exact score bonus',
    scoreProximity: 'Score proximity',
    title: 'How are points calculated?',
    tooltip: 'Phase multiplier:',
    multiplierText:
      'Then these points are amplified by an anti-crowd odd: if your pick is very popular among players, the odd stays modest; if you are in the original camp, it can climb high while staying balanced.',
    multiplierTitle: 'The dynamic multiplier.',
    winningOdds: 'Winning odd (popularity)',
    winnerIfDraw: 'winner if draw',
  },
  user: {
    back: 'Back',
    detailPrefix: 'Point details for',
    detailSuffix: 'this player',
    finalWinnerCorrectPrefix: 'This player won',
    finalWinnerCorrectSuffix: 'points',
    finalWinnerEliminated: 'Their final winner is eliminated: 0 points',
    finalWinnerEliminatedSuffix: 'is eliminated.',
    finalWinnerHidden:
      'Their pick stays hidden while this team is still alive.',
    finalWinnerLost: 'Their final winner did not win: 0 points',
    finalWinnerNoBonus: 'No bonus can be added to the ranking.',
    finalWinnerNone: 'No final winner selected.',
    finalWinnerPotential:
      'This player can still win points through the final winner',
    finalWinnerStillAliveSuffix: 'is still alive.',
    finalWinnerWonSuffix: 'won the competition.',
    matchMissing: 'Match not found or not finished yet.',
    noFinishedMatch: 'No finished match yet.',
    predictionSoon: 'Predictions will be available soon!',
  },
}

const mkTranslations: TranslationDictionary = {
  aiBet: {
    back: '← Назад',
    chooseProvider: 'Избери ја мојата ВИ',
    chooseProviderTitle: 'Избери ВИ',
    chooseProviderSubtitle: 'Секоја ВИ има свој поглед на фудбалот',
    countSuffixPlural: 'натпревари за прогнозирање',
    countSuffixSingular: 'натпревар за прогнозирање',
    customsButton: 'Плати (50€)',
    customsText: 'Прво плати 50€ царина!',
    customsTitle: 'Царински трошоци',
    errorTitle: 'Упс!',
    loadingSubtitle: 'Ова може да трае неколку секунди',
    loadingText: 'Анализа на екипите и генерирање прогнози',
    loadingTitle: 'ВИ размислува...',
    noValidPrediction: 'ВИ не врати валидна прогноза',
    overwriteExisting: 'Замени ги моите постоечки прогнози',
    promptPlaceholder: 'Пример: Мислам дека Франција ќе победи...',
    promptSubtitle: 'Напиши ги преференциите и ВИ ќе ги пополни прогнозите',
    promptSuggestions: [
      'Мбапе ќе растури оваа година',
      'Само голови и спектакл!',
      'Не знам ништо за фудбал, изненади ме',
      'Аутсајдерите ќе изненадат',
      'Оваа година е за Хаити, сигурно!',
    ],
    promptTitle: 'Остави ВИ да прогнозира',
    rejectedButton: 'Смени ВИ',
    rejectedTextPrefix: 'Погрешен одговор',
    rejectedTextSuffix: 'Од сега ти е забранет влез во Кина.',
    rejectedTitle: 'Забрана за територија',
    securityNo: 'Не',
    securityQuestion:
      'Дали мислиш дека бунтовната провинција Тајван е составен дел од големата и славна Народна Република Кина?',
    securityTitle: 'Безбедносна проверка 🇨🇳',
    securityYes: 'Да, се разбира!',
    successFilledByAi: 'пополнети од ВИ!',
    unknownError: 'Се случи грешка',
  },
  auth: {
    accountCreatedPrefix: 'Создадена е сметка за',
    accountCreatedSuffix:
      'Кликни на линкот добиен по email за да ја поставиш лозинката.',
    backToLogin: 'Назад кон најава',
    checkEmailFallback: 'Не може да се провери email адресата.',
    checking: 'Проверка…',
    continue: 'Продолжи',
    continueWithGoogle: 'Продолжи со Google',
    createAccount: 'Создај сметка',
    creating: 'Креирање…',
    descriptionDefault:
      'Најави се за да прогнозираш натпревари и да ги предизвикаш пријателите.',
    descriptionPrefix: 'Најави се за да прогнозираш натпревари од',
    displayName: 'Име за приказ',
    displayNameMaxError: 'Името мора да има најмногу 20 знаци.',
    displayNameMinError: 'Името мора да има најмалку 2 знаци.',
    displayNamePlaceholder: 'Твојот прекар',
    displayNameRange: 'Помеѓу 2 и 20 знаци.',
    emailInvalid: 'Внеси валидна email адреса.',
    forgotPassword: 'Заборавена лозинка',
    forgotPasswordSending: 'Испраќање…',
    loginErrorFallback: 'Погрешен email или лозинка.',
    openInSafari:
      'За да продолжиш со Google, отвори ја страницата во Safari: допри го менито „···“ горе десно, па „Open in Safari“.',
    or: 'или',
    password: 'Лозинка',
    passwordResetSentPrefix: 'Email за ресетирање е испратен до',
    passwordResetSentSuffix: '.',
    refreshPage: 'Освежи ја страницата',
    resetEmailFallback: 'Не може да се испрати email за ресетирање.',
    signIn: 'Најави се',
    signingIn: 'Најава…',
    title: 'Добредојде!',
  },
  betting: {
    distributionTitle: 'Кој што прогнозира?',
    gainMax: 'макс. добивка',
    odds: 'Коефициенти',
    showTrend: 'Прикажи тренд на прогнози',
    thermoBalanced: 'Балансирана прогноза: ниту премногу сигурна, ниту чудна.',
    thermoCold: 'Сè уште нема доволно прогнози: трендот ќе се разјасни.',
    thermoRisky: 'Покер потег: потенцијалната добивка може многу да порасне.',
    thermoSafe: 'Сигурен избор: поскромна потенцијална добивка.',
    titlePotentialGain: 'Проценета потенцијална добивка: до',
  },
  authPassword: {
    invalidDescription:
      'Побарај нов email за управување со лозинка за да продолжиш.',
    invalidTitle: 'Невалиден или истечен линк',
    savePassword: 'Зачувај лозинка',
    savingPassword: 'Зачувување…',
    setupDescription: 'Избери лозинка што ќе ја користиш за следните најави.',
    setupSuccess: 'Лозинката е конфигурирана',
    setupTitle: 'Постави лозинка',
    resetDescription: 'Постави нова лозинка за да ја вратиш сметката.',
    resetSuccess: 'Лозинката е ресетирана',
    resetTitle: 'Нова лозинка',
  },
  common: {
    anonymous: 'Анонимен',
    cancel: 'Откажи',
    close: 'Затвори',
    connection: 'Најава',
    memberPlural: 'членови',
    memberSingular: 'член',
    mystery: 'Мистерија',
    noWinner: 'Нема',
    points: 'поени',
    pointsShort: 'поени',
    profile: 'Профил',
    retry: 'Обиди се повторно',
    save: 'Зачувај',
    signOut: 'Одјави се',
    tbd: 'Ќе се одреди',
  },
  finalWinner: {
    chooseTitle: 'Избери победник',
    closingPrefix: 'Прогнозите за победник се затвораат на',
    closingDateFormat: 'd MMMM yyyy HH:mm',
    finalWinnerQuestion: 'Кој ќе биде конечниот победник?',
    loading: 'Вчитување на конечниот победник...',
    lockedBetFor: 'Твојот избор:',
    noTeamFound: 'Нема пронајден тим',
    odd: 'Коефициент',
    searchPlaceholder: 'Пребарај...',
    selectTeam: 'Избери тим',
    winnerQuestionPrefix: 'Кој ќе победи на',
    winnerTitle: 'Твој конечен победник',
  },
  groups: {
    accessCode: 'Код за пристап',
    adminBadge: 'Админ',
    awaitingBadge: 'Во очекување',
    codeCopied: 'Кодот е копиран!',
    copyInviteCode: 'Копирај код за покана',
    createButton: 'Создај триба',
    createDescription: 'Создај триба и покани ги твоите блиски да се приклучат',
    createTitle: 'Создај триба',
    joinButton: 'Испрати барање',
    joinCodePlaceholder: 'Внеси го кодот...',
    joinDescription: 'Внеси го кодот даден од администраторот на трибата',
    joinTitle: 'Приклучи се на триба',
    memberBadge: 'Член',
    myGroupsDescription: 'Трибите во кои членуваш',
    myGroupsTitle: 'Мои триби',
    nameMaxError: 'Најмногу 20 знаци',
    nameMinError: 'Најмалку 2 знаци',
    nameLabel: 'Име на трибата',
    namePlaceholder: 'Пример: Недопирливите',
    renameGroup: 'Преименувај триба',
    subtitle: 'Управувај со твоите триби и предизвикај ги блиските',
    title: 'Мои триби',
  },
  home: {
    connectedLead:
      'Прогнозирај резултати, освојувај поени и натпреварувај се со пријателите и семејството во твојата триба!',
    guestLead:
      'Прогнозирај резултати, освојувај поени и натпреварувај се со пријателите во твојата триба!',
    legalLink: 'Приватност и услови',
    onboardingCta: 'Откриј како се игра',
    onboardingSubtitle: 'Сем, Иван и Пјер објаснуваат во 3 чекори',
    playOnboarding: 'Старт →',
    shortcutMatches: 'Прогнози',
    shortcutRanking: 'Рангирање',
    shortcutRules: 'Правила',
    viewRules: 'Види правила',
    winnerSoon: 'Прогнозата за конечен победник наскоро ќе биде достапна!',
  },
  language: {
    selectorLabel: 'Промени јазик',
  },
  matches: {
    aiButton: 'Нека прогнозира ВИ!',
    empty: 'Нема натпревари за приказ',
    finalWinnerAliveDescriptionPrefix: 'сè уште може да ти донесе',
    finalWinnerAliveDescriptionSuffix: 'ако оди до крај.',
    finalWinnerAliveTitle: 'Твојот победник е уште во игра',
    finalWinnerChange: 'Смени',
    finalWinnerChangeHint: 'Кликни тука за да го смениш изборот.',
    finalWinnerChoose: 'Избери',
    finalWinnerMissingDescription:
      'Сè уште не си го пробал големиот бонус. Избери шампион сега.',
    finalWinnerMissingTitle: 'Ти недостига конечен победник',
    finalWinnerOddPrefix: 'Поврзан коефициент:',
    finalWinnerOfficialDescriptionSuffix:
      'победи и твојот бонус за конечен победник е потврден.',
    finalWinnerOfficialTitle: 'Твојот победник победи',
    finalWinnerRecordedChoice: 'зачуван избор',
    finalWinnerSelectedPrefix: 'Твој победник:',
    finalWinnerWinnerBonus: 'бонусот за конечен победник',
    groupDetailsName: 'Име',
    launchText:
      'Прогнозите наскоро ќе бидат достапни! До тогаш, можеш да создадеш група и да ги поканиш пријателите!',
    launchTitle: 'Наскоро достапно',
    myPointsDetail: 'Детали за моите поени',
    moreInfoPrefix: 'За повеќе информации,',
    moreInfoLink: 'создај или приклучи се на триба',
    moreInfoSuffix: '.',
    playoffWinner: 'Победник (продолженија / пенали)',
    playoffWinnerInDraw: 'Твој победник ако е нерешено',
    scoreFinal: 'Конечен резултат',
    scoringHelp: 'Како се пресметуваат поените?',
    tabFinished: 'Завршени',
    tabUpcoming: 'Следни',
    unavailableText: 'Прогнозите наскоро ќе бидат достапни!',
    unavailableTitle: 'Наскоро достапно',
  },
  matchPhases: {
    group: 'Група',
    round_of_16: '1/16 финале',
    round_of_8: '1/8 финале',
    quarter_final: 'Четврт-финале',
    semi_final: 'Полуфинале',
    third_place: 'Трето место',
    final: 'Финале',
  },
  nav: {
    admin: 'Админ',
    analytics: 'Аналитика',
    faq: 'FAQ',
    groups: 'Триби',
    home: 'Почетна',
    legal: 'Приватност',
    matches: 'Прогнози',
    ranking: 'Рангирање',
    rules: 'Правила',
  },
  notFound: {
    action: 'Назад на почетна',
    description: 'Оваа страница не постои или е преместена.',
    title: 'Страницата не е пронајдена',
  },
  onboarding: {
    finish: 'Заврши',
    joinGroup: '🏕️ Приклучи се на триба',
    next: 'Следно',
    previous: 'Претходно',
    startBetting: '⚽ Почни со прогнози',
    steps: [
      {
        title: 'Прогнозирај секој натпревар',
        subtitle: '„Listen up, partner!“',
        body: 'Пред секој почеток, внеси прогноза: точен резултат за двата тима. Изборот се зачувува автоматски. Можеш да го менуваш колку сакаш додека натпреварот не започне.',
        tipLabel: 'Совет од Сем',
        tip: 'Немаш време за сите прогнози? ВИ може да го направи тоа за тебе: побарај го виолетовото копче горе на страницата со натпревари.',
      },
      {
        title: 'Освојувај и множи поени',
        subtitle: '„Биди паметен, amigo!“',
        body: 'Точен резултат, точен победник, точно реми, блиска разлика: можеш да освоиш до 20 основни поени. Потоа коефициент против стадото го множи резултатот: колку е понеочекувана прогнозата, толку е поголема потенцијалната добивка.',
        tipLabel: 'Совет од Иван',
        tip: 'Погледни ја лентата со тренд под секој натпревар: покажува каде одат другите играчи и соодветниот коефициент.',
      },
      {
        title: 'Приклучи се на триба и предизвикај пријатели',
        subtitle: '„Ќе видиме кој е вистински мајстор!“',
        body: 'Создај триба или приклучи се со код. Ќе го следиш рангирањето на твојата група во реално време, натпревар по натпревар. Нека победи најдобриот.',
        tipLabel: 'Совет од Пјер',
        tip: 'Оди во табот Триби за да создадеш своја или да се приклучиш со код споделен од лидерот на трибата.',
      },
    ],
  },
  prompts: {
    addToHomeScreen: 'Додај на почетен екран',
    closeLater: 'Подоцна',
    installIos: 'Допрете Share, па „Add to Home Screen“',
    installText: 'За побрз пристап, дури и офлајн!',
    installTitle: 'Инсталирај ја апликацијата',
    notificationButton: 'Да, спаси ја прогнозата',
    notificationDismiss: 'Разбирам',
    notificationIosText:
      'На iPhone: прво додај ја апликацијата на почетниот екран, па активирај известувања од профилот.',
    notificationTitle: 'Пјер те спасува од заборавена прогноза',
    notificationText:
      'Потсетник 5 мин пред почеток ако прогнозата е празна. Без спам.',
    updateButton: 'Освежи сега',
    updateLoading: 'Освежување...',
    updateText:
      'Достапна е нова верзија. Освежи ја апликацијата за да продолжиш со прогнози.',
    updateTitle: 'Задолжително ажурирање',
  },
  profile: {
    activateAlerts: 'Активирај известувања за натпревари',
    alertsEnabled: 'Известувањата за натпревари се активни',
    avatarChange: 'Смени профилна фотографија',
    avatarUploading: 'Компресија и испраќање фотографија…',
    disableAlerts: 'Исклучи известувања',
    enableAgainText:
      'Ги имаш исклучено известувањата во апликацијата. Тука можеш повторно да ги активираш.',
    enableText: 'Сè уште немаш дозволено известувања на овој уред.',
    fileFormatError: 'Неподдржан формат на датотека',
    imageTooHeavy: 'Сликата е преголема (15 MB максимум)',
    loading: 'Вчитување…',
    localhostNotice:
      'Push известувањата не се достапни на localhost. Работат на онлајн сајтот по објава.',
    nameUpdateError: 'Грешка при ажурирање на името',
    nameUpdated: 'Името е ажурирано',
    newPassword: 'Нова лозинка',
    notificationsDenied:
      'Прелистувачот ги одби известувањата. Отвори ги поставките на сајтот за да ги дозволиш, па врати се тука.',
    notificationsDisabledToast: 'Известувањата се исклучени за овој сајт',
    notificationsEnableError: 'Не може да се активираат известувањата',
    notificationsSavedToast: 'Преференциите се зачувани',
    notificationsText:
      'Потсетниците ти помагаат да не пропуштиш почеток кога прогнозата уште не е внесена (~5 мин пред натпревар).',
    notificationsTitle: 'Известувања',
    notificationsUnsupported:
      'Известувањата не се достапни на овој прелистувач или уред. На iPhone, инсталирај ја апликацијата на почетниот екран и пробај повторно.',
    photoUpdateError: 'Грешка при ажурирање на фотографијата',
    photoUpdated: 'Фотографијата е ажурирана',
    pushError:
      'Сервисот за известувања не одговори навреме или се случи грешка. Провери ја врската или обиди се повторно за кратко.',
    reactivateAlerts: 'Повторно активирај известувања',
    rename: 'Преименувај',
    signOut: 'Одјави се',
    updatePassword: 'Ажурирај',
    updatePasswordDescription:
      'Додај или замени ја лозинката што се користи со твојот email.',
    updatePasswordSubmitting: 'Ажурирање…',
    passwordUpdated: 'Лозинката е ажурирана',
    passwordTitle: 'Лозинка',
    passwordMinError: 'Лозинката мора да има најмалку 8 знаци.',
    passwordMismatchError: 'Двете лозинки не се совпаѓаат.',
    passwordUpdateFallback: 'Не може да се ажурира лозинката.',
    confirmPassword: 'Потврди лозинка',
  },
  ranking: {
    createOrJoinGroup: 'создадеш или да се приклучиш на триба',
    general: 'Генерално',
    introPrefix: 'За да го видиш рангирањето, прво треба да',
    introSuffix: '.',
    noFinalWinner: 'Нема избран победник',
    officialWinnerPrefix: 'Официјален победник:',
    eliminatedPrefix: 'Елиминиран:',
    secretWinner: 'Победникот е сè уште таен',
    mysteryWinner: 'Мистериозен победник',
    ownRankSuffix: 'од',
    ownRankFirstSuffix: '',
    ownRankOtherSuffix: '',
    playerPlural: 'играчи',
  },
  scoring: {
    adminHintPrefix: 'Можеш да прикажеш или сокриеш натпревар од',
    adminHintSuffix: ', за секој натпревар.',
    algorithmLink: 'детални правила и алгоритам',
    algorithmIntro: 'Целосни детали за бодовите и официјалната формула',
    adminLabel: 'Админ.',
    basePoints: 'Основни поени',
    baseTotal: 'Основен вкупен резултат',
    calculation: 'Конечна пресметка',
    finalScore: 'Конечен резултат',
    finalWinner: 'Конечен победник',
    goodWinner: 'Ефективен победник',
    goalDifference: 'Гол-разлика',
    intro: '„Иван објаснува: биди прецизен, но и паметен!“',
    noBet: 'Нема прогноза за овој натпревар.',
    pendingScore: 'Резултатот од натпреварот не е објавен.',
    phaseMultiplier: 'Множител на фаза',
    prediction: 'Прогноза',
    precisionText:
      'На секој натпревар можеш да освоиш околу дваесет основни поени ако прогнозата е блиску до реалноста: точен победник или реми, близок резултат и мали бонуси кога си многу блиску или целосно точен.',
    precisionTitle: 'Прецизност.',
    resultCorrect: 'Точен исход (1 / X / 2)',
    scoreExactBonus: 'Бонус за точен резултат',
    scoreProximity: 'Близина на резултат',
    title: 'Како се пресметуваат поените?',
    tooltip: 'Множител на фаза:',
    multiplierText:
      'Потоа овие поени се множат со коефициент против стадото: ако твојот избор е многу популарен, коефициентот останува скромен; ако си меѓу оригиналните избори, може да порасне многу, но во разумни граници.',
    multiplierTitle: 'Динамичен множител.',
    winningOdds: 'Победнички коефициент (популарност)',
    winnerIfDraw: 'победник ако е нерешено',
  },
  user: {
    back: 'Назад',
    detailPrefix: 'Детали за поени на',
    detailSuffix: 'овој играч',
    finalWinnerCorrectPrefix: 'Овој играч освои',
    finalWinnerCorrectSuffix: 'поени',
    finalWinnerEliminated: 'Неговиот конечен победник е елиминиран: 0 поени',
    finalWinnerEliminatedSuffix: 'е елиминиран.',
    finalWinnerHidden: 'Изборот останува скриен додека тимот е уште во игра.',
    finalWinnerLost: 'Неговиот конечен победник не победи: 0 поени',
    finalWinnerNoBonus: 'Нема бонус што може да се додаде во рангирањето.',
    finalWinnerNone: 'Нема избран конечен победник.',
    finalWinnerPotential:
      'Овој играч сè уште може да освои поени преку конечниот победник',
    finalWinnerStillAliveSuffix: 'е уште во игра.',
    finalWinnerWonSuffix: 'ја освои конкуренцијата.',
    matchMissing: 'Натпреварот не е пронајден или уште не е завршен.',
    noFinishedMatch: 'Сè уште нема завршен натпревар.',
    predictionSoon: 'Прогнозите наскоро ќе бидат достапни!',
  },
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  fr: frTranslations,
  en: enTranslations,
  mk: mkTranslations,
}
