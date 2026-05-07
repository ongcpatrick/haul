# Trello API Setup for Haul

Your board:

https://trello.com/b/IDD33TqM/ime-403-project-board/table

Board shortlink:

```text
IDD33TqM
```

Trello allows API writes through an API key + user token. The board URL alone is not enough for API updates.

## Step 1: Get A Trello API Key

Go to:

https://trello.com/power-ups/admin

Create/select a Power-Up and copy the API key.

Official Trello docs:

- https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/
- https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/

## Step 2: Generate A Token

Replace `YOUR_KEY_HERE` in this URL and open it in your browser:

```text
https://trello.com/1/authorize?expiration=30days&name=HaulSprintSeeder&scope=read,write&response_type=token&key=YOUR_KEY_HERE
```

Approve access, then copy the token.

## Step 3: Export Credentials Locally

Run these in Terminal. Do not paste these into GitHub or commit them.

```bash
export TRELLO_KEY="your_api_key_here"
export TRELLO_TOKEN="your_token_here"
```

## Step 4: Preview The Trello Update

```bash
cd "/Users/ongcp/Documents/AI Projects/IME 403 Haul Project"
python3 scripts/trello_seed_sprint_1d.py --dry-run
```

## Step 5: Write Cards To Trello

```bash
python3 scripts/trello_seed_sprint_1d.py
```

The script will:

- Find or create the required lists
- Add Sprint 1.D cards
- Skip cards that already exist by exact title
- Never store your API key or token

