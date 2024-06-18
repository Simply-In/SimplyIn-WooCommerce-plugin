/* eslint-disable @typescript-eslint/ban-ts-comment */

import ReactDOM from "react-dom";
import { SimplyID } from "./components/SimplyID";
import { PhoneField } from "./components/PhoneField/PhoneField";
import SimplyBrandIcon from "./assets/SimplyBrandIcon";
import { middlewareApi } from "./services/middlewareApi";
import { saveDataSessionStorage } from "./services/sessionStorageApi";
import './i18n.ts'


console.log('SimplyIn Hello');
// checking if there is a custom or built taxId/nip in field
const nipFieldHandling = () => {

	const defaultNipField = document.querySelectorAll('input[placeholder*="nip" i]:not([id="billing_tax_id_simply"]), input[id*="nip" i]:not([id="billing_tax_id_simply"])')
	//saving nipField id to session storage
	const existingNipElement = [...defaultNipField][0];

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

	}

}



// Function to update the style
function updateStyle() {

	setTimeout(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const selectButton = document.getElementById("billing_country_field").querySelector("span.woocommerce-input-wrapper").querySelector("span.select2-container.select2-container--default")
		const oldStyle = document.getElementById('dynamic-style');
		if (oldStyle) oldStyle.remove();
		const style = document.createElement('style');
		style.id = 'dynamic-style';

		// Add a CSS rule to the style element
		style.textContent = `
		.select2-dropdown.select2-dropdown--below {
		  width: ${(selectButton?.getBoundingClientRect().width ?? 300)}px !important; /* Or calculate the width based on window size */
		}`;

		document.head.append(style);
	}, 100)
}
//@ts-ignore
const isSafari = window.safari !== undefined;


if (isSafari) {

	updateStyle();

	// Update the style every time the window size changes
	window.onresize = updateStyle;
	window.onscroll = updateStyle;
}



//function that is waiting for DOM to load and then rendering react components
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
document.addEventListener("DOMContentLoaded", (async (): any => {
	setTimeout(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const selectButton = document.getElementById("billing_country_field").querySelector("span.woocommerce-input-wrapper").querySelector("span")
		// Add an inline onClick event to the button
		if (selectButton) {
			selectButton.onclick = function () {
				setTimeout(() => {
					const dropdownElement = document.querySelector('.select2-dropdown.select2-dropdown--below');
					if (dropdownElement) {

						if (!(dropdownElement as any)?.style?.width) {
							(dropdownElement as any).style.width = (selectButton)?.clientWidth
						}
					} else {
						console.log('Element not found');
					}
				}, 100)
			};
		}
	}, 1000)



	if (isSafari) {

		setTimeout(() => {
			updateStyle()
		}, 1000)
	}

	const reactAppContainer = document.createElement("div");
	reactAppContainer.setAttribute("id", "reactAppContainer");
	reactAppContainer.setAttribute("class", "woocommerce-input-wrapper");



	const formContainer = document.getElementById("billing_email_field");
	formContainer?.appendChild(reactAppContainer);

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

	if (testRequest?.message === "Merchant api key not found" || testRequest?.code === "UNAUTHORIZED") {
		console.log("SIMPLYIN API KEY INVALID");
		deleteSimplyContent()
	} else if (testRequest === "Error: Simplyin API key is empty") {
		deleteSimplyContent()
		console.log("SIMPLYIN API KEY IS EMPTY");
	}


})());

