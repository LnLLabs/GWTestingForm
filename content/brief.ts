export const docsUrl = "https://docs.genwealth.app";
export const demoUrl = "https://demo.genwealth.app";

export const brief = {
  eyebrow: "Preprod testnet",
  title: "Help us test GenWealth",
  intro:
    "This is the place to sign in with the preprod wallet you use on the demo, tell us how it went, and report bugs. Rewards are sent later to a mainnet address you sign with that same wallet.",
  checklist: [
    {
      title: "Read the guides",
      body: "Start with the docs so the demo matches what GenWealth is for.",
      href: docsUrl,
      label: "docs.genwealth.app",
    },
    {
      title: "Use the demo on preprod",
      body: "Connect the wallet you will sign in with here, and walk through the demo.",
      href: demoUrl,
      label: "demo.genwealth.app",
    },
    {
      title: "Come back and report",
      body: "Rate the demo, leave a comment, and file a bug whenever you find one.",
    },
  ],
  seedPhrase:
    "GenWealth never asks for your seed phrase. This site only asks your wallet to sign a short confirmation.",
  rewards:
    "Accepted bugs are rewarded by the severity we assign after review. You can suggest a severity. The one that counts is the one a reviewer sets.",
};
