# Console guide

> Source: [https://hapti.dev/docs/console](https://hapti.dev/docs/console). This copy is updated at each release.

> Every screen of the Hapti console with its direct link and the exact labels of its buttons, so an AI agent can walk a person through any job step by step.

The console at [app.hapti.dev](https://app.hapti.dev) is where people run tasks, manage keys, pay and invite their team. This page describes every screen, so that an assistant can guide someone through it without seeing their screen.

## How to guide someone

- **Give the direct link.** Every screen has its own address, listed below. Sending `https://app.hapti.dev/#/developers` is faster than describing the menu.
- **Quote the label exactly.** The console is in English and in French: it follows the browser, and each person picks a language under "My account" (click their name at the bottom of the menu, or `https://app.hapti.dev/#/account`). This guide gives each label in French, as it appears on screen, in quotes, with its meaning in English: click "Clé test" (Test key). Quote the English meaning to a person whose console is in English.
- **Check the mode first.** The console shows either Test or Live data, never both. If someone cannot find a task, a key or a webhook, it is usually in the other mode: the **Test** and **Live** switch is at the bottom of the left menu, above the person's name (at the top on a phone). The console opens in Live unless the person chose Test.
- **Check the role.** Some buttons only appear for some roles, see [Roles](#roles). A missing button is usually a missing permission, not a bug.
- **Search jumps anywhere.** Ctrl K (⌘ K on a Mac), or "Rechercher" at the top of the menu, opens a search over pages, tasks and people. Pasting a task id (`tsk_…`) or a Request-Id (`req_…`) opens it directly.

## Sign in

1. Open [app.hapti.dev](https://app.hapti.dev).
2. Click "Continuer avec GitHub", "Continuer avec Google", "Continuer avec Microsoft" (a work or school Microsoft account works too) or "Continuer avec GitLab".
3. The first sign in creates the person's organisation. Keys are then made on the developers screen, see [Get an API key](#get-an-api-key).

"J'ai une clé API" (I have an API key) opens the console with a key instead, in that key's mode only. Inviting people, authorizing AI apps and joining an organisation need GitHub or Google.

## Layout

The left menu holds, from top to bottom, the pages of the current project, then, under "Organisation", the settings shared by every project:

| Menu label | Meaning | Link |
| --- | --- | --- |
| "Vue d'ensemble" | Overview of the project | `https://app.hapti.dev/#/` |
| "Tâches" | Tasks, batches and schedules | `https://app.hapti.dev/#/tasks` |
| "Tests" | End-to-end test runs | `https://app.hapti.dev/#/tests` |
| "Bac à sable" | Playground, to run a task by hand | `https://app.hapti.dev/#/playground` |
| "Utilisateurs" | The people tasks are done for | `https://app.hapti.dev/#/users` |
| "Développeurs" | Keys, MCP, webhooks, request logs, settings of the project | `https://app.hapti.dev/#/developers` |
| "Paramètres" (under "Organisation") | Tabs "Général" (name, projects), "Équipe" (members, invitations, activity) and "Facturation" (credit, card, payments, spend per project) | `https://app.hapti.dev/#/settings` |

The team and the billing belong to the organisation: `https://app.hapti.dev/#/settings/team` and `https://app.hapti.dev/#/settings/billing`.

At the top of the menu, the project switcher shows the organisation name and the current project with its colour. Clicking it lists every organisation and project the person can open, "Nouveau projet" (new project) for owners and admins, and "Paramètres de l’organisation". The address of each page holds the project, such as `https://app.hapti.dev/#/p/org_…/tests`, so a shared link opens the right project. The menu also holds the **Test** / **Live** switch and the person's name with "Se déconnecter" (sign out). On a phone the menu uses short labels: "Accueil", "Tâches", "Tests", "Essayer", "Profils", "API", "Orga".

## Screens

### Overview

`https://app.hapti.dev/#/`

- "Premiers pas" (first steps): four steps with a button each, until all are done: run a first task, call the API, connect an agent by MCP, add a card. "Masquer" hides it.
- Four figures: tasks, success rate, credit, average duration. Tasks and credit link to their screens.
- "Dernières tâches" (latest tasks), with "Tout voir" (see all).
- "Nouvelle tâche" (new task) at the top right opens the playground.

### Tasks

`https://app.hapti.dev/#/tasks`

Three tabs: "Tâches", "Lots" (batches) and "Programmations" (schedules).

- The search box finds a task by goal, site, person or id.
- The period list: "Toujours", "24 h", "7 jours", "30 jours".
- The filters: "Toutes", "En cours", "Attendent" (waiting for an answer or for credit), "Réussies", "Échouées", "Annulées".
- Clicking a row opens the task.

A filtered link works too: `https://app.hapti.dev/#/tasks?user=customer_42` lists one person's tasks, `?status=succeeded` the successful ones.

### One task

`https://app.hapti.dev/#/tasks/tsk_…`

- At the top: the status, the price ("facturée" billed, "aucune action facturée" nothing billed, "facturée à l’action" billed per action while it runs), the number of actions and the duration.
- On the left: the agent's screen, live while it works ("EN DIRECT"), and one thumbnail per step.
- On the right: "Demande" (what was asked), "Réponse" (the answer, files to download with "Télécharger"), "Étapes" (each step with its time), and "Détails" (site, person, fields filled, recipe, id with "Copier").
- At the top right: "cURL" copies the same task as a command, "Relancer" starts it again once it is over. In live mode the button asks to confirm, as the new task is billed for each action that works.
- At the bottom: "Annuler la tâche" (cancel; only the actions already done are billed), "Le résultat est faux ?" (the result is wrong, see [Dispute](#dispute-a-wrong-result)), "Effacer la preuve" (erase the screenshots and steps). Each asks for a second click to confirm.

When the agent needs something, a box appears at the top of the right column, see [Answer a waiting task](#answer-a-waiting-task).

### Batches

`https://app.hapti.dev/#/batches`

The list of batches with their progress, results and amount billed. A batch is sent by the API; the screen shows the command to copy. Clicking a batch shows its tasks.

### Schedules

`https://app.hapti.dev/#/schedules`

The list of scheduled tasks, with "Pause", "Reprendre" (resume) and "Supprimer" (delete), and the form "Nouvelle programmation":

1. "Adresse de départ": the page to start on.
2. "Objectif": the goal, in plain words.
3. "Fréquence": "Toutes les…" (every) with a value like `15m`, `2h` or `1d`, at least 5 minutes, or "Règle cron" with a rule like `0 9 * * 1-5` (9 am Monday to Friday).
4. "Fuseau horaire": the time zone, filled with the browser's own.
5. "Programmer".

### Playground

`https://app.hapti.dev/#/playground`

Runs one task by hand, in the current mode.

1. "Adresse de départ": the page to start on.
2. "Objectif": what to do and what to report back.
3. "Options avancées" (advanced options), all optional:
   - "Données (JSON)": the facts the agent may use, as JSON.
   - "Utilisateur final": the person the task is for, which gives the agent their mailbox, session and vault.
   - "Budget maximum ($)": a price cap.
   - "Rejouer une recette": "Automatique" by default, or a recipe to replay.
   - "Proxy résidentiel", with "Pays de sortie" (exit country).
   - "Apprendre et rejouer": on by default.
4. "Lancer la tâche". The task page opens and shows the agent working.

"Exemples" fills the form with a ready example. "Même chose par l'API" shows the same task as a command, with "Copier".

### People

`https://app.hapti.dev/#/users`

Everyone tasks were done for, with their session, number of stored accounts and what they cost this month. A person appears with their first task. Clicking a row opens them.

### One person

`https://app.hapti.dev/#/users/customer_42`

- "Voir ses tâches": their tasks.
- "Lien de connexion": a link the person opens to store their own accounts in the vault. See [Let a person store their accounts](#let-a-person-store-their-accounts).
- "Boîte mail": the address the agent receives mail at for them. "Créer une boîte" creates one. A forward to the person's own address is offered with "Proposer"; they confirm it by mail. "Arrêter le transfert" stops it.
- "Journal d'identité": everything that touched their identity: mail received, accounts used, session saved.
- "Mandat": what the person allowed the agent to commit to on their behalf.
- "Session": the sites they are signed in to, and their device language and time zone.
- "Coffre": their stored accounts. Passwords are never shown.
- "Mémoire": facts the agent keeps about them. "Ajouter" adds one, "Oublier" removes it.
- "Limites": "Tâches par jour" and "Dépense par mois ($)", then "Enregistrer". Empty means no limit.

### Team

`https://app.hapti.dev/#/settings/team`

Tabs "Membres", "Invitations" and "Activité" (the last two for owners and admins).

The team belongs to the organisation and is the same in every project.

- "Membres": each member with their role, their projects ("Tous les projets" or a list), billing access, keys and last visit. Owners and admins change a role in its list, click "modifier" under the projects to choose "Tous les projets, y compris les prochains" or "Certains projets", and use "Retirer" (remove) to take someone out, which revokes their keys. Removing a project from someone revokes the keys they made in it. "Quitter" on one's own row leaves the organisation.
- "Facturation": a switch, for owners, that lets a member pay and see billing.
- "Organisation" and "Projet en cours", under the members: rename them with "Renommer". Owners rename the organisation; admins and owners rename the project.
- "Invitations": pending, accepted, expired and cancelled invitations, with "Renvoyer" (send again), "Nouveau lien" (new link) and "Annuler" (cancel).
- "Activité": who did what: keys, invitations, roles, webhooks, payments.

### Developers

`https://app.hapti.dev/#/developers`

Tabs "Configuration", "Requêtes" (request logs) and "Webhooks".

On "Configuration":

- The first box shows the command for a first task ("API") and the MCP configuration ("MCP"), with "Copier".
- "Clés API": the keys, their mode, who made them and when they were last used. "Clé test" and "Clé live" create a key. "Révoquer" revokes one.
- "Recettes": what successful tasks learned, with "Renommer" and "Supprimer".
- "Webhooks": how many addresses are active, with "Gérer" (manage).
- "Applications connectées": AI apps authorized with OAuth (Claude, ChatGPT…), with "Déconnecter".
- "Réglages par défaut" (owners and admins): "Proxy résidentiel" on or off for every task, "Pays de sortie", "Langue du navigateur" (browser language, "Automatique" when empty), "Version de l'API".
- "Domaine mail": a domain of the organisation for the people's mailboxes, with "Ajouter", the DNS records to add, "Vérifier" and "Retirer". Without one, addresses end in `@mail.hapti.dev`.

### Request logs

`https://app.hapti.dev/#/developers/logs`

Every API call made with a key of this mode, for 30 days. Search by path or Request-Id, filter with "Toutes", "Réussies" or "Erreurs". Clicking a row shows the parameters, the body sent and the answer, with passwords, tokens and file contents masked. Developers, admins and owners only.

### Webhooks

`https://app.hapti.dev/#/developers/webhooks`

"Adresses" lists the addresses events are sent to. "Envois" (deliveries) below lists every delivery, filtered with "Tous", "Livrés", "Échecs", "En attente" and by address. Clicking a delivery shows each attempt, the answer of the server and "Renvoyer" (send again).

### Billing

`https://app.hapti.dev/#/settings/billing`

- "Crédit disponible": the credit left, shared by test and live tasks.
- "Recharger": $10, $25, $50, $100 or "Autre" (other, $5 to $1,000).
- "Recharge automatique": tops the credit up when it gets low.
- "30 derniers jours": spending, tasks billed and average cost.
- "Consommation par jour": each day's tasks and cost. Clicking a day lists its tasks.
- "Paiements reçus": every top up and offered credit, with "Reçu" (receipt).

Only owners, and members an owner gave billing access to, can pay.

## Common jobs

### Get an API key

1. Open `https://app.hapti.dev/#/developers`.
2. Under "Clés API", click "Clé test" for a test key, or "Clé live" for a live one.
3. Click "Copier" right away: the key is never shown again. A key whose value was lost cannot be shown: revoke it with the bin icon on its row, then make a new one.

### Connect Hapti to an AI agent

**With a new key**, after creating it as above, the same box shows "Brancher à un agent" (connect to an agent) with three buttons: "Cursor" and "VS Code" open the editor and add Hapti, "Claude Code" copies a command to paste in a terminal.

**With any MCP client**, open `https://app.hapti.dev/#/developers`, click "MCP" in the first box and "Copier", then paste it in the client's MCP settings, with the key in place of `hp_test_…`.

**With OAuth**, in Claude, ChatGPT or another app that supports it, add the connector `https://api.hapti.dev/mcp`. The console then opens a consent page, see [Authorize an AI app](#authorize-an-ai-app).

### Authorize an AI app

When an app asks to use Hapti with OAuth, the console shows "Autoriser [app name]":

1. "Organisation": the organisation the app will act in. It is a choice only for someone who belongs to several.
2. "Projets": the projects the app may act in. Only the current project is ticked; "Tout cocher" ticks all. The app never sees the others, and a project created later is never added on its own.
3. "Droits": "Utiliser" (use: tasks and follow-up) or "Développer" (develop, for a coding agent: also projects, test keys, webhooks and tests). "Développer" selects "Test" below.
4. "Mode": "Live" (real tasks) or "Test" (nothing is sent for real).
5. "Autoriser" (allow) or "Refuser" (refuse).

The access can be withdrawn at any time under "Applications connectées" on `https://app.hapti.dev/#/developers`: the × next to a project takes that project away from the app, "Déconnecter" removes the app from all of them and revokes the keys it made: the button says how many before you confirm. An admin can take their project away from the app of a teammate. To add a project to an app, connect it again and tick it.

### Add a card and get the offered credit

1. Open `https://app.hapti.dev/#/settings/billing`.
2. Click "Ajouter une carte" in the offer at the top. Nothing is charged.
3. Enter the card in the Stripe window. The offered $5 arrive within seconds.

The same button appears in the bar at the top of every screen while the credit is low and no card is saved.

### Add credit

1. Open `https://app.hapti.dev/#/settings/billing`.
2. Under "Recharger", click an amount, or "Autre" then type one and click "Recharger".
3. With a saved card, a panel shows the card: click "Payer". Without one, the Stripe window opens, and the card you pay with is kept for the next payments. If it is the first card of the organisation, the offered $5 come with the payment, once per card.

If the payment fails, the panel says why and offers "Réessayer" (retry), "Utiliser une autre carte" or "Remplacer la carte". When the bank asks for a confirmation, its window opens. Retrying never charges twice. Tasks waiting for credit start on their own once it arrives.

### Turn on automatic top up

1. Open `https://app.hapti.dev/#/settings/billing`.
2. Under "Recharge automatique", click "Configurer" ("Enregistrer une carte" first if no card is saved).
3. Set "Sous" (below, at least $5), "recharger" (add, at least $10) and "au plus" (at most per month).
4. Tick the box agreeing to the charges, then "Activer".

"Modifier" changes it and "Arrêter" stops it.

### Run a first task

1. Open `https://app.hapti.dev/#/playground`.
2. Click an example under "Exemples", or fill "Adresse de départ" and "Objectif".
3. Click "Lancer la tâche" and watch the agent on the task page.

A task needs credit, in test as in live; without it, it waits and starts as soon as credit is added.

### Answer a waiting task

A task that needs something shows a box at the top of its right column:

- **A question** ("L'agent demande"): type the answer and click "Répondre".
- **An approval** ("L'agent demande votre accord"): click "Oui, vas-y" (yes) or "Non".

"Copier le lien" copies a page to send to the person the task is for, so they answer themselves, without an account, once.

To find every task that waits, open `https://app.hapti.dev/#/tasks` and click "Attendent".

### Cancel, retry or erase a task

On the task page:

- "Annuler la tâche", then "Confirmer l'annulation": the task stops; only the actions already done are billed.
- "Relancer", once the task is over: the same task starts again.
- "Effacer la preuve", then confirm: the screenshots and steps are deleted. They are otherwise kept 90 days.

### Dispute a wrong result

Within 7 days of a billed task:

1. Open the task and click "Le résultat est faux ?" at the bottom.
2. Say what is wrong, for example "the reference given is not the one on the site".
3. Click "Contester et être remboursé". Most disputes are refunded at once.

### Find a failed task and why

1. Open `https://app.hapti.dev/#/tasks` and click "Échouées".
2. Open the task: "Réponse" says what stopped it, and the last thumbnails show the screen at that moment.

To read the API call that created it, copy the Request-Id from your logs or code and paste it in the search (Ctrl K).

### Let a person store their accounts

1. Open the person: `https://app.hapti.dev/#/users/customer_42`.
2. Under "Lien de connexion", optionally fill "Site à connecter" and "Nom affiché".
3. Click "Créer le lien", then "Copier", and send it to the person yourself. It is valid 24 hours.

The person enters their accounts on that page. You never see their passwords, and neither does the AI: the vault types them.

### Limit what a person can spend

1. Open the person.
2. Under "Limites", fill "Tâches par jour" and or "Dépense par mois ($)".
3. Click "Enregistrer". Leave a field empty for no limit.

### Invite a teammate

1. Open `https://app.hapti.dev/#/settings/team` and click "Inviter".
2. Type their e-mail, choose the role and, when the organisation has several projects, "Tous les projets" or the projects they may open, then click "Envoyer l'invitation". "ou créer un lien" makes a link to send yourself instead.
3. They open the link, sign in with GitHub or Google, and click "Rejoindre".

Invitations are followed under the "Invitations" tab.

### Change a role or remove someone

1. Open `https://app.hapti.dev/#/settings/team`.
2. Change the role in the member's list, or click "Retirer" then confirm. Removing someone revokes their keys.

An organisation always keeps at least one owner.

### Switch project or organisation

Click the project switcher at the top of the left menu (on a phone, the project name at the top of the screen) and pick a project. Each project has its own keys, people, tasks, tests, webhooks and settings; the team belongs to the organisation.

### Create a project

1. Click the project switcher at the top of the left menu, then "Nouveau projet".
2. Type its name and click "Créer le projet". The console opens the new project on "Développeurs": create its API key there.

Use one project per product, so that each product has its own keys, people and tests, for example one project per app you build on Hapti.

### Add a webhook address

1. Open `https://app.hapti.dev/#/developers/webhooks` and click "Ajouter une adresse".
2. Fill "Adresse" (a public https address), optionally "Description" and "En-têtes envoyés" (headers, one per line).
3. Under "Événements", keep "Tous, y compris les prochains" or click "Choisir" and tick the events.
4. Click "Ajouter", then copy the signing secret shown, to check the `Hapti-Signature` header.

Clicking an address opens it: "Envoyer un test" sends a signed `ping`, "Renvoyer les échecs" sends again the events of the last 3 days it never received, "Générer un nouveau secret" rotates the secret (the old one stays valid 24 hours), "Mettre en pause", "Modifier" and "Supprimer".

### Read an API request

1. Open `https://app.hapti.dev/#/developers/logs`.
2. Paste the Request-Id or a path in the search box, or click "Erreurs".
3. Click the row to see the body sent and the answer.

### Change the default settings

On `https://app.hapti.dev/#/developers`, under "Réglages par défaut", owners and admins set the proxy, the exit country, the browser language and the API version for every task. Each change is saved at once. A task can still set its own.

## Roles

| Role (as shown) | Can |
| --- | --- |
| "Propriétaire" (owner) | Everything, including billing and the other owners |
| "Admin" | Team, every key, settings and webhooks, tasks |
| "Développeur" (developer) | Their own keys, tasks, request logs and webhook deliveries |
| "Lecteur" (viewer) | Sees tasks and people, changes nothing |

Paying and seeing billing need the owner role, or billing access given by an owner on the team screen.

## When something looks wrong

| What the person sees | What it means | What to do |
| --- | --- | --- |
| No task, key or webhook they expected | They are in the other mode | Click **Test** or **Live** in the left menu. The tasks screen offers "Passer en Live" or "Passer en Test" when the other mode has tasks |
| A bar "tâches en pause" at the top | The credit is used up | Add credit, see [Add credit](#add-credit). The tasks start on their own |
| "En pause · crédit" on a task | The same | The same |
| "Réservé aux développeurs, admins et propriétaires" | Their role cannot see request logs or webhooks | An owner or admin changes their role on the team screen |
| "Seul le propriétaire peut ajouter du crédit" | They cannot pay | An owner pays, or gives them billing access |
| A missing button | Their role does not allow it | See [Roles](#roles) |
| "Cette invitation n'est plus valable" | The invitation expired or was used | Ask for a new link: "Nouveau lien" under Invitations |
| "Nouvelle version de la console disponible" | The console was updated | Click "Mettre à jour" |
