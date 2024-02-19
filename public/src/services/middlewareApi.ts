import axios from "axios";

let shopBase = '..'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
if (appLocalizer?.base_url) { shopBase = appLocalizer?.base_url; console.log(appLocalizer?.base_url); }

interface IRequestBoodyCoordinates {
	lat: string, lng: string
}
interface IMiddlewareApi {
	endpoint: "checkout/submitEmail" | "checkout/resend-checkout-code-via-email" | "checkout/submitPhoneNumber" | "checkout/submitCheckoutCode" | "checkout/createUserData" | "checkout/verifyPhoneNumber" | "userData" | "createOrder" | "addresses/find" | "parcelLockers/getClosest",
	method: "GET" | "POST" | "PATCH",
	requestBody: { email: string } | { code: string } | { phoneNumber: string } | { searchAddressBy: string, token: string } | IRequestBoodyCoordinates
	token?: string

}

export const middlewareApi = ({ endpoint, method, requestBody, token }: IMiddlewareApi) => {


	if (endpoint !== "parcelLockers/getClosest") {
		return axios.post(`${shopBase}/wp-json/simplyin/data/`, {
			endpoint,
			method,
			requestBody,
			token: token ?? "",
		})
			.then((response) => {
				return response.data
			})
			.catch((error) => {
				console.log(error);
			})
	}
	else {
		return axios.post(`${shopBase}/wp-json/simplyin/data/`, {
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
		})
			.then((response) => {
				return response.data
			})
			.catch((error) => {
				console.log(error);
			})

	}
}

