import axios from "axios";

let shopBase = '..';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
if (appLocalizer?.base_url) { shopBase = appLocalizer?.base_url }

interface IRequestBoodyCoordinates {
	lat: string;
	lng: string;
}

interface IMiddlewareApi {
	endpoint: "checkout/submitEmail" | "checkout/resend-checkout-code-via-email" | "checkout/submitCheckoutCode" | "checkout/createUserData" | "userData" | "createOrder" | "addresses/find" | "parcelLockers/getClosest" | "checkout/checkIfSubmitEmailPushNotificationWasConfirmed" | "checkout/retrieveCompanyData";
	method: "GET" | "POST" | "PATCH";
	requestBody: any;
	token?: string;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const { woocommerce_version, plugin_version, current_user } = appLocalizer;

async function getLocalIP(): Promise<string | null> {
	try {
		const response = await fetch('https://api.ipify.org?format=json');
		const data = await response.json();
		return data.ip;
	} catch (error) {
		console.error('Error fetching IP address:', error);
		return null; // Handle the error as needed
	}
}

export const middlewareApi = async ({ endpoint, method, requestBody, token }: IMiddlewareApi) => {
	try {
		const ip = await getLocalIP();

		if (endpoint !== "parcelLockers/getClosest") {
			const response = await axios.post(`${shopBase}/wp-json/simplyin/data/`, {
				endpoint,
				method,
				requestBody: {
					...requestBody,
					ip: ip ?? "",
					shopVersion: woocommerce_version,
					plugin_version: plugin_version,
					shopUserEmail: current_user?.data?.user_email || undefined,
					platform: "WooCommerce"
				},
				token: token ?? "",
			});

			return response.data;
		} else {
			const response = await axios.post(`${shopBase}/wp-json/simplyin/data/`, {
				endpoint,
				method,
				requestBody: {
					"acceptedParcelLockerProviders": [
						"inpost",
						"ruch",
						"poczta",
						"ups",
						"dhl",
						"dpd",
						"meest",
						"fedex",
						"orlen"
					],
					"coordinates": {
						"lat": (requestBody as IRequestBoodyCoordinates).lat,
						"lng": (requestBody as IRequestBoodyCoordinates).lng
					},
					"searchRadiusInMeters": 20000,
					"numberOfItemsToFind": 50
				},
				token: token ?? "",
			});

			return response.data;
		}
	} catch (error) {
		console.error('Error in middlewareApi:', error);
		throw error; // Re-throw the error to handle it upstream if needed
	}
}