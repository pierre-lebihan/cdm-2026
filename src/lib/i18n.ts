import type { Locale } from 'date-fns'
import { enUS, fr, mk, eu } from 'date-fns/locale'
import type { MatchTournamentPhase } from './matchEnums'

export type LanguageCode = 'fr' | 'en' | 'mk' | 'eu' | 'br'

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

export interface AlgorithmCriterionRow {
  criterion: string
  points: string
}

export interface RuleTableTranslation {
  header: string[]
  rows: string[][]
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
  algorithm: {
    backToRules: string
    boundsText: string
    criterionHeader: string
    description: string
    exactValuesText: string
    exampleHoldUpText: string
    exampleMassText: string
    examplesTitle: string
    faqLink: string
    faqPrefix: string
    faqSuffix: string
    finalFormulaText: string
    formulaIntro: string
    formulaLabel: string
    groupFamilyLabel: string
    groupFamilyText: string
    knockoutFamilyLabel: string
    knockoutFamilyText: string
    maxTheoretical: string
    pointsHeader: string
    popularityIntro: string
    popularityTitle: string
    precisionRows: AlgorithmCriterionRow[]
    precisionText: string
    precisionTitle: string
    title: string
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
  faq: {
    createTribeAnswer: string
    createTribePunchline: string
    createTribeQuestion: string
    dataAnswerBold: string
    dataAnswerIntro: string
    dataPunchline: string
    dataQuestion: string
    freeAnswer: string
    freePunchline: string
    freeQuestion: string
    joinTribeAnswer: string
    joinTribePunchline: string
    joinTribeQuestion: string
    multipleTribesAnswer: string
    multipleTribesPunchline: string
    multipleTribesQuestion: string
    participateAnswer: string
    participatePunchline: string
    participateQuestion: string
    problemAnswer: string
    problemPunchline: string
    problemQuestion: string
    scoringAlgorithmPrefix: string
    scoringAnswerMultiplier: string
    scoringAnswerPrecision: string
    scoringLinkLabel: string
    scoringPunchline: string
    scoringQuestion: string
    subtitle: string
    title: string
    tribeAnswer: string
    tribePunchline: string
    tribeQuestion: string
    whatIsItCompetitionPrefix: string
    whatIsItCompetitionSuffix: string
    whatIsItDefault: string
    whatIsItPunchline: string
    whatIsItQuestion: string
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
    tabLive: string
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
    leetchi: string
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
  rules: {
    additionalTitle: string
    algorithmLink: string
    distributionNote: string
    distributionTable: RuleTableTranslation
    distributionText: string
    distributionTitle: string
    feesText: string
    feesTitle: string
    finalWinnerDefault: string
    finalWinnerPrefix: string
    finalWinnerSuffix: string
    finalWinnerTitle: string
    groupExampleTitle: string
    groupExamplesTable: RuleTableTranslation
    groupIntro: string
    groupTable: RuleTableTranslation
    groupTitle: string
    playoffDrawText: string
    playoffExampleTitle: string
    playoffExamplesTable: RuleTableTranslation
    playoffIntro: string
    playoffTitle: string
    qualificationText: string
    qualificationTitle: string
    subscriptionTitle: string
    subtitle: string
    title: string
    validationDeadlineIntro: string
    validationLateText: string
    validationLateTitle: string
    validationTitle: string
    validationWinnerDeadline: string
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
  toasts: {
    betSaved: string
    betSaveError: string
    batchBetsSaveError: string
    finalWinnerSaved: string
    finalWinnerSaveError: string
    groupAlreadyMemberPrefix: string
    groupCreateError: string
    groupCreatedCodeConnector: string
    groupCreatedPrefix: string
    groupCreatedSuffix: string
    groupJoinError: string
    groupJoinSuccessPrefix: string
    groupNotFoundPrefix: string
    groupNotFoundSuffix: string
    groupPlayerValidated: string
    groupRenameError: string
    groupRenamed: string
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
  {
    code: 'eu',
    flagCode: 'eu',
    htmlLang: 'eu',
    label: 'Basque',
    localeCode: 'eu-ES',
    nativeLabel: 'Euskara',
    shortLabel: 'EU'
  },
  {
    code: 'br',
    flagCode: 'br-fr',
    htmlLang: 'br',
    label: 'Breton',
    localeCode: 'br-FR',
    nativeLabel: 'Brezhoneg',
    shortLabel: 'BR'
  },
]

export const languageOptionsByCode: Record<LanguageCode, LanguageOption> = {
  fr: languageOptions[0],
  en: languageOptions[1],
  mk: languageOptions[2],
  eu: languageOptions[3],
  br: languageOptions[4],
}

export const dateLocales: Record<LanguageCode, Locale> = {
  fr,
  en: enUS,
  mk,
  eu,
  br: enUS, // Fallback to English locale for Breton since date-fns doesn't have Breton locale
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
  algorithm: {
    backToRules: '← Règles du jeu',
    boundsText:
      'La cote est ensuite bornée entre ×1 et ×10. Tant qu’il n’y a qu’un seul pronostic valide sur le match, la cote reste à ×1, sans effet anti-mouton sans foule.',
    criterionHeader: 'Critère',
    description:
      'Tout ce qui concerne les points de base, la popularité des pronos et des exemples chiffrés.',
    exactValuesText:
      'Les valeurs exactes dépendent du nombre de joueurs et de la répartition réelle ; l’app affiche une estimation de cote et une fourchette de gain potentiel au moment où tu saisis ton score.',
    exampleHoldUpText:
      'Même base, mais tu es presque seul sur ta famille : p est très faible, la cote grimpe. Tu peux dépasser 150 points sur un seul match, le hold-up.',
    exampleMassText:
      'Imaginons que tu fasses un quasi sans-faute sur un match, autour de 18 points de base. Si tout le monde a joué la même famille que toi, p est proche de 1 : la cote plonge vers le plancher et tu peux finir autour de 25 points sur ce match, le pari de la masse.',
    examplesTitle: '3. Exemples extrêmes (ordre de grandeur)',
    faqLink: 'FAQ',
    faqPrefix: 'Questions courtes : voir aussi la',
    faqSuffix: '.',
    finalFormulaText:
      'Points finaux = arrondi des points de base × cote × multiplicateur de phase.',
    formulaIntro:
      'Soit p la proportion de pronostics valides sur ce match qui tombent dans la même famille que le tien. Par exemple, 30 % des gens ont aussi misé une victoire A. La cote appliquée à tes points de base est :',
    formulaLabel: 'Cote = exp(−p^(1/2) × 2) × 10',
    groupFamilyLabel: 'Phase de groupe',
    groupFamilyText:
      'trois familles : victoire équipe A, match nul, victoire équipe B.',
    knockoutFamilyLabel: 'Phase finale',
    knockoutFamilyText:
      'deux familles : au final, c’est soit une victoire de A, soit une victoire de B, y compris après prolongations ou penalties. Si tu pars sur un nul à 90 min, ton choix de vainqueur départage ta famille.',
    maxTheoretical:
      'Maximum théorique sur ces critères : 20 points avant multiplicateur.',
    pointsHeader: 'Points',
    popularityIntro:
      'On regarde comment les joueurs se répartissent sur le match :',
    popularityTitle: '2. Popularité du pronostic',
    precisionRows: [
      {
        criterion: 'Résultat correct (V / N / D à 90 min)',
        points: '2',
      },
      {
        criterion: 'Bon gagnant du match (règle phase groupe vs phase finale)',
        points: '8',
      },
      {
        criterion: 'Proximité du score : max(3 − écart total des buts, 0)',
        points: '0 à 3',
      },
      {
        criterion: 'Écart de buts : max(3 − |marge réelle − marge pariée|, 0)',
        points: '0 à 3',
      },
      {
        criterion: 'Bonus score exact à 90 min',
        points: '4',
      },
    ],
    precisionText:
      'Le Résultat, la Proximité, l’Écart de buts et le Bonus score exact nécessitent le bon résultat à 90 min (V / N / D). Le Gagnant reste indépendant du résultat à 90 min en phase finale.',
    precisionTitle: '1. Points de précision (par match)',
    title: 'Règlement détaillé et algorithme',
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
  faq: {
    createTribeAnswer:
      "Allez dans l'onglet Tribus dans le menu. Dans la section Créer une tribu, choisissez le nom de la tribu. Un code d'accès sera alors créé, qu'il vous suffira d'envoyer aux personnes qui souhaitent faire partie de votre tribu.",
    createTribePunchline: 'Bâtis-la comme une cabane en rondins !',
    createTribeQuestion: 'Comment créer ma tribu ?',
    dataAnswerBold: 'Aucune donnée ne sera réutilisée pour un autre objectif.',
    dataAnswerIntro:
      'Les données personnelles collectées le sont uniquement dans le but du jeu.',
    dataPunchline: 'Tes données restent dans ton territoire !',
    dataQuestion: 'Que faites-vous de mes données ?',
    freeAnswer:
      "Oui, l'inscription au site est gratuite. Néanmoins, il est conseillé aux tribus de mettre en place une cagnotte pour récompenser les vainqueurs et rajouter de l'enjeu.",
    freePunchline: 'Free as in freedom, baby !',
    freeQuestion: 'Est-ce gratuit ?',
    joinTribeAnswer:
      "Allez dans l'onglet Tribus dans le menu, entrez le code que vous a indiqué votre chef d'équipe dans la section Rejoindre une tribu. Votre demande sera validée et vous pourrez commencer vos pronostics.",
    joinTribePunchline: "Le code, c'est la clé du chalet !",
    joinTribeQuestion: 'Comment rejoindre une tribu ?',
    multipleTribesAnswer:
      "Oui, vous pouvez faire partie d'autant de tribus que vous le souhaitez. Par contre, vous ne pouvez parier qu'un seul score par match, qui sera le même dans toutes vos tribus.",
    multipleTribesPunchline: 'Una apuesta, muchas tribus, amigo !',
    multipleTribesQuestion: 'Puis-je faire partie de plusieurs tribus ?',
    participateAnswer:
      "Après vous être connecté, vous devez tout d'abord rejoindre une tribu ou créer votre propre tribu. Une fois cette étape réalisée, vous pourrez pronostiquer votre vainqueur final ainsi que vos premiers matchs.",
    participatePunchline: 'Trouve ta tribu et plante ta hache !',
    participateQuestion: 'Comment participer ?',
    problemAnswer:
      "Vous pouvez nous envoyer votre requête à l'adresse pierre@le-bihan.eu. Nous vous répondrons le plus rapidement possible.",
    problemPunchline: 'Envoie un signal de fumée à Pierre !',
    problemQuestion: "J'ai un problème non listé ici",
    scoringAlgorithmPrefix: 'Tableau complet, formule et exemples :',
    scoringAnswerMultiplier:
      'Ensuite, un multiplicateur dynamique amplifie ces points : si tout le monde a joué la même tendance que toi, le gain reste modeste ; si tu es dans une minorité de pronos, le multiplicateur peut monter fort. L’objectif est de récompenser les choix originaux sans casser l’équilibre du jeu.',
    scoringAnswerPrecision:
      'D’abord, la précision : plus ton pronostic colle au vrai match (bon vainqueur ou bon nul, score proche, petits bonus si tu es juste ou tout proche), plus tu accumules des points de base, jusqu’à une vingtaine de points par rencontre.',
    scoringLinkLabel: 'règlement détaillé et algorithme',
    scoringPunchline: 'Sois précis, sois malin, sois original !',
    scoringQuestion: 'Comment sont calculés les points ?',
    subtitle: 'Sam, Iván et Pierre répondent à tes questions',
    title: 'Questions fréquentes',
    tribeAnswer:
      "Une tribu est un groupe de personnes qui regroupe des amis, des connaissances, des familles, avec lesquels vous aurez choisi de jouer. Chacun d'entre vous peut créer sa propre tribu s'il le souhaite.",
    tribePunchline: "C'est ta meute, ta cabane, ton clan !",
    tribeQuestion: "Qu'est-ce qu'une tribu ?",
    whatIsItCompetitionPrefix:
      'Un site qui vous permet de jouer avec les pronostics de',
    whatIsItCompetitionSuffix:
      'entre amis ou en famille. À chaque bon pronostic, vous marquez un certain nombre de points, qui cumulés au fur et à mesure détermineront votre place dans le classement de votre tribu.',
    whatIsItDefault:
      'Un site qui vous permet de jouer avec des pronostics sportifs, entre amis ou en famille. À chaque bon pronostic, vous marquez un certain nombre de points, qui cumulés au fur et à mesure détermineront votre place dans le classement de votre tribu.',
    whatIsItPunchline: 'Welcome to the show, partner !',
    whatIsItQuestion: "Qu'est-ce que c'est ?",
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
    tabLive: 'En cours',
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
    leetchi: 'Soutenez les organisateurs',
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
  rules: {
    additionalTitle: 'Règles additionnelles',
    algorithmLink: 'Règlement détaillé et algorithme →',
    distributionNote:
      'Cette répartition est intégrée directement dans les côtes des matchs. Vous pouvez donc savoir les points à gagner en regardant la côte.',
    distributionTable: {
      header: ['Phase', 'Matchs', 'Multi.', '% total'],
      rows: [
        ['Poules', '48', '×0,75', '35%'],
        ['16es', '16', '×1', '12%'],
        ['8es', '8', '×1,5', '12%'],
        ['Quarts', '4', '×3', '9%'],
        ['Demis', '2', '×6', '7%'],
        ['3e place', '1', '×8', '5%'],
        ['Finale', '1', '×12', '7%'],
        ['Vainqueur', '—', '—', '10%'],
      ],
    },
    distributionText:
      'Les points sont répartis de façon équilibrée pour que les retournements de situation restent possibles jusqu’au bout !',
    distributionTitle: 'Répartition des points',
    feesText:
      "L'inscription est gratuite et instantanée. Néanmoins, il est conseillé aux tribus de mettre en place une cagnotte pour récompenser les vainqueurs et rajouter de l'enjeu.",
    feesTitle: "Droits d'inscription",
    finalWinnerDefault:
      'Chaque joueur pronostique le vainqueur final avant le début de la compétition. Si le pronostic est correct, la cote associée est ajoutée au total de points.',
    finalWinnerPrefix: 'Chaque joueur pronostique le champion de',
    finalWinnerSuffix:
      'avant le début de la compétition. Si le pronostic est correct, la cote associée est ajoutée au total de points.',
    finalWinnerTitle: 'Vainqueur final',
    groupExampleTitle: 'Exemples : France 3-0 Mexique',
    groupExamplesTable: {
      header: [
        'Prono',
        'Résultat',
        'Gagnant',
        'Proximité',
        'Écart',
        'Bonus',
        'Total',
      ],
      rows: [
        ['3-0', '2', '8', '3', '3', '4', '20'],
        ['4-0', '2', '8', '2 (diff 1)', '0 (marge 4≠3)', '0', '12'],
        ['4-1', '2', '8', '1 (diff 2)', '3 (marge 3=3)', '0', '14'],
        ['2-1', '2', '8', '1 (diff 2)', '0 (marge 1≠3)', '0', '11'],
        ['0-2', '0 (mauvais résultat)', '—', '—', '—', '—', '0'],
      ],
    },
    groupIntro:
      'Pour chaque match, vous pouvez marquer jusqu’à 20 points répartis en 5 critères indépendants. Si le résultat (V/N/D) est incorrect, vous obtenez 0 point.',
    groupTable: {
      header: ['Critère', 'Description', 'Points'],
      rows: [
        ['Résultat Correct', 'Victoire / Nul / Défaite correcte', '2'],
        ['Gagnant Correct', 'Bonne équipe gagnante (hors nul)', '8'],
        ['Proximité du Score', '3 − écart total des buts (min 0)', '0–3'],
        ['Écart de Buts', 'Bonne marge de victoire / nul', '3'],
        ['Bonus Score Exact', 'Score 100 % exact', '4'],
      ],
    },
    groupTitle: 'Règles durant la phase de groupe',
    playoffDrawText:
      'En phase finale, les matchs nuls au bout de 90 min sont possibles (prolongations / tirs au but). Pronostiquer un nul vous rapporte les points Résultat Correct + Proximité + Écart + Bonus si exact, mais pas le bonus Gagnant.',
    playoffExampleTitle: 'Exemples : Brésil 2-1 Allemagne',
    playoffExamplesTable: {
      header: [
        'Prono',
        'Résultat',
        'Gagnant',
        'Proximité',
        'Écart',
        'Bonus',
        'Total',
      ],
      rows: [
        ['2-1', '2', '8', '3', '3', '4', '20'],
        ['3-1', '2', '8', '2 (diff 1)', '0 (marge 2≠1)', '0', '12'],
        ['3-2', '2', '8', '1 (diff 2)', '3 (marge 1=1)', '0', '14'],
        ['3-0', '2', '8', '1 (diff 2)', '0 (marge 3≠1)', '0', '11'],
        ['1-1', '0 (mauvais résultat)', '—', '—', '—', '—', '0'],
      ],
    },
    playoffIntro:
      'Le fonctionnement est identique à la phase de groupe : jusqu’à 20 points par match selon les 5 mêmes critères. Vous pronostiquez le score à la fin du temps réglementaire (90 min).',
    playoffTitle: 'Règles durant la phase finale',
    qualificationText:
      'Il n’y a pas d’élimination, tout le monde participe aux pronostics de tous les matchs. Chacun des participants garde son nombre de points acquis durant toute la compétition.',
    qualificationTitle: 'Mode de qualification',
    subscriptionTitle: "Droits d'inscription et mode de qualification",
    subtitle: "Sam, Iván et Pierre t'expliquent comment pronostiquer",
    title: 'Règles du jeu',
    validationDeadlineIntro:
      'Les pronostics pour chaque match doivent être remplis sur le site avant le début de ceux-ci.',
    validationLateText:
      'sur un match ou pour le vainqueur final, le joueur aura 0 point mais ne sera pas éliminé et pourra donc participer aux autres matchs.',
    validationLateTitle: 'En cas de retard ou de non-réponse',
    validationTitle: 'Date de validation des pronostics',
    validationWinnerDeadline:
      'En ce qui concerne les pronostics sur le vainqueur de la compétition, ceux-ci doivent être réalisés avant le premier match de la compétition, soit le samedi 14 juin 2025 à 21h.',
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
  toasts: {
    betSaved: 'Pronostic sauvegardé',
    betSaveError: 'Erreur lors de la sauvegarde du pronostic',
    batchBetsSaveError: 'Erreur lors de la sauvegarde des pronostics',
    finalWinnerSaved: 'Équipe mise à jour',
    finalWinnerSaveError: 'Mise à jour échouée :(',
    groupAlreadyMemberPrefix: 'Vous appartenez déjà à la tribu',
    groupCreateError: 'Erreur lors de la création du groupe',
    groupCreatedCodeConnector: 'avec le code',
    groupCreatedPrefix: 'Groupe',
    groupCreatedSuffix: 'créé',
    groupJoinError: "Erreur lors de l'inscription",
    groupJoinSuccessPrefix: 'Inscription dans la tribu',
    groupNotFoundPrefix: 'Aucune tribu avec le code',
    groupNotFoundSuffix: "n'existe",
    groupPlayerValidated: 'Joueur validé',
    groupRenameError: 'Erreur lors du renommage de la tribu',
    groupRenamed: 'Tribu renommée',
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
  algorithm: {
    backToRules: '← Game rules',
    boundsText:
      'The odd is then capped between ×1 and ×10. As long as there is only one valid prediction on the match, the odd stays at ×1, with no anti-crowd effect without a crowd.',
    criterionHeader: 'Criterion',
    description:
      'Everything about base points, prediction popularity, and worked examples.',
    exactValuesText:
      'Exact values depend on the number of players and the real distribution. The app shows an estimated odd and potential gain range while you enter your score.',
    exampleHoldUpText:
      'Same base, but you are almost alone in your family: p is very low, so the odd climbs. You can go above 150 points on a single match, the hold-up.',
    exampleMassText:
      'Imagine you are almost perfect on a match, around 18 base points. If everyone played the same family as you, p is close to 1: the odd drops toward the floor and you can end around 25 points on that match, the crowd bet.',
    examplesTitle: '3. Extreme examples (rough scale)',
    faqLink: 'FAQ',
    faqPrefix: 'Short questions: also see the',
    faqSuffix: '.',
    finalFormulaText:
      'Final points = rounded base points × odd × phase multiplier.',
    formulaIntro:
      'Let p be the proportion of valid predictions on this match that fall into the same family as yours. For example, 30% of players also picked team A to win. The odd applied to your base points is:',
    formulaLabel: 'Odd = exp(−p^(1/2) × 2) × 10',
    groupFamilyLabel: 'Group stage',
    groupFamilyText: 'three families: team A win, draw, team B win.',
    knockoutFamilyLabel: 'Knockout stage',
    knockoutFamilyText:
      'two families: in the end, either A wins or B wins, including after extra time or penalties. If you predict a draw after 90 minutes, your winner pick decides your family.',
    maxTheoretical:
      'Theoretical maximum on these criteria: 20 points before multiplier.',
    pointsHeader: 'Points',
    popularityIntro: 'We look at how players are distributed on the match:',
    popularityTitle: '2. Prediction popularity',
    precisionRows: [
      {
        criterion: 'Correct result (W / D / L after 90 minutes)',
        points: '2',
      },
      {
        criterion: 'Correct match winner (group vs knockout rule)',
        points: '8',
      },
      {
        criterion: 'Score proximity: max(3 − total goal gap, 0)',
        points: '0 to 3',
      },
      {
        criterion:
          'Goal difference: max(3 − |real margin − predicted margin|, 0)',
        points: '0 to 3',
      },
      {
        criterion: 'Exact score bonus after 90 minutes',
        points: '4',
      },
    ],
    precisionText:
      'The Result and Exact score bonus require the correct result after 90 minutes (W / D / L). Score proximity and Goal difference are awarded if the 90-minute result is correct or if the correct winner is predicted in knockout matches. Winner points are always independent from the 90-minute result in knockout matches.',
    precisionTitle: '1. Precision points (per match)',
    title: 'Detailed rules and algorithm',
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
  faq: {
    createTribeAnswer:
      'Open the Tribes tab from the menu. In the Create a tribe section, choose the tribe name. An access code will be created; send it to the people you want in your tribe.',
    createTribePunchline: 'Build it like a proper cabin!',
    createTribeQuestion: 'How do I create my tribe?',
    dataAnswerBold: 'No data will be reused for another purpose.',
    dataAnswerIntro:
      'Personal data is collected only for the purpose of the game.',
    dataPunchline: 'Your data stays on your turf!',
    dataQuestion: 'What do you do with my data?',
    freeAnswer:
      'Yes, signing up is free. However, tribes are encouraged to set up a prize pool to reward winners and add some stakes.',
    freePunchline: 'Free as in freedom, baby!',
    freeQuestion: 'Is it free?',
    joinTribeAnswer:
      'Open the Tribes tab from the menu, then enter the code shared by your team leader in the Join a tribe section. Your request will be approved and you can start predicting.',
    joinTribePunchline: 'The code is the cabin key!',
    joinTribeQuestion: 'How do I join a tribe?',
    multipleTribesAnswer:
      'Yes, you can belong to as many tribes as you want. However, you can only place one score per match, and it will be the same in all your tribes.',
    multipleTribesPunchline: 'One bet, many tribes, amigo!',
    multipleTribesQuestion: 'Can I be in several tribes?',
    participateAnswer:
      'After signing in, you first need to join a tribe or create your own. Once that is done, you can predict your final winner and your first matches.',
    participatePunchline: 'Find your tribe and plant your flag!',
    participateQuestion: 'How do I participate?',
    problemAnswer:
      'You can send your request to pierre@le-bihan.eu. We will answer as quickly as possible.',
    problemPunchline: 'Send Pierre a smoke signal!',
    problemQuestion: 'I have a problem not listed here',
    scoringAlgorithmPrefix: 'Full table, formula, and examples:',
    scoringAnswerMultiplier:
      'Then a dynamic multiplier amplifies those points: if everyone picked the same trend as you, the gain stays modest; if you are in a minority of predictions, the multiplier can climb high. The goal is to reward original choices without breaking the balance of the game.',
    scoringAnswerPrecision:
      'First, precision: the closer your prediction is to the real match (correct winner or draw, close score, small bonuses if you are exact or very close), the more base points you collect, up to around twenty points per match.',
    scoringLinkLabel: 'detailed rules and algorithm',
    scoringPunchline: 'Be precise, be smart, be original!',
    scoringQuestion: 'How are points calculated?',
    subtitle: 'Sam, Ivan and Pierre answer your questions',
    title: 'Frequently asked questions',
    tribeAnswer:
      'A tribe is a group of friends, acquaintances, or family members you chose to play with. Each of you can create your own tribe if you want.',
    tribePunchline: 'Your pack, your cabin, your clan!',
    tribeQuestion: 'What is a tribe?',
    whatIsItCompetitionPrefix: 'A site where you can play with predictions for',
    whatIsItCompetitionSuffix:
      'with friends or family. With each correct prediction, you score points that build up over time and determine your ranking in your tribe.',
    whatIsItDefault:
      'A site where you can play sports predictions with friends or family. With each correct prediction, you score points that build up over time and determine your ranking in your tribe.',
    whatIsItPunchline: 'Welcome to the show, partner!',
    whatIsItQuestion: 'What is this?',
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
    tabLive: 'Live',
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
    leetchi: 'Support the organizers',
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
  rules: {
    additionalTitle: 'Additional rules',
    algorithmLink: 'Detailed rules and algorithm →',
    distributionNote:
      'This distribution is built directly into match odds. You can estimate the points available by looking at the odd.',
    distributionTable: {
      header: ['Phase', 'Matches', 'Multi.', '% total'],
      rows: [
        ['Groups', '48', '×0.75', '35%'],
        ['Round of 32', '16', '×1', '12%'],
        ['Round of 16', '8', '×1.5', '12%'],
        ['Quarter-finals', '4', '×3', '9%'],
        ['Semi-finals', '2', '×6', '7%'],
        ['Third place', '1', '×8', '5%'],
        ['Final', '1', '×12', '7%'],
        ['Winner', '—', '—', '10%'],
      ],
    },
    distributionText:
      'Points are distributed in a balanced way so comebacks stay possible until the end!',
    distributionTitle: 'Point distribution',
    feesText:
      'Registration is free and instant. However, tribes are encouraged to set up a prize pool to reward winners and add some stakes.',
    feesTitle: 'Entry fees',
    finalWinnerDefault:
      'Each player predicts the final winner before the competition starts. If the prediction is correct, the associated odd is added to the point total.',
    finalWinnerPrefix: 'Each player predicts the champion of',
    finalWinnerSuffix:
      'before the competition starts. If the prediction is correct, the associated odd is added to the point total.',
    finalWinnerTitle: 'Final winner',
    groupExampleTitle: 'Examples: France 3-0 Mexico',
    groupExamplesTable: {
      header: [
        'Pick',
        'Result',
        'Winner',
        'Proximity',
        'Gap',
        'Bonus',
        'Total',
      ],
      rows: [
        ['3-0', '2', '8', '3', '3', '4', '20'],
        ['4-0', '2', '8', '2 (diff 1)', '0 (margin 4≠3)', '0', '12'],
        ['4-1', '2', '8', '1 (diff 2)', '3 (margin 3=3)', '0', '14'],
        ['2-1', '2', '8', '1 (diff 2)', '0 (margin 1≠3)', '0', '11'],
        ['0-2', '0 (wrong result)', '—', '—', '—', '—', '0'],
      ],
    },
    groupIntro:
      'For each match, you can score up to 20 points split across 5 independent criteria. If the result (W/D/L) is wrong, you get 0 points.',
    groupTable: {
      header: ['Criterion', 'Description', 'Points'],
      rows: [
        ['Correct result', 'Correct win / draw / loss', '2'],
        ['Correct winner', 'Correct winning team (excluding draws)', '8'],
        ['Score proximity', '3 − total goal gap (min 0)', '0–3'],
        ['Goal difference', 'Correct winning margin / draw', '3'],
        ['Exact score bonus', '100% exact score', '4'],
      ],
    },
    groupTitle: 'Rules during the group stage',
    playoffDrawText:
      'In knockout matches, draws after 90 minutes are possible (extra time / penalties). Predicting a draw gives you Correct result + Proximity + Gap + Bonus points if exact, but not the Winner bonus.',
    playoffExampleTitle: 'Examples: Brazil 2-1 Germany',
    playoffExamplesTable: {
      header: [
        'Pick',
        'Result',
        'Winner',
        'Proximity',
        'Gap',
        'Bonus',
        'Total',
      ],
      rows: [
        ['2-1', '2', '8', '3', '3', '4', '20'],
        ['3-1', '2', '8', '2 (diff 1)', '0 (margin 2≠1)', '0', '12'],
        ['3-2', '2', '8', '1 (diff 2)', '3 (margin 1=1)', '0', '14'],
        ['3-0', '2', '8', '1 (diff 2)', '0 (margin 3≠1)', '0', '11'],
        ['1-1', '0 (wrong result)', '—', '—', '—', '—', '0'],
      ],
    },
    playoffIntro:
      'The logic is identical to the group stage: up to 20 points per match using the same 5 criteria. You predict the score at the end of regulation time (90 minutes).',
    playoffTitle: 'Rules during the knockout stage',
    qualificationText:
      'There is no elimination: everyone predicts every match. Each participant keeps their points throughout the whole competition.',
    qualificationTitle: 'Qualification mode',
    subscriptionTitle: 'Entry fees and qualification mode',
    subtitle: 'Sam, Ivan and Pierre explain how to predict',
    title: 'Game rules',
    validationDeadlineIntro:
      'Predictions for each match must be filled in on the site before kick-off.',
    validationLateText:
      'on a match or on the final winner, the player gets 0 points but is not eliminated and can still participate in the other matches.',
    validationLateTitle: 'In case of lateness or no answer',
    validationTitle: 'Prediction validation date',
    validationWinnerDeadline:
      'Final winner predictions must be made before the first match of the competition, on Saturday, June 14, 2025 at 21:00.',
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
  toasts: {
    betSaved: 'Prediction saved',
    betSaveError: 'Error while saving the prediction',
    batchBetsSaveError: 'Error while saving predictions',
    finalWinnerSaved: 'Team updated',
    finalWinnerSaveError: 'Update failed :(',
    groupAlreadyMemberPrefix: 'You already belong to tribe',
    groupCreateError: 'Error while creating the group',
    groupCreatedCodeConnector: 'with code',
    groupCreatedPrefix: 'Group',
    groupCreatedSuffix: 'created',
    groupJoinError: 'Error while signing up',
    groupJoinSuccessPrefix: 'Joined tribe',
    groupNotFoundPrefix: 'No tribe with code',
    groupNotFoundSuffix: 'exists',
    groupPlayerValidated: 'Player approved',
    groupRenameError: 'Error while renaming the tribe',
    groupRenamed: 'Tribe renamed',
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
  algorithm: {
    backToRules: '← Правила на играта',
    boundsText:
      'Коефициентот потоа е ограничен помеѓу ×1 и ×10. Додека има само една валидна прогноза за натпреварот, коефициентот останува ×1, без ефект против мнозинството кога нема мнозинство.',
    criterionHeader: 'Критериум',
    description:
      'Сè за основните поени, популарноста на прогнозите и бројчани примери.',
    exactValuesText:
      'Точните вредности зависат од бројот на играчи и реалната распределба. Апликацијата прикажува проценет коефициент и опсег на потенцијална добивка додека го внесуваш резултатот.',
    exampleHoldUpText:
      'Иста основа, но речиси си сам во твојата фамилија: p е многу ниско, па коефициентот расте. Можеш да надминеш 150 поени на еден натпревар, вистински hold-up.',
    exampleMassText:
      'Замисли дека си речиси совршен на натпревар, околу 18 основни поени. Ако сите ја одиграле истата фамилија како тебе, p е блиску до 1: коефициентот паѓа кон минимумот и можеш да завршиш околу 25 поени на тој натпревар, прогнозата на мнозинството.',
    examplesTitle: '3. Екстремни примери (приближно)',
    faqLink: 'FAQ',
    faqPrefix: 'Кратки прашања: види ја и',
    faqSuffix: '.',
    finalFormulaText:
      'Конечни поени = заокружени основни поени × коефициент × множител на фаза.',
    formulaIntro:
      'Нека p биде делот од валидните прогнози за овој натпревар што паѓаат во истата фамилија како твојата. На пример, 30% од играчите исто така играле победа на тим A. Коефициентот што се применува на твоите основни поени е:',
    formulaLabel: 'Коефициент = exp(−p^(1/2) × 2) × 10',
    groupFamilyLabel: 'Групна фаза',
    groupFamilyText: 'три фамилии: победа на тим A, нерешено, победа на тим B.',
    knockoutFamilyLabel: 'Елиминациска фаза',
    knockoutFamilyText:
      'две фамилии: на крај победува или A или B, вклучително по продолженија или пенали. Ако прогнозираш нерешено по 90 минути, твојот избор на победник ја одредува фамилијата.',
    maxTheoretical:
      'Теоретски максимум за овие критериуми: 20 поени пред множител.',
    pointsHeader: 'Поени',
    popularityIntro: 'Гледаме како играчите се распределуваат на натпреварот:',
    popularityTitle: '2. Популарност на прогнозата',
    precisionRows: [
      {
        criterion: 'Точен исход (П / Н / П по 90 минути)',
        points: '2',
      },
      {
        criterion:
          'Точен победник на натпреварот (групна vs елиминациска фаза)',
        points: '8',
      },
      {
        criterion: 'Близина на резултат: max(3 − вкупна гол-разлика, 0)',
        points: '0 до 3',
      },
      {
        criterion:
          'Гол-разлика: max(3 − |реална маргина − прогнозирана маргина|, 0)',
        points: '0 до 3',
      },
      {
        criterion: 'Бонус за точен резултат по 90 минути',
        points: '4',
      },
    ],
    precisionText:
      'Исходот и бонусот за точен резултат бараат точен исход по 90 минути (П / Н / П). Близината на резултатот и гол-разликата се доделуваат ако исходот по 90 минути е точен или ако е предвиден точниот победник во елиминациски натпревар. Победникот секогаш е независен од исходот по 90 минути во елиминациската фаза.',
    precisionTitle: '1. Поени за прецизност (по натпревар)',
    title: 'Детални правила и алгоритам',
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
  faq: {
    createTribeAnswer:
      'Отвори го табот Триби во менито. Во делот Создај триба, избери име на трибата. Ќе се создаде код за пристап што можеш да го испратиш на луѓето што сакаш да бидат во твојата триба.',
    createTribePunchline: 'Изгради ја како вистинска база!',
    createTribeQuestion: 'Како да создадам триба?',
    dataAnswerBold: 'Ниту еден податок нема да се користи за друга цел.',
    dataAnswerIntro:
      'Личните податоци се собираат само за потребите на играта.',
    dataPunchline: 'Твоите податоци остануваат на твоја територија!',
    dataQuestion: 'Што правите со моите податоци?',
    freeAnswer:
      'Да, регистрацијата на сајтот е бесплатна. Сепак, трибите може да направат награден фонд за победниците и да додадат повеќе влог во играта.',
    freePunchline: 'Бесплатно, како слобода!',
    freeQuestion: 'Дали е бесплатно?',
    joinTribeAnswer:
      'Отвори го табот Триби во менито, внеси го кодот што ти го дал лидерот во делот Приклучи се на триба. Барањето ќе биде одобрено и ќе можеш да почнеш со прогнози.',
    joinTribePunchline: 'Кодот е клучот!',
    joinTribeQuestion: 'Како да се приклучам на триба?',
    multipleTribesAnswer:
      'Да, можеш да бидеш дел од колку триби сакаш. Но можеш да внесеш само еден резултат по натпревар, ист за сите твои триби.',
    multipleTribesPunchline: 'Една прогноза, многу триби, amigo!',
    multipleTribesQuestion: 'Можам ли да бидам во повеќе триби?',
    participateAnswer:
      'Откако ќе се најавиш, прво треба да се приклучиш на триба или да создадеш своја. Потоа можеш да го прогнозираш конечниот победник и првите натпревари.',
    participatePunchline: 'Најди ја твојата триба и постави знаме!',
    participateQuestion: 'Како да учествувам?',
    problemAnswer:
      'Можеш да го испратиш барањето на pierre@le-bihan.eu. Ќе одговориме најбрзо што можеме.',
    problemPunchline: 'Испрати порака до Пјер!',
    problemQuestion: 'Имам проблем што не е наведен тука',
    scoringAlgorithmPrefix: 'Целосна табела, формула и примери:',
    scoringAnswerMultiplier:
      'Потоа динамичен множител ги засилува тие поени: ако сите ја играле истата тенденција како тебе, добивката останува скромна; ако си во малцинство, множителот може силно да порасне. Целта е да се наградат оригиналните избори без да се наруши балансот на играта.',
    scoringAnswerPrecision:
      'Прво, прецизност: колку повеќе твојата прогноза се доближува до реалниот натпревар (точен победник или нерешено, близок резултат, мали бонуси ако си точен или многу блиску), толку повеќе основни поени собираш, до околу дваесет поени по натпревар.',
    scoringLinkLabel: 'детални правила и алгоритам',
    scoringPunchline: 'Биди прецизен, паметен и оригинален!',
    scoringQuestion: 'Како се пресметуваат поените?',
    subtitle: 'Сем, Иван и Пјер одговараат на твоите прашања',
    title: 'Често поставувани прашања',
    tribeAnswer:
      'Триба е група пријатели, познаници или семејство со кои си избрал да играш. Секој може да создаде своја триба ако сака.',
    tribePunchline: 'Твојата екипа, твојата база, твојот клан!',
    tribeQuestion: 'Што е триба?',
    whatIsItCompetitionPrefix: 'Сајт на кој можеш да играш со прогнози за',
    whatIsItCompetitionSuffix:
      'со пријатели или семејство. За секоја добра прогноза освојуваш поени што се собираат со текот на времето и го одредуваат твоето место во рангирањето на трибата.',
    whatIsItDefault:
      'Сајт на кој можеш да играш спортски прогнози со пријатели или семејство. За секоја добра прогноза освојуваш поени што се собираат со текот на времето и го одредуваат твоето место во рангирањето на трибата.',
    whatIsItPunchline: 'Welcome to the show, partner!',
    whatIsItQuestion: 'Што е ова?',
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
    tabLive: 'Во тек',
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
    leetchi: 'Поддржете ги организаторите',
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
  rules: {
    additionalTitle: 'Дополнителни правила',
    algorithmLink: 'Детални правила и алгоритам →',
    distributionNote:
      'Оваа распределба е вградена директно во коефициентите на натпреварите. Можеш да ги процениш поените за добивка гледајќи го коефициентот.',
    distributionTable: {
      header: ['Фаза', 'Натпревари', 'Множ.', '% вкупно'],
      rows: [
        ['Групи', '48', '×0,75', '35%'],
        ['1/16 финале', '16', '×1', '12%'],
        ['1/8 финале', '8', '×1,5', '12%'],
        ['Четврт-финале', '4', '×3', '9%'],
        ['Полуфинале', '2', '×6', '7%'],
        ['Трето место', '1', '×8', '5%'],
        ['Финале', '1', '×12', '7%'],
        ['Победник', '—', '—', '10%'],
      ],
    },
    distributionText:
      'Поените се распределени балансирано за пресврти да бидат можни до самиот крај!',
    distributionTitle: 'Распределба на поени',
    feesText:
      'Регистрацијата е бесплатна и моментална. Сепак, трибите може да направат награден фонд за победниците и да додадат повеќе влог.',
    feesTitle: 'Котизација',
    finalWinnerDefault:
      'Секој играч го прогнозира конечниот победник пред почетокот на натпреварувањето. Ако прогнозата е точна, поврзаниот коефициент се додава на вкупниот број поени.',
    finalWinnerPrefix: 'Секој играч го прогнозира шампионот на',
    finalWinnerSuffix:
      'пред почетокот на натпреварувањето. Ако прогнозата е точна, поврзаниот коефициент се додава на вкупниот број поени.',
    finalWinnerTitle: 'Конечен победник',
    groupExampleTitle: 'Примери: Франција 3-0 Мексико',
    groupExamplesTable: {
      header: [
        'Прогноза',
        'Исход',
        'Победник',
        'Близина',
        'Разлика',
        'Бонус',
        'Вкупно',
      ],
      rows: [
        ['3-0', '2', '8', '3', '3', '4', '20'],
        ['4-0', '2', '8', '2 (разл. 1)', '0 (маргина 4≠3)', '0', '12'],
        ['4-1', '2', '8', '1 (разл. 2)', '3 (маргина 3=3)', '0', '14'],
        ['2-1', '2', '8', '1 (разл. 2)', '0 (маргина 1≠3)', '0', '11'],
        ['0-2', '0 (погрешен исход)', '—', '—', '—', '—', '0'],
      ],
    },
    groupIntro:
      'За секој натпревар можеш да освоиш до 20 поени поделени во 5 независни критериуми. Ако исходот (П/Н/П) е погрешен, добиваш 0 поени.',
    groupTable: {
      header: ['Критериум', 'Опис', 'Поени'],
      rows: [
        ['Точен исход', 'Точна победа / нерешено / пораз', '2'],
        ['Точен победник', 'Точна победничка екипа (без нерешено)', '8'],
        ['Близина на резултат', '3 − вкупна разлика во голови (мин 0)', '0–3'],
        ['Гол-разлика', 'Точна победничка маргина / нерешено', '3'],
        ['Бонус точен резултат', '100% точен резултат', '4'],
      ],
    },
    groupTitle: 'Правила во групната фаза',
    playoffDrawText:
      'Во елиминациската фаза, нерешено по 90 минути е можно (продолженија / пенали). Прогноза на нерешено носи поени за Точен исход + Близина + Разлика + Бонус ако е точна, но не и бонус за Победник.',
    playoffExampleTitle: 'Примери: Бразил 2-1 Германија',
    playoffExamplesTable: {
      header: [
        'Прогноза',
        'Исход',
        'Победник',
        'Близина',
        'Разлика',
        'Бонус',
        'Вкупно',
      ],
      rows: [
        ['2-1', '2', '8', '3', '3', '4', '20'],
        ['3-1', '2', '8', '2 (разл. 1)', '0 (маргина 2≠1)', '0', '12'],
        ['3-2', '2', '8', '1 (разл. 2)', '3 (маргина 1=1)', '0', '14'],
        ['3-0', '2', '8', '1 (разл. 2)', '0 (маргина 3≠1)', '0', '11'],
        ['1-1', '0 (погрешен исход)', '—', '—', '—', '—', '0'],
      ],
    },
    playoffIntro:
      'Функционира исто како групната фаза: до 20 поени по натпревар според истите 5 критериуми. Го прогнозираш резултатот на крајот од регуларното време (90 минути).',
    playoffTitle: 'Правила во елиминациската фаза',
    qualificationText:
      'Нема елиминација: сите учествуваат во прогнозите за сите натпревари. Секој учесник ги задржува освоените поени во текот на целото натпреварување.',
    qualificationTitle: 'Начин на квалификација',
    subscriptionTitle: 'Котизација и начин на квалификација',
    subtitle: 'Сем, Иван и Пјер објаснуваат како се прогнозира',
    title: 'Правила на играта',
    validationDeadlineIntro:
      'Прогнозите за секој натпревар мора да се внесат на сајтот пред неговиот почеток.',
    validationLateText:
      'за натпревар или за конечниот победник, играчот добива 0 поени, но не е елиминиран и може да учествува во другите натпревари.',
    validationLateTitle: 'Во случај на задоцнување или без одговор',
    validationTitle: 'Датум на валидација на прогнозите',
    validationWinnerDeadline:
      'Прогнозите за победникот на натпреварувањето мора да се направат пред првиот натпревар, односно во сабота, 14 јуни 2025 во 21:00.',
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
  toasts: {
    betSaved: 'Прогнозата е зачувана',
    betSaveError: 'Грешка при зачувување на прогнозата',
    batchBetsSaveError: 'Грешка при зачувување на прогнозите',
    finalWinnerSaved: 'Тимот е ажуриран',
    finalWinnerSaveError: 'Ажурирањето не успеа :(',
    groupAlreadyMemberPrefix: 'Веќе припаѓаш на трибата',
    groupCreateError: 'Грешка при создавање на групата',
    groupCreatedCodeConnector: 'со код',
    groupCreatedPrefix: 'Групата',
    groupCreatedSuffix: 'е создадена',
    groupJoinError: 'Грешка при пријавување',
    groupJoinSuccessPrefix: 'Приклучување во трибата',
    groupNotFoundPrefix: 'Нема триба со код',
    groupNotFoundSuffix: 'не постои',
    groupPlayerValidated: 'Играчот е одобрен',
    groupRenameError: 'Грешка при преименување на трибата',
    groupRenamed: 'Трибата е преименувана',
  },
}

const euTranslations: TranslationDictionary = {
  aiBet: {
    back: '← Atzera',
    chooseProvider: 'Nire IA aukeratu',
    chooseProviderTitle: 'Aukeratu zure IA',
    chooseProviderSubtitle: 'IA bakoitzak futbolaren ikuspegi propioa du',
    countSuffixPlural: 'aurreikusteko partida',
    countSuffixSingular: 'aurreikusteko partida',
    customsButton: 'Ordaindu (50 €)',
    customsText: 'Mesedez, ordaindu 50 € aduana-sarietan lehenik!',
    customsTitle: 'Aduana-sariak',
    errorTitle: 'Ups!',
    loadingSubtitle: 'Honek segundo batzuk har ditzake',
    loadingText: 'Taldeak analizatzen eta iragarpenak sortzen',
    loadingTitle: 'IA pentsatzen ari da...',
    noValidPrediction: 'IAk ez du baliozko iragarpenik itzuli',
    overwriteExisting: 'Gainidatzi nire egungo iragarpenak',
    promptPlaceholder: 'Adibidez: Nire ustez Frantziak irabaziko du...',
    promptSubtitle: 'Idatzi zure lehentasunak eta IAk zure apustuak beteko ditu',
    promptSuggestions: [
      'Mbappek dena apurtuko du aurten',
      'Golak eta ikuskizuna besterik ez!',
      'Ez dakit ezer futbolaz, harritu nazazu',
      'Ahulenek ezustekoak emango dituzte',
      'Aurten Haitiren urtea da, jakina!',
    ],
    promptTitle: 'Utzi IAri iragartzen',
    rejectedButton: 'IA aldatu',
    rejectedTextPrefix: 'Erantzun okerra',
    rejectedTextSuffix: 'Txinan sartzea debekatuta daukazu hemendik aurrera.',
    rejectedTitle: 'Lurralde debekua',
    securityNo: 'Ez',
    securityQuestion:
      'Taiwan probintzia matxinoa Txinako Herri Errepublika handi eta gloriotsuaren zati integra dela uste duzu?',
    securityTitle: 'Segurtasun kontrola 🇨🇳',
    securityYes: 'Bai, nola ez!',
    successFilledByAi: 'IAk beteta!',
    unknownError: 'Errore bat gertatu da',
  },
  algorithm: {
    backToRules: '← Jokoaren arauak',
    boundsText:
      'Ondoren, kuota ×1 eta ×10 artean mugatzen da. Partidan baliozko iragarpen bakarra dagoen bitartean, kuota ×1ean mantentzen da; ez dago jendearen aurkako efekturik jenderik gabe.',
    criterionHeader: 'Irizpidea',
    description:
      'Oinarrizko puntuei, iragarpenen ospeari eta adibide zehatzei buruzko guztia.',
    exactValuesText:
      'Balio zehatzak jokalari kopuruaren eta benetako banaketaren araberakoak dira. Aplikazioak estimatutako kuota eta irabazi potentzialaren tartea erakusten ditu scorea idazten duzun bitartean.',
    exampleHoldUpText:
      'Oinarri bera, baina zure familian ia bakarrik zaude: p oso baxua da, beraz kuotak gora egiten du. Partida bakar batean 150 puntu baino gehiago lortu ditzakezu: horixe da hold-up-a.',
    exampleMassText:
      'Imajinatu partida batean ia perfektu zabiltzala, 18 oinarri-puntu inguru. Denek zure familia bera jokatu badute, p 1etik gertu dago: kuota lurrera erortzen da eta partida horretan 25 puntu ingururekin amaitu dezakezu: horixe da jendearen apustua (crowd bet).',
    examplesTitle: '3. Muturreko adibideak (eskala gutxi gorabehera)',
    faqLink: 'FAQ',
    faqPrefix: 'Galdera laburrak: ikusi halaber',
    faqSuffix: '.',
    finalFormulaText:
      'Azken puntuak = oinarri-puntu biribilduak × kuota × fasearen biderkatzailea.',
    formulaIntro:
      'Izan bedi p zure familia berean erortzen diren partida honetako baliozko iragarpenen proportzioa. Adibidez, jokalarien %30ek A taldearen garaipena aukeratu dute. Zure oinarri-puntuei aplikatutako kuota hau da:',
    formulaLabel: 'Kuota = exp(−p^(1/2) × 2) × 10',
    groupFamilyLabel: 'Multzoen fasea',
    groupFamilyText: 'hiru familia: A taldeak irabazi, berdinketa, B taldeak irabazi.',
    knockoutFamilyLabel: 'Kanporaketa fasea',
    knockoutFamilyText:
      'bi familia: azkenean, A-k irabazten du edo B-k irabazten du, luzapena edo penaltiak barne. 90 minuturen ostean berdinketa iragartzen baduzu, zure irabazlearen hautaketak zehazten du zure familia.',
    maxTheoretical:
      'Gehienezko teorikoa irizpide hauetan: 20 puntu biderkatzailearen aurretik.',
    pointsHeader: 'Puntuak',
    popularityIntro: 'Jokalariak partidan nola banatzen diren begiratzen dugu:',
    popularityTitle: '2. Iragarpenen ospea',
    precisionRows: [
      {
        criterion: 'Emaitza zuzena (1 / X / 2, 90 minuturen ostean)',
        points: '2',
      },
      {
        criterion: 'Partidako irabazle zuzena (multzoen vs kanporaketen araua)',
        points: '8',
      },
      {
        criterion: 'Score hurbiltasuna: max(3 − golen aldea guztira, 0)',
        points: '0-3',
      },
      {
        criterion:
          'Golen diferentzia: max(3 − |benetako marjina − aurreikusitako marjina|, 0)',
        points: '0-3',
      },
      {
        criterion: 'Score zehatzaren bonusa 90 minuturen ostean',
        points: '4',
      },
    ],
    precisionText:
      'Emaitzak eta Score zehatzaren bonusak emaitza zuzena eskatzen dute 90 minuturen ostean (1 / X / 2). Score hurbiltasuna eta Golen diferentzia ematen dira 90 minutuko emaitza zuzena bada edo kanporaketa partidetan irabazle zuzena asmatzen bada. Irabazlearen puntuak beti dira 90 minutuko emaitzarekiko independenteak kanporaketa partidetan.',
    precisionTitle: '1. Zehaztasun puntuak (partida bakoitzeko)',
    title: 'Arau zehatzak eta algoritmoa',
  },
  auth: {
    accountCreatedPrefix: 'Kontu bat sortu da honrentzat:',
    accountCreatedSuffix:
      'Egin klik posta elektronikoz jasotako estekan zure pasahitza ezartzeko.',
    backToLogin: 'Itzuli saioa histera',
    checkEmailFallback: 'Ezin izan da posta helbidea egiaztatu.',
    checking: 'Egiaztatzen…',
    continue: 'Jarraitu',
    continueWithGoogle: 'Jarraitu Google-kin',
    createAccount: 'Kontua sortu',
    creating: 'Sortzen…',
    descriptionDefault:
      'Hasi saioa partidak iragartzeko eta zure lagunei erronka egiteko.',
    descriptionPrefix: 'Hasi saioa partidak iragartzeko honentzat:',
    displayName: 'Pantaila-izena',
    displayNameMaxError: 'Izenak gehienez 20 karaktere izan ditzake.',
    displayNameMinError: 'Izenak gutxienez 2 karaktere izan behar ditu.',
    displayNamePlaceholder: 'Zure ezizena',
    displayNameRange: '2 eta 20 karaktere artean.',
    emailInvalid: 'Sartu baliozko posta helbide bat.',
    forgotPassword: 'Pasahitza ahaztu dut',
    forgotPasswordSending: 'Bidaltzen…',
    loginErrorFallback: 'Posta helbide edo pasahitz okerra.',
    openInSafari:
      'Google-kin jarraitzeko, ireki orri hau Safarin: sakatu goiko eskuineko “…” menua, eta gero “Ireki Safarin”.',
    or: 'edo',
    password: 'Pasahitza',
    passwordResetSentPrefix: 'Pasahitza berrezartzeko mezu bat bidali da hona:',
    passwordResetSentSuffix: '.',
    refreshPage: 'Berritu orria',
    resetEmailFallback: 'Ezin izan da berrezartzeko mezua bidali.',
    signIn: 'Hasi saioa',
    signingIn: 'Saioa hasten…',
    title: 'Ongi etorri!',
  },
  betting: {
    distributionTitle: 'Nork zer iragarri du?',
    gainMax: 'gehienezko irabazia',
    odds: 'Kuotak',
    showTrend: 'Erakutsi iragarpenen joera',
    thermoBalanced: 'Hautaketa orekatua: ez oso segurua, ez oso eroa.',
    thermoCold: 'Oraindik ez dago iragarpen nahikorik: joera laster egonkorra izango da.',
    thermoRisky: 'Aukera ausarta: irabazi potentziala oso gora igo daiteke.',
    thermoSafe: 'Hautaketa segurua: irabazi potentzial apalagoa.',
    titlePotentialGain: 'Estimatutako irabazi potentziala: gehienez',
  },
  faq: {
    createTribeAnswer:
      'Ireki Tribuak fitxa menuan. "Sortu tribu bat" atalean, aukeratu tribuaren izena. Sarbide-kode bat sortuko da; bidali zure tribuan egotea nahi duzun jendeari.',
    createTribePunchline: 'Eraiki ezazu txabola egoki bat bezala!',
    createTribeQuestion: 'Nola sortuko dut nire tribua?',
    dataAnswerBold: 'Ez da daturik berrerabiliko beste helburu baterako.',
    dataAnswerIntro:
      'Datu pertsonalak jokoaren helbururako soilik biltzen dira.',
    dataPunchline: 'Zure datuak zure lurrean geratzen dira!',
    dataQuestion: 'Zer egiten duzue nire datuekin?',
    freeAnswer:
      'Bai, izena ematea doakoa da. Hala ere, tribuak saria (bote bat) jartzera animatzen dira, irabazleak saritzeko eta jokoari emozio apur bat gehitzeko.',
    freePunchline: 'Doakoa eta libre, lagun!',
    freeQuestion: 'Doakoa al da?',
    joinTribeAnswer:
      'Ireki Tribuak fitxa menuan, eta ondoren sartu zure taldeko buruak emandako kodea "Sartu tribu batean" atalean. Zure eskaera onartuko da eta iragartzen has zaitezke.',
    joinTribePunchline: 'Kodea txabolako gakoa da!',
    joinTribeQuestion: 'Nola sartuko naiz tribu batean?',
    multipleTribesAnswer:
      'Bai, nahi adina tributako kide izan zaitezke. Hala ere, partida bakoitzeko score bakar bat jar dezakezu, eta bera izango da zure tribu guztietan.',
    multipleTribesPunchline: 'Apustu bat, tribu asko, adiskide!',
    multipleTribesQuestion: 'Tribu bat baino gehiagotan egon naiteke?',
    participateAnswer:
      'Saioa hasi ondorengo pausoa tribu batean sartzea edo zeure bat sortzea da. Hori egindakoan, zure azken irabazlea eta lehen partidak iragar ditzakezu.',
    participatePunchline: 'Aurkitu zure tribua eta jarri zure bandera!',
    participateQuestion: 'Nola hartu dezaket parte?',
    problemAnswer:
      'Zure eskaera pierre@le-bihan.eu helbidera bidali dezakezu. Ahalik eta azkarren erantzungo dizugu.',
    problemPunchline: 'Bidali ke-seinale bat Pierreri!',
    problemQuestion: 'Hemen agertzen ez den arazo bat dut',
    scoringAlgorithmPrefix: 'Taula osoa, formula eta adibideak:',
    scoringAnswerMultiplier:
      'Ondoren, biderkatzaile dinamiko batek puntu horiek handitzen ditu: denek zure joera bera aukeratu badute, irabazia txikia izango da; iragarpenen gutxiengoan bazaude, biderkatzailea oso gora igo daiteke. Helburua aukera originalak saritzea da, jokoaren oreka hautsi gabe.',
    scoringAnswerPrecision:
      'Lehenik, zehaztasuna: zure iragarpena benetako partidatik zenbat eta gertuago egon (irabazle edo berdinketa zuzena, score gertua, bonusekin zehatza edo oso gertua bazara), orduan eta oinarri-puntu gehiago bilduko dituzu, partida bakoitzeko hogei puntu inguru arte.',
    scoringLinkLabel: 'arau zehatzak eta algoritmoa',
    scoringPunchline: 'Izan zehatza, izan azkarra, izan originala!',
    scoringQuestion: 'Nola kalkulatzen dira puntuak?',
    subtitle: 'Sam, Ivan eta Pierrek zure galderei erantzuten diete',
    title: 'Maiz egiten diren galderak',
    tribeAnswer:
      'Tribu bat zurekin jolasteko aukeratu dituzun lagun, ezagun edo senideen talde bat da. Nahi izanez gero, bakoitzak bere tribua sor dezake.',
    tribePunchline: 'Zure taldea, zure txabola, zure klan-a!',
    tribeQuestion: 'Zer da tribu bat?',
    whatIsItCompetitionPrefix: 'Iragarpenekin jolasteko webgune bat honentzat:',
    whatIsItCompetitionSuffix:
      'lagun edo senideekin. Iragarpen zuzen bakoitzarekin, denboran zehar metatzen diren puntuak lortuko dituzu eta horrek zure tribuaren sailkapena zehaztuko du.',
    whatIsItDefault:
      'Kirol iragarpenekin lagun edo senideekin jolasteko webgune bat. Iragarpen zuzen bakoitzarekin, denboran zehar metatzen diren puntuak lortuko dituzu eta horrek zure tribuaren sailkapena zehaztuko du.',
    whatIsItPunchline: 'Ongi etorri ikuskizunera, kide!',
    whatIsItQuestion: 'Zer da hau?',
  },
  authPassword: {
    invalidDescription: 'Eskatu pasahitz mezu berri bat jarraitzeko.',
    invalidTitle: 'Esteka baliogabea edo iraungitua',
    savePassword: 'Pasahitza gorde',
    savingPassword: 'Gordetzen…',
    setupDescription:
      'Aukeratu hurrengo saio-hasieretan erabiliko duzun pasahitza.',
    setupSuccess: 'Pasahitza konfiguratuta',
    setupTitle: 'Ezarri zure pasahitza',
    resetDescription: 'Definitu pasahitz berri bat zure kontua berreskuratzeko.',
    resetSuccess: 'Pasahitza berrezarrita',
    resetTitle: 'Pasahitz berria',
  },
  common: {
    anonymous: 'Anonimoa',
    cancel: 'Utzi',
    close: 'Itxi',
    connection: 'Hasi saioa',
    memberPlural: 'kideak',
    memberSingular: 'kidea',
    mystery: 'Misterioa',
    noWinner: 'Bat ere ez',
    points: 'puntu',
    pointsShort: 'pt',
    profile: 'Profila',
    retry: 'Saiatu berriro',
    save: 'Gorde',
    signOut: 'Itxi saioa',
    tbd: 'Zehazteke',
  },
  finalWinner: {
    chooseTitle: 'Aukeratu irabazlea',
    closingPrefix: 'Irabazlearen iragarpenak heltzen dira:',
    closingDateFormat: 'yyyy(e)ko MMMM d, HH:mm',
    finalWinnerQuestion: 'Nork irabaziko du azkenean?',
    loading: 'Azken irabazlea kargatzen...',
    lockedBetFor: 'Zure hautaketa:',
    noTeamFound: 'Ez da talderik aurkitu',
    odd: 'Kuota',
    searchPlaceholder: 'Bilatu...',
    selectTeam: 'Hautatu talde bat',
    winnerQuestionPrefix: 'Nork irabaziko du',
    winnerTitle: 'Zure azken irabazlea',
  },
  groups: {
    accessCode: 'Sarbide-kodea',
    adminBadge: 'Admin',
    awaitingBadge: 'Zain',
    codeCopied: 'Kodea kopiatuta!',
    copyInviteCode: 'Kopiatu gonbidapen-kodea',
    createButton: 'Tribu bat sortu',
    createDescription: 'Sortu zure tribua eta gonbidatu zure jendea sartzera',
    createTitle: 'Tribu bat sortu',
    joinButton: 'Bidali eskaera',
    joinCodePlaceholder: 'Sartu kodea...',
    joinDescription: 'Sartu tribuaren administratzaileak emandako kodea',
    joinTitle: 'Sartu tribu batean',
    memberBadge: 'Kidea',
    myGroupsDescription: 'Zure tribuak',
    myGroupsTitle: 'Nire tribuak',
    nameMaxError: 'Gehienez 20 karaktere',
    nameMinError: 'Gutxienez 2 karaktere',
    nameLabel: 'Tribuaren izena',
    namePlaceholder: 'Adibidez: Ukiezinak',
    renameGroup: 'Aldatu tribuaren izena',
    subtitle: 'Kudeatu zure tribuak eta egin erronka zure jendeari',
    title: 'Nire tribuak',
  },
  home: {
    connectedLead:
      'Iragarri partiden emaitzak, lortu puntuak eta egin erronka lagun eta senideei zure tribuan!',
    guestLead:
      'Iragarri partiden emaitzak, lortu puntuak eta egin erronka lagunei zure tribuan!',
    legalLink: 'Pribatutasuna eta baldintzak',
    onboardingCta: 'Ikasi nola jokatu',
    onboardingSubtitle: 'Sam, Ivan eta Pierrek 3 urratsetan azalduko dizute',
    playOnboarding: 'Hasi →',
    shortcutMatches: 'Iragarpenak',
    shortcutRanking: 'Sailkapena',
    shortcutRules: 'Arauak',
    viewRules: 'Ikusi arauak',
    winnerSoon: 'Azken irabazlearen iragarpena laster egongo da eskuragarri!',
  },
  language: {
    selectorLabel: 'Aldatu hizkuntza',
  },
  matches: {
    aiButton: 'Utzi IAri iragartzen!',
    empty: 'Ez dago erakusteko partidarik',
    finalWinnerAliveDescriptionPrefix: 'oraindik eman diezazuke',
    finalWinnerAliveDescriptionSuffix: 'bukaeraraino iristen badira.',
    finalWinnerAliveTitle: 'Zure irabazleak bizirik jarraitzen du',
    finalWinnerChange: 'Aldatu',
    finalWinnerChangeHint: 'Egin klik hemen hautaketa aldatzeko.',
    finalWinnerChoose: 'Aukeratu',
    finalWinnerMissingDescription:
      'Oraindik ez duzu bonus handia probatu. Aukeratu zure txapelduna orain.',
    finalWinnerMissingTitle: 'Zure azken irabazlea falta da',
    finalWinnerOddPrefix: 'Lotutako kuota:',
    finalWinnerOfficialDescriptionSuffix:
      'irabazi du eta zure azken irabazlearen bonusa baieztatuta dago.',
    finalWinnerOfficialTitle: 'Zure irabazleak irabazi du',
    finalWinnerRecordedChoice: 'gordetako hautaketa',
    finalWinnerSelectedPrefix: 'Zure irabazlea:',
    finalWinnerWinnerBonus: 'azken irabazlearen bonusa',
    groupDetailsName: 'Izena',
    launchText:
      'Iragarpenak laster egongo dira eskuragarri! Bitartean, zure taldea sortu eta lagunak gonbida ditzakezu!',
    launchTitle: 'Laster jokoan',
    myPointsDetail: 'Nire puntuen xehetasunak',
    moreInfoPrefix: 'Informazio gehiago ikusteko,',
    moreInfoLink: 'sortu edo sartu tribu batean',
    moreInfoSuffix: '.',
    playoffWinner: 'Irabazlea (luzapena / penaltiak)',
    playoffWinnerInDraw: 'Zure irabazlea berdinketa izanez gero',
    scoreFinal: 'Azken emaitza',
    scoringHelp: 'Nola kalkulatzen dira puntuak?',
    tabFinished: 'Amaituak',
    tabLive: 'Zuzenean',
    tabUpcoming: 'Datozenak',
    unavailableText: 'Iragarpenak laster egongo dira eskuragarri!',
    unavailableTitle: 'Laster jokoan',
  },
  matchPhases: {
    group: 'Multzoa',
    round_of_16: 'Final-32ak',
    round_of_8: 'Final-16ak',
    quarter_final: 'Final-laurdenak',
    semi_final: 'Final-erdiak',
    third_place: 'Hirugarren postua',
    final: 'Finala',
  },
  nav: {
    admin: 'Admin',
    analytics: 'Analitika',
    faq: 'FAQ',
    groups: 'Tribuak',
    home: 'Hasiera',
    leetchi: 'Lagundu antolatzaileei',
    legal: 'Pribatutasuna',
    matches: 'Iragarpenak',
    ranking: 'Sailkapena',
    rules: 'Arauak',
  },
  notFound: {
    action: 'Itzuli hasierara',
    description: 'Orri hau ez da existitzen edo lekuz aldatu da.',
    title: 'Orria ez da aurkitu',
  },
  onboarding: {
    finish: 'Amaitu',
    joinGroup: '🏕️ Sartu tribu batean',
    next: 'Hurrengoa',
    previous: 'Aurrekoa',
    startBetting: '⚽ Hasi iragartzen',
    steps: [
      {
        title: 'Iragarri partida bakoitza',
        subtitle: '“Entzun argi, kide!”',
        body: 'Partida bakoitza hasi aurretik, sartu zure iragarpena: bi taldeen score zehatza. Zure hautaketa automatikoki gordetzen da. Nahi adina aldiz alda dezakezu partida hasi arte.',
        tipLabel: 'Samen aholkua',
        tip: 'Ez daukazu astirik dena iragartzeko? IAk zure ordez egin dezake: bilatu botoi morea iragarpenen orriaren goialdean.',
      },
      {
        title: 'Lortu eta biderkatu zure puntuak',
        subtitle: '“Izan azkarra, adiskide!”',
        body: 'Score perfektua, irabazle zuzena, berdinketa zuzena, marjina gertua: 20 oinarri-puntu arte lortu ditzakezu. Ondoren, jendearen aurkako kuota batek zure puntuazioa biderkatzen du: zure iragarpena zenbat eta ezustekoagoa izan, orduan eta handiagoa izango da irabazi potentziala.',
        tipLabel: 'Ivanen aholkua',
        tip: 'Begiratu partida bakoitzaren azpiko joera-barra: beste jokalariak nora doazen eta dagokion kuota erakusten du.',
      },
      {
        title: 'Sartu zure tribuan, egin erronka lagunei',
        subtitle: '“Ikus dezagun nork agintzen duen taulan!”',
        body: 'Sortu tribu bat edo sartu kide baten kodearekin. Zure taldearen sailkapena zuzenean jarraituko duzu, partidaz partida. Irabaz dezala onenak.',
        tipLabel: 'Pierren aholkua',
        tip: 'Joan Tribuak fitxara zeurea sortzeko edo zure taldeko buruak partekatutako kode batekin sartzeko.',
      },
    ],
  },
  prompts: {
    addToHomeScreen: 'Gehitu hasierako pantailan',
    closeLater: 'Geroago',
    installIos: 'Sakatu Partekatu, eta gero “Gehitu Hasierako Pantailan”',
    installText: 'Sarbide azkarragoa izateko, baita konexiorik gabe ere!',
    installTitle: 'Instalatu aplikazioa',
    notificationButton: 'Bai, gorde nire iragarpena',
    notificationDismiss: 'Ulertuta',
    notificationIosText:
      'iPhonetan: lehenik gehitu aplikazioa hasierako pantailan, eta gero aktibatu abisuak zure profiletik.',
    notificationTitle: 'Pierrek ahaztutako iragarpenetatik salbatzen zaitu',
    notificationText:
      'Abisua partida hasi baino 5 minutu lehenago zure sarea hutsik badago. Spam-ik gabe.',
    updateButton: 'Berritu orain',
    updateLoading: 'Berritzen...',
    updateText:
      'Bertsio berri bat eskuragarri dago. Kargatu berriro aplikazioa iragartzen jarraitzeko.',
    updateTitle: 'Ezinbesteko eguneratzea',
  },
  profile: {
    activateAlerts: 'Aktibatu partiden abisuak',
    alertsEnabled: 'Partiden abisuak aktibatuta',
    avatarChange: 'Aldatu profileko argazkia',
    avatarUploading: 'Argazkia konprimitzen eta igotzen…',
    disableAlerts: 'Desaktibatu abisuak',
    enableAgainText:
      'Aplikazioko abisuak desaktibatu zenituen. Hemen berriro aktiba ditzakezu.',
    enableText: 'Oraindik ez dituzu jakinarazpenak baimendu gailu honetan.',
    fileFormatError: 'Onartzen ez den fitxategi formatua',
    imageTooHeavy: 'Irudia oso astuna da (gehienez 15 MB)',
    loading: 'Kargatzen…',
    localhostNotice:
      'Push jakinarazpenak ez daude eskuragarri localhost-en. Webgunean funtzionatzen dute zabaldu ondoren.',
    nameUpdateError: 'Errorea izena eguneratzean',
    nameUpdated: 'Izena eguneratuta',
    newPassword: 'Pasahitz berria',
    notificationsDenied:
      'Nabigatzaileak jakinarazpenak ukatu ditu. Ireki gunearen ezarpenak jakinarazpenak baimentzeko, eta itzuli hona.',
    notificationsDisabledToast: 'Gune honetarako jakinarazpenak desaktibatuta',
    notificationsEnableError: 'Ezin izan dira jakinarazpenak aktibatu',
    notificationsSavedToast: 'Lehentasunak gorde dira',
    notificationsText:
      'Abisuek partida hasiera ez galtzen laguntzen dizute zure iragarpena hutsik dagoenean (~5 min partida baino lehen).',
    notificationsTitle: 'Jakinarazpenak',
    notificationsUnsupported:
      'Jakinarazpenak ez daude eskuragarri nabigatzaile edo gailu honetan. iPhonetan, instalatu aplikazioa hasierako pantailan eta saiatu berriro.',
    photoUpdateError: 'Errorea argazkia eguneratzean',
    photoUpdated: 'Argazkia eguneratuta',
    pushError:
      'Jakinarazpen zerbitzuak ez du garaiz erantzun edo errore bat gertatu da. Egiaztatu konexioa edo saiatu berriro une bat barru.',
    reactivateAlerts: 'Aktibatu berriro partiden abisuak',
    rename: 'Aldatu izena',
    signOut: 'Itxi saioa',
    updatePassword: 'Eguneratu',
    updatePasswordDescription:
      'Gehitu edo ordezkatu zure posta helbidearekin erabiltzen duzun pasahitza.',
    updatePasswordSubmitting: 'Eguneratzen…',
    passwordUpdated: 'Pasahitza eguneratuta',
    passwordTitle: 'Pasahitza',
    passwordMinError: 'Pasahitzak gutxienez 8 karaktere izan behar ditu.',
    passwordMismatchError: 'Bi pasahitzak ez datoz bat.',
    passwordUpdateFallback: 'Ezin izan da pasahitza eguneratu.',
    confirmPassword: 'Berretsi pasahitza',
  },
  ranking: {
    createOrJoinGroup: 'sortu edo sartu tribu batean',
    general: 'Orokorra',
    introPrefix: 'Sailkapena ikusteko, lehenik urrats hau egin behar duzu:',
    introSuffix: '.',
    noFinalWinner: 'Ez da irabazlerik hautatu',
    officialWinnerPrefix: 'Irabazle ofiziala:',
    eliminatedPrefix: 'Kanporatua:',
    secretWinner: 'Irabazlea isilpean dago oraindik',
    mysteryWinner: 'Irabazle misteriotsua',
    ownRankSuffix: '/',
    ownRankFirstSuffix: '.',
    ownRankOtherSuffix: '.',
    playerPlural: 'jokalari',
  },
  rules: {
    additionalTitle: 'Arau osagarriak',
    algorithmLink: 'Arau zehatzak eta algoritmoa →',
    distributionNote:
      'Banaketa hau zuzenean partiden kuotetan integratuta dago. Eskuragarri dauden puntuak baloratu ditzakezu kuotari begiratuta.',
    distributionTable: {
      header: ['Fasea', 'Partidak', 'Biderk.', '% guztira'],
      rows: [
        ['Multzoak', '48', '×0.75', '35%'],
        ['Final-32ak', '16', '×1', '12%'],
        ['Final-16ak', '8', '×1.5', '12%'],
        ['Final-laurdenak', '4', '×3', '9%'],
        ['Final-erdiak', '2', '×6', '7%'],
        ['Hirugarren postua', '1', '×8', '5%'],
        ['Finala', '1', '×12', '7%'],
        ['Irabazlea', '—', '—', '10%'],
      ],
    },
    distributionText:
      'Puntuak modu orekatuan banatzen dira, azken unera arte itzulerak (comebacks) posible izan daitezen!',
    distributionTitle: 'Puntuen banaketa',
    feesText:
      'Izena ematea doakoa eta berehalakoa da. Hala ere, tribuak saria (bote bat) jartzera animatzen dira, irabazleak saritzeko eta jokoari emozio apur bat gehitzeko.',
    feesTitle: 'Sarrera-sariak',
    finalWinnerDefault:
      'Jokalari bakoitzak azken irabazlea iragartzen du txapelketa hasi aurretik. Iragarpena zuzena bada, lotutako kuota gehitzen zaio puntu guztien kopuruari.',
    finalWinnerPrefix: 'Jokalari bakoitzak honako honen txapelduna iragartzen du:',
    finalWinnerSuffix:
      'txapelketa hasi aurretik. Iragarpena zuzena bada, lotutako kuota gehitzen zaio puntu guztien kopuruari.',
    finalWinnerTitle: 'Azken irabazlea',
    groupExampleTitle: 'Adibideak: Frantzia 3-0 Mexiko',
    groupExamplesTable: {
      header: [
        'Hautaketa',
        'Emaitza',
        'Irabazlea',
        'Hurbiltasuna',
        'Aldea',
        'Bonusa',
        'Guztira',
      ],
      rows: [
        ['3-0', '2', '8', '3', '3', '4', '20'],
        ['4-0', '2', '8', '2 (aldea 1)', '0 (marjina 4≠3)', '0', '12'],
        ['4-1', '2', '8', '1 (aldea 2)', '3 (marjina 3=3)', '0', '14'],
        ['2-1', '2', '8', '1 (aldea 2)', '0 (marjina 1≠3)', '0', '11'],
        ['0-2', '0 (emaitza okerra)', '—', '—', '—', '—', '0'],
      ],
    },
    groupIntro:
      'Partida bakoitzeko, 20 puntu arte lortu ditzakezu, 5 irizpide independentetan banatuta. Emaitza (1/X/2) okerra bada, 0 puntu lortuko dituzu.',
    groupTable: {
      header: ['Irizpidea', 'Deskribapena', 'Puntuak'],
      rows: [
        ['Emaitza zuzena', 'Irabazle / berdinketa / galdu zuzena', '2'],
        ['Irabazle zuzena', 'Talde irabazle zuzena (berdinketak kanpo)', '8'],
        ['Score hurbiltasuna', '3 − golen aldea guztira (min 0)', '0–3'],
        ['Golen diferentzia', 'Marjina irabazle edo berdinketa zuzena', '3'],
        ['Score zehatzaren bonusa', '%100 score zehatza', '4'],
      ],
    },
    groupTitle: 'Arauak multzoen fasean',
    playoffDrawText:
      'Kanporaketa partidetan, 90 minuturen ostean berdinketak posible dira (luzapena / penaltiak). Berdinketa iragartzeak Emaitza zuzena + Hurbiltasuna + Aldea + Bonus puntuak ematen dizkizu zehatza bada, baina ez Irabazlearen bonusa.',
    playoffExampleTitle: 'Adibideak: Brasil 2-1 Alemania',
    playoffExamplesTable: {
      header: [
        'Hautaketa',
        'Emaitza',
        'Irabazlea',
        'Hurbiltasuna',
        'Aldea',
        'Bonusa',
        'Guztira',
      ],
      rows: [
        ['2-1', '2', '8', '3', '3', '4', '20'],
        ['3-1', '2', '8', '2 (aldea 1)', '0 (marjina 2≠1)', '0', '12'],
        ['3-2', '2', '8', '1 (aldea 2)', '3 (marjina 1=1)', '0', '14'],
        ['3-0', '2', '8', '1 (aldea 2)', '0 (marjina 3≠1)', '0', '11'],
        ['1-1', '0 (emaitza okerra)', '—', '—', '—', '—', '0'],
      ],
    },
    playoffIntro:
      'Logika multzoen fasearen bera da: 20 puntu arte partida bakoitzeko, 5 irizpide berberak erabiliz. Arauzko denboraren amaierako scorea iragartzen duzu (90弹性 minutu).',
    playoffTitle: 'Arauak kanporaketa fasean',
    qualificationText:
      'Ez dago kanporaketarik: denek iragartzen dute partida bakoitza. Parte-hartzaile bakoitzak bere puntuak mantentzen ditu txapelketa osoan zehar.',
    qualificationTitle: 'Sailkapen modua',
    subscriptionTitle: 'Sarrera-sariak eta sailkapen modua',
    subtitle: 'Sam, Ivan eta Pierrek nola iragarri azaltzen dute',
    title: 'Jokoaren arauak',
    validationDeadlineIntro:
      'Partida bakoitzaren iragarpenak webgunean bete behar dira partida hasi aurretik.',
    validationLateText:
      'partida batean edo azken irabazlean, jokalariak 0 puntu jasoko ditu baina ez da kanporatua izango eta gainerako partidetan parte hartu ahal izango du.',
    validationLateTitle: 'Berandu iritsiz gero edo erantzunik ez badago',
    validationTitle: 'Iragarpena balioztatzeko data',
    validationWinnerDeadline:
      'Azken irabazlearen iragarpenak txapelketako lehen partida baino lehen egin behar dira, 2025eko ekainaren 14an, larunbata, 21:00etan.',
  },
  scoring: {
    adminHintPrefix: 'Partida bat erakutsi edo ezkutatu dezakezu hemendik:',
    adminHintSuffix: ', norgehiagoka bakoitzerako.',
    algorithmLink: 'arau zehatzak eta algoritmoa',
    algorithmIntro: 'Puntuazioaren xehetasun osoa eta formula ofiziala',
    adminLabel: 'Admin.',
    basePoints: 'Oinarri-puntuak',
    baseTotal: 'Oinarri guztira',
    calculation: 'Azken kalkulua',
    finalScore: 'Azken emaitza',
    finalWinner: 'Azken irabazlea',
    goodWinner: 'Irabazle eraginkorra',
    goalDifference: 'Golen diferentzia',
    intro: '“Ivanek azaltzen du: izan zehatza, baina izan azkarra ere bai!”',
    noBet: 'Ez dago iragarpenik partida honetarako.',
    pendingScore: 'Partidaren emaitza oraindik ez da argitaratu.',
    phaseMultiplier: 'Fasearen biderkatzailea',
    prediction: 'Iragarpena',
    precisionText:
      'Partida bakoitzean, hogei oinarri-puntu inguru lortu ditzakezu zure iragarpena errealitatetik gertu badago: irabazle edo berdinketa zuzena, score gertua, eta bonus txikiak oso gertu edo zehazki asmatzen duzunean.',
    precisionTitle: 'Zehaztasuna.',
    resultCorrect: 'Emaitza zuzena (1 / X / 2)',
    scoreExactBonus: 'Score zehatzaren bonusa',
    scoreProximity: 'Score hurbiltasuna',
    title: 'Nola kalkulatzen dira puntuak?',
    tooltip: 'Fasearen biderkatzailea:',
    multiplierText:
      'Ondoren, puntu hauek jendearen aurkako kuota baten bidez handitzen dira: zure hautaketa jokalarien artean oso ezaguna bada, kuota apala izango da; jatorrizko aldean bazaude, oso gora igo daiteke, orekatua mantenduz.',
    multiplierTitle: 'Biderkatzaile dinamikoa.',
    winningOdds: 'Kuota irabazlea (ospea)',
    winnerIfDraw: 'irabazlea berdinketa bada',
  },
  user: {
    back: 'Atzera',
    detailPrefix: 'Puntuen xehetasunak jokalari honentzat:',
    detailSuffix: '',
    finalWinnerCorrectPrefix: 'Jokalari honek',
    finalWinnerCorrectSuffix: 'puntu irabazi ditu',
    finalWinnerEliminated: 'Beren azken irabazlea kanporatua dago: 0 puntu',
    finalWinnerEliminatedSuffix: 'kanporatua dago.',
    finalWinnerHidden:
      'Beren hautaketa ezkutuan geratzen da talde honek bizirik jarraitzen duen bitartean.',
    finalWinnerLost: 'Beren azken irabazleak ez du irabazi: 0 puntu',
    finalWinnerNoBonus: 'Ezin da bonusik gehitu sailkapenerara.',
    finalWinnerNone: 'Ez da azken irabazlerik hautatu.',
    finalWinnerPotential:
      'Jokalari honek oraindik puntuak irabazi ditzake azken irabazlearen bidez',
    finalWinnerStillAliveSuffix: 'bizirik dago oraindik.',
    finalWinnerWonSuffix: 'txapelketa irabazi du.',
    matchMissing: 'Partida ez da aurkitu edo oraindik ez da amaitu.',
    noFinishedMatch: 'Oraindik ez dago amaitutako partidarik.',
    predictionSoon: 'Iragarpenak laster egongo dira eskuragarri!',
  },
  toasts: {
    betSaved: 'Iragarpena gordeta',
    betSaveError: 'Errorea iragarpena gordetzean',
    batchBetsSaveError: 'Errorea iragarpenak gordetzean',
    finalWinnerSaved: 'Taldea eguneratuta',
    finalWinnerSaveError: 'Ezin izan da eguneratu :(',
    groupAlreadyMemberPrefix: 'Dagoeneko tribu honetako kide zara:',
    groupCreateError: 'Errorea taldea sortzean',
    groupCreatedCodeConnector: 'kode honekin:',
    groupCreatedPrefix: 'Taldea',
    groupCreatedSuffix: 'sortuta',
    groupJoinError: 'Errorea izena ematean',
    groupJoinSuccessPrefix: 'Tribuan sartuta:',
    groupNotFoundPrefix: 'Ez dago tributik kode honekin:',
    groupNotFoundSuffix: '',
    groupPlayerValidated: 'Jokalaria onartua',
    groupRenameError: 'Errorea tribuaren izena aldatzean',
    groupRenamed: 'Tribuaren izena aldatuta',
  },
}

const brTranslations: TranslationDictionary = {
  aiBet: {
    back: "← War-gil",
    chooseProvider: "Dibab va spered artifisiel",
    chooseProviderTitle: "Dibabit ho spered artifisiel",
    chooseProviderSubtitle: "Pep spered artifisiel en deus e weledigezh dezhañ eus ar vell-droad",
    countSuffixPlural: "krogad da ragwelañ",
    countSuffixSingular: "krogad da ragwelañ",
    customsButton: "Paeañ (50 €)",
    customsText: "Paeit 50 € a goustmoù da gentañ mar plij !",
    customsTitle: "Koustmoù maltouterezh",
    errorTitle: "Hopala !",
    loadingSubtitle: "Un nebeud segondennoù a c'haller mont ganti",
    loadingText: "O tielfennañ ar skipailhoù hag o fardañ ar raggweloù",
    loadingTitle: "O prederiañ emañ ar spered artifisiel...",
    noValidPrediction: "N'en deus ket ar spered artifisiel daskoret ur raggwel reizh",
    overwriteExisting: "Flastrañ va raggweloù m'em eus anezho dija",
    promptPlaceholder: "Skouer : Evidon-me e vo trec'h Bro-C'hall...",
    promptSubtitle: "Skrivit ho tibaboù ha leugnet e vo ho parioù gant ar spered artifisiel",
    promptSuggestions: [
      "Mbappe a vo krog en traoù er bloaz-mañ",
      "Palioù ha dudi hepken !",
      "N'ouzon netra war ar vell-droad, souezhit ac'hanon",
      "Ar skipailhoù bihan a greyo souezhadennoù",
      "Ar bloaz-mañ a vo hini Haiti, evel-just !",
    ],
    promptTitle: "Lezel ar spered artifisiel da ragwelañ",
    rejectedButton: "Kemmañ ar spered artifisiel",
    rejectedTextPrefix: "Erespont fall",
    rejectedTextSuffix: "Difennet eo deoc'h mont e Sina bremañ.",
    rejectedTitle: "Argasidigezh diouzh an tiriad",
    securityNo: "Ket",
    securityQuestion:
      "Ha soñjal a ra deoc'h ez eo proviñs emsavet Taiwan ul lodenn glok eus Republik Pobl Sina veur ha glorius ?",
    securityTitle: "Gwiriañ ar surentez 🇨🇳",
    securityYes: "Ya, evel-just !",
    successFilledByAi: "leugnet gant ar spered artifisiel !",
    unknownError: "Ur fazi zo bet",
  },
  algorithm: {
    backToRules: "← Reolennoù ar c'hoari",
    boundsText:
      "Limitet eo ar feur goude etre ×1 ha ×10. Keit ha ma n'eus nemet ur raggwel reizh war ar c'hrogad, e chom ar feur da ×1, hep efed enep-engroez ebet pa n'eus engroez ebet.",
    criterionHeader: "Dezverk",
    description:
      "Pep tra war ar poentoù diazez, brud ar raggweloù, ha skouerioù jedet.",
    exactValuesText:
      "Ar glad resis a lusk diouzh an niver a c'hoarierien hag an dasparzh gwirion. Diskouez a ra an arload ur feur istimet hag ur gounid gallus tra ma skrivit ho tisoc'h.",
    exampleHoldUpText:
      "An hevelep diazez, met hoc'h-unan emaoc'h en ho tiegezh preskañ : izel-tre eo p, setu ma pign ar feur. Gallout a rit mont dreist da 150 poent war ur c'hrogad hepken : an hold-up eo.",
    exampleMassText:
      "Imachinit oc'h tost peurvat war ur c'hrogad, tro-dro da 18 poent diazez. Ma vije bet c'hoariet an hevelep tiegezh gant an holl, emañ p tost da 1 : kouezañ a ra ar feur d'al leur ha gallout a rit echuiñ gant tro-dro da 25 poent war ar c'hrogad-se : par an engroez (crowd bet) eo.",
    examplesTitle: "3. Skouerioù ekstrêm (skeul vras)",
    faqLink: "FAQ",
    faqPrefix: "Goulennoù berr : sellit ivez ouzh ar",
    faqSuffix: ".",
    finalFormulaText:
      "Poentoù dibenn = poentoù diazez rontaet × feur × biderker ar prantad.",
    formulaIntro:
      "Lakomp p da vezañ kenfeur ar raggweloù reizh war ar c'hrogad-mañ hag a gouezh en hevelep tiegezh gant hoc'h hini. Da skouer, 30% eus ar c'hoarierien o deus dibabet skipailh A da gounit. Ar feur lakaet war ho poentoù diazez zo :",
    formulaLabel: "Feur = exp(−p^(1/2) × 2) × 10",
    groupFamilyLabel: "Prantad ar strolladoù",
    groupFamilyText: "tri tiegezh : skipailh A trec'h, rampo, skipailh B trec'h.",
    knockoutFamilyLabel: "Prantad an dilesel",
    knockoutFamilyText:
      "daou diegezh : er fin, pe e c'hounez A pe e c'hounez B, gant an astenn-pennad pe ar tenn-bennad e-barzh. Ma raggwelit ur c'hrogad rampo goude 90 munutenn, ho tibab evit an trec'hour a zivizo ho tiegezh.",
    maxTheoretical:
      "Uc'hfeur teoretikel war an dezverkoù-mañ : 20 poent a-raok ar biderker.",
    pointsHeader: "Puntuak",
    popularityIntro: "Sellout a reomp ouzh penaos eo dasparzhet ar c'hoarierien war ar c'hrogad :",
    popularityTitle: "2. Brud ar raggweloù",
    precisionRows: [
      {
        criterion: "Disoc'h reizh (1 / X / 2 goude 90 munutenn)",
        points: "2",
      },
      {
        criterion: "Trec'hour reizh ar c'hrogad (reolenn strollad vs dilesel)",
        points: "8",
      },
      {
        criterion: "Tostded ar skore : max(3 − diforc'h palioù hollek, 0)",
        points: "0 da 3",
      },
      {
        criterion:
          "Diforc'h palioù : max(3 − |marjenn wirion − marjenn ragwelet|, 0)",
        points: "0 da 3",
      },
      {
        criterion: "Bonus ar skore resis goude 90 munutenn",
        points: "4",
      },
    ],
    precisionText:
      "Goulenn a ra an Disoc'h ha Bonus ar skore resis an disoc'h reizh goude 90 munutenn (1 / X / 2). Tostded ar skore ha Diforc'h ar palioù a vez roet ma 'z eo reizh disoc'h an 90 munutenn pe ma 'z eo ragwelet an trec'hour reizh er c'hrogadoù dilesel. Dizalc'h e vez poentoù an trec'hour diouzh disoc'h an 90 munutenn er c'hrogadoù dilesel atav.",
    precisionTitle: "1. Poentoù resisded (dre grogad)",
    title: "Reolennoù resis hag algoritm",
  },
  auth: {
    accountCreatedPrefix: "Ur gont zo bet krouet evit",
    accountCreatedSuffix:
      "Klikit war al liamm resevet dre bostel evit kefluniañ ho tremenair.",
    backToLogin: "Distreiñ d'an emgofeañ",
    checkEmailFallback: "Teuz em bez o wiriañ ar chomlec'h postel.",
    checking: "O wiriañ…",
    continue: "Kenderc'hel",
    continueWithGoogle: "Kenderc'hel gant Google",
    createAccount: "Krouiñ ur gont",
    creating: "O krouiñ…",
    descriptionDefault:
      "Emgofeit evit ragwelañ ar c'hrogadoù ha berañ ho mignoned.",
    descriptionPrefix: "Emgofeit evit ragwelañ krogadoù evit",
    displayName: "Anv tiskouezet",
    displayNameMaxError: "Gant 20 arouezenn d'ar muiañ e rank an anv bezañ.",
    displayNameMinError: "Da nebeutañ 2 arouezenn a rank bezañ en anv.",
    displayNamePlaceholder: "Ho lesanv",
    displayNameRange: "Etre 2 hag 20 arouezenn.",
    emailInvalid: "Skrivit ur chomlec'h postel reizh.",
    forgotPassword: "Tremeneir ankouezaet",
    forgotPasswordSending: "O kas…",
    loginErrorFallback: "Postel pe tremeneir fall.",
    openInSafari:
      "To continue with Google, open this page in Safari: tap the “…” menu at the top right, then “Open in Safari”.",
    or: "pe",
    password: "Tremeneir",
    passwordResetSentPrefix: "Ur postel dresetal zo bet kaset da",
    passwordResetSentSuffix: ".",
    refreshPage: "Adkargañ ar bajenn",
    resetEmailFallback: "N'haller ket kas ar postel dresetal.",
    signIn: "Emgofeañ",
    signingIn: "Oc'h emgofeañ…",
    title: "Degemer mat !",
  },
  betting: {
    distributionTitle: "Piv en deus ragwelet petra ?",
    gainMax: "gounid muiañ",
    odds: "Feurioù",
    showTrend: "Diskouez lusk ar raggweloù",
    thermoBalanced: "Dibab kempouezet : ket re asur, ket re foll.",
    thermoCold: "N'eus ket trawalc'h a raggweloù c'hoazh : d穩定aat a raio al lusk dizale.",
    thermoRisky: "Dibab hardizh : gallout a ra ar gounid gallus pignat uhel.",
    thermoSafe: "Dibab diogel : gounid gallus muioc'h sioul.",
    titlePotentialGain: "Gounid gallus istimet : betek",
  },
  faq: {
    createTribeAnswer:
      "Digorit an ivinell Meuriadoù diwar al lañser. E lodenn Krouiñ ur meuriad, dibabit anv ar meuriad. Ur c'hod rannañ a vo krouet ; kasit anezhañ d'an dud a fell deoc'h kaout en ho meuriad.",
    createTribePunchline: "Saviz anezhañ evel ur loc'h vat !",
    createTribeQuestion: "Penaos krouiñ va meuriad ?",
    dataAnswerBold: "Roadenn ebet a vo adimplijet evit pal all ebet.",
    dataAnswerIntro:
      "Dastumet e vez ar roadennoù personel evit pal ar c'hoari hepken.",
    dataPunchline: "Chom a ra ho roadennoù war ho tiriad !",
    dataQuestion: "Petra a rit gant va roadennoù ?",
    freeAnswer:
      "Ya, digoust eo koumanantiñ. Koulskoude, lakaet e vez ar meuriadoù da sevel ur vouist-votiñ evit garedoniñ ar gounidegien ha lakaat un tamm goust.",
    freePunchline: "Digoust evel ar frankiz, mignon !",
    freeQuestion: "Ha digoust eo ?",
    joinTribeAnswer:
      "Digorit an ivinell Meuriadoù diwar al lañser, ha goude-se skrivit ar c'hod rannet gant ho rener skipailh e lodenn Mont e-barzh ur meuriad. Asantet e vo ho koulenn ha gallout a reot kregiñ da ragwelañ.",
    joinTribePunchline: "Ar c'hod eo alc'hwez al loc'h !",
    joinTribeQuestion: "Penaos mont e-barzh ur meuriad ?",
    multipleTribesAnswer:
      "Ya, gallout a rit bezañ e kement a veuriadoù ha ma fell deoc'h. Koulskoude, ne c'hallit lakaat nemet ur skore dre grogad, hag an hevelep hini e vo en holl ho meuriadoù.",
    multipleTribesPunchline: "Ur par, meur a veuriad, kamalad !",
    multipleTribesQuestion: "Hag-eñ e c'hallan bezañ e meur a veuriad ?",
    participateAnswer:
      "Goude bezañ emgofeet, e rankit mont e-barzh ur meuriad da gentañ pe krouiñ hoc'h hini. Pa vo graet kement-se, e c'hallot ragwelañ ho trec'hour dibenn hag ho krogadoù kentañ.",
    participatePunchline: "Kavit ho meuriad ha plantit ho flasenn !",
    participateQuestion: "Penaos kemer perzh ?",
    problemAnswer:
      "Gallout a rit kas ho koulenn da pierre@le-bihan.eu. Respont a rafomp d'an abretañ ar gellañ.",
    problemPunchline: "Kasit ur sevel-moged da Pierre !",
    problemQuestion: "Ur gudenn am eus n'emañ ket er roll-mañ",
    scoringAlgorithmPrefix: "Taolenn glok, formulenn, ha skouerioù :",
    scoringAnswerMultiplier:
      "Goude-se, ur biderker dinamikel a gresk ar poentoù-se : ma 'z eus bet dibabet an hevelep lusk gant an holl, e chom sioul ar gounid ; ma 'z oc'h en ur vinorelezh raggweloù, e c'hall ar biderker pignat uhel. Ar pal eo garedoniñ an dibaboù orinel hep terriñ kempouez ar c'hoari.",
    scoringAnswerPrecision:
      "Da gentañ, ar resisded : tostoc'h eo ho raggwel d'ar c'hrogad gwir (trec'hour pe rampo reizh, skore tost, bonus bihan ma 'z oc'h resis pe tost-tre), muioc'h a boentoù diazez a dastumit, betek tro-dro d'ugent poent dre grogad.",
    scoringLinkLabel: "reolennoù resis hag algoritm",
    scoringPunchline: "Bezit resis, bezit speredek, bezit orinel !",
    scoringQuestion: "Penaos e vez jedet ar poentoù ?",
    subtitle: "Sam, Ivan ha Pierre a respont d'ho koulennoù",
    title: "Goulennoù davedek",
    tribeAnswer:
      "Ur meuriad zo ur strollad mignoned, anaoudegezhioù, pe tud eus ar familh ho peus dibabet evit c'hoari ganto. Pep hini ac'hanoc'h a c'hall krouiñ e veuriad dezhañ ma fell dezhañ.",
    tribePunchline: "Ho pakad, ho loc'h, ho klan !",
    tribeQuestion: "Petra eo ur meuriad ?",
    whatIsItCompetitionPrefix: "Ul lec'hienn e lec'h ma c'hallit c'hoari gant raggweloù evit",
    whatIsItCompetitionSuffix:
      "gant mignoned pe familh. Gant pep raggwel reizh, e verkit poentoù hag a dastum gant an amzer ha termenañ ho renk en ho meuriad.",
    whatIsItDefault:
      "Ul lec'hienn e lec'h ma c'hallit c'hoari raggweloù sport gant mignoned pe familh. Gant pep raggwel reizh, e verkit poentoù hag a dastum gant an amzer ha termenañ ho renk en ho meuriad.",
    whatIsItPunchline: "Degemer mat d'an arvest, keneil !",
    whatIsItQuestion: "Petra eo se ?",
  },
  authPassword: {
    invalidDescription: "Goulennit ur postel tremeneir nevez evit kenderc'hel.",
    invalidTitle: "Liamm fall pe n'eo ket mui reizh",
    savePassword: "Enrollañ an tremeneir",
    savingPassword: "Oc'h enrollañ…",
    setupDescription:
      "Dibabit an tremeneir a vo implijet ganeoc'h evit ho heul emgofeañ.",
    setupSuccess: "Tremeneir kefluniet",
    setupTitle: "Esaat ho tremeneir",
    resetDescription: "Termenit un tremeneir nevez evit adkavout ho kont.",
    resetSuccess: "Tremeneir dresetet",
    resetTitle: "Tremeneir nevez",
  },
  common: {
    anonymous: "Dianv",
    cancel: "Nullañ",
    close: "Serriñ",
    connection: "Emgofeañ",
    memberPlural: "ezel",
    memberSingular: "ezel",
    mystery: "Kevrin",
    noWinner: "Hini ebet",
    points: "poent",
    pointsShort: "pt",
    profile: "Profil",
    retry: "Saiat en-dro",
    save: "Enrollañ",
    signOut: "Digofeañ",
    tbd: "Da vezañ divizet",
  },
  finalWinner: {
    chooseTitle: "Dibab an trec'hour",
    closingPrefix: "Ar raggweloù evit an trec'hour a serr d'ar",
    closingDateFormat: "d MMMM yyyy da HH:mm",
    finalWinnerQuestion: "Piv a vo an trec'hour dibenn ?",
    loading: "O kargañ an trec'hour dibenn...",
    lockedBetFor: "Ho tisoc'h dibabet :",
    noTeamFound: "Skipailh ebet aurket",
    odd: "Feur",
    searchPlaceholder: "Klask...",
    selectTeam: "Dibab ur skipailh",
    winnerQuestionPrefix: "Piv a gounezo",
    winnerTitle: "Ho trec'hour dibenn",
  },
  groups: {
    accessCode: "Cod mont e-barzh",
    adminBadge: "Merour",
    awaitingBadge: "O c'hortoz",
    codeCopied: "Cod kopiet !",
    copyInviteCode: "Kopiañ ar c'hod kenvitañ",
    createButton: "Krouiñ ur meuriad",
    createDescription: "Krouit ho meuriad ha kenvitit ho tud da zont e-barzh",
    createTitle: "Krouiñ ur meuriad",
    joinButton: "Kas ar goulenn",
    joinCodePlaceholder: "Skrivit ar c'hod...",
    joinDescription: "Skrivit ar c'hod rannet gant merour ar meuriad",
    joinTitle: "Mont e-barzh ur meuriad",
    memberBadge: "Ezel",
    myGroupsDescription: "Ar meuriadoù e lec'h ma 'z oc'h e-barzh",
    myGroupsTitle: "Va meuriadoù",
    nameMaxError: "20 arouezenn d'ar muiañ",
    nameMinError: "2 arouezenn da nebeutañ",
    nameLabel: "Anv ar meuriad",
    namePlaceholder: "Skouer : Ar re didouchadus",
    renameGroup: "Adenvel ar meuriad",
    subtitle: "Kudeit ho meuriadoù ha berañ ho tud",
    title: "Va meuriadoù",
  },
  home: {
    connectedLead:
      "Ragweliit disoc'hoù ar c'hrogadoù, merkit poentoù, ha berit ho mignoned hag ho familh en ho meuriad !",
    guestLead:
      "Ragweliit disoc'hoù ar c'hrogadoù, merkit poentoù, ha berit ho mignoned en ho meuriad !",
    legalLink: "Pribatidigezh ha divizoù",
    onboardingCta: "Deskiñ penaos c'hoari",
    onboardingSubtitle: "Sam, Ivan ha Pierre a zispleg deoc'h e 3 urzh",
    playOnboarding: "Kregiñ →",
    shortcutMatches: "Raggweloù",
    shortcutRanking: "Renk",
    shortcutRules: "Reolennoù",
    viewRules: "Gwelet ar reolennoù",
    winnerSoon: "Raggwel an trec'hour dibenn a vo prest dizale !",
  },
  language: {
    selectorLabel: "Kemmañ ar yezh",
  },
  matches: {
    aiButton: "Lezel ar spered artifisiel da ragwelañ !",
    empty: "Krogad ebet da ziskouez",
    finalWinnerAliveDescriptionPrefix: "a c'hall degas deoc'h c'hoazh",
    finalWinnerAliveDescriptionSuffix: "ma vont betek ar fin.",
    finalWinnerAliveTitle: "Bizirik emañ ho trec'hour c'hoazh",
    finalWinnerChange: "Kemmañ",
    finalWinnerChangeHint: "Klikit amañ evit kemmañ ho tibab.",
    finalWinnerChoose: "Dibab",
    finalWinnerMissingDescription:
      "N'ho peus ket saiet ar bonus bras c'hoazh. Dibabit ho kampion bremañ.",
    finalWinnerMissingTitle: "Mankout a ra ho trec'hour dibenn",
    finalWinnerOddPrefix: "Feur liammet :",
    finalWinnerOfficialDescriptionSuffix:
      "en deus gounezet ha kadarnaet eo ho bonus trec'hour dibenn.",
    finalWinnerOfficialTitle: "Gounezet en deus ho trec'hour",
    finalWinnerRecordedChoice: "gordetako hautaketa",
    finalWinnerSelectedPrefix: "Ho trec'hour :",
    finalWinnerWinnerBonus: "bonus an trec'hour dibenn",
    groupDetailsName: "Anv",
    launchText:
      "Ar raggweloù a vo prest dizale ! Betek neuze, e c'hallit krouiñ ho strollad ha kenvitañ ho mignoned !",
    launchTitle: "Dizale er c'hoari",
    myPointsDetail: "Xehetasunoù va foentoù",
    moreInfoPrefix: "Evit gwelet muioc'h a ditouroù,",
    moreInfoLink: "krouit pe it e-barzh ur meuriad",
    moreInfoSuffix: ".",
    playoffWinner: "Trec'hour (astenn / tennoù-pal)",
    playoffWinnerInDraw: "Ho trec'hour ma 'z eus rampo",
    scoreFinal: "Disoc'h dibenn",
    scoringHelp: "Penaos e vez jedet ar poentoù ?",
    tabFinished: "Echuet",
    tabLive: "War-eeun",
    tabUpcoming: "Da zont",
    unavailableText: "Ar raggweloù a vo prest dizale !",
    unavailableTitle: "Dizale er c'hoari",
  },
  matchPhases: {
    group: "Strollad",
    round_of_16: "Eizhvedennoù gourfenn",
    round_of_8: "Karterioù gourfenn",
    quarter_final: "Karterioù gourfenn",
    semi_final: "Hanter-gourfenn",
    third_place: "Trede plas",
    final: "Gourfenn",
  },
  nav: {
    admin: "Melestradurezh",
    analytics: "Poentoù jedet",
    faq: "FAQ",
    groups: "Meuriadoù",
    home: "Hasiera",
    leetchi: "Skoazellañ an aozerien",
    legal: "Pribatidigezh",
    matches: "Raggweloù",
    ranking: "Renk",
    rules: "Reolennoù",
  },
  notFound: {
    action: "Distreiñ d'ar gêr",
    description: "Ar bajenn-mañ n'eus ket anezhi pe diloc'het eo bet.",
    title: "Pajenn n'eo ket bet kavet",
  },
  onboarding: {
    finish: "Echuiñ",
    joinGroup: "🏕️ Mont e-barzh ur meuriad",
    next: "Hurrengoa",
    previous: "Aurrekoa",
    startBetting: "⚽ Kregiñ da ragwelañ",
    steps: [
      {
        title: "Ragwelañ pep krogad",
        subtitle: "“Selaouit mat, keneil !”",
        body: "A-raok pep lañs, skrivit ho raggwel : ar skore resis evit an daou skipailh. Enrollet e vez ho tisoc'h ent-automatikel. Gallout a rit kemmañ anezhañ kement ha ma fell deoc'h betek ma kregfe ar c'hrogad.",
        tipLabel: "Ali Sam",
        tip: "N'ho peus ket amzer da ragwelañ pep tra ? Ar spered artifisiel a c'hall ober evidoc'h : klaskit ar bouton mouk e laez pajenn ar krogadoù.",
      },
      {
        title: "Merkañ ha biderkañ ho poentoù",
        subtitle: "“Bezit speredek, adiskide !”",
        body: "Skore peurvat, trec'hour reizh, rampo reizh, marjenn tost : gallout a rit merkañ betek 20 poent diazez. Goude-se, ur feur enep-engroez a biderko ho poentoù : muioc'h e vo souezhus ho raggwel, muioc'h e pigno ar gounid gallus.",
        tipLabel: "Ali Ivan",
        tip: "Sellit ouzh ar varrenn-lusk dindan pep krogad : tiskouez a ra da belec'h ez a ar c'hoarierien all hag ar feur a ya ganti.",
      },
      {
        title: "Mont en ho meuriad, berañ ho mignoned",
        subtitle: "“Gwelet e vo piv a vo mestr war an daolenn !”",
        body: "Krouit ur meuriad pe it e-barzh unan gant ur c'hod. Heuliañ a reot renk ho strollad war-eeun, krogad goude krogad. Ra gounezo ar gwellañ c'hoarier.",
        tipLabel: "Ali Pierre",
        tip: "It d'an ivinell Meuriadoù evit krouiñ hoc'h hini pe mont e-barzh unan gant ur c'hod rannet gant ho rener meuriad.",
      },
    ],
  },
  prompts: {
    addToHomeScreen: "Gehitu d'ar skramm degemer",
    closeLater: "Geroago",
    installIos: "Pouezit war Partekatu, ha goude-se “Gehitu d'ar Skramm Degemer”",
    installText: "Evit mont buanoc'h, memes hep kenfeur internet !",
    installTitle: "Staliañ an arload",
    notificationButton: "Ya, enrollañ va raggwel",
    notificationDismiss: "Ulertuta",
    notificationIosText:
      "War iPhone : da gentañ ghezit an arload d'ho skramm degemer, ha goude-se gwitit an abisuioù diwar ho profil.",
    notificationTitle: "Pierre a savete ac'hanoc'h diouzh ar raggweloù ankouezaet",
    notificationText:
      "Un abis 5 munutenn a-raok al lañs ma 'z eo goullo ho raggwel. Spam ebet.",
    updateButton: "Adkargañ bremañ",
    updateLoading: "Oc'h adkargañ...",
    updateText:
      "Ur bertsio nevez a zo prest. Adkargit an arload evit kenderc'hel da ragwelañ.",
    updateTitle: "Eguneratzea ret",
  },
  profile: {
    activateAlerts: "Gwitit an abisuioù krogad",
    alertsEnabled: "Abisuioù krogad gwitit",
    avatarChange: "Kemmañ argazkia ar profil",
    avatarUploading: "O tihanadiñ hag o tanaat an argazkia…",
    disableAlerts: "Desgwitañ an abisuioù",
    enableAgainText:
      "Abisuioù an arload hoc'h eus lamet. Gallout a rit adgwitañ anezho amañ.",
    enableText: "N'ho peus ket aotreet an abisuioù war ar gailh-mañ c'hoazh.",
    fileFormatError: "Furmad fitxategi n'eo ket onartua",
    imageTooHeavy: "Argazkia re bonner (15 MB d'ar muiañ)",
    loading: "O kargañ…",
    localhostNotice:
      "N'eus ket tu kaout abisuioù push war localhost. Labourat a reont war al lec'hienn wirion goude al lañs.",
    nameUpdateError: "Fazi en ur hizivaat an anv",
    nameUpdated: "Anv hizivaet",
    newPassword: "Tremeneir nevez",
    notificationsDenied:
      "Ukaset eo bet an abisuioù gant ar merour merdeiñ. Digorit ezarpennoù al lec'hienn evit aotren an abisuioù, ha distroit amañ.",
    notificationsDisabledToast: "Abisuioù lamet evit al lec'hienn-mañ",
    notificationsEnableError: "N'haller ket gwitañ an abisuioù",
    notificationsSavedToast: "Lehentasunak enrollet",
    notificationsText:
      "An abisuioù a vir ouzhoc'h ankouez al lañs pa 'z eo goullo ho raggwel c'hoazh (~5 min a-raok ar c'hrogad).",
    notificationsTitle: "Abisuioù",
    notificationsUnsupported:
      "N'eus ket tu kaout abisuioù war ar merour pe ar gailh-mañ. War iPhone, staliit an arload war ar skramm degemer, ha saiat en-dro.",
    photoUpdateError: "Fazi en ur hizivaat an argazkia",
    photoUpdated: "Argazkia hizivaet",
    pushError:
      "Servij an abisuioù n'en deus ket respontet e koulz pe ur fazi a zo bet. Gwiriañ ho kenfeur pe saiat une barru.",
    reactivateAlerts: "Adgwitañ abisuioù ar c'hrogadoù",
    rename: "Adenvel",
    signOut: "Digofeañ",
    updatePassword: "Hizivaat",
    updatePasswordDescription:
      "Gehitu pe kemmañ an tremeneir implijet gant ho postel.",
    updatePasswordSubmitting: "Oc'h hizivaat…",
    passwordUpdated: "Tremeneir hizivaet",
    passwordTitle: "Tremeneir",
    passwordMinError: "Da nebeutañ 8 arouezenn a rank bezañ en tremeneir.",
    passwordMismatchError: "An daou dremeneir n'int ket memes tra.",
    passwordUpdateFallback: "Teuz em bez o hizivaat an tremeneir.",
    confirmPassword: "Berretsi an tremeneir",
  },
  ranking: {
    createOrJoinGroup: "krouiñ pe mont e-barzh ur meuriad",
    general: "Hollek",
    introPrefix: "Evit gwelet ar renk, e rankit da gentañ",
    introSuffix: ".",
    noFinalWinner: "Trec'hour ebet dibabet",
    officialWinnerPrefix: "Trec'hour ofisiel :",
    eliminatedPrefix: "Kanporatua :",
    secretWinner: "Trec'hour kuzh c'hoazh",
    mysteryWinner: "Trec'hour kevrinus",
    ownRankSuffix: "diwar",
    ownRankFirstSuffix: "añ",
    ownRankOtherSuffix: "vet",
    playerPlural: "c'hoarier",
  },
  rules: {
    additionalTitle: "Reolennoù ouzhpenn",
    algorithmLink: "Reolennoù resis hag algoritm →",
    distributionNote:
      "Ebarzhet eo an dasparzh-mañ war-eeun e feurioù ar c'hrogadoù. Istimañ a rit ar poentoù m'emañ tu kaout en ur sellout ouzh ar feur.",
    distributionTable: {
      header: ["Prantad", "Krogadoù", "Biderk.", "% hollek"],
      rows: [
        ["Strolladoù", "48", "×0.75", "35%"],
        ["Final-32ak", "16", "×1", "12%"],
        ["Final-16ak", "8", "×1.5", "12%"],
        ["Karterioù", "4", "×3", "9%"],
        ["Hanter-gourfenn", "2", "×6", "7%"],
        ["Trede plas", "1", "×8", "5%"],
        ["Gourfenn", "1", "×12", "7%"],
        ["Trec'hour", "—", "—", "10%"],
      ],
    },
    distributionText:
      "Dasparzhet eo ar poentoù en ur mod kempouezet evit ma vefe tu distreiñ (comebacks) betek ar fin !",
    distributionTitle: "Dasparzh ar poentoù",
    feesText:
      "Koumanantiñ a zo digoust ha herrek. Koulskoude, lakaet e vez ar meuriadoù da sevel ur vouist-votiñ evit garedoniñ ar gounidegien ha lakaat un tamm goust.",
    feesTitle: "Sarrera-sariak",
    finalWinnerDefault:
      "Pep c'hoarier a raggwel an trec'hour dibenn a-raok ma kregfe ar genstrivadeg. Ma 'z eo reizh ar raggwel, e vez gehitget ar feur liammet da hollad ar poentoù.",
    finalWinnerPrefix: "Pep c'hoarier a raggwel kampion",
    finalWinnerSuffix:
      "a-raok ma kregfe ar genstrivadeg. Ma 'z eo reizh ar raggwel, e vez gehitget ar feur liammet da hollad ar poentoù.",
    finalWinnerTitle: "Trec'hour dibenn",
    groupExampleTitle: "Skouerioù : Bro-C'hall 3-0 Mec'hiko",
    groupExamplesTable: {
      header: [
        "Dibab",
        "Disoc'h",
        "Trec'hour",
        "Tostded",
        "Aldea",
        "Bonus",
        "Guztira",
      ],
      rows: [
        ["3-0", "2", "8", "3", "3", "4", "20"],
        ["4-0", "2", "8", "2 (diforc'h 1)", "0 (marjenn 4≠3)", "0", "12"],
        ["4-1", "2", "8", "1 (diforc'h 2)", "3 (marjenn 3=3)", "0", "14"],
        ["2-1", "2", "8", "1 (diforc'h 2)", "0 (marjenn 1≠3)", "0", "11"],
        ["0-2", "0 (disoc'h fall)", "—", "—", "—", "—", "0"],
      ],
    },
    groupIntro:
      "Evit pep krogad, e c'hallit merkañ betek 20 poent dasparzhet war 5 dezverk dizalc'h. Ma 'z eo fall an disoc'h (1/X/2), e verkit 0 poent.",
    groupTable: {
      header: ["Dezverk", "Deskribapena", "Poentoù"],
      rows: [
        ["Disoc'h reizh", "Trec'h / rampo / coll reizh", "2"],
        ["Trec'hour reizh", "Skipailh trec'hour reizh (berdinketak kanpo)", "8"],
        ["Tostded skore", "3 − diforc'h palioù hollek (min 0)", "0–3"],
        ["Diforc'h palioù", "Marjenn trec'hour pe rampo reizh", "3"],
        ["Bonus skore resis", "%100 skore resis", "4"],
      ],
    },
    groupTitle: "Reolennoù e prantad ar strolladoù",
    playoffDrawText:
      "Er c'hrogadoù dilesel, ar berdinketadoù goude 90 munutenn a zo gallus (astenn / penaltiak). Raggwelañ ur c'hrogad rampo a ro deoc'h Disoc'h reizh + Tostded + Aldea + Bonus poentoù ma 'z eo resis, met ket Bonus an Trec'hour.",
    playoffExampleTitle: "Skouerioù : Brazil 2-1 Alamagn",
    playoffExamplesTable: {
      header: [
        "Dibab",
        "Disoc'h",
        "Trec'hour",
        "Tostded",
        "Aldea",
        "Bonus",
        "Guztira",
      ],
      rows: [
        ["2-1", "2", "8", "3", "3", "4", "20"],
        ["3-1", "2", "8", "2 (diforc'h 1)", "0 (marjenn 2≠1)", "0", "12"],
        ["3-2", "2", "8", "1 (diforc'h 2)", "3 (marjenn 1=1)", "0", "14"],
        ["3-0", "2", "8", "1 (diforc'h 2)", "0 (marjenn 3≠1)", "0", "11"],
        ["1-1", "0 (disoc'h fall)", "—", "—", "—", "—", "0"],
      ],
    },
    playoffIntro:
      "Heñvel eo al logika ouzh hini prantad ar strolladoù : betek 20 poent dre grogad gant ar memes 5 dezverk. Raggwelañ a rit ar skore e fin an amzer reoliek (90 munutenn).",
    playoffTitle: "Reolennoù e prantad an dilesel",
    qualificationText:
      "N'eus dilesel ebet : pep c'hoarier a raggwel pep krogad. Pep c'hoarier a vir e boentoù e-kerzh ar genstrivadeg a-bezh.",
    qualificationTitle: "Mod sailkapen",
    subscriptionTitle: "Sarrera-sariak ha mod sailkapen",
    subtitle: "Sam, Ivan ha Pierre a zispleg penaos ragwelañ",
    title: "Reolennoù ar c'hoari",
    validationDeadlineIntro:
      "Ar raggweloù evit pep krogad a rank bezañ skruvet war al lec'hienn a-raok al lañs.",
    validationLateText:
      "war ur c'hrogad pe war an trec'hour dibenn, e merko ar c'hoarier 0 poent met n'eo ket dileset ha gallout a raio c'hoazh kemer perzh er krogadoù all.",
    validationLateTitle: "Ma 'z oc'h berand pe ma n'eus respont ebet",
    validationTitle: "Deiziad baliozañ ar raggweloù",
    validationWinnerDeadline:
      "Raggweloù an trec'hour dibenn a rank bezañ graet a-raok krogad kentañ ar genstrivadeg, d'ar Sadorn 14 a viz Mezheven 2025 da 21:00.",
  },
  scoring: {
    adminHintPrefix: "Diskouez pe ezkutat a c'hallit ur c'hrogad diwar",
    adminHintSuffix: ", evit pep norgehiagoka.",
    algorithmLink: "reolennoù resis hag algoritm",
    algorithmIntro: "Xehetasunoù ar poentoù hag ar formulenn ofisiel",
    adminLabel: "Melestradurezh.",
    basePoints: "Poentoù diazez",
    baseTotal: "Diazez hollek",
    calculation: "Azken kalkulua",
    finalScore: "Disoc'h dibenn",
    finalWinner: "Trec'hour dibenn",
    goodWinner: "Trec'hour gwirion",
    goalDifference: "Diforc'h palioù",
    intro: "“Ivan a zispleg : bezit resis, met bezit speredek ivez !”",
    noBet: "Raggwel ebet evit ar c'hrogad-mañ.",
    pendingScore: "Disoc'h ar c'hrogad n'eo ket bet embannet c'hoazh.",
    phaseMultiplier: "Biderker ar prantad",
    prediction: "Raggwel",
    precisionText:
      "War pep krogad, e c'hallit merkañ tro-dro da ugent poent diazez ma 'z eo tost ho raggwel d'ar wirionez : trec'hour pe rampo reizh, skore tost, ha bonus bihan pa 'z oc'h tost-tre pe resis-tre.",
    precisionTitle: "Resisded.",
    resultCorrect: "Disoc'h reizh (1 / X / 2)",
    scoreExactBonus: "Bonus skore resis",
    scoreProximity: "Tostded skore",
    title: "Penaos e vez jedet ar poentoù ?",
    tooltip: "Biderker ar prantad :",
    multiplierText:
      "Goude-se, kresket e vez ar poentoù-mañ gant ur feur enep-engroez : ma 'z eo ho tisoc'h davedek-tre e-touez ar c'hoarierien, e chom sioul ar feur ; ma 'z oc'h en tu orinel, e c'hall pignat uhel, tra ma chom kempouezet.",
    multiplierTitle: "Ar biderker dinamikel.",
    winningOdds: "Feur gounid (ospea)",
    winnerIfDraw: "trec'hour ma 'z eus rampo",
  },
  user: {
    back: "War-gil",
    detailPrefix: "Xehetasunoù ar poentoù evit",
    detailSuffix: "ar c'hoarier-mañ",
    finalWinnerCorrectPrefix: "Gounezet en deus ar c'hoarier-mañ",
    finalWinnerCorrectSuffix: "poent",
    finalWinnerEliminated: "Dileset eo e drec'hour dibenn : 0 poent",
    finalWinnerEliminatedSuffix: "a zo dileset.",
    finalWinnerHidden:
      "E zibab a chom kuzh keit ha ma 'z eo m'emañ ar skipailh-mañ bizirik.",
    finalWinnerLost: "N'en deus ket gounezet e drec'hour dibenn : 0 poent",
    finalWinnerNoBonus: "Bonus ebet a c'hall bezañ gehitget d'ar renk.",
    finalWinnerNone: "Trec'hour dibenn ebet dibabet.",
    finalWinnerPotential:
      "Ar c'hoarier-mañ a c'hall c'hoazh gounid poentoù gant an trec'hour dibenn",
    finalWinnerStillAliveSuffix: "a zo bizirik c'hoazh.",
    finalWinnerWonSuffix: "en deus gounezet ar genstrivadeg.",
    matchMissing: "Krogad n'eo ket bet kavet pe n'eo ket echuet c'hoazh.",
    noFinishedMatch: "Krogad echuet ebet c'hoazh.",
    predictionSoon: "Ar raggweloù a vo prest dizale !",
  },
  toasts: {
    betSaved: "Raggwel enrollet",
    betSaveError: "Fazi en ur enrollañ ar raggwel",
    batchBetsSaveError: "Fazi en ur enrollañ ar raggweloù",
    finalWinnerSaved: "Skipailh hizivaet",
    finalWinnerSaveError: "Ezin izan da eguneratu :(",
    groupAlreadyMemberPrefix: "Dagoeneko meuriad honetako kide zara :",
    groupCreateError: "Fazi en ur krouiñ ar strollad",
    groupCreatedCodeConnector: "gant ar c'hod-mañ :",
    groupCreatedPrefix: "Strollad",
    groupCreatedSuffix: "krouet",
    groupJoinError: "Fazi en ur emgofeañ",
    groupJoinSuccessPrefix: "Meuriad e-barzh :",
    groupNotFoundPrefix: "Ez dago meuriad gant ar c'hod-mañ :",
    groupNotFoundSuffix: "",
    groupPlayerValidated: "C'hoarier asantet",
    groupRenameError: "Fazi en ur kemmañ anv ar meuriad",
    groupRenamed: "Anv ar meuriad kemmet",
  },
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  fr: frTranslations,
  en: enTranslations,
  mk: mkTranslations,
  eu: euTranslations,
  br: brTranslations,
}
