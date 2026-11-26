# API d'automatisation de sites web sans API

> Hapti automatise les démarches et formulaires sur les sites sans API, en français comme dans toutes les langues, avec un vrai navigateur, payé à l'action qui marche.

Beaucoup de sites dont dépendent vos utilisateurs n'ont pas d'API : espaces clients d'assureurs et de banques, mairies et administrations, cliniques, fournisseurs d'énergie, places de marché. Hapti est une API qui fait les tâches sur ces sites à leur place : vous donnez une adresse et un objectif en mots simples, un agent fait le travail dans un vrai navigateur, comme une personne, et renvoie le résultat avec la preuve.

```bash
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.service-public.fr",
       "goal": "Trouve le prix du timbre fiscal pour un passeport adulte."}'
```

## Ce que fait l'agent

- **Démarches et formulaires** : il remplit avec les données que vous donnez, et pose une question au lieu d'inventer quand il manque une valeur.
- **Connexion aux espaces personnels** : les identifiants sont dans un coffre chiffré, le modèle ne les voit jamais. Les codes reçus par e-mail ou par SMS sont lus par l'agent lui-même.
- **Une identité par personne** : chacun garde son navigateur, ses connexions, sa boîte mail, d'une tâche à l'autre.
- **Documents** : attestations, factures et relevés reviennent avec la tâche.
- **Toutes les langues** : la réponse suit la langue de la demande ; rien n'est imposé.

## Payé au travail fait

Vous payez chaque action de l'agent qui a marché, 0,01 $, quelle que soit l'issue de la tâche, en test comme en réel. Une action ratée ne coûte rien. Voir [la tarification](pricing.md) et le [démarrage rapide](quickstart.md).
