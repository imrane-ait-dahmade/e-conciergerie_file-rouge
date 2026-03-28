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
    sectionLead: "Key figures and trends (sample data for now).",
    kpiUsers: "Registered users",
    kpiEstablishments: "Listed establishments",
    kpiMonthlyBookings: "Bookings this month",
    chartServicesByType: "Published services by type",
    chartVolumeTrend: "Transaction volume (12 periods)",
    chartTrafficMix: "Traffic mix",
    mockNote: "Illustrative data — connect your API later.",
    tooltipValue: "Value",
    serviceLodging: "Lodging",
    serviceDining: "Dining",
    serviceLeisure: "Leisure",
    serviceMobility: "Mobility",
    pieUsers: "User sessions",
    pieBookings: "Bookings",
    pieListings: "Listings views",
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
