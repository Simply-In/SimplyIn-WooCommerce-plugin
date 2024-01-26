import axios from "axios";

let shopBase = '..'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
if (appLocalizer?.base_url) { shopBase = appLocalizer?.base_url; console.log(appLocalizer?.base_url); }
interface IMiddlewareApi {
	endpoint: "checkout/submitEmail" | "checkout/resend-checkout-code-via-email" | "checkout/submitPhoneNumber" | "checkout/submitCheckoutCode" | "checkout/createUserData" | "checkout/verifyPhoneNumber" | "userData" | "createOrder",
	method: "GET" | "POST" | "PATCH",
	requestBody: { email: string } | { code: string } | { phoneNumber: string }
	token?: string
}

export const middlewareApi = ({ endpoint, method, requestBody, token }: IMiddlewareApi) => {
	return axios.post(`${shopBase}/wp-content/plugins/simplyin/admin/api/submitData.php`, {
		endpoint,
		method,
		requestBody,
		token: token ?? ""
	})
		.then((response) => {
			return response.data
		})
		.catch((error) => {
			console.log(error);
		})
}

