# P2P Crypto Lending Frontend

A responsive and modular React frontend for the SatoshiFund peer-to-peer cryptocurrency lending platform, built as part of Coder Academy’s Advanced Applications subject (DEV1003).

---

## Overview

This application allows users to interact with a secure, blockchain-inspired crypto lending service. Users can manage wallets, request and fund loans, and view transactions — all in real time. It integrates with a RESTful backend to provide dynamic, authenticated experiences.

### Features

- 🔐 Authentication: Secure login and registration with JWT.
- 👛 Wallet Management: View balances, deposit/withdraw funds, and manage wallets.
- 💸 Loan Lifecycle: Request, browse, and fund loans.
- 🔄 Transactions: View full transaction history with type and timestamp.
- 📱 Responsive Design: Fully functional on desktop, tablet and mobile.
- ⚙️ Error Handling: Graceful, user-friendly feedback for invalid operations.
- 🧪 Testing: Component-level testing with Jest and React Testing Library.

### Github
This project can be found on [GitHub at the SatoshiFund organisation repo](https://github.com/orgs/SatoshiFundAus/repositories).

### Live Frontend
The frontend is live and available for use at: [https://satoshifund.netlify.app/](https://satoshifund.netlify.app/)

## API Integration
This frontend communicates with the SatoshiFund backend via RESTful API endpoints. The backend is currently live and available at: [https://dev1003-p2p-crypto-lending-backend.onrender.com](https://dev1003-p2p-crypto-lending-backend.onrender.com)

### Current Limitations
While the system provides a complete flow from user registration through deal acceptance and transaction generation, please note the following limitations:

- Loan repayment functionality is not implemented in the current version
- Real cryptocurrency transactions are not implemented (simulated for demonstration)

### Future Plans
- Implementation of loan repayment functionality
- Addition of user hot wallet functionality and real cryptocurrency transaction support, starting with Bitcoin
- Enhanced security features, appropriate to a web3 decentralised finance platform
- Comprehensive logging
- Implementation of rate limiting

---

## Tech Stack

### Core Dependencies

**React (v19.1.0)**  
A popular JavaScript library for building user interfaces. Chosen for its declarative, component-based architecture and broad industry adoption.

**React DOM (v19.1.0)**  
Enables rendering of React components into the DOM, managing efficient UI updates through virtual DOM diffing.

**React Router DOM (v7.6.0)**  
Handles client-side routing within the app, supporting dynamic nested routes and SPA navigation.

**React Toastify (v11.0.5)**  
Lightweight notification system for displaying toast messages. Used for success/error alerts throughout the app.

**@fortawesome/fontawesome-free (v6.7.2)**  
Provides scalable vector icons used across the UI to enhance visual clarity and user feedback.

### Development Dependencies

**Vite (v6.3.5)**  
Next-generation frontend build tool and dev server. Offers lightning-fast HMR, native ES modules, and faster builds compared to Webpack.

**@vitejs/plugin-react (v4.4.1)**  
Official Vite plugin that enables React Fast Refresh and JSX transformation.

**Jest (v29.7.0) & babel-jest (v30.0.0-beta.3)**  
Jest serves as the primary testing framework, with Babel support for modern JavaScript and JSX.

**@testing-library/react (v16.3.0) & @testing-library/jest-dom (v6.6.3)**  
Encourages writing tests that reflect user behavior and accessibility best practices in React components.

**ESLint (v9.25.0)**  
Linter for JavaScript used to enforce consistent code style. Configured with Airbnb-style conventions and integrated with Prettier.

**Prettier**  
Code formatter used in conjunction with ESLint to ensure readable, consistent code. Applied via IDE plugins and ESLint rules.

**Babel Presets**  
Includes `@babel/preset-env` and `@babel/preset-react` to support modern JavaScript and JSX features in the test environment.

**TypeScript Definitions**  
`@types/react` and `@types/react-dom` provide improved type safety and IDE support, even in a JavaScript-based codebase.

---

## Hardware Requirements

This frontend project is lightweight and optimised for modern development workflows using React and Vite.

### Local Development

- **CPU:** Dual-core processor (Intel i5/Ryzen 3 or equivalent)
- **RAM:** Minimum 4 GB (8 GB recommended for multitasking)
- **Disk:** 500 MB free space for node modules and project files
- **OS:** macOS, Linux, or Windows
- **Node.js:** v18 or later
- **Browser:** Chrome, Firefox, or Edge (latest stable release)

### Development/Test Server

- **vCPU:** 1 virtual core (shared or dedicated)
- **RAM:** 512 MB – 1 GB
- **Disk:** 1 GB storage for CI/CD artifacts and cache
- **Node.js Runtime:** v18 or higher

### Production Hosting (Static Frontend)

- **Hosting Platforms:** Netlify (used), Vercel, GitHub Pages, or Cloudflare Pages
- **RAM:** 128 MB+
- **vCPU:** Shared CPU sufficient for static site serving
- **Disk:** 100–300 MB for built static assets

Note: This frontend requires a running backend API for full functionality. CORS and JWT token headers must be correctly configured on the backend.

---

## Code Style

This project uses a custom ESLint configuration built on top of the **ESLint Recommended Rules**, along with plugins tailored for React and modern development best practices.

### Style Guide

- **Base Rules:** Built on [`@eslint/js`](https://eslint.org/docs/latest/use/configure/configuration-files-new#eslintjs) recommended rules
- **React Hooks:** Enforced with [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks) to ensure correct hook usage and prevent common mistakes
- **Vite Integration:** Includes [`eslint-plugin-react-refresh`](https://www.npmjs.com/package/eslint-plugin-react-refresh) to prevent unsafe exports during fast refresh
- **Globals:** Browser-specific globals enabled via [`globals`](https://www.npmjs.com/package/globals)
- **Parser:** ECMAScript 2020+ with JSX support

### Key Rules Enforced

- No unused variables (`no-unused-vars`) — ignores variables that match constants or uppercase patterns (e.g. `CAPITAL_CASE`)
- React hooks rules strictly followed (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)
- Restricts export patterns that can break hot module reloads (`react-refresh/only-export-components`)

This configuration ensures consistency across the codebase, encourages safe React practices, and aligns with modern JavaScript standards.

Note: Formatting (e.g. spacing, indentation) is managed through ESLint rules and Prettier integrations in local IDEs.

---

## Getting Started

### Installation

These instructions will help you get a copy of the frontend project up and running on your local machine for development and testing purposes.

1. Prerequisites

Before installing, ensure the following are installed on your system:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

You will also need access to the [SatoshiFund Backend API](https://github.com/SatoshiFundAus/dev1003-p2p-crypto-lending-backend) running locally or hosted remotely.

2. Clone the Repository

```bash
git clone https://github.com/SatoshiFundAus/dev1003-p2p-crypto-lending-frontend.git
cd dev1003-p2p-crypto-lending-frontend
```

3. Install Dependencies

```bash
   npm install
   # or
   yarn install
```

4. Start the Development Server

```bash
   npm start
   # or
   yarn start
```

Then open your browser and visit: http://localhost:3000

---

## Testing

To run the test suite:
```bash
npm test
# or
yarn test
```
The src/tests/ folder contains tests for key components and features of the application. These tests are written using Jest and React Testing Library to ensure reliability and maintainability.

1. `InterestTerms.test.jsx`
**Purpose:**  
Tests the Interest Terms page/component.
**Coverage:**
- Renders the loading state.
- Renders the title and table after loading.
- Verifies that interest term data (e.g., "3 months", "5.0%") is displayed.
- Checks that the informative note about monthly repayments is shown.

2. `Cryptocurrencies.test.jsx`
**Purpose:**  
Tests the Supported Cryptocurrencies page/component.
**Coverage:**
- Renders the loading state.
- Renders the title and table after loading.
- Verifies that cryptocurrency data (e.g., "Bitcoin", "BTC") is displayed.
- Checks that the informative note about supported cryptocurrencies is shown.

3. `RequestLoan.test.jsx`
**Purpose:**  
Tests the Request Loan page/component.
**Coverage:**
- Renders the loading state.
- Renders the loan request form after loading.
- Verifies that all form fields are present.
- Checks that collateral information is displayed.

4. `LoginRegister.test.jsx`
**Purpose:**  
Tests the Login and Register page/component.
**Coverage:**
- Renders login and register forms with correct headings.
- Verifies presence of required input fields and submit buttons.
- Checks for the existence of navigation links between login and register forms.

5. `Dashboard.test.jsx`
**Purpose:**  
Tests the Dashboard page/component.
**Coverage:**
- Renders the dashboard header, footer, and logo.
- Shows the loading state initially.
- Verifies the presence of the Bitcoin symbol and user icon in the header.

6. `BitcoinLivePrice.test.jsx`
**Purpose:**  
Tests the Bitcoin Live Price component.
**Coverage:**
- Renders the loading state.
- Displays the Bitcoin price after loading.
- Shows the last updated time.
- Handles and displays an error message if the API call fails.

---

## Project Structure

This frontend project follows a modular structure using React and Vite. It separates pages, components, assets, styles, test files, and config into clearly defined folders to support scalability and maintainability.

### Directory Tree

- __mocks__  
  - fileMock.js  
  - react-route-dom.js  
  - styleMock.js  
- docs  
  - assignment-1/  
  - assignment-2/  
  - assignment-3/  
  - LICENSE.md  
- eslint.config.js  
- index.html  
- jest.config.js  
- node_modules/  
- package-lock.json  
- package.json  
- public  
  - favicon.svg  
- README.md  
- src  
  - App.jsx  
  - assets/  
  - components/  
  - pages/  
  - styles/  
  - tests/  
  - main.jsx  
  - setupTests.js  
- vite.config.js  

### Folder and File Descriptions

### Folder Descriptions

- **`src/`** – Contains all application logic and visual structure.
  - `App.jsx` – Central app shell and route definitions.
  - `components/` – Reusable building blocks (e.g. headers, footers).
  - `pages/` – Top-level views tied to routes (e.g. Landing Page, Dashboard).
  - `styles/` – CSS Modules and global style files.
  - `assets/` – Static images, icons, or fonts.
  - `tests/` – Jest test suites for unit and integration testing.
  - `main.jsx` – React entry point that renders the app to the DOM.
  - `setupTests.js` – Configures the test environment for all test files.

- **`public/`** – Static files served directly, such as the favicon.
- **`__mocks__/`** – Mocked modules for use in tests.
- **`docs/`** – Assessment documentation and licensing.

This layout supports separation of concerns, simplifies navigation, and makes the app easier to extend as complexity grows.

---

## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Add your changes (git add .)
4. Commit your changes (git commit -m 'Add some AmazingFeature')
5. Push to the branch (git push origin feature/AmazingFeature)
6. Open a Pull Request

---

## Technology Decisions and Alternatives

This frontend project builds on the architectural and design principles outlined in our [Planning & Design Documentation](docs/assignment-1/DEV1003_Assessment_01.pdf). We proposed a React + Vite stack, justified by its developer experience, speed, and alignment with modern frontend best practices.

Below is a summary comparing our chosen technologies with alternatives that were considered:

| Category             | Chosen Tool                 | Alternatives                   | Rationale                                                                 |
|----------------------|-----------------------------|--------------------------------|---------------------------------------------------------------------------|
| Frontend Framework   | React                       | Vue, Angular                   | React is widely adopted, modular, and aligned with our learning goals.   |
| Build Tool           | Vite                        | Webpack, Parcel                | Vite is faster, simpler, and offers out-of-the-box HMR and modern syntax.|
| Routing              | React Router DOM            | Reach Router                   | React Router is the standard choice for SPAs and is well-documented.     |
| Styling              | CSS Modules                 | Styled Components, Sass        | CSS Modules offer simple scoping without runtime overhead.               |
| Icons                | Font Awesome                | Material Icons, Heroicons      | Font Awesome provided consistent styling and broad icon coverage.        |
| Notifications        | react-toastify              | Notistack, Snackbar            | react-toastify is simple, flexible, and integrates easily with React.    |
| Testing Framework    | Jest + React Testing Library| Mocha + Enzyme                 | Jest + RTL encourages user-centric testing and is well-supported.        |
| Code Quality         | ESLint + Prettier           | StandardJS, XO                 | This pairing enforces modern JavaScript standards and automatic formatting. |
| Development Hosting  | Netlify                     | Vercel, GitHub Pages           | Netlify supports CI/CD, environment variables, and React routing out of the box. |

These decisions reflect a balance between performance, team familiarity, and the educational scope of the project. Where possible, we chose tools that simplified setup while encouraging best practices in component design, testing, and code quality. For full justification of our architectural and planning choices, see the linked design documentation.

---

## Team
Project developed as part of Coder Academy's Advanced Applications Subject (DEV1003) - Assessment 3, as a collaboration between:

### Tyson Williams
- [GitHub Profile](https://github.com/TysonPWilliams)
- [LinkedIn](https://www.linkedin.com/in/tysonpwilliams/)

### Adrian Gidaro
- [GitHub Profile](https://github.com/adriangcodes)
- [LinkedIn](https://www.linkedin.com/in/adriangidaro)

---

## License

This project is licensed under the MIT License - see the [LICENSE](docs/LICENSE.md) file for details.

---

## Package Licensing

This project relies on a number of open-source packages, each governed by their respective licenses. Below is a summary of licenses for key dependencies:

### Core Dependencies

- [**react (v19.1.0)**](https://github.com/facebook/react/blob/main/LICENSE) – MIT License  
- [**react-dom (v19.1.0)**](https://github.com/facebook/react/blob/main/LICENSE) – MIT License  
- [**react-router-dom (v7.6.0)**](https://github.com/remix-run/react-router/blob/main/LICENSE) – MIT License  
- [**react-toastify (v11.0.5)**](https://github.com/fkhadra/react-toastify/blob/main/LICENSE) – MIT License  
- [**@fortawesome/fontawesome-free (v6.7.2)**](https://github.com/FortAwesome/Font-Awesome/blob/6.x/LICENSE.txt) – CC BY 4.0 License  

### Development Dependencies

- [**vite (v6.3.5)**](https://github.com/vitejs/vite/blob/main/LICENSE) – MIT License  
- [**@vitejs/plugin-react (v4.4.1)**](https://github.com/vitejs/vite-plugin-react/blob/main/LICENSE) – MIT License  
- [**eslint (v9.25.0)**](https://github.com/eslint/eslint/blob/main/LICENSE) – MIT License  
- [**@eslint/js (v9.25.0)**](https://github.com/eslint/eslint/blob/main/LICENSE) – MIT License  
- [**eslint-plugin-react-hooks (v5.2.0)**](https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/LICENSE) – MIT License  
- [**eslint-plugin-react-refresh (v0.4.19)**](https://github.com/vitejs/vite-plugin-react-swc/blob/main/packages/eslint-plugin-react-refresh/LICENSE) – MIT License  
- [**globals (v16.0.0)**](https://github.com/sindresorhus/globals/blob/main/license) – MIT License  
- [**jest (v29.7.0)**](https://github.com/jestjs/jest/blob/main/LICENSE) – MIT License  
- [**@jest/globals (v30.0.0-beta.3)**](https://github.com/jestjs/jest/blob/main/LICENSE) – MIT License  
- [**babel-jest (v30.0.0-beta.3)**](https://github.com/facebook/jest/blob/main/LICENSE) – MIT License  
- [**@testing-library/react (v16.3.0)**](https://github.com/testing-library/react-testing-library/blob/main/LICENSE) – MIT License  
- [**@testing-library/jest-dom (v6.6.3)**](https://github.com/testing-library/jest-dom/blob/main/LICENSE) – MIT License  
- [**@babel/preset-env (v7.27.2)**](https://github.com/babel/babel/blob/main/LICENSE) – MIT License  
- [**@babel/preset-react (v7.27.1)**](https://github.com/babel/babel/blob/main/LICENSE) – MIT License  
- [**@types/react (v19.1.2)**](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE) – MIT License  
- [**@types/react-dom (v19.1.2)**](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE) – MIT License  

Please consult each package’s official repository for full license details.

This project benefits from using open-source packages with permissive licenses such as **MIT**, which grant broad rights to use, modify, and distribute the software with minimal obligations — typically just crediting the original authors. This flexibility is ideal for academic, experimental, and commercial development alike.

One exception is **Font Awesome**, which is licensed under **Creative Commons Attribution 4.0 (CC BY 4.0)**. This allows for wide use and modification, provided appropriate attribution is given. Icons are used in accordance with this license for UI enhancement purposes only.

---

## References

Jest. (n.d.) Testing React Apps. Available at: https://jestjs.io/docs/tutorial-react (Accessed: 1 June 2025).

BrowserStack. (n.d.) React Testing Tutorial: A Complete Guide. Available at: https://www.browserstack.com/guide/react-testing-tutorial (Accessed: 1 June 2025).

Create React App. (n.d.) Running Tests. Available at: https://create-react-app.dev/docs/running-tests/ (Accessed: 1 June 2025).

React. (n.d.) React API Reference. Available at: https://react.dev/reference/react (Accessed: 16 May 2025).