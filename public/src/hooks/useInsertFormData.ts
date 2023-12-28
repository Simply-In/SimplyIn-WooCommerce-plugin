import { useEffect } from 'react'
import { selectPickupPointInpost } from '../functions/selectInpostPoint';

export const useInsertFormData = (userData: any, formElements: any) => {
	console.log('insert', userData);
	useEffect((): void => {

		if (!Object.keys(userData).length) {
			return
		}
		if (userData.phoneNumber) { (document.getElementById('billing_phone') as HTMLInputElement).value = userData.phoneNumber }


		if (userData?.billingAddresses) {
			const address = userData.billingAddresses

			if ("name" in address) { (document.getElementById('billing_first_name') as HTMLInputElement).value = address.name || "" }
			if ("surname" in address) { (document.getElementById('billing_last_name') as HTMLInputElement).value = address.surname || "" }
			if ("city" in address) { (document.getElementById('billing_city') as HTMLInputElement).value = address.city || "" }
			if ("companyName" in address) { (document.getElementById('billing_company') as HTMLInputElement).value = address.companyName || "" }
			if ("taxId" in address) { (document.getElementById('billing_tax_id') as HTMLInputElement).value = address.taxId || "" }
			if ("country" in address) {
				const savedCountryCode = address.country;
				const countrySelect = document.getElementById('billing_country') as HTMLSelectElement;
				const countrySpan = document.getElementById('select2-billing_country-container') as HTMLSpanElement

				if (countrySelect) {
					for (let i = 0; i < countrySelect.options.length; i++) {
						if (countrySelect.options[i].value === savedCountryCode) {
							countrySelect.selectedIndex = i;

							if (countrySpan?.innerText) {
								countrySpan.innerText = countrySelect.options[i].innerText || ""
							}

							//causing shipping method update
							const changeEvent = new Event('change', { bubbles: true });
							countrySelect.dispatchEvent(changeEvent);

							break;
						}
					}
				}

			}
			if ("street" in address) { (document.getElementById('billing_address_1') as HTMLInputElement).value = `${address.street} ${address.streetNumber ? address.streetNumber : ""}` }
			if ("appartmentNumber" in address) { (document.getElementById('billing_address_2') as HTMLInputElement).value = address.appartmentNumber || "" }
			if ("postalCode" in address) { (document.getElementById('billing_postcode') as HTMLInputElement).value = address.postalCode || "" }

			if ("state" in address) {

				const stateElement: HTMLElement | null = document.getElementById('billing_state')

				if (stateElement) {
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

		if (userData?.shippingAddresses) {
			const checkbox = document.getElementById('ship-to-different-address-checkbox');
			(checkbox as HTMLInputElement).checked = true;
			document.querySelector('.shipping_address')?.removeAttribute('style')
			const shippingAddress = userData.shippingAddresses

			if ("name" in shippingAddress) { (document.getElementById('shipping_first_name') as HTMLInputElement).value = shippingAddress.name || "" }
			if ("surname" in shippingAddress) { (document.getElementById('shipping_last_name') as HTMLInputElement).value = shippingAddress.surname || "" }
			if ("city" in shippingAddress) { (document.getElementById('shipping_city') as HTMLInputElement).value = shippingAddress.city || "" }
			if ("companyName" in shippingAddress) { (document.getElementById('shipping_company') as HTMLInputElement).value = shippingAddress.companyName || "" }
			if ("street" in shippingAddress) { (document.getElementById('shipping_address_1') as HTMLInputElement).value = `${shippingAddress.street} ${shippingAddress.streetNumber ? shippingAddress.streetNumber : ""}` }
			if ("appartmentNumber" in shippingAddress) { (document.getElementById('shipping_address_2') as HTMLInputElement).value = shippingAddress.appartmentNumber || "" }
			if ("postalCode" in shippingAddress) { (document.getElementById('shipping_postcode') as HTMLInputElement).value = shippingAddress.postalCode || "" }
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

		if (userData?.shippingAddresses === null) {
			const checkbox = document.getElementById('ship-to-different-address-checkbox');
			if ((checkbox as HTMLInputElement)?.checked) {
				checkbox?.click();
			}
			(checkbox as HTMLInputElement).checked = false;
		}


		if (userData?.parcelLockers) {
			selectPickupPointInpost({ deliveryPointID: userData?.parcelLockers?.lockerId })
		}

	}, [userData, formElements])

} 
