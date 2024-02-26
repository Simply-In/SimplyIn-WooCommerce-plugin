import { useEffect } from 'react'
import { selectPickupPointInpost } from '../functions/selectInpostPoint';

const updateField = (addressField: string, elementId: string, data: any) => {
	if (addressField in data) {
		const element = document.getElementById(elementId) as HTMLInputElement;
		if (element) {
			try {
				element.value = data[addressField] || "";
			}
			catch (err) { console.log(err); }
		}
	}
}

const fillBillingData = (userData: any, shopDefaultNipField: Element | null) => {
	const address = userData.billingAddresses
	const companyCheckbox = document.querySelector("[value='company' i]") ?? document.querySelector("[value='firma' i]") ?? null

	const radioNodeList = companyCheckbox?.parentNode?.querySelectorAll('input[type="radio"]')
	const radioInputsArray = Array.from(radioNodeList ?? []);
	const filteredRadioInputs = radioInputsArray.filter(input => input !== companyCheckbox);

	const notFirma = document.getElementById(filteredRadioInputs[0]?.id)


	if (address?.taxId || address?.companyName) {

		if (companyCheckbox) {
			notFirma?.removeAttribute('checked')
			companyCheckbox?.setAttribute('checked', 'checked')
			const changeEvent = new Event('change', { bubbles: true });
			companyCheckbox?.dispatchEvent(changeEvent);
		}

	} else {
		companyCheckbox?.removeAttribute('checked')
		notFirma?.setAttribute('checked', 'checked')
		const changeEvent = new Event('change', { bubbles: true });
		notFirma?.dispatchEvent(changeEvent);
	}

	if ("taxId" in address) {
		const billing_tax_id_simply = (shopDefaultNipField ?? document.getElementById('billing_tax_id_simply')) as HTMLInputElement
		if (billing_tax_id_simply) {
			try {
				billing_tax_id_simply.value = address.taxId || ""
			} catch (err) { console.log(err); }
		}
	}

	updateField("name", 'billing_first_name', address);
	updateField("surname", 'billing_last_name', address);
	updateField("city", 'billing_city', address);
	updateField("companyName", 'billing_company', address);


	if ("country" in address) {
		const savedCountryCode = address.country;
		const countrySelect = document.getElementById('billing_country') as HTMLSelectElement;
		const countrySpan = document.getElementById('select2-billing_country-container') as HTMLSpanElement

		if (countrySelect?.options) {
			for (let i = 0; i < countrySelect?.options.length; i++) {
				if (countrySelect?.options[i].value === savedCountryCode) {
					countrySelect.selectedIndex = i;

					if (countrySpan?.innerText) {
						countrySpan.innerText = countrySelect?.options[i].innerText || ""
					}

					//causing shipping method update
					const changeEvent = new Event('change', { bubbles: true });
					countrySelect.dispatchEvent(changeEvent);

					break;
				}
			}
		}

	}

	updateField("appartmentNumber", 'billing_address_2', address);

	if ("street" in address) {
		const billing_address_1 = document.getElementById('billing_address_1') as HTMLInputElement
		if (billing_address_1) {

			try {
				billing_address_1.value = `${address.street} ${address.streetNumber ? address.streetNumber : ""}`
			} catch (err) { console.log(err); }
		}

	}

	updateField("postalCode", 'billing_postcode', address);



	if ("state" in address) {

		const stateElement: HTMLElement | null = document.getElementById('billing_state')

		if (stateElement?.nodeName) {
			const stateElementType = stateElement?.nodeName

			if (stateElementType === 'INPUT' && stateElement instanceof HTMLInputElement) {
				stateElement.value = address.state

			} else if (stateElementType === 'SELECT' && stateElement instanceof HTMLSelectElement) {

				const stateSpan = document.getElementById('select2-billing_state-container') as HTMLSpanElement
				for (let i = 0; i < stateElement.options.length; i++) {
					if (stateElement.options[i].value === address.state) {
						stateElement.selectedIndex = i;

						if (stateSpan?.innerText) {
							stateSpan.innerText = stateElement.options[i].innerText || ""
						}
						break;
					}
				}

			}
		}

	}
}


const fillShippingData = (userData: any) => {
	const checkbox = document.getElementById('ship-to-different-address-checkbox');
	try {
		if (checkbox) {
			(checkbox as HTMLInputElement).checked = true;

			const changeEvent = new Event('change', { bubbles: true });
			checkbox.dispatchEvent(changeEvent);


		}
	} catch (err) {
		console.log(err);
	}
	document.querySelector('.shipping_address')?.removeAttribute('style')
	const shippingAddress = userData.shippingAddresses

	updateField("name", 'shipping_first_name', shippingAddress);
	updateField("surname", 'shipping_last_name', shippingAddress);
	updateField("city", 'shipping_city', shippingAddress);
	updateField("companyName", 'shipping_company', shippingAddress);
	updateField("street", 'shipping_address_1', shippingAddress);
	updateField("appartmentNumber", 'shipping_address_2', shippingAddress);
	updateField("postalCode", 'shipping_postcode', shippingAddress);


	if ("country" in shippingAddress) {
		const savedCountryCode = shippingAddress.country || "";

		const countrySelect = document.getElementById('shipping_country') as HTMLSelectElement;
		const countrySpan = document.getElementById('select2-shipping_country-container') as HTMLSpanElement

		if (countrySelect) {
			for (let i = 0; i < countrySelect.options.length; i++) {
				if (countrySelect.options[i].value === savedCountryCode) {
					countrySelect.selectedIndex = i;

					if (countrySpan?.innerText) {
						countrySpan.innerText = countrySelect.options[i].innerText || ""
					}
					const changeEvent = new Event('change', { bubbles: true });
					countrySelect.dispatchEvent(changeEvent);
					break;
				}
			}
		}

	}
}


export const useInsertFormData = (userData: any, formElements: any) => {



	const shopDefaultNipField = document.querySelector('[placeholder*="nip" i]') ?? document.querySelector('[id*="nip" i]')

	useEffect((): void => {

		if (!Object.keys(userData).length) {
			return
		}
		if (userData.phoneNumber) {
			const billingPhone = document.getElementById('billing_phone') as HTMLInputElement;
			if (billingPhone) {
				billingPhone.value = userData.phoneNumber;
			}
		}



		if (userData?.billingAddresses) {

			fillBillingData(userData, shopDefaultNipField)

		}

		if (userData?.shippingAddresses) {
			fillShippingData(userData)
		}

		if (userData?.shippingAddresses === null) {
			const checkbox = document.getElementById('ship-to-different-address-checkbox');
			if ((checkbox as HTMLInputElement)?.checked) {
				checkbox?.click();
			}
			try {

				if (checkbox) {
					(checkbox as HTMLInputElement).checked = false;
				}
			}
			catch (err) {
				console.log(err);
			}

		}


		if (userData?.parcelLockers) {
			selectPickupPointInpost({ deliveryPointID: userData?.parcelLockers?.lockerId })
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData, formElements])

}
