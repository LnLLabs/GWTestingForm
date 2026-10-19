# GenWealth tester

Testers sign in with the Cardano preprod wallet they use on the demo, rate it, and file bugs. The app stores everything in a SQLite file. Local development does not use Docker. Production runs beside the demo, on the existing `genwealth` Docker network.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. The database is created at `data/tester.db` the first time the app runs.

To choose reviewer wallets, copy the environment file and add their preprod stake addresses:

```bash
cp .env.example .env
```

`ADMIN_STAKE_ADDRESSES` is a comma-separated list of `stake_test1...` addresses. Those wallets see a Review link after they sign in. Restart `npm run dev` after changing it.

## Production

On the demo server, the `genwealth` network already exists and Nginx is attached to it. From this directory:

```bash
cp .env.example .env
```

Set these in `.env` before starting:

- `SESSION_SECRET` — at least 32 random characters. Do not reuse the sample value.
- `APP_URL` — `https://tester.genwealth.app`
- `ADMIN_STAKE_ADDRESSES` — reviewer `stake_test1...` addresses
- `PRIVACY_CONTROLLER_NAME` — the founder (a natural person) named as data controller until GenWealth is a legal entity
- `PRIVACY_CONTACT_EMAIL` — where testers ask for access, deletion, or to withdraw email consent

`DATABASE_PATH` in `.env` is ignored in Docker. Compose stores the database in the `tester-data` volume.

```bash
docker compose up -d --build
```

The service name on the `genwealth` network is `tester`, and it listens on port 3000. Nginx should proxy `tester.genwealth.app` to `http://tester:3000` and keep the public host:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_pass http://tester:3000;
```

Wallets can sign on `http://localhost:3000` during development. They need HTTPS everywhere else.

## Wallet check

1. Install a Cardano wallet and switch it to preprod.
2. Open the site, connect that wallet, and sign the login message.
3. Enter an `addr1...` reward address, review the message, and sign it.
4. Save a star rating and file a bug.
5. Sign in with an allowlisted wallet and set the bug's status and severity.

## Email and privacy

Testers can leave an email on the feedback form. It is optional. Two separate consents are stored on `participants`: contact about testing and rewards, and product updates. The privacy notice is `/privacy`.

Have counsel review that notice before production. After incorporation, update it so the new company is the controller, and record that this personal data moved to that entity.

## Later payout check

A future script can read `participants.stake_address`, `participants.mainnet_address`, the latest `feedback` row, and `bugs` where `status` is `accepted`. Compare the stake address with preprod activity before paying the participation portion.
