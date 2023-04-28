# VC Issuer Application

A Verifiable Credential (VC) Issuer Application built using Next.js. The application features a frontend for user interaction and backend services to communicate with ID-porten and issue VCs.

## Features

- User authentication with ID-porten
- Issuance of Verifiable Credentials (VCs)
- Backend services for VC management and ID-porten communication

## Prerequisites

- Node.js (v14 or later)
- npm

## Getting Started

1. Clone the repository:

```
git clone https://github.com/norges-bank/cbdc-sandbox-vc-issuer.git
cd vc-issuer-application
```

2. Install dependencies:

```
npm install
```

3. Configure the environment:

   Copy the `.env.example` file to a new file named `.env` and update the values to match your PostgreSQL database settings and ID-porten configuration.

```
cp .env.example .env
```

5. Start the development server:

```
npm run dev
```

6. Open your browser and visit http://localhost:3001 to access the application.

## Building and Running in Production

1. Build the application:

```
npm run build
```

2. Start the production server:

```
npm run start
```

3. Open your browser and visit http://localhost:3001 to access the application.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.