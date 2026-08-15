(function () {
  'use strict';
  var root = document.getElementById('ottrx-root');
  if (!root) return;
  var DATA_URL = root.getAttribute('data-data-url');

  function boot(DATA) {
  var FEEDBACK_EMAIL = DATA.meta.email;
  // ============================ i18n ============================
  // Interface strings and the section taxonomy are translated. Agency listings
  // (names, addresses, descriptions) stay exactly as the source published them;
  // in French mode every listing links to its official lignesantechamplain.ca
  // page instead, which is professionally translated and agency-maintained.
  var LANG = /^fr\b/i.test(root.getAttribute('lang') || document.documentElement.lang || '') ? 'fr' : 'en';
  var STR = {
    'eyebrow':      ['Ottawa Ontario Health Team · Primary Care Network', 'Équipe Santé Ontario d’Ottawa · Réseau de soins primaires'],
    'title':        ['Referral & Resource Directory', 'Répertoire des orientations et des ressources'],
    'sub':          ['Where to send a referral in Ottawa and the Champlain region, and the tools, forms and community supports that go with it. Built for family physicians and nurse practitioners.',
                     'Où adresser une demande de consultation à Ottawa et dans la région de Champlain, avec les outils, formulaires et soutiens communautaires qui vont avec. Conçu pour les médecins de famille et les infirmières praticiennes.'],
    'stamp':        ['Compiled 14 August 2026 · Service listings from Champlain Healthline, retrieved 4 August 2026 · Allied Health additions from the Resource list supplied 14 August 2026',
                     'Compilé le 14 août 2026 · Services tirés de Ligne Santé Champlain, extraits le 4 août 2026 · Ajouts en santé alliée provenant de la liste de ressources fournie le 14 août 2026'],
    'search.label': ['Search the directory', 'Rechercher dans le répertoire'],
    'search.ph':    ['Search everything — specialty, physician, clinic, form, phone number…',
                     'Tout rechercher — spécialité, médecin, clinique, formulaire, numéro de téléphone…'],
    'search.clear': ['Clear search', 'Effacer la recherche'],
    'feedback.cta': ['See anything that needs to change? Let us know', 'Quelque chose à corriger? Dites-le-nous'],
    'feedback.blurb': ['<strong>Found something wrong, missing or out of date?</strong> A bad fax number or a retired intake pathway delays a patient. Tell us and we will fix it — you do not need to be sure, just tell us what looked off.',
                     '<strong>Une erreur, un oubli ou une information périmée?</strong> Un mauvais numéro de télécopieur ou une voie d’accès abolie retarde un patient. Signalez-le et nous le corrigerons — nul besoin d’être certain, dites-nous simplement ce qui vous a semblé inexact.'],
    'verif':        ['<strong>Verification status.</strong> Referral routes, central intake contacts, forms and resource links were checked against official sources on 5 August 2026. The specialist roster has not been independently re-verified per physician; confirm current practice details before relying on an entry. Service listings are reproduced as the agencies published them to Champlain Healthline.',
                     '<strong>État de la vérification.</strong> Les voies d’orientation, les coordonnées des accueils centralisés, les formulaires et les liens vers les ressources ont été vérifiés auprès des sources officielles le 5 août 2026. La liste des spécialistes provient directement du tableau de bord de l’Équipe Santé Ontario de mai 2026 et n’a pas été revérifiée médecin par médecin. Les services sont reproduits tels que publiés par les organismes sur Ligne Santé Champlain.'],
    'verif2':       ['Healthcare phone numbers, fax lines and referral pathways change frequently. Confirm a fax number against the destination clinic before first use. Review this directory annually.',
                     'Les numéros de téléphone, les télécopieurs et les voies d’orientation changent souvent. Confirmez un numéro de télécopieur auprès de la clinique destinataire avant la première utilisation. Révisez ce répertoire chaque année.'],
    'fr.notice':    ['', 'Version française : l’interface, les voies d’orientation et les ressources sont traduites. Les fiches des organismes (noms, adresses, descriptions) restent telles que publiées à la source — le lien « Voir sur Ligne Santé » de chaque fiche ouvre la version française officielle. Les passages à portée médicolégale (formulaire 1, obligations de déclaration au MTO, WSIB) demeurent en anglais, à votre demande, afin d’éviter toute ambiguïté; ils sont signalés.'],
    'en.only':      ['', 'Conservé en anglais : texte à portée médicolégale.'],

    'tab.all':      ['Search everything', 'Tout rechercher'],
    'tab.referral': ['Referral routes', 'Voies d’orientation'],
    'tab.map':      ['Map', 'Carte'],
    'tab.spec':     ['Specialists', 'Spécialistes'],
    'tab.svc':      ['Clinics & services', 'Cliniques et services'],
    'tab.fax':      ['Fax lookup', 'Recherche par télécopieur'],
    'tab.forms':    ['Forms', 'Formulaires'],
    'tab.res':      ['Resources', 'Ressources'],
    'tab.quick':    ['Quick numbers', 'Numéros utiles'],

    'col.result':   ['Result', 'Résultat'],
    'col.section':  ['Section', 'Section'],
    'col.whatis':   ['What it is', 'De quoi il s’agit'],
    'col.details':  ['Details', 'Détails'],
    'col.physician':['Physician', 'Médecin'],
    'col.specialty':['Specialty', 'Spécialité'],
    'col.cpso':     ['CPSO', 'CPSO'],
    'col.site':     ['Practice site', 'Lieu de pratique'],
    'col.phone':    ['Phone', 'Téléphone'],
    'col.langs':    ['Languages', 'Langues'],
    'col.service':  ['Service', 'Service'],
    'col.cats':     ['Categories', 'Catégories'],
    'col.address':  ['Address', 'Adresse'],
    'col.contact':  ['Contact', 'Coordonnées'],
    'col.fees':     ['Fees / eligibility', 'Frais / admissibilité'],
    'col.fax':      ['Fax', 'Télécopieur'],
    'col.belongs':  ['Belongs to', 'Appartient à'],
    'col.source':   ['Source', 'Source'],
    'col.number':   ['Number', 'Numéro'],
    'col.notes':    ['Notes', 'Notes'],
    'col.program':  ['Program', 'Programme'],
    'col.scope':    ['Scope', 'Portée'],
    'col.holds':    ['Holds', 'Contient'],
    'col.area':     ['Area', 'Secteur'],
    'col.district': ['Postal district', 'Secteur postal'],
    'col.listings': ['Listings', 'Fiches'],

    'all.title':    ['Search everything', 'Tout rechercher'],
    'all.empty':    ['Type anything in the box above — a specialty, a physician, a clinic, a form, a postal code, a phone or fax number. This tab lists every match from every section in one table. The other tabs filter themselves as you type.',
                     'Tapez n’importe quoi dans la case ci-dessus — une spécialité, un médecin, une clinique, un formulaire, un code postal, un numéro de téléphone ou de télécopieur. Cet onglet regroupe tous les résultats de toutes les sections dans un seul tableau. Les autres onglets se filtrent au fur et à mesure.'],
    'all.what':     ['What lives where', 'Contenu de chaque section'],
    'all.none':     ['Nothing matches', 'Aucun résultat pour'],
    'all.hint':     ['Try a shorter or more general term — “cardio” rather than “cardiologist downtown”. Searching ignores accents and phone formatting, so “bruyere” and “613-737” both work.',
                     'Essayez un terme plus court ou plus général — « cardio » plutôt que « cardiologue au centre-ville ». La recherche ignore les accents et la ponctuation des numéros : « bruyere » et « 613-737 » fonctionnent tous les deux.'],
    'results':      ['results', 'résultats'],
    'result':       ['result', 'résultat'],
    'for':          ['for', 'pour'],
    'matching':     ['matching', 'correspondant à'],
    'showmore':     ['Show', 'Afficher'],
    'more':         ['more', 'de plus'],
    'remaining':    ['remaining', 'restants'],
    'nomatch':      ['No matches', 'Aucun résultat'],
    'nomatch.hint': ['Try a shorter term, a specialty name (“cardiology”), a clinic (“Bruyère”), or a phone prefix (“613-721”). You can also clear the search and use the category filter.',
                     'Essayez un terme plus court, un nom de spécialité (« cardiologie »), une clinique (« Bruyère ») ou un préfixe téléphonique (« 613-721 »). Vous pouvez aussi effacer la recherche et utiliser le filtre par catégorie.'],

    'map.title':    ['Map', 'Carte'],
    'map.blurb':    ['listings with public postal locations appear as district markers. Circle size reflects how many listings sit in that district.',
                     'fiches ayant un secteur postal public apparaissent sous forme de repères. La taille du cercle indique le nombre de fiches dans ce secteur.'],
    'map.searchable':['published listings are searchable here, including online and confidential-location resources.',
                     'fiches publiées peuvent être recherchées ici, y compris les ressources en ligne ou dont l’adresse est confidentielle.'],
    'map.warn':     ['<strong>Markers are approximate.</strong> Each circle sits at the centre of a postal district (the first three characters of the postal code), not at a street address. Use it to see roughly where care is concentrated — not to navigate. Every listing in the side panel has a <em>Directions</em> link that opens its full address in Google Maps, which is the number to trust.',
                     '<strong>Les repères sont approximatifs.</strong> Chaque cercle se trouve au centre d’un secteur postal (les trois premiers caractères du code postal), et non à une adresse civique. Servez-vous-en pour voir où les services se concentrent — pas pour vous y rendre. Chaque fiche du panneau latéral comporte un lien <em>Itinéraire</em> qui ouvre l’adresse complète dans Google Maps : c’est celle-là qui fait foi.'],
    'map.ph':       ['Filter by service provided — physiotherapy, food bank, cardiology, wound care…',
                     'Filtrer par service offert — physiothérapie, banque alimentaire, cardiologie, soins des plaies…'],
    'map.filterlabel': ['Filter the map by service provided', 'Filtrer la carte par service offert'],
    'map.clear':    ['Clear the map filter', 'Effacer le filtre de la carte'],
    'map.showgroup':['Show on the map', 'Afficher sur la carte'],
    'map.suggestaria': ['Matching services', 'Services correspondants'],
    'map.suggestcount': ['Matching services are available. Use the arrow keys to choose one.',
                         'Des services correspondants sont disponibles. Utilisez les flèches pour en choisir un.'],
    'map.searchall': ['All matching listings for', 'Toutes les fiches correspondant à'],
    'map.all':      ['All', 'Tout'],
    'map.other':    ['Resources & other', 'Ressources et autres'],
    'map.shown':    ['shown', 'affichées'],
    'map.loading':  ['Loading map…', 'Chargement de la carte…'],
    'map.loading2': ['If it does not appear, the area list will be shown instead.',
                     'Si elle ne s’affiche pas, la liste par secteur sera présentée à la place.'],
    'map.aria':     ['Map of Ottawa health services by postal district', 'Carte des services de santé d’Ottawa par secteur postal'],
    'map.sidearia': ['Listings in the selected area', 'Fiches du secteur sélectionné'],
    'map.choose':   ['Choose an area', 'Choisissez un secteur'],
    'map.choosehint':['Pick an area below, or click a circle on the map.', 'Choisissez un secteur ci-dessous ou cliquez sur un cercle de la carte.'],
    'map.showall':  ['Show all', 'Afficher les'],
    'map.unplaced': ['Online, confidential location, or no public postal code', 'En ligne, adresse confidentielle ou aucun secteur postal public'],
    'map.showunplaced':['Show records without a public map location', 'Afficher les fiches sans emplacement public sur la carte'],
    'map.allareas': ['All areas', 'Tous les secteurs'],
    'map.backareas':['← All areas', '← Tous les secteurs'],
    'map.backto':   ['← Back to areas', '← Retour aux secteurs'],
    'map.ottawa':   ['Ottawa', 'Ottawa'],
    'map.across':   ['across', 'répartis dans'],
    'map.districts':['postal districts', 'secteurs postaux'],
    'map.district': ['postal district', 'secteur postal'],
    'map.approx':   ['marker is approximate', 'repère approximatif'],
    'map.nothing':  ['Nothing here with the current filters.', 'Rien ici avec les filtres actuels.'],
    'map.nolistings':['No listings match the current filters.', 'Aucune fiche ne correspond aux filtres actuels.'],
    'map.notshown': ['Additional results are not shown. Narrow the search or pick a postal district above.',
                     'D’autres résultats ne sont pas affichés. Précisez la recherche ou choisissez un secteur postal ci-dessus.'],
    'map.fail':     ['<strong>Map unavailable.</strong> The map library could not load — usually a blocked CDN on a locked-down network. Everything is still browsable by area below, and every listing remains in the Specialists and Clinics tabs.',
                     '<strong>Carte indisponible.</strong> La bibliothèque cartographique n’a pas pu se charger — généralement un CDN bloqué sur un réseau restreint. Tout reste consultable par secteur ci-dessous, et chaque fiche demeure dans les onglets Spécialistes et Cliniques.'],
    'directions':   ['Directions', 'Itinéraire'],
    'website':      ['Website', 'Site Web'],
    'call':         ['Call', 'Appeler'],
    'viewlisting':  ['View directory record', 'Voir la fiche du répertoire'],
    'listing':      ['listing', 'fiche'],
    'listings':     ['listings', 'fiches'],

    'spec.title':   ['Specialist roster', 'Liste des spécialistes'],
    'spec.blurb':   ['attributed specialist physicians across', 'médecins spécialistes attribués répartis dans'],
    'spec.blurb2':  ['specialty groups.', 'groupes de spécialités.'],
    'spec.allspec': ['All specialties', 'Toutes les spécialités'],
    'spec.anylang': ['Any language', 'Toutes les langues'],
    'spec.filterlabel': ['Filter by specialty', 'Filtrer par spécialité'],
    'spec.langlabel': ['Filter by language', 'Filtrer par langue'],

    'physician':    ['physician', 'médecin'],
    'physicians':   ['physicians', 'médecins'],

    'svc.title':    ['Clinics, services & community supports', 'Cliniques, services et soutiens communautaires'],
    'svc.allsec':   ['All', 'Les'],
    'svc.sections': ['sections', 'sections'],
    'svc.allcats':  ['All', 'Les'],
    'svc.cats':     ['categories in this section', 'catégories de cette section'],
    'svc.seclabel': ['Filter by section', 'Filtrer par section'],
    'svc.catlabel': ['Filter by service category', 'Filtrer par catégorie de service'],
    'svc.viewhl':   ['View on Champlainhealthline', 'Voir sur Ligne Santé Champlain'],
    'svc.viewsite': ['Visit website', 'Site Web'],
    'scope.label': ['Filter by location', 'Filtrer par lieu'],
    'scope.badge':   ['Serves Ottawa region', 'Dessert la région d’Ottawa'],
    'oht.badge':   ['OHT partner', 'Partenaire ESO'],
    'oht.badgeti': ['A partner organisation of the Ottawa OHT-ÉSO (Ottawa Ontario Health Team)', 'Organisme partenaire de l’Ottawa OHT-ÉSO'],
    'oht.filter':  ['OHT partner organisations only', 'Organismes partenaires de l’ESO seulement'],
    'scope.serves':  ['✓ Serves the Ottawa region', '✓ Dessert la région d’Ottawa'],
    'scope.prov':    ['Province-wide organisation. The address below is its head office, not a location you visit — reach it by phone or web.', 'Organisme provincial. L’adresse ci-dessous est le siège social.'],
    'scope.natl':    ['National organisation. The address below is its head office, not a location you visit — reach it by phone or web.', 'Organisme national. L’adresse ci-dessous est le siège social.'],
    'scope.badgeti': ['Located outside Ottawa — this organisation serves the Ottawa region by phone, mail or web', 'Situé à l’extérieur d’Ottawa — dessert la région par téléphone, courrier ou Web'],
    'scope.ottawa': ['Ottawa-area locations only', 'Emplacements d’Ottawa seulement'],
    'scope.all':    ['All locations', 'Tous les emplacements'],
    'scope.away':   ['Province-wide and national bodies only', 'Organismes provinciaux et nationaux seulement'],
    'scope.note':   ['Showing Ottawa-area locations only. Province-wide and national organisations — ministries, regulatory colleges, disease associations and helplines — are hidden. Most are based in Toronto but serve Ottawa by phone or web.', 'Emplacements d’Ottawa seulement.'],
    'svc.viewhl2':  ['View on Champlainhealthline', 'Voir sur Ligne Santé Champlain'],
    'svc.fulldetails': ['Full details', 'Fiche complète'],
    'svc.eligibility': ['Eligibility', 'Admissibilité'],
    'svc.hours': ['Hours', 'Heures'],
    'svc.eligibilityhours': ['Eligibility and hours', 'Admissibilité et heures'],

    'fax.title':    ['Fax lookup', 'Recherche par télécopieur'],
    'fax.match':    ['match', 'correspondance'],
    'fax.matches':  ['matches', 'correspondances'],
    'fax.nomatch':  ['No match for', 'Aucune correspondance pour'],
    'fax.nomatch2': ['Try fewer digits — the last 7 are usually enough. If it still finds nothing, the number may belong to a specialist office or a clinic that does not publish its fax on Champlain Healthline. Neither is indexed here.',
                     'Essayez moins de chiffres — les 7 derniers suffisent généralement. Si rien ne ressort, le numéro peut appartenir à un cabinet de spécialiste ou à une clinique qui ne publie pas son télécopieur sur Ligne Santé Champlain. Ni l’un ni l’autre n’est indexé ici.'],
    'fax.kind.hl':  ['Champlain Healthline listing', 'Fiche Ligne Santé Champlain'],
    'fax.kind.v':   ['Central intake / agency (verified)', 'Accueil centralisé / organisme (vérifié)'],

    'forms.title':  ['Forms', 'Formulaires'],
    'res.title':    ['Resources', 'Ressources'],
    'res.blurb':    ['Professional organisations, system resources, clinical tools, billing, allied care and social supports — with access requirements and cost noted for each.',
                     'Organismes professionnels, ressources du système, outils cliniques, facturation, soins paramédicaux et soutiens sociaux — avec les conditions d’accès et les coûts indiqués pour chacun.'],
    'res.jump':     ['Jump to resource section', 'Aller à une section de ressources'],
    'quick.title':  ['Quick reference numbers', 'Numéros de référence rapide'],
    'quick.blurb':  ['The numbers worth keeping at the desk. Crisis lines are listed first.',
                     'Les numéros à garder sous la main. Les lignes de crise figurent en premier.'],
    'quick.crisis': ['Crisis', 'Crise'],

    'ref.title':    ['Referral routes', 'Voies d’orientation'],
    'ref.routes':   ['The four routes', 'Les quatre voies'],
    'ref.route':    ['Route', 'Voie'],
    'ref.intakes':  ['Central intake programs', 'Programmes d’accueil centralisé'],
    'ref.caption':  ['Confirmed against official program sources, 5 August 2026.',
                     'Confirmé auprès des sources officielles des programmes, le 5 août 2026.'],
    'ref.routing':  ['Specialty routing', 'Acheminement par spécialité'],
    'ref.link':     ['Link', 'Lien'],
    'tabsaria':     ['Directory sections', 'Sections du répertoire']
  };
  function t(k) {
    var v = STR[k];
    if (!v) return k;
    return (LANG === 'fr' && v[1]) ? v[1] : v[0];
  }

  var HL_EN = 'https://www.champlainhealthline.ca/displayService.aspx?id=';
  var HL_FR = 'https://www.lignesantechamplain.ca/displayService.aspx?id=';
  function hlUrl(id) { return (LANG === 'fr' ? HL_FR : HL_EN) + id; }
  function faxKind(k) { return k === 'v' ? t('fax.kind.v') : t('fax.kind.hl'); }

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function humanText(s) {
    return String(s == null ? '' : s).replace(/(^|[^-])\s*--\s*([^-]|$)/g, '$1 – $2');
  }
  function titleText(s) {
    return humanText(s).replace(/\s+[—–]\s+/g, ': ');
  }
  function titleHl(s, q) {
    return hl(titleText(s), q);
  }
  function publicLabel(s) {
    return titleText(s).replace(/\s*\(\d+\)\s*$/, '');
  }
  function safeUrl(u) {
    u = String(u || '').trim();
    return /^https?:\/\//i.test(u) ? u : '';
  }
  function link(u, t) {
    var s = safeUrl(u);
    if (!s) return esc(t ? humanText(t) : '');
    return '<a href="' + esc(s) + '" target="_blank" rel="noopener noreferrer">' + esc(t ? humanText(t) : s) + '</a>';
  }
  function norm(s) {
    s = String(s == null ? '' : s).toLowerCase();
    // strip accents so "bruyere" finds "Bruyère" and "montfort" finds "Montfort"
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }
  function hl(text, q) {
    var t = esc(humanText(text));
    if (!q) return t;
    var terms = q.split(/\s+/).filter(function (x) { return x.length > 1; })
                 .map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    if (!terms.length) return t;
    try {
      return t.replace(new RegExp('(' + terms.join('|') + ')', 'gi'), '<mark>$1</mark>');
    } catch (e) { return t; }
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function badgeClass(r) {
    var k = norm(r);
    if (k.indexOf('central') > -1 || k.indexOf('fax') > -1) return 'intake';
    if (k.indexOf('econsult') > -1 || k.indexOf('specialist') > -1) return 'econsult';
    if (k.indexOf('healthmap') > -1 || k.indexOf('clinics') > -1) return 'map';
    if (k.indexOf('direct') > -1 || k.indexOf('quick') > -1) return 'direct';
    return 'other';
  }
  function detailsHtml(d, q) {
    if (!d || !d.length) return '';
    var rows = d.map(function (x) {
      var warn = /^⚠/.test(x.l) ? ' class="is-warn"' : '';
      var val = x.u ? link(x.u, x.t) : hl(x.x, q);
      return '<dt' + warn + '>' + esc(x.l.replace(/^⚠\s*/, '')) + '</dt><dd' + warn + '>' + val + '</dd>';
    }).join('');
    return '<dl class="ottrx__dl">' + rows + '</dl>';
  }
  function cardHtml(item, q) {
    return '<article class="ottrx__card">' +
      '<h4 class="ottrx__cardname">' + titleHl(item.name, q) + '</h4>' +
      (ohtBadge(item) ? '<p class="ottrx__cardbadges">' + ohtBadge(item) + '</p>' : '') +
      (item.desc ? '<p class="ottrx__carddesc">' + hl(item.desc, q) + '</p>' : '') +
      detailsHtml(item.d, q) + '</article>';
  }
  function itemBlob(item) {
    var s = item.name + ' ' + (item.desc || '') + ' ' + (item.alias || '') + ' ' + ((item.tags || []).join(' '));
    (item.d || []).forEach(function (x) { s += ' ' + x.l + ' ' + (x.x || '') + ' ' + (x.t || ''); });
    return norm(s);
  }

  // Phone numbers appear as "(613) 721-7890" but clinicians type "613-721" or
  // "6137217890". Append a digits-only copy of every number so both forms hit.
  function withDigits(blob) {
    var nums = blob.match(/[0-9][0-9()\s.\-]{5,}/g);
    if (!nums) return blob;
    return blob + ' ' + nums.map(function (n) { return n.replace(/\D/g, ''); }).join(' ');
  }

  // ---------- precompute search blobs ----------
  DATA.resources.forEach(function (sec) {
    sec.groups.forEach(function (g) { g.items.forEach(function (i) { i._b = itemBlob(i); }); });
  });
  DATA.forms.forEach(function (f) { f.items.forEach(function (i) { i._b = itemBlob(i); }); });
  DATA.routing.forEach(function (r) { r._b = withDigits(norm(r.s + ' ' + r.r + ' ' + r.d)); });
  DATA.intakes.forEach(function (i) { i._b = withDigits(norm(i.name + ' ' + i.scope + ' ' + i.phone + ' ' + i.fax + ' ' + i.email)); });
  DATA.quick.forEach(function (i) { i._b = withDigits(norm(i.n + ' ' + i.p + ' ' + i.note)); });
  DATA.specialists.forEach(function (g) {
    g.rows.forEach(function (r) { r._b = withDigits(norm(g.group + ' ' + r.name + ' ' + r.sub + ' ' + r.site + ' ' + r.phone + ' ' + (r.fax || '') + ' ' + r.langs)); });
  });
  // sections hold indices into DATA.svcRows so each listing is stored once
  DATA.services.forEach(function (s) {
    s.rows = s.idx.map(function (i) { return DATA.svcRows[i]; });
  });
  // every field is searchable, including the ones only shown under "Full details"
  var SVC_FIELDS = ['name','org','addr','street','cross','city','postal','phone','tollfree','fax','tty',
    'crisis','afterhours','email','web','contacts','execs','hours','desc','elig','apply','fees','lang',
    'langnotes','access','accessnotes','area','meetings','dates','fsa','alias'];
  DATA.svcRows.forEach(function (r) {
    r.cats = (r.c || []).map(function (i) { return DATA.catNames[i]; });
    var parts = [];
    SVC_FIELDS.forEach(function (k) { if (r[k]) parts.push(r[k]); });
    parts.push(r.cats.join(' '));
    r._b = withDigits(norm(parts.join(' ')));
  });
  DATA.fax.forEach(function (f) {
    if (f.i != null) {
      var r = DATA.svcRows[f.i];
      f.name = r.name; f.org = r.org || ''; f.addr = r.addr || ''; f.phone = r.phone || '';
      f.cats = (r.cats || []).slice(0, 2); f.row = r;
    } else {
      f.cats = f.scope ? [f.scope] : [];
    }
    f._b = withDigits(norm(f.fax + ' ' + f.name + ' ' + (f.org || '') + ' ' + (f.addr || '')));
  });


  // ---------- language labels ----------
  // The source dashboard stores two-letter codes for English and French and raw
  // ISO names for everything else. Neither reads well in a dropdown, so map to
  // the name a clinician would actually say.
  var LANG_LABEL = {
    'en': 'English', 'fr': 'French',
    'modern greek (1453-)': 'Greek',
    'swahili (macrolanguage)': 'Swahili',
    'malay (macrolanguage)': 'Malay',
    'panjabi': 'Punjabi',
    'yue chinese': 'Cantonese',
    'hakka chinese': 'Hakka',
    'mandarin chinese': 'Mandarin',
    'persian': 'Farsi'
  };
  function langLabel(tok) {
    var k = String(tok || '').trim().toLowerCase();
    return LANG_LABEL[k] || String(tok || '').trim();
  }
  // Build the filter list from the data rather than a hardcoded list, so every
  // language a physician actually speaks is offered — and none that nobody does.
  var LANG_OPTS = null;
  function langOptions() {
    if (LANG_OPTS) return LANG_OPTS;
    var counts = {};
    DATA.specialists.forEach(function (g) {
      g.rows.forEach(function (r) {
        String(r.langs || '').split(/[,\/;]| and /).forEach(function (tok) {
          tok = tok.trim();
          if (!tok) return;
          counts[tok] = (counts[tok] || 0) + 1;
        });
      });
    });
    LANG_OPTS = Object.keys(counts).map(function (tok) {
      return { v: tok, l: langLabel(tok), n: counts[tok] };
    }).sort(function (a, b) {
      // English and French first — they are the service languages — then A-Z.
      var rank = function (x) { return x.l === 'English' ? 0 : x.l === 'French' ? 1 : 2; };
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return a.l.localeCompare(b.l, LANG === 'fr' ? 'fr' : 'en');
    });
    return LANG_OPTS;
  }
  function langDisplay(s) {
    return String(s || '').split(/\s*,\s*/).map(langLabel).filter(Boolean).join(', ');
  }

  // ---------- state ----------
  var PAGE = 150;
  var state = { tab: 'referral', q: '', spec: '', svc: '', leaf: '', lang: '', scope: 'all', res: '', shown: {} };
  // scope: 'ottawa' shows only listings with an Ottawa-area address; 'all' adds
  // the province-wide and national bodies; 'away' shows only those.
  // A listing whose address is outside Ottawa but whose catchment covers it.
  // The badge stops a Toronto address reading as "not for my patient".
  // Marks the 66 organisations that are formal partners of the Ottawa OHT-ÉSO.
  function ohtBadge(r) {
    if (!r || !r.oht) return '';
    var ti = t('oht.badgeti') + (r.ohtname && r.ohtname !== r.name ? ' — listed by the OHT as "' + r.ohtname + '"' : '');
    return ' <span class="ottrx__badge ottrx__badge--oht" title="' + esc(ti) + '">' + esc(t('oht.badge')) + '</span>';
  }
  function scopeBadge(r) {
    if (!r || (!r.offsite && (!r.scope || r.scope === 'ottawa'))) return '';
    return ' <span class="ottrx__badge ottrx__badge--scope" title="' + esc(t('scope.badgeti')) + '">' +
           esc(t('scope.badge')) + '</span>';
  }
  // The address is where a reader decides "this is the wrong city, someone made a
  // mistake". So the explanation goes there, in full words, above the address.
  function scopeAddr(r, q) {
    var addr = hl(r.addr, q);
    if (!r.offsite && (!r.scope || r.scope === 'ottawa')) return addr;
    var where = r.scope === 'national' ? t('scope.natl') : t('scope.prov');
    return '<span class="ottrx__scopenote"><strong>' + esc(t('scope.serves')) + '</strong>' +
           '<span>' + esc(where) + '</span></span>' + addr;
  }
  function scopeOk(r) {
    if (state.scope === 'all') return true;
    if (state.scope === 'away') return r.scope && r.scope !== 'ottawa';
    return !r.scope || r.scope === 'ottawa';
  }

  // ---------- renderers ----------
  function matches(blob, q) {
    if (!q) return true;
    var terms = q.split(/\s+/).filter(Boolean);
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (blob.indexOf(t) > -1) continue;
      // "613-721" / "(613) 721" should also match the digits-only copy
      if (/\d/.test(t)) {
        var d = t.replace(/[^0-9a-z]/g, '');
        if (d && d !== t && blob.indexOf(d) > -1) continue;
      }
      return false;
    }
    return true;
  }

  function renderReferral(q) {
    var h = '';
    // routes
    var routes = DATA.routes.filter(function (r) { return matches(norm(r.name + ' ' + r.desc), q); });
    if (routes.length) {
      h += '<h3 class="ottrx__h3">' + t('ref.routes') + '</h3>';
      routes.forEach(function (r) {
        h += '<article class="ottrx__card"><h4 class="ottrx__cardname">' + t('ref.route') + ' ' + esc(r.n) + ': ' + titleHl(r.name, q) + '</h4>' +
             '<p class="ottrx__carddesc">' + hl(r.desc, q) + '</p>';
        if (r.links.length) {
          h += '<dl class="ottrx__dl">' + r.links.map(function (l) {
            return '<dt>' + t('ref.link') + '</dt><dd>' + link(l.u, l.t) + '</dd>'; }).join('') + '</dl>';
        }
        h += '</article>';
      });
    }

    // intakes
    var intakes = DATA.intakes.filter(function (i) { return matches(i._b, q); });
    if (intakes.length) {
      h += '<h3 class="ottrx__h3">' + t('ref.intakes') + '</h3>';
      h += '<div class="ottrx__tablewrap ottrx__tablewrap--stack"><table class="ottrx__table">' +
           '<caption>' + t('ref.caption') + '</caption>' +
           '<thead><tr><th scope="col">' + t('col.program') + '</th><th scope="col">' + t('col.scope') + '</th><th scope="col">' + t('col.contact') + '</th></tr></thead><tbody>';
      intakes.forEach(function (i) {
        var c = [];
        if (i.phone) c.push('Ph ' + esc(i.phone));
        if (i.fax) c.push('Fax ' + esc(i.fax));
        if (i.email) c.push('<a href="mailto:' + esc(i.email) + '">' + esc(i.email) + '</a>');
        h += '<tr><td data-th="Program">' + link(i.url, titleText(i.name)) + '</td>' +
             '<td data-th="Scope" class="muted">' + hl(i.scope, q) + '</td>' +
             '<td data-th="Contact" class="num">' + c.join('<br>') + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }

    // routing
    var routing = DATA.routing.filter(function (r) { return matches(r._b, q); });
    h += '<h3 class="ottrx__h3">' + t('ref.routing') + ' <span class="muted">(' + routing.length + ')</span></h3>';
    if (!routing.length) {
      h += emptyHtml(q);
    } else {
      h += '<div class="ottrx__tablewrap ottrx__tablewrap--stack"><table class="ottrx__table">' +
           '<thead><tr><th scope="col">Specialty</th><th scope="col">Route</th><th scope="col">Detail</th></tr></thead><tbody>';
      routing.forEach(function (r) {
        h += '<tr><td data-th="Specialty">' + hl(r.s, q) + '</td>' +
             '<td data-th="Route"><span class="ottrx__badge ottrx__badge--' + badgeClass(r.r) + '">' + esc(r.r) + '</span></td>' +
             '<td data-th="Detail" class="muted">' + hl(r.d, q) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }
    return h;
  }

  function renderSpecialists(q) {
    var groups = DATA.specialists;
    var opts = '<option value="">' + t('spec.allspec') + '</option>' +
      groups.map(function (g) {
        return '<option value="' + esc(g.group) + '"' + (state.spec === g.group ? ' selected' : '') + '>' +
               esc(g.group) + '</option>'; }).join('');

    var h = '<div class="ottrx__panelhead"><h2 class="ottrx__h2">' + t('spec.title') + '</h2></div>';




    h += '<div class="ottrx__filters">' +
      '<select class="ottrx__select" data-filter="spec" aria-label="' + t('spec.filterlabel') + '">' + opts + '</select>' +
      '<select class="ottrx__select" data-filter="lang" aria-label="' + t('spec.langlabel') + '">' +
        '<option value="">' + t('spec.anylang') + '</option>' +
        langOptions()
          .map(function (o) { return '<option value="' + esc(o.v) + '"' + (state.lang === o.v ? ' selected' : '') + '>' + esc(o.l) + '</option>'; }).join('') +
      '</select></div>';

    var rows = [];
    groups.forEach(function (g) {
      if (state.spec && g.group !== state.spec) return;
      g.rows.forEach(function (r) {
        if (state.lang && norm(r.langs).indexOf(norm(state.lang)) === -1) return;
        if (!matches(r._b, q)) return;
        rows.push({ g: g.group, r: r });
      });
    });

    if (q || state.spec || state.lang) {
      h += '<p class="ottrx__status" role="status">' + rows.length + ' physician' + (rows.length === 1 ? '' : 's') +
           (q ? ' matching “' + esc(q) + '”' : '') + '</p>';
    }
    if (!rows.length) return h + emptyHtml(q);

    var limit = state.shown.spec || PAGE;
    var slice = rows.slice(0, limit);

    h += '<div class="ottrx__tablewrap ottrx__tablewrap--stack"><table class="ottrx__table">' +
      '<thead><tr><th scope="col">' + t('col.physician') + '</th><th scope="col">' + t('col.specialty') + '</th>' +
      '<th scope="col">' + t('col.site') + '</th><th scope="col">' + t('col.phone') + '</th><th scope="col">' + t('col.fax') + '</th><th scope="col">' + t('col.langs') + '</th></tr></thead><tbody>';
    slice.forEach(function (o) {
      var r = o.r;
      var spec = o.g + (r.sub ? ' — ' + r.sub : '');
      h += '<tr><td data-th="Physician">' + hl(r.name, q) + '</td>' +
        '<td data-th="Specialty" class="muted">' + hl(spec, q) + '</td>' +
        
        '<td data-th="Practice site" class="muted">' + hl(r.site, q) + '</td>' +
        '<td data-th="Phone" class="num">' + hl(r.phone, q) + '</td>' +
        '<td data-th="Fax" class="num muted">' + hl(r.fax || '', q) + '</td>' +
        '<td data-th="Languages" class="muted tight">' + hl(langDisplay(r.langs), q) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    if (rows.length > limit) {
      h += '<button type="button" class="ottrx__more" data-more="spec">Show ' +
           Math.min(PAGE, rows.length - limit) + ' more (' + (rows.length - limit) + ' remaining)</button>';
    }
    return h;
  }

  function renderServices(q) {
    var secs = DATA.services;
    var opts = '<option value="">All ' + DATA.meta.svcSections + ' sections</option>' + secs.map(function (s) {
      return '<option value="' + esc(s.key) + '"' + (state.svc === s.key ? ' selected' : '') + '>' +
             esc(s.title) + ' (' + s.rows.filter(scopeOk).length + ')</option>'; }).join('');

    var active = null;
    secs.forEach(function (s) { if (s.key === state.svc) active = s; });

    var leafOpts = '';
    if (active && active.leafs.length) {
      leafOpts = '<select class="ottrx__select" data-filter="leaf" aria-label="Filter by service category">' +
        '<option value="">All ' + active.leafs.length + ' categories in this section</option>' +
        active.leafs.map(function (c) {
          return '<option value="' + esc(c) + '"' + (state.leaf === c ? ' selected' : '') + '>' + esc(c) + '</option>';
        }).join('') + '</select>';
    }

    var h = '<div class="ottrx__panelhead"><h2 class="ottrx__h2">' + t('svc.title') + '</h2>' ;

    h += '<div class="ottrx__filters">' +
      '<select class="ottrx__select" data-filter="svc" aria-label="Filter by section">' + opts + '</select>' +
      leafOpts +
      '<select class="ottrx__select" data-filter="scope" aria-label="' + t('scope.label') + '">' +
        ['all','ottawa','away'].map(function (k) {
          return '<option value="' + k + '"' + (state.scope === k ? ' selected' : '') + '>' + esc(t('scope.' + k)) + '</option>';
        }).join('') +
      '</select></div>';
    if (state.scope === 'ottawa') h += '<div class="ottrx__note">' + esc(t('scope.note')) + '</div>';

    if (active && active.src !== 'site') {
      h += '<div class="ottrx__note"><strong>Grouping note.</strong> Champlain Healthline publishes the exact contents of ' +
        'this section on its own site; our copy of it is derived by matching category names, so a listing could sit in a ' +
        'neighbouring section. Every row shows its real Healthline categories, and “View on Champlainhealthline” opens the ' +
        'authoritative page.</div>';
    }

    var rows = [], seenRows = {};
    secs.forEach(function (s) {
      if (state.svc && s.key !== state.svc) return;
      var secHit = matches(norm(s.title), q);
      s.rows.forEach(function (r) {
        if (!scopeOk(r)) return;
        if (state.leaf && (r.cats || []).indexOf(state.leaf) === -1) return;
        if (!(matches(r._b, q) || secHit)) return;
        if (!state.svc && seenRows[r.id]) return;
        seenRows[r.id] = 1;
        rows.push({ c: s.title, r: r });
      });
    });

    if (q || state.svc || state.leaf || state.scope !== 'all') {
      h += '<p class="ottrx__status" role="status">' + rows.length + ' listing' + (rows.length === 1 ? '' : 's') +
           (q ? ' matching “' + esc(q) + '”' : '') + '</p>';
    }
    if (!rows.length) return h + emptyHtml(q);

    var limit = state.shown.svc || PAGE;
    var slice = rows.slice(0, limit);

    h += '<div class="ottrx__tablewrap ottrx__tablewrap--stack ottrx__tablewrap--services"><table class="ottrx__table ottrx__table--services">' +
      '<thead><tr><th scope="col">' + t('col.service') + '</th><th scope="col">' + t('col.cats') + '</th><th scope="col">' + t('col.address') + '</th>' +
      '<th scope="col">' + t('col.contact') + '</th><th scope="col">' + t('col.fees') + '</th></tr></thead><tbody>';
    slice.forEach(function (o) {
      var r = o.r;
      var head = '<div class="ottrx__service-name">' + (r.web ? link(r.web, r.name) : hl(r.name, q)) + '</div>';
      var bdg = ohtBadge(r) + scopeBadge(r);
      if (bdg) head += '<br>' + bdg;
      if (r.org && norm(r.org) !== norm(r.name)) head += '<br><span class="muted">' + hl(r.org, q) + '</span>';
      var contact = [];
      if (r.phone) contact.push(hl(r.phone, q));
      if (r.fax) contact.push('<span class="muted">Fax ' + hl(r.fax, q) + '</span>');
      if (r.email) contact.push('<a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a>');
      var extra = [];
      if (r.fees) extra.push('<div class="ottrx__service-fees">' + hl(r.fees, q) + '</div>');
      var secondary = [];
      if (r.elig) secondary.push('<div><strong>' + t('svc.eligibility') + '</strong>' + hl(r.elig, q) + '</div>');
      if (r.hours) secondary.push('<div><strong>' + t('svc.hours') + '</strong>' + hl(r.hours, q) + '</div>');
      if (secondary.length) {
        var secondaryLabel = r.elig && r.hours ? t('svc.eligibilityhours') :
          (r.elig ? t('svc.eligibility') : t('svc.hours'));
        extra.push('<details class="ottrx__service-secondary"><summary>' + secondaryLabel + '</summary>' +
          secondary.join('') + '</details>');
      }
      var sourceLinks = [];
      if (r.web) sourceLinks.push(link(r.web, t('svc.viewsite')));
      if (r.healthline !== false) sourceLinks.push(link(hlUrl(r.id), r.web ? t('svc.viewhl2') : t('svc.viewhl')));
      h += '<tr><td data-th="Service">' + head +
        (sourceLinks.length ? '<div class="ottrx__service-links">' + sourceLinks.join('') + '</div>' : '') + '</td>' +
        '<td data-th="Categories" class="muted">' + esc((r.cats || []).slice(0, 3).join(' · ')) +
          ((r.cats || []).length > 3 ? ' <span class="muted">+' + (r.cats.length - 3) + '</span>' : '') + '</td>' +
        '<td data-th="Address" class="muted">' + scopeAddr(r, q) + '</td>' +
        '<td data-th="Contact" class="num">' + contact.join('<br>') + '</td>' +
        '<td data-th="Fees / eligibility" class="muted">' + extra.join('<br>') + '</td></tr>';
    });
    h += '</tbody></table></div>';
    if (rows.length > limit) {
      h += '<button type="button" class="ottrx__more" data-more="svc">Show ' +
           Math.min(PAGE, rows.length - limit) + ' more (' + (rows.length - limit) + ' remaining)</button>';
    }
    return h;
  }

  // ======================= FAX REVERSE LOOKUP =======================
  function renderFax(q) {
    var h = '<div class="ottrx__panelhead"><h2 class="ottrx__h2">' + t('fax.title') + '</h2>';

    

    var digitsQ = q.replace(/[^0-9a-z]/g, '');
    if (!q) {
      return h + '<div class="ottrx__empty"><b>Type a fax number in the search box above</b>' +
        'Any format works. You can also search by organisation name to find its fax number.</div>';
    }

    var hits = DATA.fax.filter(function (f) {
      if (digitsQ && /\d/.test(q) && f.d.indexOf(digitsQ) > -1) return true;
      return matches(f._b, q);
    });

    h += '<p class="ottrx__status" role="status">' + hits.length + ' match' + (hits.length === 1 ? '' : 'es') +
         ' for “' + esc(q) + '”</p>';

    if (!hits.length) {
      return h + '<div class="ottrx__empty"><b>No match for “' + esc(q) + '”</b>' +
        'Try fewer digits — the last 7 are usually enough. If it still finds nothing, the number may belong to a ' +
        'specialist office or a clinic that does not publish its fax on Champlain Healthline. Neither is indexed here.</div>';
    }

    h += '<div class="ottrx__tablewrap ottrx__tablewrap--stack"><table class="ottrx__table">' +
      '<thead><tr><th scope="col">' + t('col.fax') + '</th><th scope="col">' + t('col.belongs') + '</th><th scope="col">' + t('col.address') + '</th>' +
      '<th scope="col">' + t('col.phone') + '</th><th scope="col">' + t('col.source') + '</th></tr></thead><tbody>';
    hits.slice(0, 200).forEach(function (f) {
      var who = hl(f.name, q);
      if (f.org && norm(f.org) !== norm(f.name)) who += '<br><span class="muted">' + hl(f.org, q) + '</span>';
      if (f.cats && f.cats.length) who += '<br><span class="muted">' + esc(f.cats.join(' · ')) + '</span>';
      if (f.row) who += '<br>' + (f.row.web
        ? link(f.row.web, t('svc.viewsite')) + ' <span class="muted">·</span> ' + link(hlUrl(f.row.id), t('svc.viewhl2'))
        : link(hlUrl(f.row.id), t('svc.viewhl')));
      h += '<tr><td data-th="Fax" class="num"><strong>' + hl(f.fax, q) + '</strong></td>' +
        '<td data-th="Belongs to">' + who + '</td>' +
        '<td data-th="Address" class="muted">' + hl(f.addr, q) + '</td>' +
        '<td data-th="Phone" class="num">' + hl(f.phone, q) + '</td>' +
        '<td data-th="Source" class="muted">' + esc(faxKind(f.kind)) + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }

  // ======================= GLOBAL SEARCH =======================
  // Counts hits in every tab so the user can jump straight to the right one.
  function globalCounts(q) {
    if (!q) return [];
    var out = [];
    function add(id, label, n, sample) { if (n) out.push({ id: id, label: label, n: n, sample: sample }); }

    var rt = DATA.routing.filter(function (r) { return matches(r._b, q); });
    var ints = DATA.intakes.filter(function (i) { return matches(i._b, q); });
    add('referral', 'Referral routes', rt.length + ints.length,
        rt.slice(0, 4).map(function (r) { return r.s + ' — ' + r.r; })
          .concat(ints.slice(0, 2).map(function (i) { return i.name; })));

    var sp = [];
    DATA.specialists.forEach(function (g) {
      g.rows.forEach(function (r) { if (matches(r._b, q)) sp.push(r.name + ' — ' + g.group); });
    });
    add('specialists', 'Specialists', sp.length, sp.slice(0, 5));

    var sv = [], seenSv = {};
    DATA.services.forEach(function (s) {
      s.rows.forEach(function (r) {
        if (seenSv[r.id] || !matches(r._b, q)) return;
        seenSv[r.id] = 1; sv.push(r.name + ' — ' + s.title);
      });
    });
    add('services', 'Clinics & services', sv.length, sv.slice(0, 5));

    var fx = DATA.fax.filter(function (f) {
      var dq = q.replace(/[^0-9a-z]/g, '');
      return (dq && /\d/.test(q) && f.d.indexOf(dq) > -1) || matches(f._b, q);
    });
    add('fax', 'Fax lookup', fx.length, fx.slice(0, 4).map(function (f) { return f.fax + ' — ' + f.name; }));

    var fm = [];
    DATA.forms.forEach(function (f) { f.items.forEach(function (i) { if (matches(i._b, q)) fm.push(i.name); }); });
    add('forms', 'Forms', fm.length, fm.slice(0, 4));

    var rs = [];
    DATA.resources.forEach(function (sec) {
      sec.groups.forEach(function (g) { g.items.forEach(function (i) { if (matches(i._b, q)) rs.push(i.name); }); });
    });
    add('resources', 'Resources', rs.length, rs.slice(0, 5));

    var qk = DATA.quick.filter(function (i) { return matches(i._b, q); });
    add('quick', 'Quick numbers', qk.length, qk.slice(0, 4).map(function (i) { return i.n + ' — ' + i.p; }));

    var mp = mapFiltered(q);
    add('map', 'Map', mp.length, []);

    out.sort(function (a, b) { return b.n - a.n; });
    return out;
  }

  // Flatten every section into one list of real result rows, so "Search
  // everything" looks and behaves like every other tab in the directory.
  function allRows(q) {
    var out = [];
    if (!q) return out;

    DATA.routing.forEach(function (r) {
      if (matches(r._b, q)) out.push({ tab: 'referral', sec: 'Referral routes', name: r.s,
                                       meta: r.r, detail: r.d });
    });
    DATA.intakes.forEach(function (i) {
      if (!matches(i._b, q)) return;
      var c = [];
      if (i.phone) c.push('Ph ' + i.phone);
      if (i.fax) c.push('Fax ' + i.fax);
      if (i.email) c.push(i.email);
      out.push({ tab: 'referral', sec: 'Central intake', name: i.name, meta: c.join(' · '),
                 detail: i.scope, url: i.url });
    });
    DATA.specialists.forEach(function (g) {
      g.rows.forEach(function (r) {
        if (!matches(r._b, q)) return;
        out.push({ tab: 'specialists', sec: 'Specialists', name: r.name,
                   meta: g.group + (r.sub ? ' — ' + r.sub : ''),
                   detail: [r.site, r.phone, r.langs].filter(Boolean).join(' · ') });
      });
    });
    var seenSvc = {};
    DATA.services.forEach(function (s2) {
      s2.rows.forEach(function (r) {
        if (seenSvc[r.id] || !scopeOk(r) || !matches(r._b, q)) return;
        seenSvc[r.id] = 1;
        var c = [];
        if (r.phone) c.push(r.phone);
        if (r.fax) c.push('Fax ' + r.fax);
        out.push({ tab: 'services', sec: 'Clinics & services', name: r.name,
                   meta: (r.cats || []).slice(0, 2).join(' · '),
                   detail: [r.addr, c.join(' · ')].filter(Boolean).join(' · '),
                   url: r.web || hlUrl(r.id), badge: ohtBadge(r) + scopeBadge(r) });
      });
    });
    var dq = q.replace(/[^0-9a-z]/g, '');
    DATA.fax.forEach(function (f) {
      if (!((dq && /\d/.test(q) && f.d.indexOf(dq) > -1) || matches(f._b, q))) return;
      out.push({ tab: 'fax', sec: 'Fax lookup', name: f.fax,
                 meta: f.name, detail: [f.org, f.addr, f.phone].filter(Boolean).join(' · '),
                 url: f.row ? (f.row.web || hlUrl(f.row.id)) : '' });
    });
    DATA.forms.forEach(function (f) {
      f.items.forEach(function (i) {
        if (matches(i._b, q)) out.push({ tab: 'forms', sec: 'Forms', name: i.name,
                                         meta: f.agency, detail: i.desc });
      });
    });
    DATA.resources.forEach(function (sec) {
      sec.groups.forEach(function (g) {
        g.items.forEach(function (i) {
          if (matches(i._b, q)) out.push({ tab: 'resources', sec: 'Resources', name: i.name,
                                           meta: sec.title, detail: i.desc });
        });
      });
    });
    DATA.quick.forEach(function (i) {
      if (matches(i._b, q)) out.push({ tab: 'quick', sec: 'Quick numbers', name: i.n,
                                       meta: i.p, detail: i.note });
    });
    return out;
  }

  function renderAll(q) {
    var h = '<div class="ottrx__panelhead"><h2 class="ottrx__h2">' + t('all.title') + '</h2>';
    if (!q) {
      h += '<p class="ottrx__blurb">' + t('all.empty') + '</p></div>';
      return h;
    }

    var rows = allRows(q);
    var bySec = {};
    rows.forEach(function (r) { bySec[r.sec] = (bySec[r.sec] || 0) + 1; });
    var secList = Object.keys(bySec).join(', ');

    h += '<p class="ottrx__blurb">' + rows.length + ' result' + (rows.length === 1 ? '' : 's') +
         ' for “' + esc(q) + '”' + (secList ? ' — ' + esc(secList) : '') + '</p></div>';

    if (!rows.length) {
      return h + '<div class="ottrx__empty"><b>Nothing matches “' + esc(q) + '”</b>' +
        'Try a shorter or more general term — “cardio” rather than “cardiologist downtown”. Searching ignores ' +
        'accents and phone formatting, so “bruyere” and “613-737” both work.</div>';
    }

    var limit = state.shown.all || PAGE;
    var slice = rows.slice(0, limit);

    h += '<p class="ottrx__status" role="status">' + rows.length + ' result' + (rows.length === 1 ? '' : 's') +
         ' matching “' + esc(q) + '”</p>';
    h += '<div class="ottrx__tablewrap ottrx__tablewrap--stack"><table class="ottrx__table">' +
      '<thead><tr><th scope="col">' + t('col.result') + '</th><th scope="col">' + t('col.section') + '</th><th scope="col">' + t('col.whatis') + '</th>' +
      '<th scope="col">' + t('col.details') + '</th></tr></thead><tbody>';
    slice.forEach(function (r) {
      h += '<tr><td data-th="Result">' + (r.url ? link(r.url, r.name) : hl(r.name, q)) + (r.badge || '') + '</td>' +
        '<td data-th="Section"><span class="ottrx__badge ottrx__badge--' + badgeClass(r.sec) + '">' +
          esc(r.sec) + '</span></td>' +
        '<td data-th="What it is" class="muted">' + hl(r.meta || '', q) + '</td>' +
        '<td data-th="Details" class="muted">' + hl(r.detail || '', q) + '</td></tr>';
    });
    h += '</tbody></table></div>';
    if (rows.length > limit) {
      h += '<button type="button" class="ottrx__more" data-more="all">Show ' +
           Math.min(PAGE, rows.length - limit) + ' more (' + (rows.length - limit) + ' remaining)</button>';
    }
    return h;
  }


  function renderForms(q) {
    var h = '<div class="ottrx__panelhead"><h2 class="ottrx__h2">' + t('forms.title') + '</h2>' +
      '<p class="ottrx__blurb">Form numbers, direct downloads, submission routes and the medico-legal points that most often ' +
      'cause a form to be returned or challenged.</p></div>';
    var any = 0;
    DATA.forms.forEach(function (f) {
      var items = f.items.filter(function (i) { return matches(i._b, q); });
      if (!items.length) return;
      any += items.length;
      h += '<h3 class="ottrx__h3">' + esc(f.agency) + '</h3>';
      items.forEach(function (i) { h += cardHtml(i, q); });
    });
    return any ? h : h + emptyHtml(q);
  }

  function renderResources(q) {
    var h = '<div class="ottrx__panelhead"><h2 class="ottrx__h2" tabindex="-1" data-resource-title>' + t('res.title') + '</h2>' +
      '<p class="ottrx__blurb">' + t('res.blurb') + '</p></div>';
    var active = null;
    DATA.resources.forEach(function (sec) { if (sec.id === state.res) active = sec; });

    if (!q && !active) {
      h += '<p class="ottrx__resourcehint">Choose a category to see its resources. You can return here at any time.</p>' +
        '<div class="ottrx__resourcegrid" role="list">';
      DATA.resources.forEach(function (sec) {
        h += '<button type="button" class="ottrx__resourcechoice" data-resource="' + esc(sec.id) + '" role="listitem">' +
          '<strong>' + esc(publicLabel(sec.title)) + '</strong>' +
          (sec.blurb ? '<span>' + esc(humanText(sec.blurb)) + '</span>' : '') +
          '<span class="ottrx__resourcego">Explore resources →</span></button>';
      });
      return h + '</div>';
    }

    var options = '<option value="">All resource categories</option>' + DATA.resources.map(function (sec) {
      return '<option value="' + esc(sec.id) + '"' + (active && active.id === sec.id ? ' selected' : '') + '>' +
        esc(publicLabel(sec.title)) + '</option>';
    }).join('');
    h += '<div class="ottrx__resourcebar">' +
      '<button type="button" class="ottrx__resourceback" data-resource="">← Browse all categories</button>' +
      '<select class="ottrx__select" data-filter="res" aria-label="Choose a resource category">' + options + '</select></div>';

    var sections = q ? DATA.resources : [active];
    var body = '', any = 0;
    sections.forEach(function (sec) {
      if (!sec) return;
      var groups = [], total = 0;
      sec.groups.forEach(function (g) {
        var items = g.items.filter(function (i) { return matches(i._b, q); });
        if (!items.length) return;
        total += items.length;
        groups.push({
          title: publicLabel(g.title) || publicLabel(sec.title),
          cards: items.map(function (i) { return cardHtml(i, q); }).join('')
        });
      });
      if (!total) return;
      any += total;
      body += '<section class="ottrx__resourcepage" aria-labelledby="ottrx-' + esc(sec.id) + '">' +
        '<h3 class="ottrx__h3" id="ottrx-' + esc(sec.id) + '">' + esc(publicLabel(sec.title)) + '</h3>' +
        (sec.blurb ? '<p class="ottrx__blurb ottrx__resourceblurb">' + esc(humanText(sec.blurb)) + '</p>' : '');
      if (groups.length === 1) {
        body += (groups[0].title !== publicLabel(sec.title) ? '<h4 class="ottrx__h4">' + esc(groups[0].title) + '</h4>' : '') + groups[0].cards;
      } else {
        groups.forEach(function (group) {
          body += '<details class="ottrx__resourcegroup"' + (q ? ' open' : '') + '><summary>' + esc(group.title) + '</summary>' +
            '<div class="ottrx__resourceitems">' + group.cards + '</div></details>';
        });
      }
      body += '<button type="button" class="ottrx__resourceback ottrx__resourceback--bottom" data-resource="">Browse another resource category</button></section>';
    });
    if (!any) return h + emptyHtml(q);
    if (q) h += '<p class="ottrx__status" role="status">' + any + ' resource' + (any === 1 ? '' : 's') + ' matching “' + esc(q) + '”</p>';
    return h + body;
  }

  function renderQuick(q) {
    var rows = DATA.quick.filter(function (i) { return matches(i._b, q); });
    var h = '<div class="ottrx__panelhead"><h2 class="ottrx__h2">' + t('quick.title') + '</h2>' +
      '<p class="ottrx__blurb">' + t('quick.blurb') + '</p></div>';
    if (!rows.length) return h + emptyHtml(q);
    h += '<div class="ottrx__tablewrap ottrx__tablewrap--stack"><table class="ottrx__table">' +
      '<thead><tr><th scope="col">' + t('col.service') + '</th><th scope="col">' + t('col.number') + '</th><th scope="col">' + t('col.notes') + '</th></tr></thead><tbody>';
    rows.forEach(function (i) {
      var tel = String(i.p).replace(/[^0-9+]/g, '');
      h += '<tr><td data-th="Service">' + hl(i.n, q) +
        (i.crit ? ' <span class="ottrx__badge ottrx__badge--intake">' + t('quick.crisis') + '</span>' : '') + '</td>' +
        '<td data-th="Number" class="num"><a href="tel:' + esc(tel) + '">' + hl(i.p, q) + '</a></td>' +
        '<td data-th="Notes" class="muted">' + hl(i.note, q) + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }

  function emptyHtml(q) {
    return '<div class="ottrx__empty"><b>No matches' + (q ? ' for “' + esc(q) + '”' : '') + '</b>' +
      'Try a shorter term, a specialty name (“cardiology”), a clinic (“Bruyère”), or a phone prefix (“613-721”). ' +
      'You can also clear the search and use the category filter.</div>';
  }

  // ======================= MAP =======================
  var LEAFLET_CSS = root.getAttribute('data-leaflet-css');
  var LEAFLET_JS = root.getAttribute('data-leaflet-js');
  var mapState = { loaded: false, failed: false, map: null, layer: null,
                   fsa: null, area: null, all: false, unplaced: false, type: '', q: '', qLabel: '' };

  // One row per published WordPress listing. Rows without a public postal
  // location stay searchable and are shown separately from physical markers.
  var POINTS = null;
  function points() {
    if (POINTS) return POINTS;
    if (Array.isArray(DATA.mapRows)) {
      POINTS = DATA.mapRows.map(function (r) {
        return {
          k: r.kind || 'other', type: r.type || '', fsa: r.fsa || '',
          cat: r.cat || '', cats: (r.catList || []).join(' '), catList: r.catList || [],
          name: r.name || '', org: r.org || '', meta: r.meta || '', phone: r.phone || '',
          geo: r.geo || '', web: r.web || '', url: r.url || '', wpId: r.wpId || 0,
          search: r.search || '', inferred: !!r.inferred
        };
      });
      return POINTS;
    }

    // Backward-compatible fallback for payloads generated before mapRows.
    POINTS = [];
    DATA.specialists.forEach(function (g) {
      g.rows.forEach(function (r) {
        if (!DATA.fsaGeo[r.fsa]) return;
        POINTS.push({ k: 'spec', fsa: r.fsa, cat: g.group, name: r.name,
                      cats: g.group + ' ' + (r.sub || ''), catList: [g.group], org: '',
                      meta: (r.sub ? r.sub + ' · ' : '') + r.site, phone: r.phone, geo: r.geo, web: '' });
      });
    });
    var seenSvc = {};
    DATA.services.forEach(function (s) {
      s.rows.forEach(function (r) {
        if (!DATA.fsaGeo[r.fsa] || seenSvc[r.id] || !scopeOk(r)) return;
        seenSvc[r.id] = 1;   // a listing sits in several sections; map it once
        POINTS.push({ k: 'svc', fsa: r.fsa, cat: (r.cats && r.cats[0]) || s.title, name: r.name,
                      cats: (r.cats || []).join(' '), catList: (r.cats || []), org: r.org || '',
                      meta: r.addr || '', phone: r.phone || '', geo: r.addr || '', web: r.web || '', id: r.id });
      });
    });
    return POINTS;
  }

  function hasMapLocation(p) { return !!(p && p.fsa && DATA.fsaGeo[p.fsa]); }
  function locatedRows(rows) { return rows.filter(hasMapLocation); }
  function pointBlob(p) {
    return p._b || (p._b = withDigits(norm(
      [p.name, p.org, p.cat, p.cats, p.meta, p.phone, p.search].join(' '))));
  }

  function mapFiltered(q) {
    return points().filter(function (p) {
      if (mapState.type && p.k !== mapState.type) return false;
      var blob = pointBlob(p);
      if (q && !matches(blob, q)) return false;               // global search box
      if (mapState.q && !matches(blob, mapState.q)) return false;  // this tab's own box
      return true;
    });
  }

  // Every service category and specialty that actually has something on the map,
  // with the number of listings behind it.
  var MAP_SUGGEST = null;
  function mapSuggestions() {
    if (MAP_SUGGEST) return MAP_SUGGEST;
    var counts = {};
    points().forEach(function (p) {
      (p.cats || '').split('  ').join(' ');
      var names = p.k === 'spec' ? [p.cat] : (p.catList || []);
      names.forEach(function (c) { if (c) counts[c] = (counts[c] || 0) + 1; });
    });
    MAP_SUGGEST = Object.keys(counts)
      .map(function (c) { return { name: c, n: counts[c], k: norm(c) }; })
      .sort(function (a, b) { return a.name.localeCompare(b.name); });
    return MAP_SUGGEST;
  }

  // Always alphabetical, so the list is predictable and you can scan for the
  // name you expect. Typing narrows it; it never reorders on you.
  function byName(a, b) { return a.name.localeCompare(b.name, LANG === 'fr' ? 'fr' : 'en'); }
  // No truncation: an alphabetical list that stops at "A" is useless. The panel
  // is height-capped and scrolls instead, so every match stays reachable.
  function suggestFor(text) {
    var raw = text.trim();
    var q = norm(raw);
    var suggestions = mapSuggestions()
      .filter(function (o) { return !q || o.k.indexOf(q) > -1; })
      .sort(byName);
    if (q) {
      var allCount = points().filter(function (p) {
        return (!mapState.type || p.k === mapState.type) && matches(pointBlob(p), q);
      }).length;
      if (allCount) {
        suggestions.unshift({ name: raw, label: t('map.searchall') + ' “' + raw + '”', n: allCount, k: q });
      }
    }
    return suggestions;
  }

  function gmaps(p) {
    return 'https://www.google.com/maps/search/?api=1&query=' +
           encodeURIComponent((p.geo || p.name) + ', Ottawa, ON');
  }

  function hitHtml(p) {
    var publicAddress = p.geo && !/(no public|not published|national service|online only|virtual)/i.test(p.geo);
    var links = publicAddress ? '<a href="' + esc(gmaps(p)) + '" target="_blank" rel="noopener noreferrer">' + t('directions') + '</a>' : '';
    if (p.web && safeUrl(p.web)) links += link(p.web, t('website'));
    else if (p.url && safeUrl(p.url)) links += link(p.url, t('viewlisting'));
    else if (p.id) links += link(hlUrl(p.id), t('svc.viewhl2'));
    if (p.phone) {
      var tel = p.phone.split('/')[0].replace(/[^0-9+]/g, '');
      if (tel.length >= 7) links += '<a href="tel:' + esc(tel) + '">' + t('call') + '</a>';
    }
    return '<div class="ottrx__hit">' +
      '<p class="ottrx__hitname">' + esc(p.name) + '</p>' +
      '<p class="ottrx__hitmeta">' + esc(p.cat) + '</p>' +
      (p.meta ? '<p class="ottrx__hitmeta">' + esc(p.meta) + '</p>' : '') +
      (!hasMapLocation(p) ? '<p class="ottrx__hitmeta ottrx__hitmeta--unplaced">' + esc(t('map.unplaced')) + '</p>' : '') +
      (p.phone ? '<p class="ottrx__hitmeta">' + esc(p.phone) + '</p>' : '') +
      (links ? '<div class="ottrx__hitlinks">' + links + '</div>' : '') + '</div>';
  }

  function areaOf(fsa) { return (DATA.fsaGeo[fsa] || {}).area || 'Other'; }

  function sideHits(q) {
    var rows = mapFiltered(q);
    if (mapState.fsa) return rows.filter(function (p) { return p.fsa === mapState.fsa; });
    if (mapState.area) return rows.filter(function (p) { return areaOf(p.fsa) === mapState.area; });
    return rows;
  }

  function sideList(items, cap) {
    if (!items.length) {
      return '<div class="ottrx__hit"><p class="ottrx__hitmeta">' + t('map.nothing') + '</p></div>';
    }
    var h = items.slice(0, cap).map(hitHtml).join('');
    if (items.length > cap) {
      h += '<div class="ottrx__hit"><p class="ottrx__hitmeta">' + t('map.notshown') + '</p></div>';
    }
    return h;
  }

  function mapMatchText(term) {
    if (!term) return '';
    return (LANG === 'fr' ? 'Résultats pour ' : 'Showing matches for ') + '“' + esc(term) + '”';
  }

  function renderSide(q) {
    var side = panelEl.querySelector('[data-mapside]');
    if (!side) return;
    var rows = mapFiltered(q);
    var located = locatedRows(rows);
    var unplaced = rows.filter(function (p) { return !hasMapLocation(p); });
    var term = mapState.qLabel || mapState.q || q;

    // ---- a postal district is selected ----
    if (mapState.fsa && DATA.fsaGeo[mapState.fsa]) {
      var g = DATA.fsaGeo[mapState.fsa];
      var hits = located.filter(function (p) { return p.fsa === mapState.fsa; });
      side.innerHTML = '<div class="ottrx__mapsidehead">' +
        '<button type="button" class="ottrx__back" data-area="' + esc(g.area) + '">&larr; ' + esc(g.area) + ' ' + t('map.ottawa') + '</button>' +
        '<h4>' + esc(g.name) + '</h4>' +
        '<p>' + esc(mapState.fsa) + ' · ' + t('map.approx') +
        (term ? ' · ' + mapMatchText(term) : '') + '</p></div>' +
        sideList(hits, 150);
      side.scrollTop = 0;
      return;
    }

    // ---- an area is selected: its districts, then its listings ----
    if (mapState.area) {
      var inArea = located.filter(function (p) { return areaOf(p.fsa) === mapState.area; });
      var dist = {};
      inArea.forEach(function (p) { dist[p.fsa] = (dist[p.fsa] || 0) + 1; });
      var dkeys = Object.keys(dist).sort(function (a, b) { return dist[b] - dist[a]; });
      side.innerHTML = '<div class="ottrx__mapsidehead">' +
        '<button type="button" class="ottrx__back" data-area="">' + t('map.backareas') + '</button>' +
        '<h4>' + esc(mapState.area) + ' ' + t('map.ottawa') + '</h4>' +
        '<p>' + (term ? mapMatchText(term) + '. ' : '') + t('map.choosehint') + '</p></div>' +
        (dkeys.length > 1 ? '<div class="ottrx__districts">' + dkeys.map(function (f) {
          return '<button type="button" class="ottrx__district" data-fsa="' + esc(f) + '">' +
                 esc(f) + '</button>'; }).join('') + '</div>' : '') +
        sideList(inArea, 150);
      side.scrollTop = 0;
      return;
    }

    // ---- records that are searchable but cannot honestly receive a marker ----
    if (mapState.unplaced) {
      side.innerHTML = '<div class="ottrx__mapsidehead">' +
        '<button type="button" class="ottrx__back" data-area="">' + t('map.backto') + '</button>' +
        '<h4>' + t('map.unplaced') + '</h4>' +
        (term ? '<p>' + mapMatchText(term) + '</p>' : '') + '</div>' + sideList(unplaced, 200);
      side.scrollTop = 0;
      return;
    }

    // ---- nothing selected: pick an area, or show everything ----
    if (mapState.all) {
      side.innerHTML = '<div class="ottrx__mapsidehead">' +
        '<button type="button" class="ottrx__back" data-area="">' + t('map.backto') + '</button>' +
        '<h4>' + t('map.allareas') + '</h4>' +
        (term ? '<p>' + mapMatchText(term) + '</p>' : '') + '</div>' + sideList(rows, 200);
      side.scrollTop = 0;
      return;
    }

    var areas = {};
    located.forEach(function (p) { var a = areaOf(p.fsa); areas[a] = (areas[a] || 0) + 1; });
    var akeys = Object.keys(areas).sort(function (a, b) { return areas[b] - areas[a]; });
    side.innerHTML = '<div class="ottrx__mapsidehead"><h4>' + t('map.choose') + '</h4>' +
      '<p>' + (term ? mapMatchText(term) + '. ' : '') + t('map.choosehint') + '</p></div>' +
      (rows.length ? '<button type="button" class="ottrx__areabtn ottrx__areabtn--all" data-showall="1">' +
        t('map.showall') + ' ' + t('listings') + '</button>' : '') +
      (unplaced.length ? '<button type="button" class="ottrx__areabtn ottrx__areabtn--unplaced" data-unplaced="1">' +
        '<span>' + t('map.showunplaced') + '</span></button>' : '') +
      (akeys.length ? akeys.map(function (a) {
        return '<button type="button" class="ottrx__areabtn" data-area="' + esc(a) + '">' +
               '<span>' + esc(a) + ' Ottawa</span></button>';
      }).join('') : '<div class="ottrx__hit"><p class="ottrx__hitmeta">' + t('map.nolistings') + '</p></div>');
    side.scrollTop = 0;
  }

  function drawMarkers(q) {
    if (!mapState.map) return;
    var L = window.L;
    if (mapState.layer) mapState.map.removeLayer(mapState.layer);
    mapState.layer = L.layerGroup().addTo(mapState.map);
    var by = {};
    locatedRows(mapFiltered(q)).forEach(function (p) {
      (by[p.fsa] = by[p.fsa] || { spec: 0, svc: 0, other: 0 })[p.k]++;
    });
    Object.keys(by).forEach(function (fsa) {
      var g = DATA.fsaGeo[fsa], c = by[fsa], total = c.spec + c.svc + c.other;
      var dominant = c.other >= c.spec && c.other >= c.svc ? '#7C3AED' : (c.spec >= c.svc ? '#0369A1' : '#0891B2');
      L.circleMarker([g.lat, g.lon], {
        radius: Math.max(9, Math.min(34, 7 + Math.sqrt(total) * 3.1)),
        color: '#fff', weight: 2, fillColor: dominant, fillOpacity: .78
      }).addTo(mapState.layer)
        .bindTooltip(g.name, { direction: 'top' })
        .on('click', function () {
          mapState.fsa = fsa;
          mapState.area = (DATA.fsaGeo[fsa] || {}).area || null;
          mapState.all = false;
          mapState.unplaced = false;
          renderSide(state.q);
        });
    });
  }

  function fitArea(area) {
    var L = window.L, pts = [];
    Object.keys(DATA.fsaGeo).forEach(function (f) {
      if (DATA.fsaGeo[f].area === area) pts.push([DATA.fsaGeo[f].lat, DATA.fsaGeo[f].lon]);
    });
    if (!pts.length || !mapState.map) return;
    try { mapState.map.fitBounds(L.latLngBounds(pts).pad(0.35)); } catch (e) {}
  }

  function initMap(q) {
    var el = panelEl.querySelector('[data-map]');
    if (!el || !window.L) return;
    var L = window.L;
    mapState.map = L.map(el, { scrollWheelZoom: false }).setView([45.395, -75.70], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapState.map);
    drawMarkers(q);
    renderSide(q);
  }

  function loadLeaflet(cb) {
    if (window.L) { cb(true); return; }
    if (mapState.failed) { cb(false); return; }
    var css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = LEAFLET_CSS;
    document.head.appendChild(css);
    var s = document.createElement('script');
    s.src = LEAFLET_JS; s.async = true;
    var done = false;
    var to = setTimeout(function () {
      if (done) return; done = true; mapState.failed = true; cb(false);
    }, 8000);
    s.onload = function () { if (done) return; done = true; clearTimeout(to); cb(!!window.L); };
    s.onerror = function () { if (done) return; done = true; clearTimeout(to); mapState.failed = true; cb(false); };
    document.head.appendChild(s);
  }

  function areaFallback(q) {
    var rows = locatedRows(mapFiltered(q)), byArea = {};
    rows.forEach(function (p) {
      var a = DATA.fsaGeo[p.fsa].area;
      (byArea[a] = byArea[a] || {})[p.fsa] = (byArea[a][p.fsa] || 0) + 1;
    });
    var h = '<div class="ottrx__warn">' + t('map.fail') + '</div>';
    h += '<div class="ottrx__tablewrap ottrx__tablewrap--stack"><table class="ottrx__table">' +
      '<thead><tr><th scope="col">' + t('col.area') + '</th><th scope="col">' + t('col.district') + '</th></tr></thead><tbody>';
    Object.keys(byArea).sort().forEach(function (a) {
      Object.keys(byArea[a]).sort().forEach(function (f) {
        h += '<tr><td data-th="Area">' + esc(a) + '</td>' +
             '<td data-th="Postal district">' + esc(f) + ' &mdash; ' + esc(DATA.fsaGeo[f].name) + '</td></tr>';
      });
    });
    return h + '</tbody></table></div>';
  }

  function segHtml(q) {
    var opts = [
      { v: '',     label: t('map.all'),      dot: 'both' },
      { v: 'spec', label: t('tab.spec'),     dot: 'spec' },
      { v: 'svc',  label: t('tab.svc'),      dot: 'svc' },
      { v: 'other',label: t('map.other'),     dot: 'other' }
    ];
    return '<div class="ottrx__seg" role="group" aria-label="' + t('map.showgroup') + '">' +
      opts.map(function (o, i) {
        var id = 'ottrx-mt-' + (o.v || 'all');
        return '<input class="ottrx__sr" type="radio" name="ottrx-maptype" id="' + id + '" ' +
          'value="' + o.v + '" data-mapfilter="type"' + (mapState.type === o.v ? ' checked' : '') + '>' +
          '<label class="ottrx__segopt" for="' + id + '">' +
            '<span class="ottrx__segdot ottrx__segdot--' + o.dot + '"></span>' +
            '<span class="ottrx__seglabel">' + esc(o.label) + '</span>' +
          '</label>';
      }).join('') + '</div>';
  }

  function renderMap(q) {
    var h = '<div class="ottrx__panelhead"><h2 class="ottrx__h2">' + t('map.title') + '</h2></div>';
    h += '<div class="ottrx__mapsearchwrap">' +
      '<svg class="ottrx__searchicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" aria-hidden="true" focusable="false">' +
        '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>' +
      '<label class="ottrx__sr" for="ottrx-mapsearch">' + t('map.filterlabel') + '</label>' +
      '<input class="ottrx__search ottrx__search--map" id="ottrx-mapsearch" type="text" data-mapsearch ' +
        'role="combobox" aria-expanded="false" aria-controls="ottrx-mapsuggest" aria-autocomplete="list" ' +
        'autocomplete="off" autocorrect="off" spellcheck="false" value="' + esc(mapState.qLabel || mapState.q) + '" ' +
        'placeholder="' + t('map.ph') + '">' +
      '<button type="button" class="ottrx__clear' + (mapState.q ? ' is-on' : '') + '" data-mapclear ' +
        'aria-label="' + t('map.clear') + '">&times;</button>' +
      '<ul class="ottrx__suggest" id="ottrx-mapsuggest" role="listbox" data-suggest hidden ' +
        'aria-label="' + t('map.suggestaria') + '"></ul>' +
      '<p class="ottrx__sr" aria-live="polite" data-suggestlive></p></div>';

    h += '<div class="ottrx__maptools">' + segHtml(q) + '</div>';


    if (mapState.failed) return h + areaFallback(q);

    h += '<div class="ottrx__maplayout">' +
      '<div class="ottrx__map" data-map role="application" aria-label="' + t('map.aria') + '">' +
        '<div class="ottrx__maploading">' + t('map.loading') + '<br>' + t('map.loading2') + '</div>' +
      '</div>' +
      '<aside class="ottrx__mapside" data-mapside aria-label="' + t('map.sidearia') + '"></aside></div>';

    return h;
  }

  function afterMapRender() {
    if (state.tab !== 'map' || mapState.failed) return;
    mapState.map = null;
    renderSide(state.q);   // show the area summary straight away, before tiles arrive
    loadLeaflet(function (okLoad) {
      if (state.tab !== 'map') return;
      if (!okLoad) { render(); return; }
      initMap(state.q);
    });
  }

  var TABS = [
    { id: 'all',         key: 'tab.all',      render: renderAll },
    { id: 'referral',    key: 'tab.referral', render: renderReferral },
    { id: 'map',         key: 'tab.map',      render: renderMap },
    { id: 'specialists', key: 'tab.spec',     render: renderSpecialists },
    { id: 'services',    key: 'tab.svc',      render: renderServices },
    { id: 'fax',         key: 'tab.fax',      render: renderFax },
    { id: 'forms',       key: 'tab.forms',    render: renderForms },
    { id: 'resources',   key: 'tab.res',      render: renderResources },
    { id: 'quick',       key: 'tab.quick',    render: renderQuick }
  ];

  // ---------- shell ----------
  var tabsEl = root.querySelector('[data-tabs]');
  var panelEl = root.querySelector('[data-panel]');
  var searchEl = root.querySelector('[data-search]');
  var clearEl = root.querySelector('[data-clear]');

  function renderTabs() {
    tabsEl.innerHTML = TABS.map(function (tb, i) {
      var on = tb.id === state.tab;
      return '<button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-' + tb.id + '" ' +
        'aria-controls="ottrx-panel" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" ' +
        'data-tab="' + tb.id + '">' + t(tb.key) +
        (tb.count ? ' <span class="n">' + tb.count + '</span>' : '') + '</button>';
    }).join('');
  }
  renderTabs();

  function current() {
    for (var i = 0; i < TABS.length; i++) if (TABS[i].id === state.tab) return TABS[i];
    return TABS[0];
  }

  function render() {
    var tb = current();
    Array.prototype.forEach.call(tabsEl.querySelectorAll('[data-tab]'), function (b) {
      var on = b.getAttribute('data-tab') === tb.id;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    panelEl.setAttribute('aria-labelledby', 'ottrx-tab-' + tb.id);
    panelEl.innerHTML = tb.render(state.q);
    clearEl.classList.toggle('is-on', !!state.q);
    updateFeedback(t(tb.key));
    if (tb.id === 'map') afterMapRender();
  }

  // Prefill the correction email. The section goes in the subject line so it can
  // be triaged at a glance; the body is three short prompts and nothing else.
  // No machine footer: it told the reader nothing and leaked the page URL.
  function updateFeedback(tabLabel) {
    var fr = LANG === 'fr';
    var subject = (fr ? 'Correction du répertoire : ' : 'Directory correction: ') + tabLabel;
    var body = (fr ? [
      'Bonjour,',
      '',
      'J’ai trouvé une information à corriger dans le répertoire.',
      '',
      'Quelle fiche (nom tel qu’il apparaît dans le répertoire) :',
      '',
      'Type de problème — supprimez les lignes qui ne s’appliquent pas :',
      '  - Information inexacte',
      '  - Ressource fermée',
      '  - Coordonnées modifiées',
      '  - Service ou fournisseur manquant',
      '  - Je suis un fournisseur et j’aimerais être ajouté',
      '  - Correction générale',
      '',
      'Ce qui est inexact :',
      '',
      'Ce qu’il faudrait indiquer (si vous le savez) :',
      '',
      'Veuillez ne pas inclure de renseignements sur les patients dans ce courriel.',
      '',
      'Merci,'
    ] : [
      'Hi,',
      '',
      'I found something in the directory that needs fixing.',
      '',
      'Which entry (name as it appears in the directory):',
      '',
      'Type of issue — delete the lines that do not apply:',
      '  - Incorrect information',
      '  - Resource has closed',
      '  - Contact details have changed',
      '  - Missing service or provider',
      '  - I am a provider and would like to be added',
      '  - General correction',
      '',
      'What is wrong:',
      '',
      'What it should say (if you know):',
      '',
      'Please do not include any patient information in this email.',
      '',
      'Thanks,'
    ]).join('\n');
    var href = 'mailto:' + FEEDBACK_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    Array.prototype.forEach.call(root.querySelectorAll('[data-feedback]'), function (a) {
      a.setAttribute('href', href);
    });
  }

  function writeHash() {
    var p = ['tab=' + state.tab];
    if (LANG !== 'en') p.push('lang=fr');
    if (state.q) p.push('q=' + encodeURIComponent(state.q));
    if (state.spec) p.push('spec=' + encodeURIComponent(state.spec));
    if (state.svc) p.push('svc=' + encodeURIComponent(state.svc));
    if (state.leaf) p.push('leaf=' + encodeURIComponent(state.leaf));
    if (state.lang) p.push('speclang=' + encodeURIComponent(state.lang));
    if (state.res) p.push('res=' + encodeURIComponent(state.res));
    var h = '#' + p.join('&');
    if (h !== location.hash) history.replaceState(null, '', h);
  }
  function readHash() {
    var h = location.hash.replace(/^#/, '');
    if (!h) return;
    h.split('&').forEach(function (kv) {
      var i = kv.indexOf('='); if (i < 0) return;
      var k = kv.slice(0, i), v = decodeURIComponent(kv.slice(i + 1));
      if (k === 'tab' && TABS.some(function (tb) { return tb.id === v; })) state.tab = v;
      if (k === 'q') state.q = norm(v);
      if (k === 'spec') state.spec = v;
      if (k === 'svc') state.svc = v;
      if (k === 'leaf') state.leaf = v;
      if (k === 'lang' && (v === 'fr' || v === 'en')) LANG = v;
      if (k === 'speclang') state.lang = v;
      if (k === 'res') state.res = v;
    });
    if (state.q) searchEl.value = state.q;
  }

  // ---------- events ----------
  var timer;
  searchEl.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.q = norm(searchEl.value.trim());
      state.shown = {};
      // Searching filters the tab you are already on. Cross-section results stay
      // one click away via the hint bar and the "Search everything" tab, rather
      // than yanking you out of the list you were reading.
      render(); writeHash();
    }, 180);
  });
  searchEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      searchEl.value = ''; state.q = ''; state.shown = {};
      render(); writeHash();
    }
  });
  clearEl.addEventListener('click', function () {
    searchEl.value = ''; state.q = ''; state.shown = {};
    render(); writeHash(); searchEl.focus();
  });

  tabsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]'); if (!b) return;
    state.tab = b.getAttribute('data-tab'); state.shown = {};
    render(); writeHash();
  });
  tabsEl.addEventListener('keydown', function (e) {
    var keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'h', End: 'e' };
    if (!(e.key in keys)) return;
    e.preventDefault();
    var i = TABS.findIndex(function (tb) { return tb.id === state.tab; });
    if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = TABS.length - 1;
    else i = (i + keys[e.key] + TABS.length) % TABS.length;
    state.tab = TABS[i].id; state.shown = {};
    render(); writeHash();
    tabsEl.querySelector('[data-tab="' + state.tab + '"]').focus();
  });

  // ---------------- combobox for the map's service filter ----------------
  var sgOpen = false, sgIndex = -1, sgItems = [], sgSuppress = false;

  function sgEls() {
    return { input: panelEl.querySelector('[data-mapsearch]'),
             list: panelEl.querySelector('[data-suggest]'),
             live: panelEl.querySelector('[data-suggestlive]') };
  }
  function sgClose() {
    var e = sgEls();
    sgOpen = false; sgIndex = -1; sgItems = [];
    if (e.list) { e.list.hidden = true; e.list.innerHTML = ''; }
    if (e.input) { e.input.setAttribute('aria-expanded', 'false'); e.input.removeAttribute('aria-activedescendant'); }
  }
  function sgPaint() {
    var e = sgEls();
    if (!e.list) return;
    e.list.innerHTML = sgItems.map(function (o, i) {
      return '<li class="ottrx__suggestopt' + (i === sgIndex ? ' is-active' : '') + '" role="option" ' +
        'id="ottrx-sg-' + i + '" aria-selected="' + (i === sgIndex) + '" data-sg="' + esc(o.name) + '">' +
        '<span class="ottrx__suggestname">' + esc(o.label || o.name) + '</span></li>';
    }).join('');
    if (sgIndex >= 0) {
      e.input.setAttribute('aria-activedescendant', 'ottrx-sg-' + sgIndex);
      var el = e.list.children[sgIndex];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    } else {
      e.input.removeAttribute('aria-activedescendant');
    }
  }
  function sgShow(text) {
    var e = sgEls();
    if (!e.input || !e.list) return;
    sgItems = suggestFor(text);
    if (!sgItems.length) { sgClose(); return; }
    sgOpen = true; sgIndex = -1;
    e.list.hidden = false;
    e.input.setAttribute('aria-expanded', 'true');
    sgPaint();
    if (e.live) e.live.textContent = t('map.suggestcount');
    e.list.scrollTop = 0;
  }
  function sgPick(name) {
    var e = sgEls();
    clearTimeout(mapTimer);          // the pending keystroke would overwrite this
    if (e.input) e.input.value = name;
    mapState.q = norm(name);
    mapState.qLabel = name;          // keep the proper capitalisation in the field
    sgClose();
    refreshMap();
    sgSuppress = true;   // refocusing must not immediately reopen the list
    var again = panelEl.querySelector('[data-mapsearch]');
    if (again) { again.focus(); try { again.setSelectionRange(name.length, name.length); } catch (err) {} }
    sgSuppress = false;
  }

  var mapTimer;
  function refreshMap() {
    // reset the drill-down first: it must happen whether or not the map object
    // exists, otherwise a new search leaves you stranded in the old area view
    mapState.fsa = null; mapState.area = null; mapState.all = false; mapState.unplaced = false;
    if (mapState.failed || !mapState.map) { render(); return; }
    drawMarkers(state.q);
    renderSide(state.q);
    var cl = panelEl.querySelector('[data-mapclear]');
    if (cl) cl.classList.toggle('is-on', !!mapState.q);
  }
  panelEl.addEventListener('input', function (e) {
    if (!(e.target.getAttribute && e.target.hasAttribute('data-mapsearch'))) return;
    var v = e.target.value;
    sgShow(v);
    clearTimeout(mapTimer);
    mapTimer = setTimeout(function () {
      mapState.q = norm(v.trim()); mapState.qLabel = v.trim(); refreshMap();
    }, 180);
  });
  panelEl.addEventListener('focusin', function (e) {
    if (sgSuppress) return;
    if (e.target.hasAttribute && e.target.hasAttribute('data-mapsearch')) sgShow(e.target.value);
  });
  panelEl.addEventListener('keydown', function (e) {
    if (!e.target.hasAttribute || !e.target.hasAttribute('data-mapsearch')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!sgOpen) { sgShow(e.target.value); return; }
      sgIndex += (e.key === 'ArrowDown' ? 1 : -1);
      if (sgIndex < 0) sgIndex = sgItems.length - 1;
      if (sgIndex >= sgItems.length) sgIndex = 0;
      sgPaint();
      return;
    }
    if (e.key === 'Enter') {
      if (sgOpen && sgIndex >= 0) { e.preventDefault(); sgPick(sgItems[sgIndex].name); }
      else { sgClose(); }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (sgOpen) { sgClose(); return; }
      e.target.value = ''; mapState.q = ''; mapState.qLabel = ''; refreshMap();
      return;
    }
    if (e.key === 'Tab') sgClose();
  });
  panelEl.addEventListener('mousedown', function (e) {
    var li = e.target.closest && e.target.closest('[data-sg]');
    // Keep focus in the combobox, but wait for the real click before removing
    // the option. Mutating on mousedown can redirect the click to a control
    // that appears underneath the old option.
    if (li) e.preventDefault();
  });
  document.addEventListener('click', function (e) {
    if (!sgOpen) return;
    if (e.target.closest && e.target.closest('.ottrx__mapsearchwrap')) return;
    sgClose();
  });

  panelEl.addEventListener('change', function (e) {
    var mf = e.target.getAttribute && e.target.getAttribute('data-mapfilter');
    if (mf) {
      mapState.type = e.target.value;
      refreshMap();
      var ms = panelEl.querySelector('[data-mapfilter="type"][value="' + mapState.type + '"]');
      if (ms) { ms.checked = true; ms.focus(); }
      return;
    }
    var f = e.target.getAttribute && e.target.getAttribute('data-filter');
    if (!f) return;
    state[f] = e.target.value; state.shown = {};
    if (f === 'svc') state.leaf = '';   // section changed: its categories no longer apply
    render(); writeHash();
    var sel = panelEl.querySelector('[data-filter="' + f + '"]');
    if (sel) sel.focus();
  });
  panelEl.addEventListener('click', function (e) {
    var resource = e.target.closest('[data-resource]');
    if (resource) {
      state.res = resource.getAttribute('data-resource') || '';
      render(); writeHash();
      var resourceTitle = panelEl.querySelector('[data-resource-title]');
      if (resourceTitle) resourceTitle.focus();
      return;
    }
    var suggestion = e.target.closest('[data-sg]');
    if (suggestion) { e.preventDefault(); sgPick(suggestion.getAttribute('data-sg')); return; }
    var sa = e.target.closest('[data-showall]');
    if (sa) { mapState.all = true; mapState.unplaced = false; mapState.area = null; mapState.fsa = null; renderSide(state.q); return; }
    var up = e.target.closest('[data-unplaced]');
    if (up) { mapState.unplaced = true; mapState.all = false; mapState.area = null; mapState.fsa = null; renderSide(state.q); return; }
    var ab = e.target.closest('[data-area]');
    if (ab) {
      var av = ab.getAttribute('data-area');
      mapState.area = av || null;
      mapState.fsa = null;
      mapState.all = false;
      mapState.unplaced = false;
      renderSide(state.q);
      if (mapState.map && av) fitArea(av);
      return;
    }
    var df = e.target.closest('[data-fsa]');
    if (df) {
      var fv = df.getAttribute('data-fsa');
      mapState.fsa = fv;
      mapState.area = (DATA.fsaGeo[fv] || {}).area || null;
      mapState.all = false;
      mapState.unplaced = false;
      renderSide(state.q);
      var gg = DATA.fsaGeo[fv];
      if (mapState.map && gg) mapState.map.setView([gg.lat, gg.lon], 12);
      return;
    }
    var mc = e.target.closest('[data-mapclear]');
    if (mc) {
      var mi = panelEl.querySelector('[data-mapsearch]');
      if (mi) { mi.value = ''; mi.focus(); }
      mapState.q = ''; mapState.qLabel = ''; sgClose(); refreshMap();
      return;
    }
    var go = e.target.closest('[data-goto]');
    if (go) {
      state.tab = go.getAttribute('data-goto');
      state.shown = {};
      render(); writeHash();
      var t = tabsEl.querySelector('[data-tab="' + state.tab + '"]');
      if (t) t.focus();
      return;
    }
    var b = e.target.closest('[data-more]'); if (!b) return;
    var k = b.getAttribute('data-more');
    state.shown[k] = (state.shown[k] || PAGE) + PAGE;
    render();
    var next = panelEl.querySelector('[data-more]');
    (next || panelEl).focus && (next || panelEl).focus();
  });

  // ---- language ----
  function applyLang() {
    root.setAttribute('lang', LANG);
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n]'), function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n-ph]'), function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-i18n-al]'), function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-al')));
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-lang]'), function (b) {
      var on = b.getAttribute('data-lang') === LANG;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    tabsEl.setAttribute('aria-label', t('tabsaria'));
    var note = root.querySelector('[data-frnote]');
    if (note) {
      if (LANG === 'fr') { note.textContent = t('fr.notice'); note.hidden = false; }
      else { note.hidden = true; }
    }
    renderTabs();
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lang]');
    if (!b) return;
    LANG = b.getAttribute('data-lang') === 'fr' ? 'fr' : 'en';
    MAP_SUGGEST = null;
    applyLang();
    render();
    writeHash();
  });

  window.addEventListener('hashchange', function () { readHash(); render(); });

  readHash();
  applyLang();
  render();
  root.setAttribute('aria-busy', 'false');
  }

  function bootError() {
    var panel = root.querySelector('[data-panel]');
    var fr = /^fr\b/i.test(root.getAttribute('lang') || '');
    if (panel) panel.innerHTML = '<div class="ottrx__warn" role="alert">' +
      (fr ? 'Le répertoire ne peut pas être chargé pour le moment. Veuillez réessayer.' :
            'The directory could not be loaded. Please try again.') + '</div>';
    root.setAttribute('aria-busy', 'false');
    root.classList.add('ottrx--load-error');
  }

  if (!DATA_URL || !window.fetch) { bootError(); return; }
  window.fetch(DATA_URL, { credentials: 'same-origin' })
    .then(function (response) {
      if (!response.ok) throw new Error('Directory data request failed');
      return response.json();
    })
    .then(boot)
    .catch(bootError);
})();
