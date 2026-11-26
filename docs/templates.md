# Templates

> Ready-made Hapti tasks for common jobs on websites without an API. Give a template id and its params instead of writing a goal.

Templates are tasks that are already written and tuned. Instead of a `url` and a `goal`, you give a `template` and its `params`. Everything else works like any task: `user`, `data`, `output`, webhooks and the rest.

```json
{
  "template": "recuperer_factures",
  "params": { "site": "https://billing.example.com", "period": "last 3 months" },
  "user": "customer_42"
}
```

## Available templates

| Template | What it does | Params |
| --- | --- | --- |
| `prendre_rdv` | On a booking site (prefecture, town hall, doctor...), books the first slot that fits. | `site`, `reason`, `window` |
| `deposer_formulaire` | Fills in an official or online form with the person’s data and submits it through to the confirmation. | `site`, `purpose` |
| `suivre_dossier` | Signs in and reports the status of a request: permit, benefit, application, claim... | `site`, `which` |
| `telecharger_document` | Gets a certificate or document from a personal account and returns it as a file. | `site`, `document` |
| `recuperer_factures` | Downloads the invoices of a customer account (energy, phone, suppliers) as files. | `site`, `period` |
| `mettre_a_jour_infos` | Changes the address, phone, IBAN or other details in a customer account. | `site`, `change` |
| `resilier` | Cancels a subscription or contract online through to the confirmation, declining retention offers. | `site`, `what`, `reason` |
| `reclamer` | Files a claim: train delay, lost parcel, overpayment, faulty product. | `site`, `case` |
| `publier_annonce` | Posts a listing on a classifieds site or marketplace, with photos and price. | `site`, `title`, `price`, `text` |
| `demander_devis` | Fills in a supplier’s quote form, then waits for the answer in the person’s mailbox. | `site`, `need`, `wait_minutes` |
| `passer_commande` | Orders on a supplier portal without an API, from the basket to the order number. | `site`, `items`, `delivery` |
| `relever_portail` | Signs in to a portal and reads figures or statuses: sales, stock, orders. | `site`, `what`, `schema` |
| `creer_compte` | Creates an account on a site with the person’s email and confirms the code received by email or SMS. | `site` |
| `inscription_evenement` | Registers the person for an event, training or webinar, and reports the confirmation. | `site`, `choice` |

List them with their params at any time with [`GET /v1/catalogue?lang=en`](api-catalogue.md).

```json
{
  "object": "list",
  "data": [
    {
      "id": "prendre_rdv",
      "group": "demarches",
      "name": "Book an appointment",
      "description": "On a booking site (prefecture, town hall, doctor…), books the first slot that fits.",
      "params": {
        "site": "address of the booking page",
        "reason": "reason for the appointment",
        "window": "preferred dates and times (optional)"
      }
    }
  ]
}
```

## When to write your own goal

Templates cover frequent jobs. For anything else, a clear goal works just as well: say what to achieve and what to report back, and put the facts in `data`.
