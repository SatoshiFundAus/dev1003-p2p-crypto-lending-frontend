# P2P Crypto Lending Frontend

A modern, responsive frontend for the SatoshiFund peer-to-peer cryptocurrency lending platform, built with React.

## Overview

SatoshiFund’s frontend provides a seamless user experience for lending and borrowing crypto assets, managing wallets, and tracking transactions. The app is designed for clarity, accessibility, and security, integrating tightly with the backend API to deliver real-time data and robust workflows.
Developed with React, the frontend leverages modular components, secure authentication (via JWT), and modern UI/UX best practices. The platform uses RESTful API calls to interact with the backend and supports all major lending and borrowing features.

## Features

- User Authentication: Secure login and registration with JWT.
- Wallet Management: View balances, deposit, withdraw, and create/delete wallets.
- Loan Requests: Request loans with customizable terms and collateral.
- Lending: Browse, fund, and track loan requests.
- Transactions: View incoming and outgoing transaction history.
- Interest Terms: View current loan terms and interest rates.
- Supported Cryptocurrencies: See which cryptocurrencies are available for lending and borrowing.
- Responsive Design: Fully responsive for desktop, tablet, and mobile.
- User-Friendly Error Handling: Clear, actionable error messages throughout the app.

## Technology Stack

| Category | Tool/Library | Rationale |
|------------------|----------------------------|--------------------------------------------------------------------------|
| Frontend | React | Component-based, fast, and widely adopted. |
| State Management | React Hooks | Simple, local state management. |
| Routing | React Router | Declarative routing for SPA navigation. |
| Styling | CSS Modules | Scoped, maintainable styles per component. |
| Notifications | react-toastify | User-friendly toast notifications. |
| HTTP Requests | fetch API | Native, promise-based HTTP requests. |
| Authentication | JWT | Secure, stateless authentication. |
| Testing | Jest + React Testing Library | Modern, robust testing for React components. |

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
Clone the repository:
```bash
    git clone https://github.com/SatoshiFundAus/dev1003-p2p-crypto-lending-frontend.git
    cd dev1003-p2p-crypto-lending-frontend
```

Install dependencies:
```bash
   npm install
   # or
   yarn install
```

Start the development server:
```bash
   npm start
   # or
   yarn start
```

Open your browser:
Visit http://localhost:3000

### Running Tests
```bash
npm test
# or
yarn test
```
## Project Structure
src/
  components/         # React components (pages, UI, forms, etc.)
  styles/             # Global and shared styles
  App.jsx             # Main app component and routes
  index.js            # Entry point

## API Integration
This frontend communicates with the SatoshiFund Backend via RESTful API endpoints. Ensure the backend is running and accessible for full functionality.

## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Add your changes (git add .)
4. Commit your changes (git commit -m 'Add some AmazingFeature')
5. Push to the branch (git push origin feature/AmazingFeature)
6. Open a Pull Request

## Technology Decisions and Alternatives
| Category | Chosen Tool | Alternatives | Rationale |
|------------------|---------------------------|----------------------|----------------------------------------------------------------|
| Frontend | React | Vue, Angular | React’s ecosystem, flexibility, and learning goals. |
| Styling | CSS Modules | Styled Components | CSS Modules offer scoping and simplicity. |
| Routing | React Router | Reach Router | React Router is the standard for SPA navigation. |
| Notifications | react-toastify | Notistack, Snackbar | Simple, customizable, and widely used. |
| Testing | Jest + RTL | Mocha, Enzyme | Modern, robust, and well-documented for React. |

## Team
Developed as part of Coder Academy's Advanced Applications Subject (DEV1003) - Assessment 2, as a collaboration between:
Tyson Williams
GitHub | LinkedIn
Adrian Gidaro
GitHub | LinkedIn

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## References
Jest. (n.d.) Testing React Apps. Available at: https://jestjs.io/docs/tutorial-react (Accessed: 1 June 2025).

BrowserStack. (n.d.) React Testing Tutorial: A Complete Guide. Available at: https://www.browserstack.com/guide/react-testing-tutorial (Accessed: 1 June 2025).

Create React App. (n.d.) Running Tests. Available at: https://create-react-app.dev/docs/running-tests/ (Accessed: 1 June 2025).

React. (n.d.) React API Reference. Available at: https://react.dev/reference/react (Accessed: 16 May 2025).