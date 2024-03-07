
import ReactDOM from "react-dom";
import { SimplyID } from "./components/SimplyID";
import { PhoneField } from "./components/PhoneField/PhoneField";
import SimplyBrandIcon from "./assets/SimplyBrandIcon";
import { middlewareApi } from "./services/middlewareApi";
import { saveDataSessionStorage } from "./services/sessionStorageApi";
import './i18n.ts'
// import { selectIPickupPointInpost } from "./functions/selectInpostPoint";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
if (appLocalizer) { console.log((appLocalizer)); }


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

// checking if there is a custom or built taxId/nip in field
const nipFieldHandling = () => {

	const defaultNipField = document.querySelectorAll('input[placeholder*="nip" i]:not([id="billing_tax_id_simply"]), input[id*="nip" i]:not([id="billing_tax_id_simply"])')
	//saving nipField id to session storage
	const existingNipElement = [...defaultNipField][0];

	console.log('existingNipElement', existingNipElement);

	const customNipFieldId = document.getElementById("simply_tax_label_id") as HTMLInputElement

	if (existingNipElement) {
		const taxIdField = document.getElementById('billing_tax_id_simply_field');
		saveDataSessionStorage({ key: "nipField", data: existingNipElement?.id })
		if (taxIdField) {
			taxIdField.style.display = 'none';
		}
		if (customNipFieldId && existingNipElement?.id) {
			try {
				customNipFieldId.value = existingNipElement?.id
			} catch (err) { console.log(err); }
		}
	} else {
		if (customNipFieldId) {
			try {
				customNipFieldId.value = "billing_tax_id_simply"
			} catch (err) { console.log(err); }
		}
	}





}
// moving email container field to top function
const placingEmailField = () => {

	const container = document.querySelector('.woocommerce-billing-fields__field-wrapper');

	// change class of Element to have wide
	const elementToMove = document.getElementById('billing_email_field');

	if (elementToMove && container) {
		const indexOfEmailFieldInContainer = Array.from(container?.children)?.indexOf(elementToMove);

		if (elementToMove.classList.contains('form-row-last')) {
			container.children[indexOfEmailFieldInContainer - 1].classList.remove("form-row-first")
			container.children[indexOfEmailFieldInContainer - 1].classList.add("form-row-wide")
		}

		if (elementToMove.classList.contains('form-row-first')) {
			container.children[indexOfEmailFieldInContainer + 1].classList.remove("form-row-last")
			container.children[indexOfEmailFieldInContainer + 1].classList.add("form-row-wide")
		}
	}

	// moving email container field to top

	elementToMove?.classList.remove("form-row-first")
	elementToMove?.classList.remove("form-row-last")
	elementToMove?.classList.add("form-row-wide")
	// Check if both the container and the element to move exist
	if (container && elementToMove) {
		//if first element is billing_name, insert email - simply-field at first place in checkout container
		if (container.children[0].classList.contains('billing_first_name_field')) {
			container.insertBefore(elementToMove, container.children[0]);
			elementToMove?.setAttribute('data-priority', "1");
		} else {
			container.insertBefore(elementToMove, container.children[1]);
			elementToMove?.setAttribute('data-priority', `1`);
		}

	} else {
		console.log('Container or element not found');
	}

}



// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
document.addEventListener("DOMContentLoaded", (async (): any => {

	const reactAppContainer = document.createElement("div");
	reactAppContainer.setAttribute("id", "reactAppContainer");
	reactAppContainer.setAttribute("class", "woocommerce-input-wrapper");



	const formContainer = document.getElementById("billing_email_field");
	formContainer?.appendChild(reactAppContainer);

	console.log('reactAppContainer', reactAppContainer);
	ReactDOM.render(
		<SimplyID />,
		document.getElementById("reactAppContainer")
	);


	const phoneAppInputField = document.getElementById("phoneAppInputField_field");
	if (phoneAppInputField) {
		phoneAppInputField.remove();
	}

	const phoneContainer = document.getElementById("order_review");
	const phoneAppContainer = document.createElement("div");
	phoneAppContainer.setAttribute("id", "phoneAppContainer");
	phoneAppContainer.setAttribute("class", "woocommerce-input-wrapper");

	phoneContainer?.insertBefore(phoneAppContainer, phoneContainer.childNodes[2]);


	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	ReactDOM.render(<PhoneField />, document.getElementById("phoneAppContainer"));



	//Logo simply inserting
	const BillingSection = document.querySelector('.woocommerce-billing-fields__field-wrapper');
	const simplyLogoContainer = document.createElement("div");
	simplyLogoContainer.setAttribute("id", "simplyLogoContainer");

	BillingSection?.insertBefore(simplyLogoContainer, BillingSection.firstChild);
	ReactDOM.render(
		<SimplyBrandIcon />,
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




	nipFieldHandling()
	//if there is a nip/taxId field, do not render taxIdField


	//manually placing email field at the top
	placingEmailField()

	//test request for checking if simplyin api key is valid
	const testRequest = await middlewareApi({
		endpoint: "checkout/submitEmail",
		method: 'POST',
		requestBody: { "email": "" }
	}).then(res => {
		return res
	})



	//function for deleting visual simply content when it shouldn't be rendered - no api key or invalid api key
	const deleteSimplyContent = () => {
		document.querySelector("#simplyLogoContainer")?.remove()
		document.querySelector("#phoneAppContainer")?.remove()
		document.querySelector("#billing_tax_id_simply_field")?.remove()
	}

	if (testRequest?.message === "Merchant api key not found") {
		console.log("SIMPLYIN API KEY INVALID");
		deleteSimplyContent()
	} else if (testRequest === "Error: Simplyin API key is empty") {
		deleteSimplyContent()
		console.log("SIMPLYIN API KEY IS EMPTY");
	}
	else {
		console.log("SIMPLYIN API KEY VALID");
	}

})());

