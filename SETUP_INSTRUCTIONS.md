package.json content should include nodemailer dependency. Please update package.json to add nodemailer:

```json
npm install nodemailer
```

Update package.json scripts section to include:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seed.js",
  "test": "jest"
}
```

To run the seed script after setup:

```bash
npm run seed
```
