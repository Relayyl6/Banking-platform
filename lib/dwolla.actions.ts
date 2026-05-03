"use server";

import { Client } from "dwolla-v2";

const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        "Dwolla environment should either be set to `sandbox` or `production`"
      );
  }
};

const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions
) => {
  try {
    return await dwollaClient
      .post(`customers/${options.customerId}/funding-sources`, {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
      })
      .then((res) => res.headers.get("location"));
  } catch (err) {
    console.error("Creating a Funding Source Failed: ", err);
  }
};

export const createOnDemandAuthorization = async () => {
  try {
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations"
    );
    const authLink = onDemandAuthorization.body._links;
    return authLink;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
  }
};

// lib/actions/dwolla.actions.ts

export const createDwollaCustomer = async (newCustomer: {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
}) => {
  try {
    console.log("[DEBUG] Creating Dwolla customer with:", {
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
    });

    // IMPORTANT: Remove `type` field - it's not a valid Dwolla API field
    const dwollaCustomerData = {
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
      address1: newCustomer.address1,
      city: newCustomer.city,
      state: newCustomer.state,
      postalCode: newCustomer.postalCode,
      dateOfBirth: newCustomer.dateOfBirth,
      ssn: newCustomer.ssn,
      // type is NOT a valid field for Dwolla customer creation
    };

    const response = await dwollaClient.post("customers", dwollaCustomerData);
    const customerUrl = response.headers.get("location");
    
    console.log("[DEBUG] Dwolla customer created successfully:", customerUrl);
    
    if (!customerUrl) {
      throw new Error("No customer URL returned from Dwolla");
    }
    
    return customerUrl;
    
  } catch (err: any) {
    console.error("Dwolla API Error:", JSON.stringify(err.body, null, 2));

    // Check if customer already exists
    if (err.body?.code === 'DuplicateResource') {
      console.log("[DEBUG] Customer already exists, searching for existing customer...");
      // You might want to search for existing customer here
      throw new Error("Dwolla Validation: email - A customer with this email already exists");
    }

    const dwollaErrors = err.body?._embedded?.errors;
    if (dwollaErrors && dwollaErrors.length > 0) {
      const firstError = dwollaErrors[0];
      const field = firstError.path?.replace("/", "") || "field";
      const message = firstError.message;
      throw new Error(`Dwolla Validation: ${field} - ${message}`);
    }

    throw new Error("An unexpected error occurred with the payment provider.");
  }
};

export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  try {
    const requestBody = {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: amount,
      },
    };
    return await dwollaClient
      .post("transfers", requestBody)
      .then((res) => res.headers.get("location"));
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    // create dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // add funding source to the dwolla customer & get the funding source url
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};