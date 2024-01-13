# ComEd Prices App

This is a simple desktop application which retrieves and displays electricity prices from [ComEd’s price data API](https://hourlypricing.comed.com/hp-api/). I created this app in order to ensure that I know the most cost-effective times to turn on larger appliances.

This app uses the [Tauri framework](https://tauri.app/) and I initialized it with `create-tauri-app`. Most of the code is boilerplate that I left unedited. Notable files include the following:

- `src/main.ts` - Includes the core logic of the app, including calculations and API calls.
- `src/styles.css` - Specifies the stylistic design of the UI.
- `index.html` - Specifies the content of the UI.
- `.github/workflows/main.yml` - This file was taken from the [Tauri Action GitHub repository](https://github.com/tauri-apps/tauri-action), and I’ve mostly left it untouched. It ensures that GitHub automatically creates new binaries for each release to ensure cross-platform compatibility.

This app is not affiliated with ComEd in any way.
