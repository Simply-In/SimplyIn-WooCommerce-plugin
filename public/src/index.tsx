
import ReactDOM from "react-dom";
import { SimplyID } from "./components/SimplyID";
import { PhoneField } from "./components/PhoneField/PhoneField";
import SimplyBrandIcon from "./assets/SimplyBrandIcon";
import { middlewareApi } from "./services/middlewareApi";
// import { selectIPickupPointInpost } from "./functions/selectInpostPoint";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// if (appLocalizer) { console.log((appLocalizer.apiKey)); }
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore


type data = {
	selector?: string;
	getFirst?: boolean

}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const waitForElementToRender = (data: data) => {

	return new Promise((resolve) => {
		const observer = new MutationObserver(() => {

			const element = () => {
				if (data?.selector && !data?.getFirst) {
					return document.querySelector(data.selector);
				} else if (data?.selector && data?.getFirst) {
					return document.querySelectorAll(data.selector)[0];
				}

			}
			if (element()) {
				observer.disconnect();
				resolve(element());
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
	});
}







// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
document.addEventListener("DOMContentLoaded", (async (): any => {


	let isValid = true

	const reactAppContainer = document.createElement("div");
	reactAppContainer.setAttribute("id", "reactAppContainer");
	reactAppContainer.setAttribute("class", "woocommerce-input-wrapper");



	const formContainer = document.getElementById("billing_email_field");
	formContainer?.appendChild(reactAppContainer);

	console.log('reactAppContainer', reactAppContainer);
	ReactDOM.render(
		isValid && <SimplyID />,
		document.getElementById("reactAppContainer")
	);

	const phoneContainer = document.getElementById("order_review");
	const phoneAppContainer = document.createElement("div");
	phoneAppContainer.setAttribute("id", "phoneAppContainer");
	phoneAppContainer.setAttribute("class", "woocommerce-input-wrapper");

	phoneContainer?.insertBefore(phoneAppContainer, phoneContainer.childNodes[2]);


	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	ReactDOM.render(isValid && <PhoneField />, document.getElementById("phoneAppContainer"));



	//Logo

	const BillingSection = document.querySelector('.woocommerce-billing-fields__field-wrapper');
	const simplyLogoContainer = document.createElement("div");
	simplyLogoContainer.setAttribute("id", "simplyLogoContainer");

	BillingSection?.insertBefore(simplyLogoContainer, BillingSection.firstChild);
	ReactDOM.render(
		isValid && <SimplyBrandIcon />,
		document.getElementById("simplyLogoContainer")
	);


	const BillingFieldsWrapper = document.querySelector(".woocommerce-billing-fields__field-wrapper") as HTMLElement
	if (BillingFieldsWrapper) {
		BillingFieldsWrapper.style.marginTop = "0";
	}

	const BillingFieldsH3 = document.querySelector('.woocommerce-billing-fields h3') as HTMLElement

	if (BillingFieldsH3) {
		BillingFieldsH3.style.marginBottom = "0";
	}



	const testRequest = await middlewareApi({
		endpoint: "checkout/submitEmail",
		method: 'POST',
		requestBody: { "email": "" }
	}).then(res => {
		return res
	})


	const deleteSimplyContent = () => {

		document.querySelector("#simplyLogoContainer")?.remove()
		document.querySelector("#phoneAppContainer")?.remove()

	}


	console.log(testRequest);
	if (testRequest === "Unauthorized") {
		console.log("SIMPLYIN API KEY INVALID");
		isValid = false
		deleteSimplyContent()
		return
	} else if (testRequest === "Simplyin apikey is empty") {
		isValid = false
		deleteSimplyContent()
		console.log("SIMPLYIN API KEY IS EMPTY");
		return
	}
	else {
		isValid = true
		console.log("SIMPLYIN API KEY VALID");
	}



	// selectIPickupPointInpost({ deliveryPointID: 'LGE04M' });

})());

