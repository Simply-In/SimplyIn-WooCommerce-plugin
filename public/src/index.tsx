
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

const nipFieldHandling = () => {


	const nipField = document.querySelector('[placeholder*="nip" i]') || document.querySelector('[id*="nip" i]')
	console.log("nipField", nipField);


	saveDataSessionStorage({ key: "nipField", data: nipField?.id })

	if (nipField && nipField.id !== "billing_tax_id_simply") {
		console.log('element found');
		const taxIdField = document.getElementById('billing_tax_id_simply_field');
		if (taxIdField) {
			taxIdField.style.display = 'none';
		} else {
			console.log('Element not found');
		}
	} else {
		console.log('element not found');

	}

}

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

	// const billingFirstNameField = document.getElementById('billing_first_name_field');
	// const dataPriorityValue = billingFirstNameField?.getAttribute('data-priority')



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




	nipFieldHandling()
	//if there is nip field, do not render taxIdField




	placingEmailField()




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










})());

