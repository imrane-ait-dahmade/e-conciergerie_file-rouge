import { cache } from "react";
import { readFile } from "fs/promises";
import path from "path";
import type { Locale } from "./i18n-config";
import { defaultLocale, isLocale } from "./i18n-config";

/** Keys mirror public/locales/<locale>/common.json */
export type CommonDictionary = {
  brand: string;
  login: string;
  register: string;
  footer: {
    tagline: string;
    contact: string;
    privacy: string;
    terms: string;
    rights: string;
    /** Titre du bloc réseaux sociaux (ex. « Suivez-nous ») */
    socialTitle: string;
    /** Ligne du compte / handle (ex. @econciergerie) */
    socialHandle: string;
  };
  appDownload: {
    title: string;
    description: string;
    appStore: string;
    appStoreSubtitle: string;
    googlePlay: string;
    googlePlaySubtitle: string;
  };
  establishmentOffer: {
    /** Titre fort (question / accroche) */
    heading: string;
    /** Ligne avant le prix (ex. « Abonne-toi pour seulement ») */
    lead: string;
    /** Montant mis en avant (ex. « 99 dh ») */
    price: string;
    /** Précision période (ex. « par an ») */
    pricePeriod: string;
    button: string;
  };
  serviceProviders: {
    title: string;
    subtitle: string;
  };
  trust: {
    title: string;
    subtitle: string;
  };
  features: {
    title: string;
    subtitle: string;
    findServices: { title: string; description: string };
    bookQuickly: { title: string; description: string };
    trustedProviders: { title: string; description: string };
    allInOne: { title: string; description: string };
  };
  landingCta: {
    title: string;
    description: string;
  };
  /** Textes page de connexion */
  loginPage: {
    title: string;
    description: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    submitting: string;
    errorTitle: string;
    signupPrompt: string;
    signupCta: string;
    /** Ligne au-dessus des boutons Google / Apple */
    oauthContinueWith: string;
    oauthGoogleAriaLabel: string;
    oauthAppleAriaLabel: string;
    /** Affiché si les URLs OAuth ne sont pas configurées */
    oauthUnavailable: string;
  };
  /** Textes page d’inscription */
  signupPage: {
    title: string;
    description: string;
    nomLabel: string;
    prenomLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    submit: string;
    submitting: string;
    errorTitle: string;
    /** Message si mot de passe et confirmation diffèrent */
    passwordMismatch: string;
    /** Erreur générique (API) */
    signupError: string;
    successTitle: string;
    successMessage: string;
    loginPrompt: string;
    loginCta: string;
    oauthContinueWith: string;
    oauthGoogleAriaLabel: string;
    oauthAppleAriaLabel: string;
    oauthUnavailable: string;
    /** Wizard inscription — placeholders {current} et {total} */
    wizardProgress: string;
    wizardStepIdentity: string;
    wizardStepEmail: string;
    wizardStepPassword: string;
    wizardNext: string;
    wizardBack: string;
    wizardIdentityInvalid: string;
    wizardEmailInvalid: string;
  };
  /** Libellés barre latérale espace connecté `/[locale]/dashboard` */
  dashboardSidebar: {
    management: string;
    sectionGeneral: string;
    sectionLocation: string;
    sectionActivity: string;
    sectionAccount: string;
    locationExplorer: string;
    placeholderLead: string;
    overview: string;
    activity: string;
    reservations: string;
    favorites: string;
    settings: string;
  };
  /** Libellés barre latérale `/[locale]/admin` */
  adminSidebar: {
    title: string;
    sectionGeneral: string;
    sectionLocation: string;
    sectionManagement: string;
    sectionSystem: string;
    dashboard: string;
    locationReferential: string;
    placeholderLead: string;
    users: string;
    etablissements: string;
    /** Services du catalogue assignés à un établissement */
    etablissementServices: string;
    reservations: string;
    services: string;
    settings: string;
    logout: string;
  };
  /** Gestion géographique — `/[locale]/admin/geographie` */
  adminGeographie: {
    pageTitle: string;
    pageDescription: string;
    tabPays: string;
    tabVilles: string;
    tabQuartiers: string;
    mockDataNote: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleteConfirmOk: string;
    deleteConfirmCancel: string;
    deleteSuccess: string;
    toolbar: {
      searchPlaceholder: string;
      filter: string;
      listPays: string;
      listVilles: string;
      listQuartiers: string;
      addPays: string;
      addVille: string;
      addQuartier: string;
    };
    paysColumns: {
      nom: string;
      codeIso: string;
      actions: string;
      modify: string;
      delete: string;
    };
    villesColumns: {
      nom: string;
      pays: string;
      actions: string;
      modify: string;
      delete: string;
    };
    quartiersColumns: {
      nom: string;
      ville: string;
      pays: string;
      actions: string;
      modify: string;
      delete: string;
    };
  };
  /** Utilisateurs — `/[locale]/admin/users` */
  adminUsers: {
    pageTitle: string;
    pageDescription: string;
    searchPlaceholder: string;
    addUser: string;
    colNom: string;
    colPrenom: string;
    colEmail: string;
    colRole: string;
    colStatut: string;
    colDateCreation: string;
    colActions: string;
    statutActive: string;
    statutInactive: string;
    actionEdit: string;
    actionDelete: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleteConfirmOk: string;
    deleteConfirmCancel: string;
    deleteSuccess: string;
    statusUpdated: string;
    formCreateTitle: string;
    formEditTitle: string;
    formNom: string;
    formPrenom: string;
    formEmail: string;
    formPassword: string;
    formPasswordEditHint: string;
    /** Règles affichées à la création (complexité mot de passe API). */
    formPasswordRules: string;
    formRole: string;
    formTelephone: string;
    formAdresse: string;
    formCancel: string;
    formSave: string;
    roleClient: string;
    rolePrestataire: string;
    roleAdmin: string;
    loadError: string;
    retry: string;
    empty: string;
    loading: string;
  };
  /** Établissements — `/[locale]/admin/etablissements` */
  adminEtablissements: {
    pageTitle: string;
    pageDescription: string;
    searchPlaceholder: string;
    addEtablissement: string;
    colNom: string;
    colOwner: string;
    colVille: string;
    colQuartier: string;
    colStatut: string;
    colDateCreation: string;
    colActions: string;
    statutActive: string;
    statutInactive: string;
    actionEdit: string;
    actionDelete: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleteConfirmOk: string;
    deleteConfirmCancel: string;
    deleteSuccess: string;
    statusUpdated: string;
    formCreateTitle: string;
    formEditTitle: string;
    formNom: string;
    formDescription: string;
    formPrestataire: string;
    formVille: string;
    formQuartier: string;
    formQuartierNeedVille: string;
    formTelephone: string;
    formEmail: string;
    formAdresse: string;
    formIsActive: string;
    formCancel: string;
    formSave: string;
    selectPlaceholder: string;
    loadError: string;
    retry: string;
    empty: string;
    loading: string;
    /** Si la liste des prestataires est vide. */
    noPrestataireAccounts: string;
    mainLocationTitle: string;
    mainLocationHelp: string;
    addressLineLabel: string;
    mapsLoading: string;
    mapsLoadError: string;
    mapsMissingKey: string;
    mapsSearchPlaceholder: string;
    mapsUseTypedCoords: string;
    mapsResetLocation: string;
    mapsPickerHint: string;
    formLatitude: string;
    formLongitude: string;
    validationLatRange: string;
    validationLngRange: string;
    validationLatLngPair: string;
  };
  /** Assignations catalogue ↔ établissements — `/[locale]/admin/etablissement-services` */
  adminEtablissementServices: {
    pageTitle: string;
    pageDescription: string;
    searchPlaceholder: string;
    addAssignment: string;
    colEtablissement: string;
    colService: string;
    colDomaine: string;
    colStatut: string;
    colPrix: string;
    colCommentaire: string;
    colDateCreation: string;
    colActions: string;
    statutActive: string;
    statutInactive: string;
    actionEdit: string;
    actionDelete: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleteConfirmOk: string;
    deleteConfirmCancel: string;
    deleteSuccess: string;
    formCreateTitle: string;
    formEditTitle: string;
    formEtablissement: string;
    formService: string;
    formPrix: string;
    formCommentaire: string;
    formCancel: string;
    formSave: string;
    selectPlaceholder: string;
    serviceOptionDisabled: string;
    prixPlaceholder: string;
    commentairePlaceholder: string;
    prixInvalid: string;
    saveSuccess: string;
    editHint: string;
    loadError: string;
    loading: string;
    empty: string;
    loadErrorOptions: string;
    specificLocationToggle: string;
    specificLocationOffHelp: string;
    formAdresse: string;
    formLatitude: string;
    formLongitude: string;
    formLocationLabel: string;
    formLocationType: string;
    addressLineLabel: string;
    mapsLoading: string;
    mapsLoadError: string;
    mapsMissingKey: string;
    mapsSearchPlaceholder: string;
    mapsUseTypedCoords: string;
    mapsResetLocation: string;
    mapsPickerHint: string;
    validationLatRange: string;
    validationLngRange: string;
    validationLatLngPair: string;
  };
  /** Catalogue offres — `/[locale]/admin/services` */
  adminServicesCatalog: {
    pageTitle: string;
    pageSubtitle: string;
    mockNote: string;
    tabDomaines: string;
    tabServices: string;
    tabCaracteristiques: string;
    domainesCardTitle: string;
    domainesCardDescription: string;
    servicesCardTitle: string;
    servicesCardDescription: string;
    caracteristiquesCardTitle: string;
    caracteristiquesCardDescription: string;
    colNom: string;
    colDescription: string;
    colLibelle: string;
    colValeur: string;
    colEtablissement: string;
    colDomaine: string;
    colLinked: string;
    colIcon: string;
    iconFieldLabel: string;
    iconFieldHelp: string;
    iconFieldPlaceholder: string;
    iconFieldMaxLength: string;
    iconPickerTabLibrary: string;
    iconPickerTabCustom: string;
    iconPickerNone: string;
    iconPickerUpload: string;
    iconPickerUploading: string;
    iconPickerCustomHint: string;
    iconPickerPreview: string;
    iconPickerUnknownKeyHint: string;
    domainesSearchPlaceholder: string;
    domainesAddButton: string;
    colStatut: string;
    colDateCreation: string;
    colActions: string;
    statutActive: string;
    statutInactive: string;
    actionEdit: string;
    actionDelete: string;
    domainesMockEditMessage: string;
    domainesMockDeleteConfirm: string;
    domainesToolbarFilter: string;
    domainesEmpty: string;
    servicesSearchPlaceholder: string;
    servicesAddButton: string;
    servicesMockEditMessage: string;
    servicesMockDeleteConfirm: string;
    servicesToolbarFilter: string;
    servicesEmpty: string;
    colType: string;
    caracteristiqueTypeService: string;
    caracteristiqueTypeEstablishment: string;
    caracteristiqueTypeGeneral: string;
    caracteristiquesSearchPlaceholder: string;
    caracteristiquesAddButton: string;
    caracteristiquesMockEditMessage: string;
    caracteristiquesMockDeleteConfirm: string;
    caracteristiquesToolbarFilter: string;
    caracteristiquesEmpty: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleteConfirmOk: string;
    deleteConfirmCancel: string;
    loadingList: string;
    loadErrorList: string;
    formCancel: string;
    formSave: string;
    selectPlaceholder: string;
    domaineModalCreate: string;
    domaineModalEdit: string;
    serviceModalCreate: string;
    serviceModalEdit: string;
    caracteristiqueModalCreate: string;
    caracteristiqueModalEdit: string;
  };
  /** Statistiques & graphiques — `/[locale]/dashboard` */
  dashboardStats: {
    pageIntro: string;
    sectionTitle: string;
    sectionLead: string;
    kpiReservations: string;
    kpiFavorites: string;
    kpiSearches: string;
    chartByCategory: string;
    chartActivity: string;
    chartDistribution: string;
    mockNote: string;
    tooltipValue: string;
    categoryRestaurants: string;
    categoryLodging: string;
    categoryTransport: string;
    categoryWellness: string;
    pieReservations: string;
    pieFavorites: string;
    pieMessages: string;
  };
  /** Statistiques admin — `/[locale]/admin` */
  adminStats: {
    pageIntro: string;
    sectionTitle: string;
    sectionLead: string;
    kpiUsers: string;
    kpiEstablishments: string;
    kpiMonthlyBookings: string;
    chartServicesByType: string;
    chartVolumeTrend: string;
    chartTrafficMix: string;
    mockNote: string;
    tooltipValue: string;
    serviceLodging: string;
    serviceDining: string;
    serviceLeisure: string;
    serviceMobility: string;
    pieUsers: string;
    pieBookings: string;
    pieListings: string;
    kpiProviders: string;
    kpiEstablishmentServices: string;
    loading: string;
    loadError: string;
    retry: string;
    recentSectionTitle: string;
    colName: string;
    colEmail: string;
    colCity: string;
    colDomain: string;
    colService: string;
    colEstablishment: string;
    colActive: string;
    colDate: string;
    colPrice: string;
    emptyState: string;
  };
  /** Barre latérale `/[locale]/prestataire` */
  providerSidebar: {
    title: string;
    sectionGeneral: string;
    sectionBusiness: string;
    dashboard: string;
    establishments: string;
    establishmentServices: string;
    caracteristiques: string;
    medias: string;
    statistics: string;
    profile: string;
    logout: string;
  };
  /** Accueil prestataire */
  providerDashboard: {
    pageTitle: string;
    welcomeTitle: string;
    welcomeLead: string;
    statsSectionTitle: string;
    cardEstablishments: string;
    cardEstablishmentsHint: string;
    cardActiveServices: string;
    cardActiveServicesHint: string;
    cardCaracteristiques: string;
    cardCaracteristiquesHint: string;
    cardReservations: string;
    cardReservationsSoon: string;
    cardReviews: string;
    cardReviewsSoon: string;
    recentTitle: string;
    recentEmpty: string;
    quickActionsTitle: string;
    actionEstablishments: string;
    actionServices: string;
    actionStatistics: string;
    actionProfile: string;
    mockDataNote: string;
    reservationStatus: string;
    reviewRating: string;
  };
  /** Prestataire — `/[locale]/prestataire/etablissements` */
  providerEtablissements: {
    pageTitle: string;
    pageDescription: string;
    addButton: string;
    colNom: string;
    colVille: string;
    colQuartier: string;
    colStatut: string;
    colCreated: string;
    colActions: string;
    statutActive: string;
    statutInactive: string;
    empty: string;
    loadError: string;
    retry: string;
    loading: string;
    formCreateTitle: string;
    formEditTitle: string;
    formNom: string;
    formAdresse: string;
    formDescription: string;
    formTelephone: string;
    formEmail: string;
    formVille: string;
    formQuartier: string;
    formQuartierNeedVille: string;
    formCancel: string;
    formSave: string;
    selectVille: string;
    selectQuartier: string;
    actionEdit: string;
    saveError: string;
    statusError: string;
    mainLocationTitle: string;
    mainLocationHelp: string;
    addressLineLabel: string;
    mapsLoading: string;
    mapsLoadError: string;
    mapsMissingKey: string;
    mapsSearchPlaceholder: string;
    mapsUseTypedCoords: string;
    mapsResetLocation: string;
    mapsPickerHint: string;
    formLatitude: string;
    formLongitude: string;
    validationLatRange: string;
    validationLngRange: string;
    validationLatLngPair: string;
  };
  /** Prestataire — `/[locale]/prestataire/medias` */
  providerMedias: {
    pageTitle: string;
    pageDescription: string;
    tabEstablishment: string;
    tabServiceLine: string;
    selectEtabLabel: string;
    selectEtabPlaceholder: string;
    selectServiceLabel: string;
    selectServicePlaceholder: string;
    filesLabel: string;
    filesHint: string;
    primaryCheckbox: string;
    uploadButton: string;
    uploadingLabel: string;
    cardUploadTitle: string;
    cardUploadDescription: string;
    sectionLibrary: string;
    sectionLibraryHint: string;
    emptyLibrary: string;
    loadListError: string;
    loadingList: string;
    loadingRefs: string;
    refsLoadError: string;
    retry: string;
    selectParentFirst: string;
    deleteButton: string;
    deleteConfirm: string;
    badgePrimary: string;
    markPrimary: string;
    successMarkPrimary: string;
    successUpload: string;
    successDelete: string;
    errorGeneric: string;
    videoBadge: string;
  };
  /** Prestataire — `/[locale]/prestataire/services` */
  providerEstablishmentServices: {
    pageTitle: string;
    pageDescription: string;
    filterAll: string;
    filterLabel: string;
    addButton: string;
    colEtablissement: string;
    colService: string;
    colDomaine: string;
    colStatut: string;
    colPrix: string;
    colCommentaire: string;
    colDateCreation: string;
    colActions: string;
    statutEtabActif: string;
    statutEtabInactif: string;
    empty: string;
    loadError: string;
    loadErrorRefs: string;
    retry: string;
    loading: string;
    formCreateTitle: string;
    formEditTitle: string;
    formEtablissement: string;
    formService: string;
    formPrix: string;
    formCommentaire: string;
    formCancel: string;
    formSave: string;
    selectPlaceholder: string;
    serviceOptionDisabled: string;
    prixPlaceholder: string;
    commentairePlaceholder: string;
    prixInvalid: string;
    editHint: string;
    actionEdit: string;
    actionDelete: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleteConfirmOk: string;
    deleteConfirmCancel: string;
    saveError: string;
    deleteError: string;
    deleteSuccess: string;
    noServiceAvailable: string;
    saveSuccess: string;
    specificLocationToggle: string;
    specificLocationOffHelp: string;
    formAdresse: string;
    formLatitude: string;
    formLongitude: string;
    formLocationLabel: string;
    formLocationType: string;
    addressLineLabel: string;
    mapsLoading: string;
    mapsLoadError: string;
    mapsMissingKey: string;
    mapsSearchPlaceholder: string;
    mapsUseTypedCoords: string;
    mapsResetLocation: string;
    mapsPickerHint: string;
    validationLatRange: string;
    validationLngRange: string;
    validationLatLngPair: string;
  };
  /** Prestataire — `/[locale]/prestataire/caracteristiques` (caractéristiques d’offre) */
  providerEstablishmentServiceCaracteristiques: {
    pageTitle: string;
    pageDescription: string;
    filterEtabAll: string;
    filterEtabLabel: string;
    filterOfferAll: string;
    filterOfferLabel: string;
    addButton: string;
    colEtablissement: string;
    colService: string;
    colLibelle: string;
    colValeur: string;
    colDateCreation: string;
    colActions: string;
    empty: string;
    emptyNoOffers: string;
    loadError: string;
    loadErrorRefs: string;
    retry: string;
    loading: string;
    formCreateTitle: string;
    formEditTitle: string;
    formOffer: string;
    formValeur: string;
    formLibelle: string;
    formModeCatalog: string;
    formModeFree: string;
    formCatalogPick: string;
    formCancel: string;
    formSave: string;
    selectPlaceholder: string;
    valeurPlaceholder: string;
    libellePlaceholder: string;
    valeurRequired: string;
    libelleRequired: string;
    actionEdit: string;
    actionDelete: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleteConfirmOk: string;
    deleteConfirmCancel: string;
    saveError: string;
    deleteError: string;
    deleteSuccess: string;
    conflictError: string;
    editHint: string;
    noCatalogLeft: string;
  };
  /** Prestataire — `/[locale]/prestataire/statistiques` */
  providerStatistics: {
    pageTitle: string;
    pageDescription: string;
    dataSourceNote: string;
    generatedAt: string;
    sectionKpis: string;
    sectionByStatus: string;
    sectionTrend: string;
    trendPlaceholder: string;
    chartEmpty: string;
    sectionSummary: string;
    summaryEstablishments: string;
    sectionRecent: string;
    recentEmpty: string;
    sectionTopServices: string;
    topServicesColService: string;
    topServicesColCount: string;
    extrasNote: string;
    cardEstablishments: string;
    cardEstablishmentsHint: string;
    cardEstablishmentsActive: string;
    cardEstablishmentsActiveHint: string;
    cardServices: string;
    cardServicesHint: string;
    cardCaracteristiques: string;
    cardCaracteristiquesHint: string;
    cardReservations: string;
    cardReservationsHint: string;
    cardReviews: string;
    cardReviewsHint: string;
    statusDemandee: string;
    statusConfirmee: string;
    statusAnnulee: string;
    statusTerminee: string;
    reservationStatus: string;
    reviewRating: string;
  };
  /** Prestataire — `/[locale]/prestataire/profil` */
  providerProfile: {
    pageTitle: string;
    pageDescription: string;
    cardTitle: string;
    cardDescription: string;
    fieldNom: string;
    fieldPrenom: string;
    fieldEmail: string;
    fieldTelephone: string;
    fieldAdresse: string;
    roleLabel: string;
    saveButton: string;
    savingButton: string;
    loadError: string;
    saveError: string;
    saveSuccess: string;
    retry: string;
    loading: string;
    loginPrompt: string;
    goToLogin: string;
  };
};

const DEFAULT_COMMON_DICTIONARY: CommonDictionary = {
  brand: "E-conciergerie",
  login: "connexion",
  register: "Inscription",
  footer: {
    tagline: "Votre plateforme digitale pour simplifier votre quotidien au Maroc.",
    contact: "Contact",
    privacy: "Confidentialite",
    terms: "Conditions",
    rights: "{year} E-conciergerie. Tous droits reserves.",
    socialTitle: "Follow us",
    socialHandle: "@econciergerie",
  },
  appDownload: {
    title: "Votre concierge digital, partout au Maroc",
    description:
      "e_conciergerie.ma est bien plus qu'une simple plateforme - votre passerelle numerique vers le meilleur du Maroc.",
    appStore: "App Store",
    appStoreSubtitle: "Telecharger sur",
    googlePlay: "Google Play",
    googlePlaySubtitle: "Installer l'app",
  },
  establishmentOffer: {
    heading: "Do you run an establishment?",
    lead: "Subscribe for only",
    price: "99 MAD",
    pricePeriod: "per year",
    button: "Subscribe now and publish your service",
  },
  serviceProviders: {
    title: "Best Service Providers",
    subtitle: "Options les plus populaires parmi les voyageurs habitant au Maroc",
  },
  trust: {
    title: "Trusted by leading brands",
    subtitle: "Join thousands who rely on our network across Morocco.",
  },
  features: {
    title: "Built for everyday convenience",
    subtitle: "Everything you need to find, book, and enjoy trusted services.",
    findServices: {
      title: "Find services easily",
      description: "Browse categories and discover providers near you in a few taps.",
    },
    bookQuickly: {
      title: "Book quickly",
      description: "Request a slot and confirm details without the back-and-forth.",
    },
    trustedProviders: {
      title: "Trusted providers",
      description: "Work with vetted partners chosen for quality and reliability.",
    },
    allInOne: {
      title: "All in one place",
      description: "Track requests, messages, and updates from a single app.",
    },
  },
  landingCta: {
    title: "Download the app",
    description: "Get E-conciergerie on your phone and carry Morocco’s best services in your pocket.",
  },
  loginPage: {
    title: "Sign in",
    description: "Enter your email and password to access your account.",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    errorTitle: "Could not sign in",
    signupPrompt: "No account yet?",
    signupCta: "Create an account",
    oauthContinueWith: "or continue with",
    oauthGoogleAriaLabel: "Sign in with Google",
    oauthAppleAriaLabel: "Sign in with Apple",
    oauthUnavailable: "Social sign-in is not configured yet.",
  },
  signupPage: {
    title: "Create an account",
    description:
      "Choose a strong password: uppercase, lowercase, number, special character, at least 8 characters.",
    nomLabel: "Last name",
    prenomLabel: "First name",
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm password",
    submit: "Sign up",
    submitting: "Signing up…",
    errorTitle: "Could not sign up",
    passwordMismatch: "Passwords do not match.",
    signupError: "Sign up failed",
    successTitle: "Success",
    successMessage: "Account created. Redirecting to sign in…",
    loginPrompt: "Already have an account?",
    loginCta: "Sign in",
    oauthContinueWith: "or continue with",
    oauthGoogleAriaLabel: "Sign up with Google",
    oauthAppleAriaLabel: "Sign up with Apple",
    oauthUnavailable: "Social sign-up is not configured yet.",
    wizardProgress: "Step {current} of {total}",
    wizardStepIdentity: "Identity",
    wizardStepEmail: "Email",
    wizardStepPassword: "Password",
    wizardNext: "Continue",
    wizardBack: "Back",
    wizardIdentityInvalid: "Enter at least 2 characters for first and last name.",
    wizardEmailInvalid: "Enter a valid email address.",
  },
  dashboardSidebar: {
    management: "My space",
    sectionGeneral: "Overview",
    sectionLocation: "Location",
    sectionActivity: "Activity",
    sectionAccount: "Account",
    locationExplorer: "Explore",
    placeholderLead: "This section will be available soon.",
    overview: "Overview",
    activity: "Activity",
    reservations: "Bookings",
    favorites: "Favorites",
    settings: "Settings",
  },
  adminSidebar: {
    title: "Administration",
    sectionGeneral: "Overview",
    sectionLocation: "Location",
    sectionManagement: "Management",
    sectionSystem: "System",
    dashboard: "Dashboard",
    locationReferential: "Places & areas",
    placeholderLead: "This section will be available soon.",
    users: "Users",
    etablissements: "Establishments",
    etablissementServices: "Establishment services",
    reservations: "Bookings",
    services: "Services",
    settings: "Settings",
    logout: "Log out",
  },
  adminGeographie: {
    pageTitle: "Geography management",
    pageDescription: "Manage countries, cities, and neighborhoods.",
    tabPays: "Countries",
    tabVilles: "Cities",
    tabQuartiers: "Neighborhoods",
    mockDataNote: "Lists are loaded from the API.",
    deleteConfirmTitle: "Delete this record?",
    deleteConfirmDescription: "This action cannot be undone.",
    deleteConfirmOk: "Delete",
    deleteConfirmCancel: "Cancel",
    deleteSuccess: "Deleted successfully.",
    toolbar: {
      searchPlaceholder: "Search…",
      filter: "Filters",
      listPays: "Country list",
      listVilles: "City list",
      listQuartiers: "Neighborhood list",
      addPays: "Add country",
      addVille: "Add city",
      addQuartier: "Add neighborhood",
    },
    paysColumns: {
      nom: "Name",
      codeIso: "ISO code",
      actions: "Actions",
      modify: "Edit",
      delete: "Delete",
    },
    villesColumns: {
      nom: "Name",
      pays: "Country",
      actions: "Actions",
      modify: "Edit",
      delete: "Delete",
    },
    quartiersColumns: {
      nom: "Name",
      ville: "City",
      pays: "Country",
      actions: "Actions",
      modify: "Edit",
      delete: "Delete",
    },
  },
  adminUsers: {
    pageTitle: "Users",
    pageDescription: "Manage accounts, roles, and access.",
    searchPlaceholder: "Search by name or email…",
    addUser: "Add user",
    colNom: "Last name",
    colPrenom: "First name",
    colEmail: "Email",
    colRole: "Role",
    colStatut: "Status",
    colDateCreation: "Created",
    colActions: "Actions",
    statutActive: "Active",
    statutInactive: "Inactive",
    actionEdit: "Edit",
    actionDelete: "Delete",
    deleteConfirmTitle: "Delete this user?",
    deleteConfirmDescription: "This cannot be undone if the server allows deletion.",
    deleteConfirmOk: "Delete",
    deleteConfirmCancel: "Cancel",
    deleteSuccess: "User deleted.",
    statusUpdated: "Status updated.",
    formCreateTitle: "Add user",
    formEditTitle: "Edit user",
    formNom: "Last name",
    formPrenom: "First name",
    formEmail: "Email",
    formPassword: "Password",
    formPasswordEditHint: "Leave blank to keep the current password.",
    formPasswordRules:
      "At least 8 characters, with uppercase, lowercase, number, and special character (API rules).",
    formRole: "Role",
    formTelephone: "Phone",
    formAdresse: "Address",
    formCancel: "Cancel",
    formSave: "Save",
    roleClient: "Client",
    rolePrestataire: "Provider",
    roleAdmin: "Administrator",
    loadError: "Could not load users.",
    retry: "Retry",
    empty: "No users match your search.",
    loading: "Loading users…",
  },
  adminEtablissements: {
    pageTitle: "Establishments",
    pageDescription: "Manage places, owners, and visibility.",
    searchPlaceholder: "Search by name, city, owner…",
    addEtablissement: "Add establishment",
    colNom: "Name",
    colOwner: "Owner (provider)",
    colVille: "City",
    colQuartier: "District",
    colStatut: "Status",
    colDateCreation: "Created",
    colActions: "Actions",
    statutActive: "Visible",
    statutInactive: "Hidden",
    actionEdit: "Edit",
    actionDelete: "Delete",
    deleteConfirmTitle: "Delete this establishment?",
    deleteConfirmDescription: "Only allowed if no bookings or linked data exist.",
    deleteConfirmOk: "Delete",
    deleteConfirmCancel: "Cancel",
    deleteSuccess: "Establishment deleted.",
    statusUpdated: "Status updated.",
    formCreateTitle: "Add establishment",
    formEditTitle: "Edit establishment",
    formNom: "Name",
    formDescription: "Description",
    formPrestataire: "Owner (provider account)",
    formVille: "City",
    formQuartier: "District",
    formQuartierNeedVille: "Choose a city first to filter districts.",
    formTelephone: "Phone",
    formEmail: "Email",
    formAdresse: "Address",
    formIsActive: "Visible on the site",
    formCancel: "Cancel",
    formSave: "Save",
    selectPlaceholder: "Select…",
    loadError: "Could not load establishments.",
    retry: "Retry",
    empty: "No establishments match your search.",
    loading: "Loading establishments…",
    noPrestataireAccounts: "No provider accounts yet. Create one under Users.",
    mainLocationTitle: "Main location",
    mainLocationHelp:
      "This is the main establishment location and may be used as fallback for services without a specific location.",
    addressLineLabel: "Address",
    mapsLoading: "Loading map…",
    mapsLoadError: "Google Maps could not be loaded. Check your connection and API key.",
    mapsMissingKey:
      "Maps are disabled: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in web/.env.local (Maps JavaScript API + Places).",
    mapsSearchPlaceholder: "Search for an address…",
    mapsUseTypedCoords: "Use typed coordinates",
    mapsResetLocation: "Reset location",
    mapsPickerHint:
      "Pick a place from suggestions, click the map, or drag the marker — coordinates update automatically.",
    formLatitude: "Latitude (WGS84)",
    formLongitude: "Longitude (WGS84)",
    validationLatRange: "Latitude must be between -90 and 90.",
    validationLngRange: "Longitude must be between -180 and 180.",
    validationLatLngPair: "Provide both latitude and longitude, or leave both empty.",
  },
  adminEtablissementServices: {
    pageTitle: "Establishment services",
    pageDescription: "Assign catalog services to establishments (price and notes per link).",
    searchPlaceholder: "Search by establishment, service, domain…",
    addAssignment: "Add assignment",
    colEtablissement: "Establishment",
    colService: "Service",
    colDomaine: "Domain",
    colStatut: "Status",
    colPrix: "Price",
    colCommentaire: "Comment",
    colDateCreation: "Created",
    colActions: "Actions",
    statutActive: "Visible",
    statutInactive: "Hidden",
    actionEdit: "Edit",
    actionDelete: "Delete",
    deleteConfirmTitle: "Remove this assignment?",
    deleteConfirmDescription: "The catalog service will no longer be offered for this establishment.",
    deleteConfirmOk: "Delete",
    deleteConfirmCancel: "Cancel",
    deleteSuccess: "Assignment removed.",
    formCreateTitle: "Assign a catalog service",
    formEditTitle: "Edit assignment",
    formEtablissement: "Establishment",
    formService: "Catalog service",
    formPrix: "Price (optional)",
    formCommentaire: "Comment (optional)",
    formCancel: "Cancel",
    formSave: "Save",
    selectPlaceholder: "Select…",
    serviceOptionDisabled: "Already assigned for this establishment",
    prixPlaceholder: "e.g. 150",
    commentairePlaceholder: "Internal note or conditions…",
    prixInvalid: "Enter a valid positive number.",
    saveSuccess: "Saved.",
    editHint: "Only price and comment can be changed. To change establishment or service, remove and create a new assignment.",
    loadError: "Could not load assignments.",
    loading: "Loading…",
    empty: "No assignments match your search.",
    loadErrorOptions: "Could not load establishments or catalog services.",
    specificLocationToggle: "This service has a specific location",
    specificLocationOffHelp: "This service will use the main establishment location.",
    formAdresse: "Address",
    formLatitude: "Latitude (WGS84)",
    formLongitude: "Longitude (WGS84)",
    formLocationLabel: "Location label",
    formLocationType: "Location type",
    addressLineLabel: "Address",
    mapsLoading: "Loading map…",
    mapsLoadError: "Google Maps could not be loaded. Check your connection and API key.",
    mapsMissingKey:
      "Maps are disabled: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in web/.env.local (Maps JavaScript API + Places).",
    mapsSearchPlaceholder: "Search for an address…",
    mapsUseTypedCoords: "Use typed coordinates",
    mapsResetLocation: "Reset location",
    mapsPickerHint:
      "Pick a place from suggestions, click the map, or drag the marker — coordinates update automatically.",
    validationLatRange: "Latitude must be between -90 and 90.",
    validationLngRange: "Longitude must be between -180 and 180.",
    validationLatLngPair: "Provide both latitude and longitude, or leave both empty.",
  },
  adminServicesCatalog: {
    pageTitle: "Service catalog",
    pageSubtitle: "Manage activity domains, establishment services, and their characteristics.",
    mockNote: "",
    tabDomaines: "Domains",
    tabServices: "Services",
    tabCaracteristiques: "Characteristics",
    domainesCardTitle: "Domains",
    domainesCardDescription: "Sectors and activity types (e.g. lodging, dining).",
    servicesCardTitle: "Services",
    servicesCardDescription: "Offers linked to an establishment and a domain.",
    caracteristiquesCardTitle: "Characteristics",
    caracteristiquesCardDescription: "Descriptive labels, optionally linked to a service type.",
    colNom: "Name",
    colDescription: "Description",
    colLibelle: "Label",
    colValeur: "Value",
    colEtablissement: "Establishment",
    colDomaine: "Domain",
    colLinked: "Linked to",
    colIcon: "Icon",
    iconFieldLabel: "Icon",
    iconFieldHelp:
      "Icon key (e.g. bed, wifi) or absolute image URL. Leave empty for no icon.",
    iconFieldPlaceholder: "e.g. bed or https://…",
    iconFieldMaxLength: "Maximum 512 characters.",
    iconPickerTabLibrary: "Icon library",
    iconPickerTabCustom: "Image or URL",
    iconPickerNone: "None",
    iconPickerUpload: "Upload image",
    iconPickerUploading: "Uploading…",
    iconPickerCustomHint: "Paste an HTTPS URL or upload an image (stored on MinIO).",
    iconPickerPreview: "Preview",
    iconPickerUnknownKeyHint:
      "This value is not in the list. Switch to “Image or URL” to edit it, or pick an icon above.",
    domainesSearchPlaceholder: "Search domains…",
    domainesAddButton: "Add domain",
    colStatut: "Status",
    colDateCreation: "Created",
    colActions: "Actions",
    statutActive: "Active",
    statutInactive: "Inactive",
    actionEdit: "Edit",
    actionDelete: "Delete",
    domainesMockEditMessage: "Demo only — hook up the form later.",
    domainesMockDeleteConfirm: "Remove this row from the demo list?",
    domainesToolbarFilter: "Filters",
    domainesEmpty: "No results.",
    servicesSearchPlaceholder: "Search services…",
    servicesAddButton: "Add service",
    servicesMockEditMessage: "Demo only — hook up the form later.",
    servicesMockDeleteConfirm: "Remove this row from the demo list?",
    servicesToolbarFilter: "Filters",
    servicesEmpty: "No results.",
    colType: "Type",
    caracteristiqueTypeService: "Service",
    caracteristiqueTypeEstablishment: "Establishment",
    caracteristiqueTypeGeneral: "General",
    caracteristiquesSearchPlaceholder: "Search characteristics…",
    caracteristiquesAddButton: "Add characteristic",
    caracteristiquesMockEditMessage: "Demo only — hook up the form later.",
    caracteristiquesMockDeleteConfirm: "Remove this row from the demo list?",
    caracteristiquesToolbarFilter: "Filters",
    caracteristiquesEmpty: "No results.",
    deleteConfirmTitle: "Confirm deletion?",
    deleteConfirmDescription: "This cannot be undone. ",
    deleteConfirmOk: "Delete",
    deleteConfirmCancel: "Cancel",
    loadingList: "Loading…",
    loadErrorList: "Could not load data.",
    formCancel: "Cancel",
    formSave: "Save",
    selectPlaceholder: "Select…",
    domaineModalCreate: "Add domain",
    domaineModalEdit: "Edit domain",
    serviceModalCreate: "Add service",
    serviceModalEdit: "Edit service",
    caracteristiqueModalCreate: "Add characteristic",
    caracteristiqueModalEdit: "Edit characteristic",
  },
  dashboardStats: {
    pageIntro: "You're signed in. Below is a snapshot of your activity.",
    sectionTitle: "Your overview",
    sectionLead: "Summary of your activity on E-conciergerie (sample data).",
    kpiReservations: "Active bookings",
    kpiFavorites: "Saved places",
    kpiSearches: "Searches this month",
    chartByCategory: "Interactions by category",
    chartActivity: "Last 12 weeks",
    chartDistribution: "Activity breakdown",
    mockNote: "Illustrative data — will be replaced by your real stats.",
    tooltipValue: "Count",
    categoryRestaurants: "Food & dining",
    categoryLodging: "Stays",
    categoryTransport: "Transport",
    categoryWellness: "Wellness",
    pieReservations: "Bookings",
    pieFavorites: "Favorites",
    pieMessages: "Messages",
  },
  adminStats: {
    pageIntro: "Admin console — snapshot of platform metrics.",
    sectionTitle: "Platform overview",
    sectionLead: "Live aggregates from the API (GET /admin/dashboard/stats).",
    kpiUsers: "Registered users",
    kpiEstablishments: "Listed establishments",
    kpiMonthlyBookings: "Bookings this month",
    chartServicesByType: "Establishments by domain",
    chartVolumeTrend: "Establishments by city (top)",
    chartTrafficMix: "Users by role",
    mockNote: "Source: admin API.",
    tooltipValue: "Value",
    serviceLodging: "Lodging",
    serviceDining: "Dining",
    serviceLeisure: "Leisure",
    serviceMobility: "Mobility",
    pieUsers: "User sessions",
    pieBookings: "Bookings",
    pieListings: "Listings views",
    kpiProviders: "Providers",
    kpiEstablishmentServices: "Establishment offers",
    loading: "Loading…",
    loadError: "Could not load dashboard statistics.",
    retry: "Retry",
    recentSectionTitle: "Recently added",
    colName: "Name",
    colEmail: "Email",
    colCity: "City",
    colDomain: "Domain",
    colService: "Service",
    colEstablishment: "Establishment",
    colActive: "Active",
    colDate: "Date",
    colPrice: "Price",
    emptyState: "No data",
  },
  providerSidebar: {
    title: "Provider space",
    sectionGeneral: "General",
    sectionBusiness: "Business",
    dashboard: "Overview",
    establishments: "My establishments",
    establishmentServices: "Services",
    caracteristiques: "Features",
    medias: "Media",
    statistics: "Statistics",
    profile: "My profile",
    logout: "Log out",
  },
  providerDashboard: {
    pageTitle: "Dashboard",
    welcomeTitle: "Hello",
    welcomeLead: "Sample overview until the API is connected.",
    statsSectionTitle: "Key figures",
    cardEstablishments: "My establishments",
    cardEstablishmentsHint: "Total",
    cardActiveServices: "Active services",
    cardActiveServicesHint: "Offers on active establishments",
    cardCaracteristiques: "Features",
    cardCaracteristiquesHint: "Lines on your offers",
    cardReservations: "Reservations",
    cardReservationsSoon: "Soon",
    cardReviews: "Reviews",
    cardReviewsSoon: "Soon",
    recentTitle: "Recent activity",
    recentEmpty: "No recent activity.",
    quickActionsTitle: "Shortcuts",
    actionEstablishments: "My establishments",
    actionServices: "Services",
    actionStatistics: "Statistics",
    actionProfile: "My profile",
    mockDataNote: "Demo data — connect GET /provider/dashboard/overview.",
    reservationStatus: "Status",
    reviewRating: "Rating",
  },
  providerEtablissements: {
    pageTitle: "My establishments",
    pageDescription: "Manage your own establishment listings.",
    addButton: "Add establishment",
    colNom: "Name",
    colVille: "City",
    colQuartier: "District",
    colStatut: "Status",
    colCreated: "Created",
    colActions: "Actions",
    statutActive: "Active",
    statutInactive: "Inactive",
    empty: "No establishments yet.",
    loadError: "Could not load establishments.",
    retry: "Retry",
    loading: "Loading…",
    formCreateTitle: "New establishment",
    formEditTitle: "Edit establishment",
    formNom: "Name",
    formAdresse: "Address",
    formDescription: "Description",
    formTelephone: "Phone",
    formEmail: "Email",
    formVille: "City",
    formQuartier: "District",
    formQuartierNeedVille: "Choose a city first to filter districts.",
    formCancel: "Cancel",
    formSave: "Save",
    selectVille: "Select a city",
    selectQuartier: "Select a district",
    actionEdit: "Edit",
    saveError: "Could not save.",
    statusError: "Could not update status.",
    mainLocationTitle: "Main location",
    mainLocationHelp:
      "This is the main establishment location and may be used as fallback for services without a specific place.",
    addressLineLabel: "Address",
    mapsLoading: "Loading map…",
    mapsLoadError: "Google Maps could not be loaded. Check your connection and API key.",
    mapsMissingKey:
      "Maps are disabled: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in web/.env.local (Maps JavaScript API + Places).",
    mapsSearchPlaceholder: "Search for an address…",
    mapsUseTypedCoords: "Use typed coordinates",
    mapsResetLocation: "Reset location",
    mapsPickerHint:
      "Pick a place from suggestions, click the map, or drag the marker — coordinates update automatically.",
    formLatitude: "Latitude (WGS84)",
    formLongitude: "Longitude (WGS84)",
    validationLatRange: "Latitude must be between -90 and 90.",
    validationLngRange: "Longitude must be between -180 and 180.",
    validationLatLngPair: "Provide both latitude and longitude, or leave both empty.",
  },
  providerMedias: {
    pageTitle: "Media library",
    pageDescription:
      "Upload images or videos for an establishment or for a specific service line. One image can be marked as primary (cover) per scope.",
    tabEstablishment: "Establishment",
    tabServiceLine: "Service line",
    selectEtabLabel: "Establishment",
    selectEtabPlaceholder: "Choose an establishment…",
    selectServiceLabel: "Assignment (establishment — service)",
    selectServicePlaceholder: "Choose a line…",
    filesLabel: "Files",
    filesHint: "Images or videos. Multiple files allowed.",
    primaryCheckbox: "Set the first image in the batch as primary (cover)",
    uploadButton: "Upload",
    uploadingLabel: "Uploading…",
    cardUploadTitle: "Upload",
    cardUploadDescription: "Choose where to attach files, then select one or more files.",
    sectionLibrary: "Uploaded media",
    sectionLibraryHint: "Preview, play videos, or remove a file.",
    emptyLibrary: "No media for this selection yet.",
    loadListError: "Could not load media list.",
    loadingList: "Loading media…",
    loadingRefs: "Loading your establishments and services…",
    refsLoadError: "Could not load establishments or services.",
    retry: "Retry",
    selectParentFirst: "Select an establishment or a service line first.",
    deleteButton: "Delete",
    deleteConfirm: "Delete this media? This cannot be undone.",
    badgePrimary: "Primary",
    markPrimary: "Set primary",
    successMarkPrimary: "Cover image updated.",
    successUpload: "Upload successful.",
    successDelete: "Media deleted.",
    errorGeneric: "Something went wrong.",
    videoBadge: "Video",
  },
  providerEstablishmentServices: {
    pageTitle: "Establishment services",
    pageDescription: "Link catalog services to your establishments.",
    filterAll: "All establishments",
    filterLabel: "Filter by establishment",
    addButton: "New assignment",
    colEtablissement: "Establishment",
    colService: "Service",
    colDomaine: "Domain",
    colStatut: "Estab. status",
    colPrix: "Price",
    colCommentaire: "Comment",
    colDateCreation: "Created",
    colActions: "Actions",
    statutEtabActif: "Open",
    statutEtabInactif: "Closed",
    empty: "No assignments yet.",
    loadError: "Could not load assignments.",
    loadErrorRefs: "Could not load lists.",
    retry: "Retry",
    loading: "Loading…",
    formCreateTitle: "Assign a service",
    formEditTitle: "Edit assignment",
    formEtablissement: "Establishment",
    formService: "Catalog service",
    formPrix: "Price (optional)",
    formCommentaire: "Comment (optional)",
    formCancel: "Cancel",
    formSave: "Save",
    selectPlaceholder: "Select…",
    serviceOptionDisabled: "Already assigned",
    prixPlaceholder: "e.g. 150",
    commentairePlaceholder: "Note or conditions…",
    prixInvalid: "Enter a valid positive number.",
    editHint: "Price, comment, and optional service-specific location (map) can be changed.",
    actionEdit: "Edit",
    actionDelete: "Remove",
    deleteConfirmTitle: "Remove this assignment?",
    deleteConfirmDescription: "The service will no longer be offered for this establishment.",
    deleteConfirmOk: "Remove",
    deleteConfirmCancel: "Cancel",
    saveError: "Could not save.",
    deleteError: "Could not remove.",
    deleteSuccess: "Assignment removed.",
    noServiceAvailable: "All catalog services are already assigned.",
    saveSuccess: "Saved.",
    specificLocationToggle: "This service has a specific location",
    specificLocationOffHelp: "This service will use the main establishment location.",
    formAdresse: "Address",
    formLatitude: "Latitude (WGS84)",
    formLongitude: "Longitude (WGS84)",
    formLocationLabel: "Location label",
    formLocationType: "Location type",
    addressLineLabel: "Address",
    mapsLoading: "Loading map…",
    mapsLoadError: "Google Maps could not be loaded. Check your connection and API key.",
    mapsMissingKey:
      "Maps are disabled: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in web/.env.local (Maps JavaScript API + Places).",
    mapsSearchPlaceholder: "Search for an address…",
    mapsUseTypedCoords: "Use typed coordinates",
    mapsResetLocation: "Reset location",
    mapsPickerHint:
      "Pick a place from suggestions, click the map, or drag the marker — coordinates update automatically.",
    validationLatRange: "Latitude must be between -90 and 90.",
    validationLngRange: "Longitude must be between -180 and 180.",
    validationLatLngPair: "Provide both latitude and longitude, or leave both empty.",
  },
  providerEstablishmentServiceCaracteristiques: {
    pageTitle: "Offer characteristics",
    pageDescription:
      "Add label/value lines for each establishment–service assignment. Catalog labels are suggestions only.",
    filterEtabAll: "All establishments",
    filterEtabLabel: "Establishment",
    filterOfferAll: "All assigned services",
    filterOfferLabel: "Assigned service",
    addButton: "Add characteristic",
    colEtablissement: "Establishment",
    colService: "Service",
    colLibelle: "Label",
    colValeur: "Value",
    colDateCreation: "Created",
    colActions: "Actions",
    empty: "No characteristics for the current filters.",
    emptyNoOffers:
      "Assign at least one catalog service to an establishment first (Services page).",
    loadError: "Could not load characteristics.",
    loadErrorRefs: "Could not load data.",
    retry: "Retry",
    loading: "Loading…",
    formCreateTitle: "Add a characteristic",
    formEditTitle: "Edit characteristic",
    formOffer: "Establishment service",
    formValeur: "Value",
    formLibelle: "Label",
    formModeCatalog: "From catalog",
    formModeFree: "Custom label",
    formCatalogPick: "Catalog label",
    formCancel: "Cancel",
    formSave: "Save",
    selectPlaceholder: "Select…",
    valeurPlaceholder: "e.g. Yes, 2, Included…",
    libellePlaceholder: "Short label",
    valeurRequired: "Value is required.",
    libelleRequired: "Label is required.",
    actionEdit: "Edit",
    actionDelete: "Remove",
    deleteConfirmTitle: "Remove this characteristic?",
    deleteConfirmDescription: "It will no longer appear for this offer.",
    deleteConfirmOk: "Remove",
    deleteConfirmCancel: "Cancel",
    saveError: "Could not save.",
    deleteError: "Could not remove.",
    deleteSuccess: "Characteristic removed.",
    conflictError: "A characteristic with this label already exists for this offer.",
    editHint: "You can change the label and the value.",
    noCatalogLeft: "All catalog labels are already used for this offer — use a custom label.",
  },
  providerStatistics: {
    pageTitle: "Statistics",
    pageDescription:
      "Key figures for your activity. Charts and top services use sample data until the API exposes them.",
    dataSourceNote:
      "Figures come from GET /provider/dashboard/overview when you are signed in; trend and top services are illustrative.",
    generatedAt: "Updated:",
    sectionKpis: "Overview",
    sectionByStatus: "Reservations by status",
    sectionTrend: "Activity preview (6 months)",
    trendPlaceholder: "Illustrative trend — replace with real monthly data from your API.",
    chartEmpty: "No reservation breakdown to display yet.",
    sectionSummary: "Establishments",
    summaryEstablishments: "{{active}} active · {{total}} total establishments",
    sectionRecent: "Recent activity",
    recentEmpty: "No recent reservations or reviews.",
    sectionTopServices: "Top services (sample)",
    topServicesColService: "Service",
    topServicesColCount: "Bookings (sample)",
    extrasNote: "Sample ranking — connect your analytics later.",
    cardEstablishments: "Establishments",
    cardEstablishmentsHint: "Total",
    cardEstablishmentsActive: "Active establishments",
    cardEstablishmentsActiveHint: "Open for bookings",
    cardServices: "Active offers",
    cardServicesHint: "On active establishments",
    cardCaracteristiques: "Offer features",
    cardCaracteristiquesHint: "Characteristic lines",
    cardReservations: "Reservations",
    cardReservationsHint: "All statuses",
    cardReviews: "Reviews",
    cardReviewsHint: "Average or count",
    statusDemandee: "Requested",
    statusConfirmee: "Confirmed",
    statusAnnulee: "Cancelled",
    statusTerminee: "Completed",
    reservationStatus: "Status",
    reviewRating: "Rating",
  },
  providerProfile: {
    pageTitle: "My profile",
    pageDescription: "Update your contact details. Password change is not available here yet.",
    cardTitle: "Account information",
    cardDescription: "These details are linked to your user account.",
    fieldNom: "Last name",
    fieldPrenom: "First name",
    fieldEmail: "Email",
    fieldTelephone: "Phone",
    fieldAdresse: "Address (optional)",
    roleLabel: "Role",
    saveButton: "Save changes",
    savingButton: "Saving…",
    loadError: "Could not load profile.",
    saveError: "Could not save changes.",
    saveSuccess: "Profile updated.",
    retry: "Retry",
    loading: "Loading…",
    loginPrompt: "Sign in to view and edit your profile.",
    goToLogin: "Go to sign in",
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asFeatureItem(
  value: unknown,
  fallback: { title: string; description: string }
): { title: string; description: string } {
  const r = asRecord(value);
  return {
    title: asString(r.title, fallback.title),
    description: asString(r.description, fallback.description),
  };
}

function normalizeDictionary(value: unknown): CommonDictionary {
  const root = asRecord(value);
  const footer = asRecord(root.footer);
  const appDownload = asRecord(root.appDownload);
  const establishmentOffer = asRecord(root.establishmentOffer);
  const serviceProviders = asRecord(root.serviceProviders);
  const trust = asRecord(root.trust);
  const features = asRecord(root.features);
  const landingCta = asRecord(root.landingCta);
  const loginPage = asRecord(root.loginPage);
  const signupPage = asRecord(root.signupPage);
  const dashboardSidebar = asRecord(root.dashboardSidebar);
  const adminSidebar = asRecord(root.adminSidebar);
  const adminGeographie = asRecord(root.adminGeographie);
  const adminUsers = asRecord(root.adminUsers);
  const adminEtablissements = asRecord(root.adminEtablissements);
  const adminEtablissementServices = asRecord(root.adminEtablissementServices);
  const adminServicesCatalog = asRecord(root.adminServicesCatalog);
  const geographieToolbar = asRecord(adminGeographie.toolbar);
  const paysColumns = asRecord(adminGeographie.paysColumns);
  const villesColumns = asRecord(adminGeographie.villesColumns);
  const quartiersColumns = asRecord(adminGeographie.quartiersColumns);
  const dashboardStats = asRecord(root.dashboardStats);
  const adminStats = asRecord(root.adminStats);
  const providerSidebar = asRecord(root.providerSidebar);
  const providerDashboard = asRecord(root.providerDashboard);
  const providerEtablissements = asRecord(root.providerEtablissements);
  const providerMedias = asRecord(root.providerMedias);
  const providerEstablishmentServices = asRecord(root.providerEstablishmentServices);
  const providerEstablishmentServiceCaracteristiques = asRecord(
    root.providerEstablishmentServiceCaracteristiques,
  );
  const providerStatistics = asRecord(root.providerStatistics);
  const providerProfile = asRecord(root.providerProfile);

  return {
    brand: asString(root.brand, DEFAULT_COMMON_DICTIONARY.brand),
    login: asString(root.login, DEFAULT_COMMON_DICTIONARY.login),
    register: asString(root.register, DEFAULT_COMMON_DICTIONARY.register),
    footer: {
      tagline: asString(footer.tagline, DEFAULT_COMMON_DICTIONARY.footer.tagline),
      contact: asString(footer.contact, DEFAULT_COMMON_DICTIONARY.footer.contact),
      privacy: asString(footer.privacy, DEFAULT_COMMON_DICTIONARY.footer.privacy),
      terms: asString(footer.terms, DEFAULT_COMMON_DICTIONARY.footer.terms),
      rights: asString(footer.rights, DEFAULT_COMMON_DICTIONARY.footer.rights),
      socialTitle: asString(
        footer.socialTitle,
        DEFAULT_COMMON_DICTIONARY.footer.socialTitle
      ),
      socialHandle: asString(
        footer.socialHandle,
        DEFAULT_COMMON_DICTIONARY.footer.socialHandle
      ),
    },
    appDownload: {
      title: asString(
        appDownload.title,
        DEFAULT_COMMON_DICTIONARY.appDownload.title
      ),
      description: asString(
        appDownload.description,
        DEFAULT_COMMON_DICTIONARY.appDownload.description
      ),
      appStore: asString(
        appDownload.appStore,
        DEFAULT_COMMON_DICTIONARY.appDownload.appStore
      ),
      appStoreSubtitle: asString(
        appDownload.appStoreSubtitle,
        DEFAULT_COMMON_DICTIONARY.appDownload.appStoreSubtitle
      ),
      googlePlay: asString(
        appDownload.googlePlay,
        DEFAULT_COMMON_DICTIONARY.appDownload.googlePlay
      ),
      googlePlaySubtitle: asString(
        appDownload.googlePlaySubtitle,
        DEFAULT_COMMON_DICTIONARY.appDownload.googlePlaySubtitle
      ),
    },
    establishmentOffer: {
      heading: asString(
        establishmentOffer.heading,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.heading
      ),
      lead: asString(
        establishmentOffer.lead,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.lead
      ),
      price: asString(
        establishmentOffer.price,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.price
      ),
      pricePeriod: asString(
        establishmentOffer.pricePeriod,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.pricePeriod
      ),
      button: asString(
        establishmentOffer.button,
        DEFAULT_COMMON_DICTIONARY.establishmentOffer.button
      ),
    },
    serviceProviders: {
      title: asString(
        serviceProviders.title,
        DEFAULT_COMMON_DICTIONARY.serviceProviders.title
      ),
      subtitle: asString(
        serviceProviders.subtitle,
        DEFAULT_COMMON_DICTIONARY.serviceProviders.subtitle
      ),
    },
    trust: {
      title: asString(trust.title, DEFAULT_COMMON_DICTIONARY.trust.title),
      subtitle: asString(trust.subtitle, DEFAULT_COMMON_DICTIONARY.trust.subtitle),
    },
    features: {
      title: asString(features.title, DEFAULT_COMMON_DICTIONARY.features.title),
      subtitle: asString(features.subtitle, DEFAULT_COMMON_DICTIONARY.features.subtitle),
      findServices: asFeatureItem(
        features.findServices,
        DEFAULT_COMMON_DICTIONARY.features.findServices
      ),
      bookQuickly: asFeatureItem(
        features.bookQuickly,
        DEFAULT_COMMON_DICTIONARY.features.bookQuickly
      ),
      trustedProviders: asFeatureItem(
        features.trustedProviders,
        DEFAULT_COMMON_DICTIONARY.features.trustedProviders
      ),
      allInOne: asFeatureItem(features.allInOne, DEFAULT_COMMON_DICTIONARY.features.allInOne),
    },
    landingCta: {
      title: asString(landingCta.title, DEFAULT_COMMON_DICTIONARY.landingCta.title),
      description: asString(
        landingCta.description,
        DEFAULT_COMMON_DICTIONARY.landingCta.description
      ),
    },
    loginPage: {
      title: asString(loginPage.title, DEFAULT_COMMON_DICTIONARY.loginPage.title),
      description: asString(
        loginPage.description,
        DEFAULT_COMMON_DICTIONARY.loginPage.description
      ),
      emailLabel: asString(
        loginPage.emailLabel,
        DEFAULT_COMMON_DICTIONARY.loginPage.emailLabel
      ),
      passwordLabel: asString(
        loginPage.passwordLabel,
        DEFAULT_COMMON_DICTIONARY.loginPage.passwordLabel
      ),
      submit: asString(loginPage.submit, DEFAULT_COMMON_DICTIONARY.loginPage.submit),
      submitting: asString(
        loginPage.submitting,
        DEFAULT_COMMON_DICTIONARY.loginPage.submitting
      ),
      errorTitle: asString(
        loginPage.errorTitle,
        DEFAULT_COMMON_DICTIONARY.loginPage.errorTitle
      ),
      signupPrompt: asString(
        loginPage.signupPrompt,
        DEFAULT_COMMON_DICTIONARY.loginPage.signupPrompt
      ),
      signupCta: asString(
        loginPage.signupCta,
        DEFAULT_COMMON_DICTIONARY.loginPage.signupCta
      ),
      oauthContinueWith: asString(
        loginPage.oauthContinueWith,
        DEFAULT_COMMON_DICTIONARY.loginPage.oauthContinueWith
      ),
      oauthGoogleAriaLabel: asString(
        loginPage.oauthGoogleAriaLabel,
        DEFAULT_COMMON_DICTIONARY.loginPage.oauthGoogleAriaLabel
      ),
      oauthAppleAriaLabel: asString(
        loginPage.oauthAppleAriaLabel,
        DEFAULT_COMMON_DICTIONARY.loginPage.oauthAppleAriaLabel
      ),
      oauthUnavailable: asString(
        loginPage.oauthUnavailable,
        DEFAULT_COMMON_DICTIONARY.loginPage.oauthUnavailable
      ),
    },
    signupPage: {
      title: asString(signupPage.title, DEFAULT_COMMON_DICTIONARY.signupPage.title),
      description: asString(
        signupPage.description,
        DEFAULT_COMMON_DICTIONARY.signupPage.description
      ),
      nomLabel: asString(
        signupPage.nomLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.nomLabel
      ),
      prenomLabel: asString(
        signupPage.prenomLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.prenomLabel
      ),
      emailLabel: asString(
        signupPage.emailLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.emailLabel
      ),
      passwordLabel: asString(
        signupPage.passwordLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.passwordLabel
      ),
      confirmPasswordLabel: asString(
        signupPage.confirmPasswordLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.confirmPasswordLabel
      ),
      submit: asString(signupPage.submit, DEFAULT_COMMON_DICTIONARY.signupPage.submit),
      submitting: asString(
        signupPage.submitting,
        DEFAULT_COMMON_DICTIONARY.signupPage.submitting
      ),
      errorTitle: asString(
        signupPage.errorTitle,
        DEFAULT_COMMON_DICTIONARY.signupPage.errorTitle
      ),
      passwordMismatch: asString(
        signupPage.passwordMismatch,
        DEFAULT_COMMON_DICTIONARY.signupPage.passwordMismatch
      ),
      signupError: asString(
        signupPage.signupError,
        DEFAULT_COMMON_DICTIONARY.signupPage.signupError
      ),
      successTitle: asString(
        signupPage.successTitle,
        DEFAULT_COMMON_DICTIONARY.signupPage.successTitle
      ),
      successMessage: asString(
        signupPage.successMessage,
        DEFAULT_COMMON_DICTIONARY.signupPage.successMessage
      ),
      loginPrompt: asString(
        signupPage.loginPrompt,
        DEFAULT_COMMON_DICTIONARY.signupPage.loginPrompt
      ),
      loginCta: asString(
        signupPage.loginCta,
        DEFAULT_COMMON_DICTIONARY.signupPage.loginCta
      ),
      oauthContinueWith: asString(
        signupPage.oauthContinueWith,
        DEFAULT_COMMON_DICTIONARY.signupPage.oauthContinueWith
      ),
      oauthGoogleAriaLabel: asString(
        signupPage.oauthGoogleAriaLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.oauthGoogleAriaLabel
      ),
      oauthAppleAriaLabel: asString(
        signupPage.oauthAppleAriaLabel,
        DEFAULT_COMMON_DICTIONARY.signupPage.oauthAppleAriaLabel
      ),
      oauthUnavailable: asString(
        signupPage.oauthUnavailable,
        DEFAULT_COMMON_DICTIONARY.signupPage.oauthUnavailable
      ),
      wizardProgress: asString(
        signupPage.wizardProgress,
        DEFAULT_COMMON_DICTIONARY.signupPage.wizardProgress
      ),
      wizardStepIdentity: asString(
        signupPage.wizardStepIdentity,
        DEFAULT_COMMON_DICTIONARY.signupPage.wizardStepIdentity
      ),
      wizardStepEmail: asString(
        signupPage.wizardStepEmail,
        DEFAULT_COMMON_DICTIONARY.signupPage.wizardStepEmail
      ),
      wizardStepPassword: asString(
        signupPage.wizardStepPassword,
        DEFAULT_COMMON_DICTIONARY.signupPage.wizardStepPassword
      ),
      wizardNext: asString(
        signupPage.wizardNext,
        DEFAULT_COMMON_DICTIONARY.signupPage.wizardNext
      ),
      wizardBack: asString(
        signupPage.wizardBack,
        DEFAULT_COMMON_DICTIONARY.signupPage.wizardBack
      ),
      wizardIdentityInvalid: asString(
        signupPage.wizardIdentityInvalid,
        DEFAULT_COMMON_DICTIONARY.signupPage.wizardIdentityInvalid
      ),
      wizardEmailInvalid: asString(
        signupPage.wizardEmailInvalid,
        DEFAULT_COMMON_DICTIONARY.signupPage.wizardEmailInvalid
      ),
    },
    dashboardSidebar: {
      management: asString(
        dashboardSidebar.management,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.management
      ),
      sectionGeneral: asString(
        dashboardSidebar.sectionGeneral,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.sectionGeneral
      ),
      sectionLocation: asString(
        dashboardSidebar.sectionLocation,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.sectionLocation
      ),
      sectionActivity: asString(
        dashboardSidebar.sectionActivity,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.sectionActivity
      ),
      sectionAccount: asString(
        dashboardSidebar.sectionAccount,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.sectionAccount
      ),
      locationExplorer: asString(
        dashboardSidebar.locationExplorer,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.locationExplorer
      ),
      placeholderLead: asString(
        dashboardSidebar.placeholderLead,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.placeholderLead
      ),
      overview: asString(
        dashboardSidebar.overview,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.overview
      ),
      activity: asString(
        dashboardSidebar.activity,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.activity
      ),
      reservations: asString(
        dashboardSidebar.reservations,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.reservations
      ),
      favorites: asString(
        dashboardSidebar.favorites,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.favorites
      ),
      settings: asString(
        dashboardSidebar.settings,
        DEFAULT_COMMON_DICTIONARY.dashboardSidebar.settings
      ),
    },
    adminSidebar: {
      title: asString(adminSidebar.title, DEFAULT_COMMON_DICTIONARY.adminSidebar.title),
      sectionGeneral: asString(
        adminSidebar.sectionGeneral,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.sectionGeneral
      ),
      sectionLocation: asString(
        adminSidebar.sectionLocation,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.sectionLocation
      ),
      sectionManagement: asString(
        adminSidebar.sectionManagement,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.sectionManagement
      ),
      sectionSystem: asString(
        adminSidebar.sectionSystem,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.sectionSystem
      ),
      dashboard: asString(
        adminSidebar.dashboard,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.dashboard
      ),
      locationReferential: asString(
        adminSidebar.locationReferential,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.locationReferential
      ),
      placeholderLead: asString(
        adminSidebar.placeholderLead,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.placeholderLead
      ),
      users: asString(adminSidebar.users, DEFAULT_COMMON_DICTIONARY.adminSidebar.users),
      etablissements: asString(
        adminSidebar.etablissements,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.etablissements
      ),
      etablissementServices: asString(
        adminSidebar.etablissementServices,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.etablissementServices
      ),
      reservations: asString(
        adminSidebar.reservations,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.reservations
      ),
      services: asString(
        adminSidebar.services,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.services
      ),
      settings: asString(
        adminSidebar.settings,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.settings
      ),
      logout: asString(
        adminSidebar.logout,
        DEFAULT_COMMON_DICTIONARY.adminSidebar.logout
      ),
    },
    adminGeographie: {
      pageTitle: asString(
        adminGeographie.pageTitle,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.pageTitle
      ),
      pageDescription: asString(
        adminGeographie.pageDescription,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.pageDescription
      ),
      tabPays: asString(adminGeographie.tabPays, DEFAULT_COMMON_DICTIONARY.adminGeographie.tabPays),
      tabVilles: asString(
        adminGeographie.tabVilles,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.tabVilles
      ),
      tabQuartiers: asString(
        adminGeographie.tabQuartiers,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.tabQuartiers
      ),
      mockDataNote: asString(
        adminGeographie.mockDataNote,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.mockDataNote
      ),
      deleteConfirmTitle: asString(
        adminGeographie.deleteConfirmTitle,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.deleteConfirmTitle
      ),
      deleteConfirmDescription: asString(
        adminGeographie.deleteConfirmDescription,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.deleteConfirmDescription
      ),
      deleteConfirmOk: asString(
        adminGeographie.deleteConfirmOk,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.deleteConfirmOk
      ),
      deleteConfirmCancel: asString(
        adminGeographie.deleteConfirmCancel,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.deleteConfirmCancel
      ),
      deleteSuccess: asString(
        adminGeographie.deleteSuccess,
        DEFAULT_COMMON_DICTIONARY.adminGeographie.deleteSuccess
      ),
      toolbar: {
        searchPlaceholder: asString(
          geographieToolbar.searchPlaceholder,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.toolbar.searchPlaceholder
        ),
        filter: asString(
          geographieToolbar.filter,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.toolbar.filter
        ),
        listPays: asString(
          geographieToolbar.listPays,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.toolbar.listPays
        ),
        listVilles: asString(
          geographieToolbar.listVilles,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.toolbar.listVilles
        ),
        listQuartiers: asString(
          geographieToolbar.listQuartiers,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.toolbar.listQuartiers
        ),
        addPays: asString(
          geographieToolbar.addPays,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.toolbar.addPays
        ),
        addVille: asString(
          geographieToolbar.addVille,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.toolbar.addVille
        ),
        addQuartier: asString(
          geographieToolbar.addQuartier,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.toolbar.addQuartier
        ),
      },
      paysColumns: {
        nom: asString(paysColumns.nom, DEFAULT_COMMON_DICTIONARY.adminGeographie.paysColumns.nom),
        codeIso: asString(
          paysColumns.codeIso,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.paysColumns.codeIso
        ),
        actions: asString(
          paysColumns.actions,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.paysColumns.actions
        ),
        modify: asString(
          paysColumns.modify,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.paysColumns.modify
        ),
        delete: asString(
          paysColumns.delete,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.paysColumns.delete
        ),
      },
      villesColumns: {
        nom: asString(
          villesColumns.nom,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.villesColumns.nom
        ),
        pays: asString(
          villesColumns.pays,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.villesColumns.pays
        ),
        actions: asString(
          villesColumns.actions,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.villesColumns.actions
        ),
        modify: asString(
          villesColumns.modify,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.villesColumns.modify
        ),
        delete: asString(
          villesColumns.delete,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.villesColumns.delete
        ),
      },
      quartiersColumns: {
        nom: asString(
          quartiersColumns.nom,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.quartiersColumns.nom
        ),
        ville: asString(
          quartiersColumns.ville,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.quartiersColumns.ville
        ),
        pays: asString(
          quartiersColumns.pays,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.quartiersColumns.pays
        ),
        actions: asString(
          quartiersColumns.actions,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.quartiersColumns.actions
        ),
        modify: asString(
          quartiersColumns.modify,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.quartiersColumns.modify
        ),
        delete: asString(
          quartiersColumns.delete,
          DEFAULT_COMMON_DICTIONARY.adminGeographie.quartiersColumns.delete
        ),
      },
    },
    adminUsers: {
      pageTitle: asString(
        adminUsers.pageTitle,
        DEFAULT_COMMON_DICTIONARY.adminUsers.pageTitle
      ),
      pageDescription: asString(
        adminUsers.pageDescription,
        DEFAULT_COMMON_DICTIONARY.adminUsers.pageDescription
      ),
      searchPlaceholder: asString(
        adminUsers.searchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminUsers.searchPlaceholder
      ),
      addUser: asString(adminUsers.addUser, DEFAULT_COMMON_DICTIONARY.adminUsers.addUser),
      colNom: asString(adminUsers.colNom, DEFAULT_COMMON_DICTIONARY.adminUsers.colNom),
      colPrenom: asString(
        adminUsers.colPrenom,
        DEFAULT_COMMON_DICTIONARY.adminUsers.colPrenom
      ),
      colEmail: asString(adminUsers.colEmail, DEFAULT_COMMON_DICTIONARY.adminUsers.colEmail),
      colRole: asString(adminUsers.colRole, DEFAULT_COMMON_DICTIONARY.adminUsers.colRole),
      colStatut: asString(
        adminUsers.colStatut,
        DEFAULT_COMMON_DICTIONARY.adminUsers.colStatut
      ),
      colDateCreation: asString(
        adminUsers.colDateCreation,
        DEFAULT_COMMON_DICTIONARY.adminUsers.colDateCreation
      ),
      colActions: asString(
        adminUsers.colActions,
        DEFAULT_COMMON_DICTIONARY.adminUsers.colActions
      ),
      statutActive: asString(
        adminUsers.statutActive,
        DEFAULT_COMMON_DICTIONARY.adminUsers.statutActive
      ),
      statutInactive: asString(
        adminUsers.statutInactive,
        DEFAULT_COMMON_DICTIONARY.adminUsers.statutInactive
      ),
      actionEdit: asString(
        adminUsers.actionEdit,
        DEFAULT_COMMON_DICTIONARY.adminUsers.actionEdit
      ),
      actionDelete: asString(
        adminUsers.actionDelete,
        DEFAULT_COMMON_DICTIONARY.adminUsers.actionDelete
      ),
      deleteConfirmTitle: asString(
        adminUsers.deleteConfirmTitle,
        DEFAULT_COMMON_DICTIONARY.adminUsers.deleteConfirmTitle
      ),
      deleteConfirmDescription: asString(
        adminUsers.deleteConfirmDescription,
        DEFAULT_COMMON_DICTIONARY.adminUsers.deleteConfirmDescription
      ),
      deleteConfirmOk: asString(
        adminUsers.deleteConfirmOk,
        DEFAULT_COMMON_DICTIONARY.adminUsers.deleteConfirmOk
      ),
      deleteConfirmCancel: asString(
        adminUsers.deleteConfirmCancel,
        DEFAULT_COMMON_DICTIONARY.adminUsers.deleteConfirmCancel
      ),
      deleteSuccess: asString(
        adminUsers.deleteSuccess,
        DEFAULT_COMMON_DICTIONARY.adminUsers.deleteSuccess
      ),
      statusUpdated: asString(
        adminUsers.statusUpdated,
        DEFAULT_COMMON_DICTIONARY.adminUsers.statusUpdated
      ),
      formCreateTitle: asString(
        adminUsers.formCreateTitle,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formCreateTitle
      ),
      formEditTitle: asString(
        adminUsers.formEditTitle,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formEditTitle
      ),
      formNom: asString(adminUsers.formNom, DEFAULT_COMMON_DICTIONARY.adminUsers.formNom),
      formPrenom: asString(
        adminUsers.formPrenom,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formPrenom
      ),
      formEmail: asString(
        adminUsers.formEmail,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formEmail
      ),
      formPassword: asString(
        adminUsers.formPassword,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formPassword
      ),
      formPasswordEditHint: asString(
        adminUsers.formPasswordEditHint,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formPasswordEditHint
      ),
      formPasswordRules: asString(
        adminUsers.formPasswordRules,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formPasswordRules
      ),
      formRole: asString(adminUsers.formRole, DEFAULT_COMMON_DICTIONARY.adminUsers.formRole),
      formTelephone: asString(
        adminUsers.formTelephone,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formTelephone
      ),
      formAdresse: asString(
        adminUsers.formAdresse,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formAdresse
      ),
      formCancel: asString(
        adminUsers.formCancel,
        DEFAULT_COMMON_DICTIONARY.adminUsers.formCancel
      ),
      formSave: asString(adminUsers.formSave, DEFAULT_COMMON_DICTIONARY.adminUsers.formSave),
      roleClient: asString(
        adminUsers.roleClient,
        DEFAULT_COMMON_DICTIONARY.adminUsers.roleClient
      ),
      rolePrestataire: asString(
        adminUsers.rolePrestataire,
        DEFAULT_COMMON_DICTIONARY.adminUsers.rolePrestataire
      ),
      roleAdmin: asString(
        adminUsers.roleAdmin,
        DEFAULT_COMMON_DICTIONARY.adminUsers.roleAdmin
      ),
      loadError: asString(
        adminUsers.loadError,
        DEFAULT_COMMON_DICTIONARY.adminUsers.loadError
      ),
      retry: asString(adminUsers.retry, DEFAULT_COMMON_DICTIONARY.adminUsers.retry),
      empty: asString(adminUsers.empty, DEFAULT_COMMON_DICTIONARY.adminUsers.empty),
      loading: asString(adminUsers.loading, DEFAULT_COMMON_DICTIONARY.adminUsers.loading),
    },
    adminEtablissements: {
      pageTitle: asString(
        adminEtablissements.pageTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.pageTitle
      ),
      pageDescription: asString(
        adminEtablissements.pageDescription,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.pageDescription
      ),
      searchPlaceholder: asString(
        adminEtablissements.searchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.searchPlaceholder
      ),
      addEtablissement: asString(
        adminEtablissements.addEtablissement,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.addEtablissement
      ),
      colNom: asString(
        adminEtablissements.colNom,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.colNom
      ),
      colOwner: asString(
        adminEtablissements.colOwner,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.colOwner
      ),
      colVille: asString(
        adminEtablissements.colVille,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.colVille
      ),
      colQuartier: asString(
        adminEtablissements.colQuartier,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.colQuartier
      ),
      colStatut: asString(
        adminEtablissements.colStatut,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.colStatut
      ),
      colDateCreation: asString(
        adminEtablissements.colDateCreation,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.colDateCreation
      ),
      colActions: asString(
        adminEtablissements.colActions,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.colActions
      ),
      statutActive: asString(
        adminEtablissements.statutActive,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.statutActive
      ),
      statutInactive: asString(
        adminEtablissements.statutInactive,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.statutInactive
      ),
      actionEdit: asString(
        adminEtablissements.actionEdit,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.actionEdit
      ),
      actionDelete: asString(
        adminEtablissements.actionDelete,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.actionDelete
      ),
      deleteConfirmTitle: asString(
        adminEtablissements.deleteConfirmTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.deleteConfirmTitle
      ),
      deleteConfirmDescription: asString(
        adminEtablissements.deleteConfirmDescription,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.deleteConfirmDescription
      ),
      deleteConfirmOk: asString(
        adminEtablissements.deleteConfirmOk,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.deleteConfirmOk
      ),
      deleteConfirmCancel: asString(
        adminEtablissements.deleteConfirmCancel,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.deleteConfirmCancel
      ),
      deleteSuccess: asString(
        adminEtablissements.deleteSuccess,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.deleteSuccess
      ),
      statusUpdated: asString(
        adminEtablissements.statusUpdated,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.statusUpdated
      ),
      formCreateTitle: asString(
        adminEtablissements.formCreateTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formCreateTitle
      ),
      formEditTitle: asString(
        adminEtablissements.formEditTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formEditTitle
      ),
      formNom: asString(
        adminEtablissements.formNom,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formNom
      ),
      formDescription: asString(
        adminEtablissements.formDescription,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formDescription
      ),
      formPrestataire: asString(
        adminEtablissements.formPrestataire,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formPrestataire
      ),
      formVille: asString(
        adminEtablissements.formVille,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formVille
      ),
      formQuartier: asString(
        adminEtablissements.formQuartier,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formQuartier
      ),
      formQuartierNeedVille: asString(
        adminEtablissements.formQuartierNeedVille,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formQuartierNeedVille
      ),
      formTelephone: asString(
        adminEtablissements.formTelephone,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formTelephone
      ),
      formEmail: asString(
        adminEtablissements.formEmail,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formEmail
      ),
      formAdresse: asString(
        adminEtablissements.formAdresse,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formAdresse
      ),
      formIsActive: asString(
        adminEtablissements.formIsActive,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formIsActive
      ),
      formCancel: asString(
        adminEtablissements.formCancel,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formCancel
      ),
      formSave: asString(
        adminEtablissements.formSave,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formSave
      ),
      selectPlaceholder: asString(
        adminEtablissements.selectPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.selectPlaceholder
      ),
      loadError: asString(
        adminEtablissements.loadError,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.loadError
      ),
      retry: asString(
        adminEtablissements.retry,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.retry
      ),
      empty: asString(
        adminEtablissements.empty,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.empty
      ),
      loading: asString(
        adminEtablissements.loading,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.loading
      ),
      noPrestataireAccounts: asString(
        adminEtablissements.noPrestataireAccounts,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.noPrestataireAccounts
      ),
      mainLocationTitle: asString(
        adminEtablissements.mainLocationTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mainLocationTitle
      ),
      mainLocationHelp: asString(
        adminEtablissements.mainLocationHelp,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mainLocationHelp
      ),
      addressLineLabel: asString(
        adminEtablissements.addressLineLabel,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.addressLineLabel
      ),
      mapsLoading: asString(
        adminEtablissements.mapsLoading,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mapsLoading
      ),
      mapsLoadError: asString(
        adminEtablissements.mapsLoadError,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mapsLoadError
      ),
      mapsMissingKey: asString(
        adminEtablissements.mapsMissingKey,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mapsMissingKey
      ),
      mapsSearchPlaceholder: asString(
        adminEtablissements.mapsSearchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mapsSearchPlaceholder
      ),
      mapsUseTypedCoords: asString(
        adminEtablissements.mapsUseTypedCoords,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mapsUseTypedCoords
      ),
      mapsResetLocation: asString(
        adminEtablissements.mapsResetLocation,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mapsResetLocation
      ),
      mapsPickerHint: asString(
        adminEtablissements.mapsPickerHint,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.mapsPickerHint
      ),
      formLatitude: asString(
        adminEtablissements.formLatitude,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formLatitude
      ),
      formLongitude: asString(
        adminEtablissements.formLongitude,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.formLongitude
      ),
      validationLatRange: asString(
        adminEtablissements.validationLatRange,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.validationLatRange
      ),
      validationLngRange: asString(
        adminEtablissements.validationLngRange,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.validationLngRange
      ),
      validationLatLngPair: asString(
        adminEtablissements.validationLatLngPair,
        DEFAULT_COMMON_DICTIONARY.adminEtablissements.validationLatLngPair
      ),
    },
    adminEtablissementServices: {
      pageTitle: asString(
        adminEtablissementServices.pageTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.pageTitle
      ),
      pageDescription: asString(
        adminEtablissementServices.pageDescription,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.pageDescription
      ),
      searchPlaceholder: asString(
        adminEtablissementServices.searchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.searchPlaceholder
      ),
      addAssignment: asString(
        adminEtablissementServices.addAssignment,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.addAssignment
      ),
      colEtablissement: asString(
        adminEtablissementServices.colEtablissement,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.colEtablissement
      ),
      colService: asString(
        adminEtablissementServices.colService,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.colService
      ),
      colDomaine: asString(
        adminEtablissementServices.colDomaine,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.colDomaine
      ),
      colStatut: asString(
        adminEtablissementServices.colStatut,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.colStatut
      ),
      colPrix: asString(
        adminEtablissementServices.colPrix,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.colPrix
      ),
      colCommentaire: asString(
        adminEtablissementServices.colCommentaire,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.colCommentaire
      ),
      colDateCreation: asString(
        adminEtablissementServices.colDateCreation,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.colDateCreation
      ),
      colActions: asString(
        adminEtablissementServices.colActions,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.colActions
      ),
      statutActive: asString(
        adminEtablissementServices.statutActive,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.statutActive
      ),
      statutInactive: asString(
        adminEtablissementServices.statutInactive,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.statutInactive
      ),
      actionEdit: asString(
        adminEtablissementServices.actionEdit,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.actionEdit
      ),
      actionDelete: asString(
        adminEtablissementServices.actionDelete,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.actionDelete
      ),
      deleteConfirmTitle: asString(
        adminEtablissementServices.deleteConfirmTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.deleteConfirmTitle
      ),
      deleteConfirmDescription: asString(
        adminEtablissementServices.deleteConfirmDescription,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.deleteConfirmDescription
      ),
      deleteConfirmOk: asString(
        adminEtablissementServices.deleteConfirmOk,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.deleteConfirmOk
      ),
      deleteConfirmCancel: asString(
        adminEtablissementServices.deleteConfirmCancel,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.deleteConfirmCancel
      ),
      deleteSuccess: asString(
        adminEtablissementServices.deleteSuccess,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.deleteSuccess
      ),
      formCreateTitle: asString(
        adminEtablissementServices.formCreateTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formCreateTitle
      ),
      formEditTitle: asString(
        adminEtablissementServices.formEditTitle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formEditTitle
      ),
      formEtablissement: asString(
        adminEtablissementServices.formEtablissement,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formEtablissement
      ),
      formService: asString(
        adminEtablissementServices.formService,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formService
      ),
      formPrix: asString(
        adminEtablissementServices.formPrix,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formPrix
      ),
      formCommentaire: asString(
        adminEtablissementServices.formCommentaire,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formCommentaire
      ),
      formCancel: asString(
        adminEtablissementServices.formCancel,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formCancel
      ),
      formSave: asString(
        adminEtablissementServices.formSave,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formSave
      ),
      selectPlaceholder: asString(
        adminEtablissementServices.selectPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.selectPlaceholder
      ),
      serviceOptionDisabled: asString(
        adminEtablissementServices.serviceOptionDisabled,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.serviceOptionDisabled
      ),
      prixPlaceholder: asString(
        adminEtablissementServices.prixPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.prixPlaceholder
      ),
      commentairePlaceholder: asString(
        adminEtablissementServices.commentairePlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.commentairePlaceholder
      ),
      prixInvalid: asString(
        adminEtablissementServices.prixInvalid,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.prixInvalid
      ),
      saveSuccess: asString(
        adminEtablissementServices.saveSuccess,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.saveSuccess
      ),
      editHint: asString(
        adminEtablissementServices.editHint,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.editHint
      ),
      loadError: asString(
        adminEtablissementServices.loadError,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.loadError
      ),
      loading: asString(
        adminEtablissementServices.loading,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.loading
      ),
      empty: asString(
        adminEtablissementServices.empty,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.empty
      ),
      loadErrorOptions: asString(
        adminEtablissementServices.loadErrorOptions,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.loadErrorOptions
      ),
      specificLocationToggle: asString(
        adminEtablissementServices.specificLocationToggle,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.specificLocationToggle
      ),
      specificLocationOffHelp: asString(
        adminEtablissementServices.specificLocationOffHelp,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.specificLocationOffHelp
      ),
      formAdresse: asString(
        adminEtablissementServices.formAdresse,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formAdresse
      ),
      formLatitude: asString(
        adminEtablissementServices.formLatitude,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formLatitude
      ),
      formLongitude: asString(
        adminEtablissementServices.formLongitude,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formLongitude
      ),
      formLocationLabel: asString(
        adminEtablissementServices.formLocationLabel,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formLocationLabel
      ),
      formLocationType: asString(
        adminEtablissementServices.formLocationType,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.formLocationType
      ),
      addressLineLabel: asString(
        adminEtablissementServices.addressLineLabel,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.addressLineLabel
      ),
      mapsLoading: asString(
        adminEtablissementServices.mapsLoading,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.mapsLoading
      ),
      mapsLoadError: asString(
        adminEtablissementServices.mapsLoadError,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.mapsLoadError
      ),
      mapsMissingKey: asString(
        adminEtablissementServices.mapsMissingKey,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.mapsMissingKey
      ),
      mapsSearchPlaceholder: asString(
        adminEtablissementServices.mapsSearchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.mapsSearchPlaceholder
      ),
      mapsUseTypedCoords: asString(
        adminEtablissementServices.mapsUseTypedCoords,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.mapsUseTypedCoords
      ),
      mapsResetLocation: asString(
        adminEtablissementServices.mapsResetLocation,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.mapsResetLocation
      ),
      mapsPickerHint: asString(
        adminEtablissementServices.mapsPickerHint,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.mapsPickerHint
      ),
      validationLatRange: asString(
        adminEtablissementServices.validationLatRange,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.validationLatRange
      ),
      validationLngRange: asString(
        adminEtablissementServices.validationLngRange,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.validationLngRange
      ),
      validationLatLngPair: asString(
        adminEtablissementServices.validationLatLngPair,
        DEFAULT_COMMON_DICTIONARY.adminEtablissementServices.validationLatLngPair
      ),
    },
    adminServicesCatalog: {
      pageTitle: asString(
        adminServicesCatalog.pageTitle,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.pageTitle
      ),
      pageSubtitle: asString(
        adminServicesCatalog.pageSubtitle,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.pageSubtitle
      ),
      mockNote: asString(
        adminServicesCatalog.mockNote,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.mockNote
      ),
      tabDomaines: asString(
        adminServicesCatalog.tabDomaines,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.tabDomaines
      ),
      tabServices: asString(
        adminServicesCatalog.tabServices,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.tabServices
      ),
      tabCaracteristiques: asString(
        adminServicesCatalog.tabCaracteristiques,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.tabCaracteristiques
      ),
      domainesCardTitle: asString(
        adminServicesCatalog.domainesCardTitle,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domainesCardTitle
      ),
      domainesCardDescription: asString(
        adminServicesCatalog.domainesCardDescription,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domainesCardDescription
      ),
      servicesCardTitle: asString(
        adminServicesCatalog.servicesCardTitle,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.servicesCardTitle
      ),
      servicesCardDescription: asString(
        adminServicesCatalog.servicesCardDescription,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.servicesCardDescription
      ),
      caracteristiquesCardTitle: asString(
        adminServicesCatalog.caracteristiquesCardTitle,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiquesCardTitle
      ),
      caracteristiquesCardDescription: asString(
        adminServicesCatalog.caracteristiquesCardDescription,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiquesCardDescription
      ),
      colNom: asString(
        adminServicesCatalog.colNom,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colNom
      ),
      colDescription: asString(
        adminServicesCatalog.colDescription,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colDescription
      ),
      colLibelle: asString(
        adminServicesCatalog.colLibelle,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colLibelle
      ),
      colValeur: asString(
        adminServicesCatalog.colValeur,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colValeur
      ),
      colEtablissement: asString(
        adminServicesCatalog.colEtablissement,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colEtablissement
      ),
      colDomaine: asString(
        adminServicesCatalog.colDomaine,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colDomaine
      ),
      colLinked: asString(
        adminServicesCatalog.colLinked,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colLinked
      ),
      colIcon: asString(
        adminServicesCatalog.colIcon,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colIcon
      ),
      iconFieldLabel: asString(
        adminServicesCatalog.iconFieldLabel,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconFieldLabel
      ),
      iconFieldHelp: asString(
        adminServicesCatalog.iconFieldHelp,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconFieldHelp
      ),
      iconFieldPlaceholder: asString(
        adminServicesCatalog.iconFieldPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconFieldPlaceholder
      ),
      iconFieldMaxLength: asString(
        adminServicesCatalog.iconFieldMaxLength,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconFieldMaxLength
      ),
      iconPickerTabLibrary: asString(
        adminServicesCatalog.iconPickerTabLibrary,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconPickerTabLibrary
      ),
      iconPickerTabCustom: asString(
        adminServicesCatalog.iconPickerTabCustom,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconPickerTabCustom
      ),
      iconPickerNone: asString(
        adminServicesCatalog.iconPickerNone,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconPickerNone
      ),
      iconPickerUpload: asString(
        adminServicesCatalog.iconPickerUpload,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconPickerUpload
      ),
      iconPickerUploading: asString(
        adminServicesCatalog.iconPickerUploading,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconPickerUploading
      ),
      iconPickerCustomHint: asString(
        adminServicesCatalog.iconPickerCustomHint,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconPickerCustomHint
      ),
      iconPickerPreview: asString(
        adminServicesCatalog.iconPickerPreview,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconPickerPreview
      ),
      iconPickerUnknownKeyHint: asString(
        adminServicesCatalog.iconPickerUnknownKeyHint,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.iconPickerUnknownKeyHint
      ),
      domainesSearchPlaceholder: asString(
        adminServicesCatalog.domainesSearchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domainesSearchPlaceholder
      ),
      domainesAddButton: asString(
        adminServicesCatalog.domainesAddButton,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domainesAddButton
      ),
      colStatut: asString(
        adminServicesCatalog.colStatut,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colStatut
      ),
      colDateCreation: asString(
        adminServicesCatalog.colDateCreation,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colDateCreation
      ),
      colActions: asString(
        adminServicesCatalog.colActions,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colActions
      ),
      statutActive: asString(
        adminServicesCatalog.statutActive,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.statutActive
      ),
      statutInactive: asString(
        adminServicesCatalog.statutInactive,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.statutInactive
      ),
      actionEdit: asString(
        adminServicesCatalog.actionEdit,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.actionEdit
      ),
      actionDelete: asString(
        adminServicesCatalog.actionDelete,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.actionDelete
      ),
      domainesMockEditMessage: asString(
        adminServicesCatalog.domainesMockEditMessage,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domainesMockEditMessage
      ),
      domainesMockDeleteConfirm: asString(
        adminServicesCatalog.domainesMockDeleteConfirm,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domainesMockDeleteConfirm
      ),
      domainesToolbarFilter: asString(
        adminServicesCatalog.domainesToolbarFilter,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domainesToolbarFilter
      ),
      domainesEmpty: asString(
        adminServicesCatalog.domainesEmpty,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domainesEmpty
      ),
      servicesSearchPlaceholder: asString(
        adminServicesCatalog.servicesSearchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.servicesSearchPlaceholder
      ),
      servicesAddButton: asString(
        adminServicesCatalog.servicesAddButton,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.servicesAddButton
      ),
      servicesMockEditMessage: asString(
        adminServicesCatalog.servicesMockEditMessage,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.servicesMockEditMessage
      ),
      servicesMockDeleteConfirm: asString(
        adminServicesCatalog.servicesMockDeleteConfirm,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.servicesMockDeleteConfirm
      ),
      servicesToolbarFilter: asString(
        adminServicesCatalog.servicesToolbarFilter,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.servicesToolbarFilter
      ),
      servicesEmpty: asString(
        adminServicesCatalog.servicesEmpty,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.servicesEmpty
      ),
      colType: asString(
        adminServicesCatalog.colType,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.colType
      ),
      caracteristiqueTypeService: asString(
        adminServicesCatalog.caracteristiqueTypeService,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiqueTypeService
      ),
      caracteristiqueTypeEstablishment: asString(
        adminServicesCatalog.caracteristiqueTypeEstablishment,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiqueTypeEstablishment
      ),
      caracteristiqueTypeGeneral: asString(
        adminServicesCatalog.caracteristiqueTypeGeneral,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiqueTypeGeneral
      ),
      caracteristiquesSearchPlaceholder: asString(
        adminServicesCatalog.caracteristiquesSearchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiquesSearchPlaceholder
      ),
      caracteristiquesAddButton: asString(
        adminServicesCatalog.caracteristiquesAddButton,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiquesAddButton
      ),
      caracteristiquesMockEditMessage: asString(
        adminServicesCatalog.caracteristiquesMockEditMessage,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiquesMockEditMessage
      ),
      caracteristiquesMockDeleteConfirm: asString(
        adminServicesCatalog.caracteristiquesMockDeleteConfirm,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiquesMockDeleteConfirm
      ),
      caracteristiquesToolbarFilter: asString(
        adminServicesCatalog.caracteristiquesToolbarFilter,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiquesToolbarFilter
      ),
      caracteristiquesEmpty: asString(
        adminServicesCatalog.caracteristiquesEmpty,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiquesEmpty
      ),
      deleteConfirmTitle: asString(
        adminServicesCatalog.deleteConfirmTitle,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.deleteConfirmTitle
      ),
      deleteConfirmDescription: asString(
        adminServicesCatalog.deleteConfirmDescription,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.deleteConfirmDescription
      ),
      deleteConfirmOk: asString(
        adminServicesCatalog.deleteConfirmOk,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.deleteConfirmOk
      ),
      deleteConfirmCancel: asString(
        adminServicesCatalog.deleteConfirmCancel,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.deleteConfirmCancel
      ),
      loadingList: asString(
        adminServicesCatalog.loadingList,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.loadingList
      ),
      loadErrorList: asString(
        adminServicesCatalog.loadErrorList,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.loadErrorList
      ),
      formCancel: asString(
        adminServicesCatalog.formCancel,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.formCancel
      ),
      formSave: asString(
        adminServicesCatalog.formSave,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.formSave
      ),
      selectPlaceholder: asString(
        adminServicesCatalog.selectPlaceholder,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.selectPlaceholder
      ),
      domaineModalCreate: asString(
        adminServicesCatalog.domaineModalCreate,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domaineModalCreate
      ),
      domaineModalEdit: asString(
        adminServicesCatalog.domaineModalEdit,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.domaineModalEdit
      ),
      serviceModalCreate: asString(
        adminServicesCatalog.serviceModalCreate,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.serviceModalCreate
      ),
      serviceModalEdit: asString(
        adminServicesCatalog.serviceModalEdit,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.serviceModalEdit
      ),
      caracteristiqueModalCreate: asString(
        adminServicesCatalog.caracteristiqueModalCreate,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiqueModalCreate
      ),
      caracteristiqueModalEdit: asString(
        adminServicesCatalog.caracteristiqueModalEdit,
        DEFAULT_COMMON_DICTIONARY.adminServicesCatalog.caracteristiqueModalEdit
      ),
    },
    dashboardStats: {
      pageIntro: asString(
        dashboardStats.pageIntro,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.pageIntro
      ),
      sectionTitle: asString(
        dashboardStats.sectionTitle,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.sectionTitle
      ),
      sectionLead: asString(
        dashboardStats.sectionLead,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.sectionLead
      ),
      kpiReservations: asString(
        dashboardStats.kpiReservations,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.kpiReservations
      ),
      kpiFavorites: asString(
        dashboardStats.kpiFavorites,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.kpiFavorites
      ),
      kpiSearches: asString(
        dashboardStats.kpiSearches,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.kpiSearches
      ),
      chartByCategory: asString(
        dashboardStats.chartByCategory,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.chartByCategory
      ),
      chartActivity: asString(
        dashboardStats.chartActivity,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.chartActivity
      ),
      chartDistribution: asString(
        dashboardStats.chartDistribution,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.chartDistribution
      ),
      mockNote: asString(
        dashboardStats.mockNote,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.mockNote
      ),
      tooltipValue: asString(
        dashboardStats.tooltipValue,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.tooltipValue
      ),
      categoryRestaurants: asString(
        dashboardStats.categoryRestaurants,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.categoryRestaurants
      ),
      categoryLodging: asString(
        dashboardStats.categoryLodging,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.categoryLodging
      ),
      categoryTransport: asString(
        dashboardStats.categoryTransport,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.categoryTransport
      ),
      categoryWellness: asString(
        dashboardStats.categoryWellness,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.categoryWellness
      ),
      pieReservations: asString(
        dashboardStats.pieReservations,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.pieReservations
      ),
      pieFavorites: asString(
        dashboardStats.pieFavorites,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.pieFavorites
      ),
      pieMessages: asString(
        dashboardStats.pieMessages,
        DEFAULT_COMMON_DICTIONARY.dashboardStats.pieMessages
      ),
    },
    adminStats: {
      pageIntro: asString(
        adminStats.pageIntro,
        DEFAULT_COMMON_DICTIONARY.adminStats.pageIntro
      ),
      sectionTitle: asString(
        adminStats.sectionTitle,
        DEFAULT_COMMON_DICTIONARY.adminStats.sectionTitle
      ),
      sectionLead: asString(
        adminStats.sectionLead,
        DEFAULT_COMMON_DICTIONARY.adminStats.sectionLead
      ),
      kpiUsers: asString(adminStats.kpiUsers, DEFAULT_COMMON_DICTIONARY.adminStats.kpiUsers),
      kpiEstablishments: asString(
        adminStats.kpiEstablishments,
        DEFAULT_COMMON_DICTIONARY.adminStats.kpiEstablishments
      ),
      kpiMonthlyBookings: asString(
        adminStats.kpiMonthlyBookings,
        DEFAULT_COMMON_DICTIONARY.adminStats.kpiMonthlyBookings
      ),
      chartServicesByType: asString(
        adminStats.chartServicesByType,
        DEFAULT_COMMON_DICTIONARY.adminStats.chartServicesByType
      ),
      chartVolumeTrend: asString(
        adminStats.chartVolumeTrend,
        DEFAULT_COMMON_DICTIONARY.adminStats.chartVolumeTrend
      ),
      chartTrafficMix: asString(
        adminStats.chartTrafficMix,
        DEFAULT_COMMON_DICTIONARY.adminStats.chartTrafficMix
      ),
      mockNote: asString(adminStats.mockNote, DEFAULT_COMMON_DICTIONARY.adminStats.mockNote),
      tooltipValue: asString(
        adminStats.tooltipValue,
        DEFAULT_COMMON_DICTIONARY.adminStats.tooltipValue
      ),
      serviceLodging: asString(
        adminStats.serviceLodging,
        DEFAULT_COMMON_DICTIONARY.adminStats.serviceLodging
      ),
      serviceDining: asString(
        adminStats.serviceDining,
        DEFAULT_COMMON_DICTIONARY.adminStats.serviceDining
      ),
      serviceLeisure: asString(
        adminStats.serviceLeisure,
        DEFAULT_COMMON_DICTIONARY.adminStats.serviceLeisure
      ),
      serviceMobility: asString(
        adminStats.serviceMobility,
        DEFAULT_COMMON_DICTIONARY.adminStats.serviceMobility
      ),
      pieUsers: asString(adminStats.pieUsers, DEFAULT_COMMON_DICTIONARY.adminStats.pieUsers),
      pieBookings: asString(
        adminStats.pieBookings,
        DEFAULT_COMMON_DICTIONARY.adminStats.pieBookings
      ),
      pieListings: asString(
        adminStats.pieListings,
        DEFAULT_COMMON_DICTIONARY.adminStats.pieListings
      ),
      kpiProviders: asString(
        adminStats.kpiProviders,
        DEFAULT_COMMON_DICTIONARY.adminStats.kpiProviders
      ),
      kpiEstablishmentServices: asString(
        adminStats.kpiEstablishmentServices,
        DEFAULT_COMMON_DICTIONARY.adminStats.kpiEstablishmentServices
      ),
      loading: asString(adminStats.loading, DEFAULT_COMMON_DICTIONARY.adminStats.loading),
      loadError: asString(adminStats.loadError, DEFAULT_COMMON_DICTIONARY.adminStats.loadError),
      retry: asString(adminStats.retry, DEFAULT_COMMON_DICTIONARY.adminStats.retry),
      recentSectionTitle: asString(
        adminStats.recentSectionTitle,
        DEFAULT_COMMON_DICTIONARY.adminStats.recentSectionTitle
      ),
      colName: asString(adminStats.colName, DEFAULT_COMMON_DICTIONARY.adminStats.colName),
      colEmail: asString(adminStats.colEmail, DEFAULT_COMMON_DICTIONARY.adminStats.colEmail),
      colCity: asString(adminStats.colCity, DEFAULT_COMMON_DICTIONARY.adminStats.colCity),
      colDomain: asString(adminStats.colDomain, DEFAULT_COMMON_DICTIONARY.adminStats.colDomain),
      colService: asString(adminStats.colService, DEFAULT_COMMON_DICTIONARY.adminStats.colService),
      colEstablishment: asString(
        adminStats.colEstablishment,
        DEFAULT_COMMON_DICTIONARY.adminStats.colEstablishment
      ),
      colActive: asString(adminStats.colActive, DEFAULT_COMMON_DICTIONARY.adminStats.colActive),
      colDate: asString(adminStats.colDate, DEFAULT_COMMON_DICTIONARY.adminStats.colDate),
      colPrice: asString(adminStats.colPrice, DEFAULT_COMMON_DICTIONARY.adminStats.colPrice),
      emptyState: asString(adminStats.emptyState, DEFAULT_COMMON_DICTIONARY.adminStats.emptyState),
    },
    providerSidebar: {
      title: asString(
        providerSidebar.title,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.title
      ),
      sectionGeneral: asString(
        providerSidebar.sectionGeneral,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.sectionGeneral
      ),
      sectionBusiness: asString(
        providerSidebar.sectionBusiness,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.sectionBusiness
      ),
      dashboard: asString(
        providerSidebar.dashboard,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.dashboard
      ),
      establishments: asString(
        providerSidebar.establishments,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.establishments
      ),
      establishmentServices: asString(
        providerSidebar.establishmentServices,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.establishmentServices
      ),
      caracteristiques: asString(
        providerSidebar.caracteristiques,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.caracteristiques
      ),
      medias: asString(
        providerSidebar.medias,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.medias
      ),
      statistics: asString(
        providerSidebar.statistics,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.statistics
      ),
      profile: asString(
        providerSidebar.profile,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.profile
      ),
      logout: asString(
        providerSidebar.logout,
        DEFAULT_COMMON_DICTIONARY.providerSidebar.logout
      ),
    },
    providerDashboard: {
      pageTitle: asString(
        providerDashboard.pageTitle,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.pageTitle
      ),
      welcomeTitle: asString(
        providerDashboard.welcomeTitle,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.welcomeTitle
      ),
      welcomeLead: asString(
        providerDashboard.welcomeLead,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.welcomeLead
      ),
      statsSectionTitle: asString(
        providerDashboard.statsSectionTitle,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.statsSectionTitle
      ),
      cardEstablishments: asString(
        providerDashboard.cardEstablishments,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardEstablishments
      ),
      cardEstablishmentsHint: asString(
        providerDashboard.cardEstablishmentsHint,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardEstablishmentsHint
      ),
      cardActiveServices: asString(
        providerDashboard.cardActiveServices,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardActiveServices
      ),
      cardActiveServicesHint: asString(
        providerDashboard.cardActiveServicesHint,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardActiveServicesHint
      ),
      cardCaracteristiques: asString(
        providerDashboard.cardCaracteristiques,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardCaracteristiques
      ),
      cardCaracteristiquesHint: asString(
        providerDashboard.cardCaracteristiquesHint,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardCaracteristiquesHint
      ),
      cardReservations: asString(
        providerDashboard.cardReservations,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardReservations
      ),
      cardReservationsSoon: asString(
        providerDashboard.cardReservationsSoon,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardReservationsSoon
      ),
      cardReviews: asString(
        providerDashboard.cardReviews,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardReviews
      ),
      cardReviewsSoon: asString(
        providerDashboard.cardReviewsSoon,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.cardReviewsSoon
      ),
      recentTitle: asString(
        providerDashboard.recentTitle,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.recentTitle
      ),
      recentEmpty: asString(
        providerDashboard.recentEmpty,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.recentEmpty
      ),
      quickActionsTitle: asString(
        providerDashboard.quickActionsTitle,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.quickActionsTitle
      ),
      actionEstablishments: asString(
        providerDashboard.actionEstablishments,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.actionEstablishments
      ),
      actionServices: asString(
        providerDashboard.actionServices,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.actionServices
      ),
      actionStatistics: asString(
        providerDashboard.actionStatistics,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.actionStatistics
      ),
      actionProfile: asString(
        providerDashboard.actionProfile,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.actionProfile
      ),
      mockDataNote: asString(
        providerDashboard.mockDataNote,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.mockDataNote
      ),
      reservationStatus: asString(
        providerDashboard.reservationStatus,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.reservationStatus
      ),
      reviewRating: asString(
        providerDashboard.reviewRating,
        DEFAULT_COMMON_DICTIONARY.providerDashboard.reviewRating
      ),
    },
    providerEtablissements: {
      pageTitle: asString(
        providerEtablissements.pageTitle,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.pageTitle
      ),
      pageDescription: asString(
        providerEtablissements.pageDescription,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.pageDescription
      ),
      addButton: asString(
        providerEtablissements.addButton,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.addButton
      ),
      colNom: asString(
        providerEtablissements.colNom,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.colNom
      ),
      colVille: asString(
        providerEtablissements.colVille,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.colVille
      ),
      colQuartier: asString(
        providerEtablissements.colQuartier,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.colQuartier
      ),
      colStatut: asString(
        providerEtablissements.colStatut,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.colStatut
      ),
      colCreated: asString(
        providerEtablissements.colCreated,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.colCreated
      ),
      colActions: asString(
        providerEtablissements.colActions,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.colActions
      ),
      statutActive: asString(
        providerEtablissements.statutActive,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.statutActive
      ),
      statutInactive: asString(
        providerEtablissements.statutInactive,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.statutInactive
      ),
      empty: asString(
        providerEtablissements.empty,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.empty
      ),
      loadError: asString(
        providerEtablissements.loadError,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.loadError
      ),
      retry: asString(
        providerEtablissements.retry,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.retry
      ),
      loading: asString(
        providerEtablissements.loading,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.loading
      ),
      formCreateTitle: asString(
        providerEtablissements.formCreateTitle,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formCreateTitle
      ),
      formEditTitle: asString(
        providerEtablissements.formEditTitle,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formEditTitle
      ),
      formNom: asString(
        providerEtablissements.formNom,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formNom
      ),
      formAdresse: asString(
        providerEtablissements.formAdresse,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formAdresse
      ),
      formDescription: asString(
        providerEtablissements.formDescription,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formDescription
      ),
      formTelephone: asString(
        providerEtablissements.formTelephone,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formTelephone
      ),
      formEmail: asString(
        providerEtablissements.formEmail,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formEmail
      ),
      formVille: asString(
        providerEtablissements.formVille,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formVille
      ),
      formQuartier: asString(
        providerEtablissements.formQuartier,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formQuartier
      ),
      formQuartierNeedVille: asString(
        providerEtablissements.formQuartierNeedVille,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formQuartierNeedVille
      ),
      formCancel: asString(
        providerEtablissements.formCancel,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formCancel
      ),
      formSave: asString(
        providerEtablissements.formSave,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formSave
      ),
      selectVille: asString(
        providerEtablissements.selectVille,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.selectVille
      ),
      selectQuartier: asString(
        providerEtablissements.selectQuartier,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.selectQuartier
      ),
      actionEdit: asString(
        providerEtablissements.actionEdit,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.actionEdit
      ),
      saveError: asString(
        providerEtablissements.saveError,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.saveError
      ),
      statusError: asString(
        providerEtablissements.statusError,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.statusError
      ),
      mainLocationTitle: asString(
        providerEtablissements.mainLocationTitle,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mainLocationTitle
      ),
      mainLocationHelp: asString(
        providerEtablissements.mainLocationHelp,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mainLocationHelp
      ),
      addressLineLabel: asString(
        providerEtablissements.addressLineLabel,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.addressLineLabel
      ),
      mapsLoading: asString(
        providerEtablissements.mapsLoading,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mapsLoading
      ),
      mapsLoadError: asString(
        providerEtablissements.mapsLoadError,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mapsLoadError
      ),
      mapsMissingKey: asString(
        providerEtablissements.mapsMissingKey,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mapsMissingKey
      ),
      mapsSearchPlaceholder: asString(
        providerEtablissements.mapsSearchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mapsSearchPlaceholder
      ),
      mapsUseTypedCoords: asString(
        providerEtablissements.mapsUseTypedCoords,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mapsUseTypedCoords
      ),
      mapsResetLocation: asString(
        providerEtablissements.mapsResetLocation,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mapsResetLocation
      ),
      mapsPickerHint: asString(
        providerEtablissements.mapsPickerHint,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.mapsPickerHint
      ),
      formLatitude: asString(
        providerEtablissements.formLatitude,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formLatitude
      ),
      formLongitude: asString(
        providerEtablissements.formLongitude,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.formLongitude
      ),
      validationLatRange: asString(
        providerEtablissements.validationLatRange,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.validationLatRange
      ),
      validationLngRange: asString(
        providerEtablissements.validationLngRange,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.validationLngRange
      ),
      validationLatLngPair: asString(
        providerEtablissements.validationLatLngPair,
        DEFAULT_COMMON_DICTIONARY.providerEtablissements.validationLatLngPair
      ),
    },
    providerMedias: {
      pageTitle: asString(
        providerMedias.pageTitle,
        DEFAULT_COMMON_DICTIONARY.providerMedias.pageTitle
      ),
      pageDescription: asString(
        providerMedias.pageDescription,
        DEFAULT_COMMON_DICTIONARY.providerMedias.pageDescription
      ),
      tabEstablishment: asString(
        providerMedias.tabEstablishment,
        DEFAULT_COMMON_DICTIONARY.providerMedias.tabEstablishment
      ),
      tabServiceLine: asString(
        providerMedias.tabServiceLine,
        DEFAULT_COMMON_DICTIONARY.providerMedias.tabServiceLine
      ),
      selectEtabLabel: asString(
        providerMedias.selectEtabLabel,
        DEFAULT_COMMON_DICTIONARY.providerMedias.selectEtabLabel
      ),
      selectEtabPlaceholder: asString(
        providerMedias.selectEtabPlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerMedias.selectEtabPlaceholder
      ),
      selectServiceLabel: asString(
        providerMedias.selectServiceLabel,
        DEFAULT_COMMON_DICTIONARY.providerMedias.selectServiceLabel
      ),
      selectServicePlaceholder: asString(
        providerMedias.selectServicePlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerMedias.selectServicePlaceholder
      ),
      filesLabel: asString(
        providerMedias.filesLabel,
        DEFAULT_COMMON_DICTIONARY.providerMedias.filesLabel
      ),
      filesHint: asString(
        providerMedias.filesHint,
        DEFAULT_COMMON_DICTIONARY.providerMedias.filesHint
      ),
      primaryCheckbox: asString(
        providerMedias.primaryCheckbox,
        DEFAULT_COMMON_DICTIONARY.providerMedias.primaryCheckbox
      ),
      uploadButton: asString(
        providerMedias.uploadButton,
        DEFAULT_COMMON_DICTIONARY.providerMedias.uploadButton
      ),
      uploadingLabel: asString(
        providerMedias.uploadingLabel,
        DEFAULT_COMMON_DICTIONARY.providerMedias.uploadingLabel
      ),
      cardUploadTitle: asString(
        providerMedias.cardUploadTitle,
        DEFAULT_COMMON_DICTIONARY.providerMedias.cardUploadTitle
      ),
      cardUploadDescription: asString(
        providerMedias.cardUploadDescription,
        DEFAULT_COMMON_DICTIONARY.providerMedias.cardUploadDescription
      ),
      sectionLibrary: asString(
        providerMedias.sectionLibrary,
        DEFAULT_COMMON_DICTIONARY.providerMedias.sectionLibrary
      ),
      sectionLibraryHint: asString(
        providerMedias.sectionLibraryHint,
        DEFAULT_COMMON_DICTIONARY.providerMedias.sectionLibraryHint
      ),
      emptyLibrary: asString(
        providerMedias.emptyLibrary,
        DEFAULT_COMMON_DICTIONARY.providerMedias.emptyLibrary
      ),
      loadListError: asString(
        providerMedias.loadListError,
        DEFAULT_COMMON_DICTIONARY.providerMedias.loadListError
      ),
      loadingList: asString(
        providerMedias.loadingList,
        DEFAULT_COMMON_DICTIONARY.providerMedias.loadingList
      ),
      loadingRefs: asString(
        providerMedias.loadingRefs,
        DEFAULT_COMMON_DICTIONARY.providerMedias.loadingRefs
      ),
      refsLoadError: asString(
        providerMedias.refsLoadError,
        DEFAULT_COMMON_DICTIONARY.providerMedias.refsLoadError
      ),
      retry: asString(providerMedias.retry, DEFAULT_COMMON_DICTIONARY.providerMedias.retry),
      selectParentFirst: asString(
        providerMedias.selectParentFirst,
        DEFAULT_COMMON_DICTIONARY.providerMedias.selectParentFirst
      ),
      deleteButton: asString(
        providerMedias.deleteButton,
        DEFAULT_COMMON_DICTIONARY.providerMedias.deleteButton
      ),
      deleteConfirm: asString(
        providerMedias.deleteConfirm,
        DEFAULT_COMMON_DICTIONARY.providerMedias.deleteConfirm
      ),
      badgePrimary: asString(
        providerMedias.badgePrimary,
        DEFAULT_COMMON_DICTIONARY.providerMedias.badgePrimary
      ),
      markPrimary: asString(
        providerMedias.markPrimary,
        DEFAULT_COMMON_DICTIONARY.providerMedias.markPrimary
      ),
      successMarkPrimary: asString(
        providerMedias.successMarkPrimary,
        DEFAULT_COMMON_DICTIONARY.providerMedias.successMarkPrimary
      ),
      successUpload: asString(
        providerMedias.successUpload,
        DEFAULT_COMMON_DICTIONARY.providerMedias.successUpload
      ),
      successDelete: asString(
        providerMedias.successDelete,
        DEFAULT_COMMON_DICTIONARY.providerMedias.successDelete
      ),
      errorGeneric: asString(
        providerMedias.errorGeneric,
        DEFAULT_COMMON_DICTIONARY.providerMedias.errorGeneric
      ),
      videoBadge: asString(
        providerMedias.videoBadge,
        DEFAULT_COMMON_DICTIONARY.providerMedias.videoBadge
      ),
    },
    providerEstablishmentServices: {
      pageTitle: asString(
        providerEstablishmentServices.pageTitle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.pageTitle
      ),
      pageDescription: asString(
        providerEstablishmentServices.pageDescription,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.pageDescription
      ),
      filterAll: asString(
        providerEstablishmentServices.filterAll,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.filterAll
      ),
      filterLabel: asString(
        providerEstablishmentServices.filterLabel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.filterLabel
      ),
      addButton: asString(
        providerEstablishmentServices.addButton,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.addButton
      ),
      colEtablissement: asString(
        providerEstablishmentServices.colEtablissement,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.colEtablissement
      ),
      colService: asString(
        providerEstablishmentServices.colService,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.colService
      ),
      colDomaine: asString(
        providerEstablishmentServices.colDomaine,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.colDomaine
      ),
      colStatut: asString(
        providerEstablishmentServices.colStatut,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.colStatut
      ),
      colPrix: asString(
        providerEstablishmentServices.colPrix,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.colPrix
      ),
      colCommentaire: asString(
        providerEstablishmentServices.colCommentaire,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.colCommentaire
      ),
      colDateCreation: asString(
        providerEstablishmentServices.colDateCreation,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.colDateCreation
      ),
      colActions: asString(
        providerEstablishmentServices.colActions,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.colActions
      ),
      statutEtabActif: asString(
        providerEstablishmentServices.statutEtabActif,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.statutEtabActif
      ),
      statutEtabInactif: asString(
        providerEstablishmentServices.statutEtabInactif,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.statutEtabInactif
      ),
      empty: asString(
        providerEstablishmentServices.empty,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.empty
      ),
      loadError: asString(
        providerEstablishmentServices.loadError,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.loadError
      ),
      loadErrorRefs: asString(
        providerEstablishmentServices.loadErrorRefs,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.loadErrorRefs
      ),
      retry: asString(
        providerEstablishmentServices.retry,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.retry
      ),
      loading: asString(
        providerEstablishmentServices.loading,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.loading
      ),
      formCreateTitle: asString(
        providerEstablishmentServices.formCreateTitle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formCreateTitle
      ),
      formEditTitle: asString(
        providerEstablishmentServices.formEditTitle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formEditTitle
      ),
      formEtablissement: asString(
        providerEstablishmentServices.formEtablissement,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formEtablissement
      ),
      formService: asString(
        providerEstablishmentServices.formService,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formService
      ),
      formPrix: asString(
        providerEstablishmentServices.formPrix,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formPrix
      ),
      formCommentaire: asString(
        providerEstablishmentServices.formCommentaire,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formCommentaire
      ),
      formCancel: asString(
        providerEstablishmentServices.formCancel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formCancel
      ),
      formSave: asString(
        providerEstablishmentServices.formSave,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formSave
      ),
      selectPlaceholder: asString(
        providerEstablishmentServices.selectPlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.selectPlaceholder
      ),
      serviceOptionDisabled: asString(
        providerEstablishmentServices.serviceOptionDisabled,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.serviceOptionDisabled
      ),
      prixPlaceholder: asString(
        providerEstablishmentServices.prixPlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.prixPlaceholder
      ),
      commentairePlaceholder: asString(
        providerEstablishmentServices.commentairePlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.commentairePlaceholder
      ),
      prixInvalid: asString(
        providerEstablishmentServices.prixInvalid,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.prixInvalid
      ),
      editHint: asString(
        providerEstablishmentServices.editHint,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.editHint
      ),
      actionEdit: asString(
        providerEstablishmentServices.actionEdit,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.actionEdit
      ),
      actionDelete: asString(
        providerEstablishmentServices.actionDelete,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.actionDelete
      ),
      deleteConfirmTitle: asString(
        providerEstablishmentServices.deleteConfirmTitle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.deleteConfirmTitle
      ),
      deleteConfirmDescription: asString(
        providerEstablishmentServices.deleteConfirmDescription,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.deleteConfirmDescription
      ),
      deleteConfirmOk: asString(
        providerEstablishmentServices.deleteConfirmOk,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.deleteConfirmOk
      ),
      deleteConfirmCancel: asString(
        providerEstablishmentServices.deleteConfirmCancel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.deleteConfirmCancel
      ),
      saveError: asString(
        providerEstablishmentServices.saveError,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.saveError
      ),
      deleteError: asString(
        providerEstablishmentServices.deleteError,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.deleteError
      ),
      deleteSuccess: asString(
        providerEstablishmentServices.deleteSuccess,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.deleteSuccess
      ),
      noServiceAvailable: asString(
        providerEstablishmentServices.noServiceAvailable,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.noServiceAvailable
      ),
      saveSuccess: asString(
        providerEstablishmentServices.saveSuccess,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.saveSuccess
      ),
      specificLocationToggle: asString(
        providerEstablishmentServices.specificLocationToggle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.specificLocationToggle
      ),
      specificLocationOffHelp: asString(
        providerEstablishmentServices.specificLocationOffHelp,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.specificLocationOffHelp
      ),
      formAdresse: asString(
        providerEstablishmentServices.formAdresse,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formAdresse
      ),
      formLatitude: asString(
        providerEstablishmentServices.formLatitude,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formLatitude
      ),
      formLongitude: asString(
        providerEstablishmentServices.formLongitude,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formLongitude
      ),
      formLocationLabel: asString(
        providerEstablishmentServices.formLocationLabel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formLocationLabel
      ),
      formLocationType: asString(
        providerEstablishmentServices.formLocationType,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.formLocationType
      ),
      addressLineLabel: asString(
        providerEstablishmentServices.addressLineLabel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.addressLineLabel
      ),
      mapsLoading: asString(
        providerEstablishmentServices.mapsLoading,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.mapsLoading
      ),
      mapsLoadError: asString(
        providerEstablishmentServices.mapsLoadError,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.mapsLoadError
      ),
      mapsMissingKey: asString(
        providerEstablishmentServices.mapsMissingKey,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.mapsMissingKey
      ),
      mapsSearchPlaceholder: asString(
        providerEstablishmentServices.mapsSearchPlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.mapsSearchPlaceholder
      ),
      mapsUseTypedCoords: asString(
        providerEstablishmentServices.mapsUseTypedCoords,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.mapsUseTypedCoords
      ),
      mapsResetLocation: asString(
        providerEstablishmentServices.mapsResetLocation,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.mapsResetLocation
      ),
      mapsPickerHint: asString(
        providerEstablishmentServices.mapsPickerHint,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.mapsPickerHint
      ),
      validationLatRange: asString(
        providerEstablishmentServices.validationLatRange,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.validationLatRange
      ),
      validationLngRange: asString(
        providerEstablishmentServices.validationLngRange,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.validationLngRange
      ),
      validationLatLngPair: asString(
        providerEstablishmentServices.validationLatLngPair,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServices.validationLatLngPair
      ),
    },
    providerEstablishmentServiceCaracteristiques: {
      pageTitle: asString(
        providerEstablishmentServiceCaracteristiques.pageTitle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.pageTitle
      ),
      pageDescription: asString(
        providerEstablishmentServiceCaracteristiques.pageDescription,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.pageDescription
      ),
      filterEtabAll: asString(
        providerEstablishmentServiceCaracteristiques.filterEtabAll,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.filterEtabAll
      ),
      filterEtabLabel: asString(
        providerEstablishmentServiceCaracteristiques.filterEtabLabel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.filterEtabLabel
      ),
      filterOfferAll: asString(
        providerEstablishmentServiceCaracteristiques.filterOfferAll,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.filterOfferAll
      ),
      filterOfferLabel: asString(
        providerEstablishmentServiceCaracteristiques.filterOfferLabel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.filterOfferLabel
      ),
      addButton: asString(
        providerEstablishmentServiceCaracteristiques.addButton,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.addButton
      ),
      colEtablissement: asString(
        providerEstablishmentServiceCaracteristiques.colEtablissement,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.colEtablissement
      ),
      colService: asString(
        providerEstablishmentServiceCaracteristiques.colService,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.colService
      ),
      colLibelle: asString(
        providerEstablishmentServiceCaracteristiques.colLibelle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.colLibelle
      ),
      colValeur: asString(
        providerEstablishmentServiceCaracteristiques.colValeur,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.colValeur
      ),
      colDateCreation: asString(
        providerEstablishmentServiceCaracteristiques.colDateCreation,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.colDateCreation
      ),
      colActions: asString(
        providerEstablishmentServiceCaracteristiques.colActions,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.colActions
      ),
      empty: asString(
        providerEstablishmentServiceCaracteristiques.empty,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.empty
      ),
      emptyNoOffers: asString(
        providerEstablishmentServiceCaracteristiques.emptyNoOffers,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.emptyNoOffers
      ),
      loadError: asString(
        providerEstablishmentServiceCaracteristiques.loadError,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.loadError
      ),
      loadErrorRefs: asString(
        providerEstablishmentServiceCaracteristiques.loadErrorRefs,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.loadErrorRefs
      ),
      retry: asString(
        providerEstablishmentServiceCaracteristiques.retry,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.retry
      ),
      loading: asString(
        providerEstablishmentServiceCaracteristiques.loading,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.loading
      ),
      formCreateTitle: asString(
        providerEstablishmentServiceCaracteristiques.formCreateTitle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formCreateTitle
      ),
      formEditTitle: asString(
        providerEstablishmentServiceCaracteristiques.formEditTitle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formEditTitle
      ),
      formOffer: asString(
        providerEstablishmentServiceCaracteristiques.formOffer,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formOffer
      ),
      formValeur: asString(
        providerEstablishmentServiceCaracteristiques.formValeur,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formValeur
      ),
      formLibelle: asString(
        providerEstablishmentServiceCaracteristiques.formLibelle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formLibelle
      ),
      formModeCatalog: asString(
        providerEstablishmentServiceCaracteristiques.formModeCatalog,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formModeCatalog
      ),
      formModeFree: asString(
        providerEstablishmentServiceCaracteristiques.formModeFree,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formModeFree
      ),
      formCatalogPick: asString(
        providerEstablishmentServiceCaracteristiques.formCatalogPick,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formCatalogPick
      ),
      formCancel: asString(
        providerEstablishmentServiceCaracteristiques.formCancel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formCancel
      ),
      formSave: asString(
        providerEstablishmentServiceCaracteristiques.formSave,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.formSave
      ),
      selectPlaceholder: asString(
        providerEstablishmentServiceCaracteristiques.selectPlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.selectPlaceholder
      ),
      valeurPlaceholder: asString(
        providerEstablishmentServiceCaracteristiques.valeurPlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.valeurPlaceholder
      ),
      libellePlaceholder: asString(
        providerEstablishmentServiceCaracteristiques.libellePlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.libellePlaceholder
      ),
      valeurRequired: asString(
        providerEstablishmentServiceCaracteristiques.valeurRequired,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.valeurRequired
      ),
      libelleRequired: asString(
        providerEstablishmentServiceCaracteristiques.libelleRequired,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.libelleRequired
      ),
      actionEdit: asString(
        providerEstablishmentServiceCaracteristiques.actionEdit,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.actionEdit
      ),
      actionDelete: asString(
        providerEstablishmentServiceCaracteristiques.actionDelete,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.actionDelete
      ),
      deleteConfirmTitle: asString(
        providerEstablishmentServiceCaracteristiques.deleteConfirmTitle,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.deleteConfirmTitle
      ),
      deleteConfirmDescription: asString(
        providerEstablishmentServiceCaracteristiques.deleteConfirmDescription,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.deleteConfirmDescription
      ),
      deleteConfirmOk: asString(
        providerEstablishmentServiceCaracteristiques.deleteConfirmOk,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.deleteConfirmOk
      ),
      deleteConfirmCancel: asString(
        providerEstablishmentServiceCaracteristiques.deleteConfirmCancel,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.deleteConfirmCancel
      ),
      saveError: asString(
        providerEstablishmentServiceCaracteristiques.saveError,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.saveError
      ),
      deleteError: asString(
        providerEstablishmentServiceCaracteristiques.deleteError,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.deleteError
      ),
      deleteSuccess: asString(
        providerEstablishmentServiceCaracteristiques.deleteSuccess,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.deleteSuccess
      ),
      conflictError: asString(
        providerEstablishmentServiceCaracteristiques.conflictError,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.conflictError
      ),
      editHint: asString(
        providerEstablishmentServiceCaracteristiques.editHint,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.editHint
      ),
      noCatalogLeft: asString(
        providerEstablishmentServiceCaracteristiques.noCatalogLeft,
        DEFAULT_COMMON_DICTIONARY.providerEstablishmentServiceCaracteristiques.noCatalogLeft
      ),
    },
    providerStatistics: {
      pageTitle: asString(
        providerStatistics.pageTitle,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.pageTitle
      ),
      pageDescription: asString(
        providerStatistics.pageDescription,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.pageDescription
      ),
      dataSourceNote: asString(
        providerStatistics.dataSourceNote,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.dataSourceNote
      ),
      generatedAt: asString(
        providerStatistics.generatedAt,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.generatedAt
      ),
      sectionKpis: asString(
        providerStatistics.sectionKpis,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.sectionKpis
      ),
      sectionByStatus: asString(
        providerStatistics.sectionByStatus,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.sectionByStatus
      ),
      sectionTrend: asString(
        providerStatistics.sectionTrend,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.sectionTrend
      ),
      trendPlaceholder: asString(
        providerStatistics.trendPlaceholder,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.trendPlaceholder
      ),
      chartEmpty: asString(
        providerStatistics.chartEmpty,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.chartEmpty
      ),
      sectionSummary: asString(
        providerStatistics.sectionSummary,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.sectionSummary
      ),
      summaryEstablishments: asString(
        providerStatistics.summaryEstablishments,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.summaryEstablishments
      ),
      sectionRecent: asString(
        providerStatistics.sectionRecent,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.sectionRecent
      ),
      recentEmpty: asString(
        providerStatistics.recentEmpty,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.recentEmpty
      ),
      sectionTopServices: asString(
        providerStatistics.sectionTopServices,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.sectionTopServices
      ),
      topServicesColService: asString(
        providerStatistics.topServicesColService,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.topServicesColService
      ),
      topServicesColCount: asString(
        providerStatistics.topServicesColCount,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.topServicesColCount
      ),
      extrasNote: asString(
        providerStatistics.extrasNote,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.extrasNote
      ),
      cardEstablishments: asString(
        providerStatistics.cardEstablishments,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardEstablishments
      ),
      cardEstablishmentsHint: asString(
        providerStatistics.cardEstablishmentsHint,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardEstablishmentsHint
      ),
      cardEstablishmentsActive: asString(
        providerStatistics.cardEstablishmentsActive,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardEstablishmentsActive
      ),
      cardEstablishmentsActiveHint: asString(
        providerStatistics.cardEstablishmentsActiveHint,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardEstablishmentsActiveHint
      ),
      cardServices: asString(
        providerStatistics.cardServices,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardServices
      ),
      cardServicesHint: asString(
        providerStatistics.cardServicesHint,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardServicesHint
      ),
      cardCaracteristiques: asString(
        providerStatistics.cardCaracteristiques,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardCaracteristiques
      ),
      cardCaracteristiquesHint: asString(
        providerStatistics.cardCaracteristiquesHint,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardCaracteristiquesHint
      ),
      cardReservations: asString(
        providerStatistics.cardReservations,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardReservations
      ),
      cardReservationsHint: asString(
        providerStatistics.cardReservationsHint,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardReservationsHint
      ),
      cardReviews: asString(
        providerStatistics.cardReviews,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardReviews
      ),
      cardReviewsHint: asString(
        providerStatistics.cardReviewsHint,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.cardReviewsHint
      ),
      statusDemandee: asString(
        providerStatistics.statusDemandee,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.statusDemandee
      ),
      statusConfirmee: asString(
        providerStatistics.statusConfirmee,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.statusConfirmee
      ),
      statusAnnulee: asString(
        providerStatistics.statusAnnulee,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.statusAnnulee
      ),
      statusTerminee: asString(
        providerStatistics.statusTerminee,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.statusTerminee
      ),
      reservationStatus: asString(
        providerStatistics.reservationStatus,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.reservationStatus
      ),
      reviewRating: asString(
        providerStatistics.reviewRating,
        DEFAULT_COMMON_DICTIONARY.providerStatistics.reviewRating
      ),
    },
    providerProfile: {
      pageTitle: asString(
        providerProfile.pageTitle,
        DEFAULT_COMMON_DICTIONARY.providerProfile.pageTitle
      ),
      pageDescription: asString(
        providerProfile.pageDescription,
        DEFAULT_COMMON_DICTIONARY.providerProfile.pageDescription
      ),
      cardTitle: asString(
        providerProfile.cardTitle,
        DEFAULT_COMMON_DICTIONARY.providerProfile.cardTitle
      ),
      cardDescription: asString(
        providerProfile.cardDescription,
        DEFAULT_COMMON_DICTIONARY.providerProfile.cardDescription
      ),
      fieldNom: asString(
        providerProfile.fieldNom,
        DEFAULT_COMMON_DICTIONARY.providerProfile.fieldNom
      ),
      fieldPrenom: asString(
        providerProfile.fieldPrenom,
        DEFAULT_COMMON_DICTIONARY.providerProfile.fieldPrenom
      ),
      fieldEmail: asString(
        providerProfile.fieldEmail,
        DEFAULT_COMMON_DICTIONARY.providerProfile.fieldEmail
      ),
      fieldTelephone: asString(
        providerProfile.fieldTelephone,
        DEFAULT_COMMON_DICTIONARY.providerProfile.fieldTelephone
      ),
      fieldAdresse: asString(
        providerProfile.fieldAdresse,
        DEFAULT_COMMON_DICTIONARY.providerProfile.fieldAdresse
      ),
      roleLabel: asString(
        providerProfile.roleLabel,
        DEFAULT_COMMON_DICTIONARY.providerProfile.roleLabel
      ),
      saveButton: asString(
        providerProfile.saveButton,
        DEFAULT_COMMON_DICTIONARY.providerProfile.saveButton
      ),
      savingButton: asString(
        providerProfile.savingButton,
        DEFAULT_COMMON_DICTIONARY.providerProfile.savingButton
      ),
      loadError: asString(
        providerProfile.loadError,
        DEFAULT_COMMON_DICTIONARY.providerProfile.loadError
      ),
      saveError: asString(
        providerProfile.saveError,
        DEFAULT_COMMON_DICTIONARY.providerProfile.saveError
      ),
      saveSuccess: asString(
        providerProfile.saveSuccess,
        DEFAULT_COMMON_DICTIONARY.providerProfile.saveSuccess
      ),
      retry: asString(providerProfile.retry, DEFAULT_COMMON_DICTIONARY.providerProfile.retry),
      loading: asString(
        providerProfile.loading,
        DEFAULT_COMMON_DICTIONARY.providerProfile.loading
      ),
      loginPrompt: asString(
        providerProfile.loginPrompt,
        DEFAULT_COMMON_DICTIONARY.providerProfile.loginPrompt
      ),
      goToLogin: asString(
        providerProfile.goToLogin,
        DEFAULT_COMMON_DICTIONARY.providerProfile.goToLogin
      ),
    },
  };
}

async function tryReadCommonFromBase(
  basePath: string,
  locale: Locale
): Promise<CommonDictionary | null> {
  try {
    const file = path.join(basePath, locale, "common.json");
    const raw = await readFile(file, "utf-8");
    return normalizeDictionary(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

async function readCommon(locale: Locale): Promise<CommonDictionary> {
  const bases = [
    path.join(process.cwd(), "public", "locales"),
    path.join(process.cwd(), "web", "public", "locales"),
  ];

  for (const base of bases) {
    const dictionary = await tryReadCommonFromBase(base, locale);
    if (dictionary) return dictionary;
  }

  if (locale !== defaultLocale) {
    return readCommon(defaultLocale);
  }

  return DEFAULT_COMMON_DICTIONARY;
}

async function loadDictionary(locale: string): Promise<CommonDictionary> {
  const safe = isLocale(locale) ? locale : defaultLocale;
  return readCommon(safe);
}

/**
 * Loads UI strings for a locale (server-only).
 * In production we cache lookups; in development we read fresh values.
 */
export const getDictionary =
  process.env.NODE_ENV === "production"
    ? cache(loadDictionary)
    : loadDictionary;
