import { test } from "@playwright/test";
import { USER } from "complete-randomer";
import { getDocument, queries, waitFor } from "pptr-testing-library";
const { getByText, getByLabelText } = queries;

import { loadExtension } from "./helpers/loadExtension";

const commonCreateWalletUserCreate = async () => {
  const user = USER.SINGLE();
  const { page: welcomePage, browser } = await loadExtension();

  // go through welcome page
  const $document = await getDocument(welcomePage);

  // go through welcome page
  const startedButton = await getByText($document, "Get Started");
  startedButton.click();

  await waitFor(() => getByText($document, "Protect your wallet"));

  // type user password and confirm password
  const passwordField = await getByLabelText($document, "Choose a password:");
  await passwordField.type(user.password);

  const passwordConfirmationField = await getByLabelText(
    $document,
    "Let's confirm you typed it correct:"
  );
  await passwordConfirmationField.type(user.password);

  // submit password form
  const passwordFormNextButton = await getByText($document, "Next");
  passwordFormNextButton.click();

  await waitFor(() => getByText($document, "Do you have a lightning wallet?"));

  return { user, browser, welcomePage, $document };
};

const commonCreateWalletSuccessCheck = async ({
  browser,
  welcomePage,
  $document,
}) => {
  // submit form
  const continueButton = await getByText($document, "Continue");
  continueButton.click();

  await welcomePage.waitForResponse(() => true);
  await waitFor(() => getByText($document, "Success!"));

  await browser.close();
};

test.describe("Create or connect wallets", () => {
  test("successfully creates an Alby wallet", async () => {
    const { user, browser, welcomePage, $document } =
      await commonCreateWalletUserCreate();

    // click at "Create Alby Wallet"
    const createNewWalletButton = await getByText($document, "Alby Wallet");
    createNewWalletButton.click();

    await waitFor(() => getByText($document, "Your Alby Lightning Wallet"));

    // type user email
    const emailField = await getByLabelText($document, "Email Address");
    await emailField.type(user.email);

    // type user password and confirm password
    const walletPasswordField = await getByLabelText($document, "Password");
    await walletPasswordField.type(user.password);

    // click create a wallet button
    const createWalletButton = await getByText($document, "Continue");
    createWalletButton.click();

    await welcomePage.waitForResponse(() => true);

    await waitFor(() => getByText($document, "Your Alby account is ready."));

    await commonCreateWalletSuccessCheck({ browser, welcomePage, $document });
  });

  test("successfully connects to LNBits wallet", async () => {
    const { browser, welcomePage, $document } =
      await commonCreateWalletUserCreate();

    // click at "Create LNbits Wallet"
    const createNewWalletButton = await getByText($document, "LNbits");
    createNewWalletButton.click();

    await waitFor(() => getByText($document, "Connect to LNbits"));

    const lnBitsAdminKey = "d8de4f373561446aa298cae2b9424325";
    const adminKeyField = await getByLabelText($document, "LNbits Admin Key");
    await adminKeyField.type(lnBitsAdminKey);

    await commonCreateWalletSuccessCheck({ browser, welcomePage, $document });
  });

  test("successfully connects to BlueWallet", async () => {
    const { browser, welcomePage, $document } =
      await commonCreateWalletUserCreate();

    // click at "LNDHub (BlueWallet)"
    const createNewWalletButton = await getByText(
      $document,
      "LNDHub (Bluewallet)"
    );
    createNewWalletButton.click();

    await waitFor(() => getByText($document, "Connect to LNDHub (BlueWallet)"));

    const lndHubUrl =
      "lndhub://c269ebb962f1a94f9c29:f6f16f35e935edc05ee7@https://lndhub.io";
    const lndUrlField = await getByLabelText($document, "LNDHub Export URI");
    await lndUrlField.type(lndHubUrl);

    await commonCreateWalletSuccessCheck({ browser, welcomePage, $document });
  });
});
