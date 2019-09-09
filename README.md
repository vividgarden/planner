# Planner

Progress reporting tool for Tabechoku dev team.

## Feature

- Serverless framework
- Node.js (express)
- Typescript
- DynamoDB
- AWS

## Install

### Setup Dotenv

```
cp dotenv .env

# EDIT .env
```

### DynamoDB Local install

```
yarn run sls dynamodb install
```


## Run

### Start Application

```
yarn run sls offline start 
```

## Tips

### Run lambda function locally

```
IS_OFFLINE=true yarn run sls invoke local --function syncTicketJob
```

### Deploy Dev

```
yarn run sls deploy 
```


### Deploy Production

```
yarn run sls deploy --stage prd
```

## License

MIT 
