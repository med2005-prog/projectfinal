export type Language = "en" | "fr" | "ar";

export const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.reportLost": "Report Lost",
    "nav.reportFound": "Report Found",
    "nav.myPosts": "My Posts",
    "nav.messages": "Messages",
    "nav.favorites": "Favorites",
    "nav.businesses": "Businesses",
    "nav.menu": "Menu",
    "nav.settings": "Settings",
    "common.back": "Back",

    
    // TopBar
    "topbar.search": "Search for lost or found items...",
    "topbar.profile": "Profile",
    "topbar.btnSearch": "Search",

    // Home Page Hero
    "hero.title": "Lost something? Found something?",
    "hero.subtitle": "Join the community helping each other reconnect with lost belongings in Agadir and beyond.",
    "hero.btnLost": "I Lost an Item",
    "hero.btnFound": "I Found an Item",

    // Home Feed
    "feed.title": "Recent Activity",
    "feed.filter.all": "All",
    "feed.filter.lost": "Lost",
    "feed.filter.found": "Found",
    "feed.loading": "Loading recent activity...",
    "feed.tryAgain": "Try again",
    "feed.empty": "No items found yet. Be the first to report something!",
    "feed.locationError": "Could not get your location. Please check permissions.",
    "feed.locationNotSupported": "Geolocation is not supported by your browser.",



    // Right Sidebar
    "sidebar.boost.title": "Boost Your Post",
    "sidebar.boost.desc": "Get your lost item seen by 10x more people in Agadir.",
    "sidebar.boost.btn": "Boost Now",
    "sidebar.howItWorks": "How it works",
    "sidebar.step1.title": "Report Item",
    "sidebar.step1.desc": "Post details and pictures of the item.",
    "sidebar.step2.title": "Smart Match",
    "sidebar.step2.desc": "Our AI connects lost & found reports automatically.",
    "sidebar.step3.title": "Reconnect",
    "sidebar.step3.desc": "Chat safely and get your item back.",
    "sidebar.categories": "Categories",
    "sidebar.viewAll": "View All Categories",

    // Categories
    "cat.electronics": "Electronics",
    "cat.wallets": "Wallets & Cards",
    "cat.keys": "Keys",
    "cat.pets": "Pets",
    "cat.bags": "Bags & Luggage",
    "cat.other": "Other",

    // Post Cards
    "post.lost": "LOST",
    "post.found": "FOUND",
    "post.boosted": "BOOSTED",
    "post.contact": "Contact",
    "post.deleteConfirm": "Are you sure you want to delete this post?",
    "post.edit": "Edit",
    "post.delete": "Delete",
    "post.featured": "FEATURED",
    "post.urgent": "URGENT",
    "post.potentialMatches": "Potential Matches",
    "post.safetyWarning": "Please be careful when dealing. Always meet in public places.",


    // Forms
    "form.lost.title": "Report a Lost Item",
    "form.lost.subtitle": "Provide details about what you lost to help our smart algorithm find a match.",
    "form.found.title": "Report a Found Item",
    "form.found.subtitle": "Thank you for helping! Provide details to help us match this item with its owner.",
    "form.whatLost": "What did you lose?",
    "form.whatFound": "What did you find?",
    "form.category": "Category",
    "form.selectCategory": "Select a category",
    "form.whenLost": "When did you lose it?",
    "form.whenFound": "When did you find it?",
    "form.whereLost": "Where did you lose it?",
    "form.whereFound": "Where did you find it?",
    "form.location": "Location",
    "form.details": "Additional Details",
    "form.status": "Status",
    "form.views": "Views",

    "form.image": "Upload Image",
    "form.submitLost": "Submit Report",
    "form.submitFound": "Submit Found Item",

    // Messages
    "msg.title": "Messages",
    "msg.search": "Search messages...",
    "msg.today": "Today",
    "msg.type": "Type your message...",

    // Boost Page
    "boost.title": "Boost Your Post",
    "boost.subtitle": "Get maximum visibility and find your item 10x faster.",
    "boost.plan.basic": "Basic Boost",
    "boost.plan.basic.desc": "Featured for 3 days",
    "boost.plan.pro": "Pro Boost",
    "boost.plan.pro.desc": "Featured for 7 days + Social Media push",
    "boost.choose": "Choose Plan",
    "boost.popular": "Most Popular",



    // Auth
    "auth.login.title": "Welcome Back",
    "auth.login.subtitle": "Sign in to manage your reports",
    "auth.register.title": "Join the Community",
    "auth.register.subtitle": "Create an account to help others",
    "auth.form.name": "Full Name",
    "auth.form.email": "Email Address",
    "auth.form.password": "Password",
    "auth.form.business": "Business Account",
    "auth.form.businessDesc": "For hotels, parks & cafes",
    "auth.form.signIn": "Sign In",
    "auth.form.signUp": "Create Account",
    "auth.form.or": "Or continue with",
    "auth.form.noAccount": "Don't have an account?",
    "auth.form.hasAccount": "Already have an account?",
    "auth.form.switchLogin": "Log In",
    "auth.form.switchSignup": "Sign Up",
    "auth.form.logout": "Sign Out",

    // Form Extras
    "form.success.title": "Reported Successfully!",
    "form.success.subtitle": "Our community is now looking for your item.",
    "form.placeholder.title": "e.g. Blue Backpack",
    "form.placeholder.location": "e.g. Marina Beach, Agadir",
    "form.placeholder.details": "Describe unique marks, serial numbers, etc.",
    "form.select": "Select",
    "form.trust": "Your contact info is safe. Only verified users can reach out.",



    // Coming Soon / 404
    "comingSoon.badge": "Coming Soon",
    "comingSoon.title": "Feature Under Development",
    "comingSoon.subtitle": "Our team is building something amazing! This feature will be ready very soon.",
    "comingSoon.features": "What's coming next",
    "comingSoon.feat1": "AI Smart Matching",
    "comingSoon.feat2": "Real-time Notifications",
    "comingSoon.feat3": "Advanced Filters",
    "comingSoon.notify": "Get notified when we launch",
    "comingSoon.notifyPlaceholder": "Enter your email",
    "comingSoon.notifyBtn": "Notify Me",
    "comingSoon.notifySuccess": "You're on the list!",
    "comingSoon.goHome": "Back to Home",

    // Businesses Page
    "biz.title": "Business Partners",
    "biz.subtitle": "Trusted locations in Agadir to report, drop off, and retrieve items safely.",
    "biz.hero.title": "Secure your space with our Trust Network",
    "biz.hero.btnRegister": "Register Your Space",
    "biz.hero.howItWorks": "How it Works",
    "biz.card1.title": "Verified Partners",
    "biz.card1.desc": "All participating businesses undergo a strict verification process.",
    "biz.card2.title": "Drop-off Points",
    "biz.card2.desc": "Convenient locations across Agadir to safely drop off or pick up items.",
    "biz.card3.title": "Management Tools",
    "biz.card3.desc": "Digital inventory management for high-traffic public spaces.",
    "biz.activePartners": "Active Partners in Agadir",
    "biz.viewMap": "View Map",
    "biz.contact": "Contact Office",
    "biz.empty": "No verified business partners found yet.",
    "biz.partner": "Partner",

    // Dashboard
    "dash.title": "Business Dashboard",
    "dash.overview": "Overview",

    "dash.managePosts": "Manage Posts",
    "dash.totalPosts": "Total Posts",
    "dash.totalViews": "Total Views",
    "dash.totalClicks": "Total Clicks",
    "dash.returnedItems": "Returned Items",
    "dash.recentPosts": "Recent Posts",
    "dash.postNew": "Post New Item",
    "dash.manageDesc": "Manage your business account and posts",
    "dash.accessDenied": "Access Denied",
    "dash.businessOnly": "This page is for business accounts only.",
    "dash.viewAll": "View All",
    "dash.noPosts": "No posts found yet.",

    // Call Interface
    "call.calling": "Calling...",
    "call.ended": "Call Ended",
    "call.mute": "Mute",
    "call.video": "Video",
    "call.speaker": "Speaker",
    "call.end": "End Call",
    "call.secure": "Secure Link",
    "call.you": "You",

    // Categories Page Extras
    "cat.title": "Browse Categories",
    "cat.subtitle": "Choose a category to find lost or reported items faster.",
    "cat.search": "Search for categories...",
    "cat.helpTitle": "Can't find a category?",
    "cat.helpDesc": "Our AI scans all reports, so even 'Other' items get matched.",

    "cat.foundCount": "items found",
    "cat.empty.title": "No results in {category}",
    "cat.empty.desc": "We couldn't find any lost or found reports in this category. Try adjusting your search or check back later.",

    // Notifications
    "notif.title": "Notifications",
    "notif.markRead": "Mark all as read",
    "notif.empty": "You've reached the end of your notifications.",
    "notif.subtitle": "Stay updated on your reports and matches.",

    // Settings
    "settings.profile": "Profile Settings",
    "settings.notifications": "Notifications",
    "settings.appearance": "Appearance",
    "settings.language": "Language",
    "settings.darkMode": "Dark Mode",
    "settings.editName": "Edit Name",
    "settings.email": "Email Address",
    "settings.phone": "Phone Number",
    "settings.push": "Push Notifications",
    "settings.emailUpdates": "Email Updates",
    "settings.matchingAlerts": "Matching Alerts",
    "settings.saveSuccess": "Settings saved successfully!",
    "settings.saveError": "Error saving settings",
    "settings.accountDeletion": "Account Deletion",

    "settings.deleteDesc": "Permanently remove all your reports and profile data.",
    "settings.deleteBtn": "Delete My Account",

    // Profile
    "profile.memberSince": "Member since",
    "profile.stats.posts": "Reports",
    "profile.stats.resolved": "Resolved",
    "profile.stats.rating": "Rating",
    "profile.stats.days": "Days Active",
    "profile.noActivity": "No activity found.",
    "profile.loginRequired": "Please log in to view your profile",

    // My Posts
    "myPosts.subtitle": "Manage your reports and boost visibility.",
    "myPosts.loading": "Loading your reports...",
    "myPosts.empty": "No active reports found",
    "myPosts.emptyDesc": "You haven't reported any lost or found items yet. Your active reports will appear here.",
    
    // AI Assistant
    "ai.name": "Fin Huwa Assistant",
    "ai.placeholder": "Type your message...",
    "ai.error": "System error occurred.",

    // Call
    "call.incoming.video": "Incoming Video Call...",
    "call.incoming.voice": "Incoming Voice Call...",
    "call.reject": "Reject",
    "call.answer": "Answer",

    // Misc
    "common.locating": "Locating...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.active": "Active",
    "common.resolved": "Resolved",
    "common.trustedPartner": "Trusted Partner",
    "common.sending": "Sending...",
    "common.voiceMessage": "Voice Message",
    "common.recordAudio": "Record Audio",
    "settings.subtitle": "Personalize your account and preferences.",
    "profile.recentActivity": "Recent Activity",
    "profile.location": "Agadir, Morocco",
    "msg.deleteConfirm": "Are you sure you want to delete this conversation?",
    "msg.deleteBtn": "Delete Conversation",
    "msg.sending": "Sending...",
    "edit.title": "Edit Post",
    "edit.save": "Save Changes",
    "fav.empty": "Your collection is empty",
    "fav.browse": "Browse Feed",
    "fav.loading": "Loading your favorites...",
    
    // Additional Boost
    "boost.activated": "Boost activated successfully! 🎉",
    "boost.canceled": "Payment was canceled.",
    "boost.heroTitle": "Boost Your Post & Recover Faster",
    "boost.monthly": "Monthly",
    "boost.yearly": "Yearly",
    "boost.save20": "Save 20%",
    "boost.dhPerYear": "DH / yr",
    "boost.dhPerMonth": "DH / mo",
    "boost.chooseToBoost": "Choose a post to boost",
    "boost.securePayment": "Secure Payment · Money Back Guarantee",

    // Business Page Extras
    "biz.activeCommunity": "Active Community Members",
    "biz.topContributors": "Top contributors who helped return items to their owners.",
    "biz.verifiedMember": "Verified Member",
    "biz.helps": "Helps",

    // Common Extras
    "common.agadirMorocco": "Agadir, Morocco",
    "common.agadir": "Agadir",
    "common.morocco": "Morocco",
    "common.failedImageUpload": "Failed to upload image",
    "common.clickToUpload": "Click to upload image",
    "common.pageNotFound": "Page Not Found",
    "common.goBack": "Go Back",
    "common.memberSinceShort": "Member since ",
    "common.actions": "Actions",
    "common.title": "Title",

    // Terms & Privacy
    "legal.terms.title": "Terms of Use",
    "legal.privacy.title": "Privacy Policy",
    "legal.terms.desc": "Please read these terms carefully before using Fin Huwa.",
    "legal.privacy.desc": "We value your privacy and protect your personal data.",
    "legal.lastUpdated": "Last Updated: May 2026"
  },
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.reportLost": "Déclarer Perdu",
    "nav.reportFound": "Déclarer Trouvé",
    "nav.myPosts": "Mes Annonces",
    "nav.messages": "Messages",
    "nav.favorites": "Favoris",
    "nav.businesses": "Entreprises",
    "nav.menu": "Menu",
    "nav.settings": "Paramètres",
    "common.back": "Retour",

    
    // TopBar
    "topbar.search": "Rechercher des objets perdus ou trouvés...",
    "topbar.profile": "Profil",
    "topbar.btnSearch": "Chercher",

    // Home Page Hero
    "hero.title": "Objet perdu ? Objet trouvé ?",
    "hero.subtitle": "Rejoignez la communauté pour aider chacun à retrouver ses affaires perdues à Agadir et au-delà.",
    "hero.btnLost": "J'ai perdu un objet",
    "hero.btnFound": "J'ai trouvé un objet",

    // Home Feed
    "feed.title": "Activité Récente",
    "feed.filter.all": "Tout",
    "feed.filter.lost": "Perdus",
    "feed.filter.found": "Trouvés",
    "feed.loading": "Chargement de l'activité récente...",
    "feed.tryAgain": "Réessayer",
    "feed.empty": "Aucun objet trouvé pour le moment. Soyez le premier à signaler quelque chose !",
    "feed.locationError": "Impossible d'obtenir votre position. Veuillez vérifier les autorisations.",
    "feed.locationNotSupported": "La géolocalisation n'est pas prise en charge par votre navigateur.",



    // Right Sidebar
    "sidebar.boost.title": "Booster votre annonce",
    "sidebar.boost.desc": "Faites voir votre objet perdu à 10x plus de personnes à Agadir.",
    "sidebar.boost.btn": "Booster",
    "sidebar.howItWorks": "Comment ça marche",
    "sidebar.step1.title": "Signaler l'objet",
    "sidebar.step1.desc": "Publiez les détails et les photos de l'objet.",
    "sidebar.step2.title": "Match Intelligent",
    "sidebar.step2.desc": "Notre IA connecte les objets perdus et trouvés automatiquement.",
    "sidebar.step3.title": "Retrouvailles",
    "sidebar.step3.desc": "Discutez en toute sécurité et récupérez votre objet.",
    "sidebar.categories": "Catégories",
    "sidebar.viewAll": "Voir Toutes les Catégories",

    // Categories
    "cat.electronics": "Électronique",
    "cat.wallets": "Portefeuilles & Cartes",
    "cat.keys": "Clés",
    "cat.pets": "Animaux",
    "cat.bags": "Sacs & Bagages",
    "cat.other": "Autre",

    // Post Cards
    "post.lost": "PERDU",
    "post.found": "TROUVÉ",
    "post.boosted": "SPONSORISÉ",
    "post.contact": "Contacter",
    "post.deleteConfirm": "Êtes-vous sûr de vouloir supprimer cette annonce ?",
    "post.edit": "Modifier",
    "post.delete": "Supprimer",
    "post.featured": "À LA UNE",
    "post.urgent": "URGENT",
    "post.potentialMatches": "Correspondances potentielles",
    "post.safetyWarning": "Soyez prudent lors de vos transactions. Rencontrez-vous toujours dans des lieux publics.",


    // Forms
    "form.lost.title": "Déclarer un Objet Perdu",
    "form.lost.subtitle": "Fournissez des détails sur ce que vous avez perdu pour aider notre algorithme à trouver une correspondance.",
    "form.found.title": "Déclarer un Objet Trouvé",
    "form.found.subtitle": "Merci pour votre aide ! Fournissez des détails pour nous aider à associer cet objet à son propriétaire.",
    "form.whatLost": "Qu'avez-vous perdu ?",
    "form.whatFound": "Qu'avez-vous trouvé ?",
    "form.category": "Catégorie",
    "form.selectCategory": "Sélectionner une catégorie",
    "form.whenLost": "Quand l'avez-vous perdu ?",
    "form.whenFound": "Quand l'avez-vous trouvé ?",
    "form.whereLost": "Où l'avez-vous perdu ?",
    "form.whereFound": "Où l'avez-vous trouvé ?",
    "form.location": "Emplacement",
    "form.details": "Détails supplémentaires",
    "form.status": "Statut",
    "form.views": "Vues",

    "form.image": "Télécharger une image",
    "form.submitLost": "Soumettre",
    "form.submitFound": "Soumettre l'objet",

    // Messages
    "msg.title": "Messages",
    "msg.search": "Rechercher...",
    "msg.today": "Aujourd'hui",
    "msg.type": "Écrivez votre message...",

    // Boost Page
    "boost.title": "Booster votre annonce",
    "boost.subtitle": "Obtenez une visibilité maximale et retrouvez votre objet 10x plus vite.",
    "boost.plan.basic": "Boost Basique",
    "boost.plan.basic.desc": "Mis en avant pendant 3 jours",
    "boost.plan.pro": "Boost Pro",
    "boost.plan.pro.desc": "Mis en avant 7 jours + Réseaux Sociaux",
    "boost.choose": "Choisir",
    "boost.popular": "Populaire",



    // Auth
    "auth.login.title": "Bon retour",
    "auth.login.subtitle": "Connectez-vous pour gérer vos annonces",
    "auth.register.title": "Rejoignez la communauté",
    "auth.register.subtitle": "Créez un compte pour aider les autres",
    "auth.form.name": "Nom complet",
    "auth.form.email": "Adresse email",
    "auth.form.password": "Mot de passe",
    "auth.form.business": "Compte Business",
    "auth.form.businessDesc": "Pour hôtels, parcs & cafés",
    "auth.form.signIn": "Se connecter",
    "auth.form.signUp": "Créer un compte",
    "auth.form.or": "Ou continuer avec",
    "auth.form.noAccount": "Vous n'avez pas de compte ?",
    "auth.form.hasAccount": "Vous avez déjà un compte ?",
    "auth.form.switchLogin": "Se connecter",
    "auth.form.switchSignup": "S'inscrire",
    "auth.form.logout": "Se déconnecter",

    // Form Extras
    "form.success.title": "Signalé avec succès !",
    "form.success.subtitle": "Notre communauté recherche maintenant votre objet.",
    "form.placeholder.title": "ex: Sac à dos bleu",
    "form.placeholder.location": "ex: Marina, Agadir",
    "form.placeholder.details": "Décrivez les marques uniques, numéros de série, etc.",
    "form.select": "Sélectionner",
    "form.trust": "Vos infos sont sécurisées. Seuls les utilisateurs vérifiés peuvent vous contacter.",



    // Coming Soon / 404
    "comingSoon.badge": "Bientôt disponible",
    "comingSoon.title": "Fonctionnalité en cours de développement",
    "comingSoon.subtitle": "Notre équipe prépare quelque chose d'incroyable ! Cette fonctionnalité sera prête très bientôt.",
    "comingSoon.features": "Ce qui arrive ensuite",
    "comingSoon.feat1": "Match Intelligent IA",
    "comingSoon.feat2": "Notifications en temps réel",
    "comingSoon.feat3": "Filtres avancés",
    "comingSoon.notify": "Soyez averti du lancement",
    "comingSoon.notifyPlaceholder": "Entrez votre email",
    "comingSoon.notifyBtn": "M'avertir",
    "comingSoon.notifySuccess": "Vous êtes sur la liste !",
    "comingSoon.goHome": "Retour à l'accueil",

    // Businesses Page
    "biz.title": "Partenaires Professionnels",
    "biz.subtitle": "Lieux de confiance à Agadir pour signaler, déposer et récupérer des objets en toute sécurité.",
    "biz.hero.title": "Sécurisez votre espace avec notre réseau de confiance",
    "biz.hero.btnRegister": "Enregistrez votre espace",
    "biz.hero.howItWorks": "Comment ça marche",
    "biz.card1.title": "Partenaires vérifiés",
    "biz.card1.desc": "Toutes les entreprises participantes sont soumises à un processus de vérification strict.",
    "biz.card2.title": "Points de dépôt",
    "biz.card2.desc": "Lieux pratiques à Agadir pour déposer ou récupérer des objets en toute sécurité.",
    "biz.card3.title": "Outils de gestion",
    "biz.card3.desc": "Gestion numérique des stocks pour les espaces publics à forte affluence.",
    "biz.activePartners": "Partenaires actifs à Agadir",
    "biz.viewMap": "Voir la carte",
    "biz.contact": "Contacter le bureau",
    "biz.empty": "Aucun partenaire professionnel vérifié trouvé pour le moment.",
    "biz.partner": "Partenaire",

    // Dashboard
    "dash.title": "Tableau de bord Business",
    "dash.overview": "Aperçu",

    "dash.managePosts": "Gérer les publications",
    "dash.totalPosts": "Total des publications",
    "dash.totalViews": "Vues totales",
    "dash.totalClicks": "Total des clics",
    "dash.returnedItems": "Objets retournés",
    "dash.recentPosts": "Publications récentes",
    "dash.postNew": "Publier un nouvel objet",
    "dash.manageDesc": "Gérez votre compte professionnel et vos publications",
    "dash.accessDenied": "Accès refusé",
    "dash.businessOnly": "Cette page est réservée aux comptes professionnels.",
    "dash.viewAll": "Voir tout",
    "dash.noPosts": "Aucune publication trouvée.",

    // Call Interface
    "call.calling": "Appel en cours...",
    "call.ended": "Appel terminé",
    "call.mute": "Muet",
    "call.video": "Vidéo",
    "call.speaker": "Haut-parleur",
    "call.end": "Raccrocher",
    "call.secure": "Lien Sécurisé",
    "call.you": "Vous",

    // Categories Page Extras
    "cat.title": "Parcourir les catégories",
    "cat.subtitle": "Choisissez une catégorie pour trouver plus rapidement les objets.",
    "cat.search": "Rechercher des catégories...",
    "cat.helpTitle": "Catégorie introuvable ?",
    "cat.helpDesc": "Notre IA scanne tous les rapports, même les objets 'Autres' sont mis en correspondance.",
    "cat.foundCount": "objets trouvés",
    "cat.empty.title": "Aucun résultat dans {category}",
    "cat.empty.desc": "Nous n'avons trouvé aucun signalement dans cette catégorie. Réessayez plus tard.",

    // Notifications
    "notif.title": "Notifications",
    "notif.markRead": "Tout marquer comme lu",
    "notif.empty": "Vous avez atteint la fin de vos notifications.",
    "notif.subtitle": "Restez informé de vos rapports et matchs.",

    // Settings
    "settings.profile": "Paramètres du profil",
    "settings.notifications": "Notifications",
    "settings.appearance": "Apparence",
    "settings.language": "Langue",
    "settings.darkMode": "Mode sombre",
    "settings.editName": "Modifier le nom",
    "settings.email": "Adresse e-mail",
    "settings.phone": "Numéro de téléphone",
    "settings.push": "Notifications Push",
    "settings.emailUpdates": "Mises à jour par e-mail",
    "settings.matchingAlerts": "Alertes de match",
    "settings.saveSuccess": "Paramètres enregistrés avec succès !",
    "settings.saveError": "Erreur lors de l'enregistrement",
    "settings.accountDeletion": "Suppression du compte",

    "settings.deleteDesc": "Supprimez définitivement tous vos rapports et données de profil.",
    "settings.deleteBtn": "Supprimer mon compte",

    // Profile
    "profile.memberSince": "Membre depuis",
    "profile.stats.posts": "Rapports",
    "profile.stats.resolved": "Résolus",
    "profile.stats.rating": "Note",
    "profile.stats.days": "Jours actifs",
    "profile.noActivity": "Aucune activité trouvée.",
    "profile.loginRequired": "Veuillez vous connecter pour voir votre profil",

    // My Posts
    "myPosts.subtitle": "Gérez vos rapports et boostez votre visibilité.",
    "myPosts.loading": "Chargement de vos rapports...",
    "myPosts.empty": "Aucun rapport actif trouvé",
    "myPosts.emptyDesc": "Vous n'avez pas encore signalé d'objets. Vos rapports actifs apparaîtront ici.",

    // AI Assistant
    "ai.name": "Assistant Fin Huwa",
    "ai.placeholder": "Écrivez votre message...",
    "ai.error": "Une erreur système est survenue.",

    // Call
    "call.incoming.video": "Appel Vidéo Entrant...",
    "call.incoming.voice": "Appel Vocal Entrant...",
    "call.reject": "Refuser",
    "call.answer": "Répondre",

    // Misc
    "common.locating": "Localisation...",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.active": "Actif",
    "common.resolved": "Résolu",
    "common.trustedPartner": "Partenaire de confiance",
    "common.sending": "Envoi...",
    "common.voiceMessage": "Message vocal",
    "common.recordAudio": "Enregistrer l'audio",
    "settings.subtitle": "Personnalisez votre compte et vos préférences.",
    "profile.recentActivity": "Activité récente",
    "profile.location": "Agadir, Maroc",
    "msg.deleteConfirm": "Êtes-vous sûr de vouloir supprimer cette conversation ?",
    "msg.deleteBtn": "Supprimer la conversation",
    "msg.sending": "Envoi...",
    "edit.title": "Modifier le message",
    "edit.save": "Enregistrer les modifications",
    "fav.empty": "Votre collection est vide",
    "fav.browse": "Parcourir le flux",
    "fav.loading": "Chargement de vos favoris...",

    // Additional Boost
    "boost.activated": "Boost activé avec succès ! 🎉",
    "boost.canceled": "Le paiement a été annulé.",
    "boost.heroTitle": "Boostez votre annonce et récupérez plus vite",
    "boost.monthly": "Mensuel",
    "boost.yearly": "Annuel",
    "boost.save20": "Économisez 20%",
    "boost.dhPerYear": "DH / an",
    "boost.dhPerMonth": "DH / mois",
    "boost.chooseToBoost": "Choisissez une annonce à booster",
    "boost.securePayment": "Paiement sécurisé · Garantie satisfait ou remboursé",

    // Business Page Extras
    "biz.activeCommunity": "Membres actifs de la communauté",
    "biz.topContributors": "Meilleurs contributeurs ayant aidé à rendre des objets.",
    "biz.verifiedMember": "Membre vérifié",
    "biz.helps": "Aides",

    // Common Extras
    "common.agadirMorocco": "Agadir, Maroc",
    "common.agadir": "Agadir",
    "common.morocco": "Maroc",
    "common.failedImageUpload": "Échec du téléchargement de l'image",
    "common.clickToUpload": "Cliquez pour télécharger l'image",
    "common.pageNotFound": "Page non trouvée",
    "common.goBack": "Retourner",
    "common.memberSinceShort": "Membre depuis ",
    "common.actions": "Actions",
    "common.title": "Titre",

    // Terms & Privacy
    "legal.terms.title": "Conditions d'utilisation",
    "legal.privacy.title": "Politique de confidentialité",
    "legal.terms.desc": "Veuillez lire attentivement ces conditions avant d'utiliser Fin Huwa.",
    "legal.privacy.desc": "Nous apprécions votre vie privée et protégeons vos données personnelles.",
    "legal.lastUpdated": "Dernière mise à jour : Mai 2026"
  },
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.reportLost": "الإبلاغ عن مفقود",
    "nav.reportFound": "الإبلاغ عن معثور عليه",
    "nav.myPosts": "إعلاناتي",
    "nav.messages": "الرسائل",
    "nav.favorites": "المفضلة",
    "nav.businesses": "الشركات",
    "nav.menu": "القائمة",
    "nav.settings": "الإعدادات",
    "common.back": "عودة",

    
    // TopBar
    "topbar.search": "ابحث عن الأشياء المفقودة أو المعثور عليها...",
    "topbar.profile": "الملف الشخصي",
    "topbar.btnSearch": "بحث",

    // Home Page Hero
    "hero.title": "أضعت شيئاً؟ وجدت شيئاً؟",
    "hero.subtitle": "انضم إلى المجتمع الذي يساعد بعضه البعض في استعادة الممتلكات المفقودة في أكادير والمناطق المجاورة.",
    "hero.btnLost": "أضعت شيئاً",
    "hero.btnFound": "وجدت شيئاً",

    // Home Feed
    "feed.title": "النشاط الأخير",
    "feed.filter.all": "الكل",
    "feed.filter.lost": "مفقود",
    "feed.filter.found": "معثور عليه",
    "feed.loading": "جاري تحميل النشاط الأخير...",
    "feed.tryAgain": "إعادة المحاولة",
    "feed.empty": "لا توجد بلاغات بعد. كن أول من يبلغ عن شيء!",
    "feed.locationError": "تعذر الحصول على موقعك. يرجى التحقق من الأذونات.",
    "feed.locationNotSupported": "تحديد الموقع الجغرافي غير مدعوم من قبل متصفحك.",



    // Right Sidebar
    "sidebar.boost.title": "روّج إعلانك",
    "sidebar.boost.desc": "اجعل غرضك المفقود يظهر لـ 10 أضعاف عدد الأشخاص في أكادير.",
    "sidebar.boost.btn": "روّج الآن",
    "sidebar.howItWorks": "كيف يعمل الموقع",
    "sidebar.step1.title": "أبلغ عن غرض",
    "sidebar.step1.desc": "انشر تفاصيل وصور الغرض.",
    "sidebar.step2.title": "مطابقة ذكية",
    "sidebar.step2.desc": "الذكاء الاصطناعي الخاص بنا يربط التقارير ببعضها تلقائياً.",
    "sidebar.step3.title": "تواصل",
    "sidebar.step3.desc": "تحدث بأمان واستعد غرضك.",
    "sidebar.categories": "التصنيفات",
    "sidebar.viewAll": "عرض جميع التصنيفات",

    // Categories
    "cat.electronics": "إلكترونيات",
    "cat.wallets": "محافظ وبطاقات",
    "cat.keys": "مفاتيح",
    "cat.pets": "حيوانات أليفة",
    "cat.bags": "حقائب وأمتعة",
    "cat.other": "أخرى",

    // Post Cards
    "post.lost": "مفقود",
    "post.found": "معثور عليه",
    "post.boosted": "مُموَّل",
    "post.contact": "تواصل",
    "post.deleteConfirm": "هل أنت متأكد من حذف هذا الإعلان؟",
    "post.edit": "تعديل",
    "post.delete": "حذف",
    "post.featured": "متميز",
    "post.urgent": "عاجل",
    "post.potentialMatches": "نتائج مطابقة",
    "post.safetyWarning": "يرجى الحذر عند التعامل. التقوا دائماً في أماكن عامة.",


    // Forms
    "form.lost.title": "الإبلاغ عن شيء مفقود",
    "form.lost.subtitle": "قدم تفاصيل عما فقدته لمساعدة خوارزميتنا الذكية في العثور على تطابق.",
    "form.found.title": "الإبلاغ عن شيء معثور عليه",
    "form.found.subtitle": "شكراً لمساعدتك! قدم تفاصيل لمساعدتنا في مطابقة هذا الغرض مع صاحبه.",
    "form.whatLost": "ماذا أضعت؟",
    "form.whatFound": "ماذا وجدت؟",
    "form.category": "التصنيف",
    "form.selectCategory": "اختر تصنيفاً",
    "form.whenLost": "متى أضعته؟",
    "form.whenFound": "متى وجدته؟",
    "form.whereLost": "أين أضعته؟",
    "form.whereFound": "أين وجدته؟",
    "form.location": "الموقع",
    "form.details": "تفاصيل إضافية",
    "form.status": "الحالة",
    "form.views": "المشاهدات",

    "form.image": "رفع صورة",
    "form.submitLost": "إرسال البلاغ",
    "form.submitFound": "إرسال الغرض",

    // Messages
    "msg.title": "الرسائل",
    "msg.search": "ابحث في الرسائل...",
    "msg.today": "اليوم",
    "msg.type": "اكتب رسالتك...",

    // Boost Page
    "boost.title": "روّج إعلانك",
    "boost.subtitle": "احصل على أقصى قدر من الرؤية واعثر على غرضك أسرع بـ 10 مرات.",
    "boost.plan.basic": "الترويج الأساسي",
    "boost.plan.basic.desc": "يظهر في المقدمة لمدة 3 أيام",
    "boost.plan.pro": "الترويج الاحترافي",
    "boost.plan.pro.desc": "يظهر في المقدمة 7 أيام + نشر في وسائل التواصل",
    "boost.choose": "اختر الباقة",
    "boost.popular": "الأكثر طلباً",



    // Auth
    "auth.login.title": "مرحباً بعودتك",
    "auth.login.subtitle": "سجل الدخول لإدارة بلاغاتك",
    "auth.register.title": "انضم إلى المجتمع",
    "auth.register.subtitle": "أنشئ حساباً لمساعدة الآخرين",
    "auth.form.name": "الاسم الكامل",
    "auth.form.email": "البريد الإلكتروني",
    "auth.form.password": "كلمة المرور",
    "auth.form.business": "حساب أعمال",
    "auth.form.businessDesc": "للفنادق، المتنزهات والمقاهي",
    "auth.form.signIn": "تسجيل الدخول",
    "auth.form.signUp": "إنشاء حساب",
    "auth.form.or": "أو المتابعة عبر",
    "auth.form.noAccount": "ليس لديك حساب؟",
    "auth.form.hasAccount": "لديك حساب بالفعل؟",
    "auth.form.switchLogin": "تسجيل الدخول",
    "auth.form.switchSignup": "التسجيل",
    "auth.form.logout": "تسجيل الخروج",

    // Form Extras
    "form.success.title": "تم الإبلاغ بنجاح!",
    "form.success.subtitle": "مجتمعنا يبحث الآن عن غرضك.",
    "form.placeholder.title": "مثال: محفظة سوداء",
    "form.placeholder.location": "مثال: مارينا، أكادير",
    "form.placeholder.details": "صف العلامات المميزة، الأرقام التسلسلية، إلخ.",
    "form.select": "اختر",
    "form.trust": "معلومات الاتصال الخاصة بك آمنة. يمكن للمستخدمين الموثقين فقط التواصل معك.",



    // Coming Soon / 404
    "comingSoon.badge": "قريباً",
    "comingSoon.title": "الميزة قيد الإنشاء",
    "comingSoon.subtitle": "فريقنا يبني شيئاً رائعاً! ستكون هذه الميزة جاهزة قريباً جداً.",
    "comingSoon.features": "ما الجديد القادم",
    "comingSoon.feat1": "مطابقة ذكية بالذكاء الاصطناعي",
    "comingSoon.feat2": "إشعارات فورية في الوقت الحقيقي",
    "comingSoon.feat3": "بحث متقدم وفلاتر",
    "comingSoon.notify": "أخبرني عند الاستعداد",
    "comingSoon.notifyPlaceholder": "بريدك الإلكتروني",
    "comingSoon.notifyBtn": "أخبرني",
    "comingSoon.notifySuccess": "تمت إضافتك للقائمة!",
    "comingSoon.goHome": "العودة للرئيسية",

    // Businesses Page
    "biz.title": "شركاء الأعمال",
    "biz.subtitle": "مواقع موثوقة في أكادير للإبلاغ عن المفقودات وتسليمها واستلامها بأمان.",
    "biz.hero.title": "قم بتأمين مساحتك من خلال شبكة الثقة الخاصة بنا",
    "biz.hero.btnRegister": "سجل مساحتك الخاصة",
    "biz.hero.howItWorks": "كيف يعمل الموقع",
    "biz.card1.title": "شركاء موثقون",
    "biz.card1.desc": "تخضع جميع الشركات المشاركة لعملية تحقق صارمة.",
    "biz.card2.title": "نقاط التسليم",
    "biz.card2.desc": "مواقع مريحة في جميع أنحاء أكادير لتسليم العناصر أو استلامها بأمان.",
    "biz.card3.title": "أدوات الإدارة",
    "biz.card3.desc": "إدارة المخزون الرقمي للأماكن العامة ذات الحركة المرورية العالية.",
    "biz.activePartners": "الشركاء النشطون في أكادير",
    "biz.viewMap": "عرض الخريطة",
    "biz.contact": "اتصل بالمكتب",
    "biz.empty": "لم يتم العثور على شركاء أعمال موثقين بعد.",
    "biz.partner": "شريك",

    // Dashboard
    "dash.title": "لوحة تحكم الأعمال",
    "dash.overview": "نظرة عامة",

    "dash.managePosts": "إدارة المنشورات",
    "dash.totalPosts": "إجمالي المنشورات",
    "dash.totalViews": "إجمالي المشاهدات",
    "dash.totalClicks": "إجمالي النقرات",
    "dash.returnedItems": "العناصر المستردة",
    "dash.recentPosts": "المنشورات الأخيرة",
    "dash.postNew": "إضافة إعلان جديد",
    "dash.manageDesc": "إدارة حسابك التجاري ومنشوراتك",
    "dash.accessDenied": "تم رفض الوصول",
    "dash.businessOnly": "هذه الصفحة مخصصة لحسابات الأعمال فقط.",
    "dash.viewAll": "عرض الكل",
    "dash.noPosts": "لا توجد منشورات بعد.",

    // Call Interface
    "call.calling": "جاري الاتصال...",
    "call.ended": "انتهت المكالمة",
    "call.mute": "كتم",
    "call.video": "فيديو",
    "call.speaker": "مكبر الصوت",
    "call.end": "إنهاء المكالمة",
    "call.secure": "اتصال آمن",
    "call.you": "أنت",

    // Categories Page Extras
    "cat.title": "تصفح التصنيفات",
    "cat.subtitle": "اختر فئة للعثور على العناصر المفقودة أو المبلغ عنها بشكل أسرع.",
    "cat.search": "ابحث في التصنيفات...",
    "cat.helpTitle": "لم تجد التصنيف؟",
    "cat.helpDesc": "يقوم ذكاؤنا الاصطناعي بمسح جميع التقارير، حتى العناصر في قسم 'أخرى' يتم مطابقتها.",
    "cat.foundCount": "عنصر تم العثور عليه",
    "cat.empty.title": "لا توجد نتائج في {category}",
    "cat.empty.desc": "لم نتمكن من العثور على أي بلاغات في هذا القسم. جرب تغيير البحث أو عد لاحقاً.",

    // Notifications
    "notif.title": "الإشعارات",
    "notif.markRead": "تحديد الكل كمقروء",
    "notif.empty": "لقد وصلت إلى نهاية إشعاراتك.",
    "notif.subtitle": "ابق على اطلاع بآخر البلاغات والمطابقات.",

    // Settings
    "settings.profile": "إعدادات الملف الشخصي",
    "settings.notifications": "الإشعارات",
    "settings.appearance": "المظهر",
    "settings.language": "اللغة",
    "settings.darkMode": "الوضع الليلي",
    "settings.editName": "تعديل الاسم",
    "settings.email": "البريد الإلكتروني",
    "settings.phone": "رقم الهاتف",
    "settings.push": "إشعارات التطبيق",
    "settings.emailUpdates": "تحديثات البريد",
    "settings.matchingAlerts": "تنبيهات المطابقة",
    "settings.saveSuccess": "تم حفظ الإعدادات بنجاح!",
    "settings.saveError": "خطأ في حفظ الإعدادات",
    "settings.accountDeletion": "حذف الحساب",

    "settings.deleteDesc": "حذف جميع بلاغاتك وبيانات ملفك الشخصي نهائياً.",
    "settings.deleteBtn": "حذف حسابي",

    // Profile
    "profile.memberSince": "عضو منذ",
    "profile.stats.posts": "البلاغات",
    "profile.stats.resolved": "تم حلها",
    "profile.stats.rating": "التقييم",
    "profile.stats.days": "أيام النشاط",
    "profile.noActivity": "لا يوجد نشاط.",
    "profile.loginRequired": "يرجى تسجيل الدخول لعرض ملفك الشخصي",

    // My Posts
    "myPosts.subtitle": "إدارة تقاريرك وزيادة فرص العثور على أغراضك.",
    "myPosts.loading": "جاري تحميل تقاريرك...",
    "myPosts.empty": "لا توجد بلاغات نشطة",
    "myPosts.emptyDesc": "لم تقم بالإبلاغ عن أي عناصر مفقودة أو معثور عليها بعد. بلاغاتك النشطة ستظهر هنا.",

    // AI Assistant
    "ai.name": "مساعد Fin Huwa",
    "ai.placeholder": "اكتب رسالتك...",
    "ai.error": "حدث خطأ في النظام.",

    // Call
    "call.incoming.video": "مكالمة فيديو واردة...",
    "call.incoming.voice": "مكالمة صوتية واردة...",
    "call.reject": "رفض",
    "call.answer": "رد",

    // Misc
    "common.locating": "جاري التحديد...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.active": "نشط",
    "common.resolved": "مكتمل",
    "common.trustedPartner": "شريك موثوق",
    "common.sending": "جاري الإرسال...",
    "common.voiceMessage": "رسالة صوتية",
    "common.recordAudio": "تسجيل صوتي",
    "settings.subtitle": "قم بتخصيص حسابك وتفضيلاتك.",
    "profile.recentActivity": "النشاط الأخير",
    "profile.location": "أكادير، المغرب",
    "msg.deleteConfirm": "هل أنت متأكد من حذف هذه المحادثة؟",
    "msg.deleteBtn": "حذف المحادثة",
    "msg.sending": "جاري الإرسال...",
    "edit.title": "تعديل المنشور",
    "edit.save": "حفظ التغييرات",
    "fav.empty": "مجموعتك فارغة",
    "fav.browse": "تصفح الإعلانات",
    "fav.loading": "جاري تحميل المفضلة...",

    // Additional Boost
    "boost.activated": "تم تفعيل الترويج بنجاح! 🎉",
    "boost.canceled": "تم إلغاء عملية الدفع.",
    "boost.heroTitle": "رَوّج إعلانك وضاعف فرص الاسترجاع",
    "boost.monthly": "شهري",
    "boost.yearly": "سنوي",
    "boost.save20": "وفر 20%",
    "boost.dhPerYear": "درهم / سنة",
    "boost.dhPerMonth": "درهم / شهر",
    "boost.chooseToBoost": "اختر إعلاناً لترويجه",
    "boost.securePayment": "دفع آمن · ضمان استرجاع",

    // Business Page Extras
    "biz.activeCommunity": "أعضاء المجتمع النشطون",
    "biz.topContributors": "مستخدمون متميزون ساعدوا في إرجاع الأغراض لأصحابها.",
    "biz.verifiedMember": "عضو موثق",
    "biz.helps": "مساعدة",

    // Common Extras
    "common.agadirMorocco": "أكادير، المغرب",
    "common.agadir": "أكادير",
    "common.morocco": "المغرب",
    "common.failedImageUpload": "فشل رفع الصورة",
    "common.clickToUpload": "اضغط لرفع الصورة",
    "common.pageNotFound": "الصفحة غير موجودة",
    "common.goBack": "العودة للخلف",
    "common.memberSinceShort": "عضو منذ ",
    "common.actions": "الإجراءات",
    "common.title": "العنوان",

    // Terms & Privacy
    "legal.terms.title": "شروط الاستخدام",
    "legal.privacy.title": "سياسة الخصوصية",
    "legal.terms.desc": "يرجى قراءة هذه الشروط بعناية قبل استخدام Fin Huwa.",
    "legal.privacy.desc": "نحن نقدر خصوصيتك ونحمي بياناتك الشخصية.",
    "legal.lastUpdated": "آخر تحديث: مايو 2026"
  }
};
